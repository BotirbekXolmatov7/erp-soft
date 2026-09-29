# AGENTS.md

Repository memory and operational guide for `sakai-ng` (Angular 21 + PrimeNG 21 admin template).

---

## Critical Invariants & Traps

- **Git Submodule Required**: `src/assets` is a git submodule (`https://github.com/cetincakiroglu/sakai-assets`). If uninitialized, `npm run build` fails immediately because `src/assets/styles.scss` and `src/assets/tailwind.css` are missing. Run `git submodule update --init --recursive` before building.
- **Service Scope & DI**: Demo services in `src/app/pages/service/` (`ProductService`, `CustomerService`, `CountryService`, `NodeService`, `PhotoService`) are annotated `@Injectable()` **without** `{ providedIn: 'root' }`. They MUST be declared in the consuming component's `providers: [...]` array or injection will fail with `NullInjectorError`. Only `LayoutService` is `providedIn: 'root'`.
- **Zoneless Change Detection**: The app runs zoneless via `provideZonelessChangeDetection()` in `src/app.config.ts` (no `zone.js`). Asynchronous updates MUST notify Angular via Angular Signals (`signal.set()`, `signal.update()`) or mark for check.
- **PrimeNG Component Renaming**: Uses PrimeNG v21. Note updated component names:
  - Use `p-select` (`SelectModule`), NOT `p-dropdown` (`DropdownModule`).
  - Use `p-datepicker` (`DatePickerModule`), NOT `p-calendar` (`CalendarModule`).
  - Use `p-toggleswitch` (`ToggleSwitchModule`), NOT `p-inputSwitch` (`InputSwitchModule`).
  - Table templates use `#header` and `#body let-row` instead of legacy `pTemplate="header"`.
- **Menu Hierarchy & Active State**: `AppMenuitem` computes active states by checking whether `LayoutService.layoutState().activePath` starts with `fullPath()`. Parent menu nodes in `src/app/layout/component/app.menu.ts` MUST include a `path` property (e.g. `path: '/pages'`) for child routes to cascade active highlights correctly.

---

## Commands & Verification

| Command | Purpose | Notes |
| :--- | :--- | :--- |
| `git submodule update --init --recursive` | Initialize styles & assets | MUST be run if `src/assets` is empty. |
| `npm run build` | Application build (`ng build`) | Primary build verification command. |
| `npm run watch` | Development build with watch | `ng build --watch --configuration development`. |
| `npx tsc --noEmit` | TypeScript compiler check | Strict mode enabled (`tsconfig.json`). |
| `npm run format` | Prettier formatter | Formats `.js, .mjs, .ts, .mts, .d.ts, .html`. |
| `npm test` | Karma test runner | Currently fails with TS18003 because zero `*.spec.ts` files exist in `src/`. |
| `npx eslint .` | Linter | Currently fails out-of-the-box: `eslint.config.js` uses legacy `root`/`overrides` keys incompatible with ESLint 9 flat config. |

*Note for Windows/PowerShell environments*: If PowerShell execution policies block `.ps1` execution, prefix npm/npx invocations with `cmd /c` (e.g., `cmd /c "npm run build"`).

---

## Architecture & Folder Structure

```
src/
├── main.ts                       # Entrypoint (bootstrapApplication)
├── app.config.ts                 # Zoneless provider, Aura theme, router setup
├── app.routes.ts                 # Root routes (AppLayout wrapper vs standalone pages)
├── app.component.ts              # Minimal root component (<router-outlet />)
├── app/
│   ├── layout/                   # Core application shell & navigation
│   │   ├── component/            # AppLayout, AppTopbar, AppSidebar, AppMenu,
│   │   │                         # AppMenuitem, AppFooter, AppConfigurator,
│   │   │                         # AppFloatingConfigurator
│   │   └── service/
│   │       └── layout.service.ts # Central singleton managing layout & theme state
│   └── pages/                    # Routed feature pages & demo views
│       ├── auth/                 # Static login, error, access-denied pages
│       ├── crud/                 # Complete CRUD reference implementation
│       ├── dashboard/            # Dashboard layout + widget subcomponents
│       ├── documentation/        # Built-in template documentation
│       ├── empty/                # Clean starter page template
│       ├── landing/              # Marketing/landing page + widget components
│       ├── notfound/             # 404 page
│       ├── uikit/                # PrimeNG component showcase pages
│       └── service/              # Mock data services (in-memory Promise arrays)
├── assets/                       # (Git Submodule) SCSS layout shell, variables, tailwind.css
└── public/                       # Static public assets (demo product images, flags)
```

Path alias `@/*` maps directly to `src/*` (e.g. `@/app/layout/service/layout.service`).

---

## Patterns Actually Used

- **Components**: 100% standalone components. No NgModules exist in application code.
- **Signals**: Primary reactivity model.
  - `LayoutService`: `layoutConfig = signal<LayoutConfig>(...)`, `layoutState = signal<LayoutState>(...)`, and numerous `computed(...)` selectors.
  - Component inputs: `input()` and `input<boolean>()` (e.g., `AppMenuitem`, `AppFloatingConfigurator`).
  - Component state: `signal<T[]>` used for list data (e.g., `products = signal<Product[]>([])`).
- **Dependency Injection**: Uses modern `inject(...)` at property declaration alongside constructor injection.
- **Control Flow**: Uses Angular native control flow syntax exclusively: `@if (...)`, `@for (... track ...)`.
- **Forms**: Exclusively template-driven forms (`FormsModule`, `[(ngModel)]`). No `ReactiveFormsModule` or `FormGroup` are used.
- **DOM Utilities**: PrimeNG `pStyleClass` directive (`StyleClassModule`) is used heavily in topbars and landing pages for toggling visibility (`pStyleClass="@next" enterFromClass="hidden"`).
- **DOM & Canvas Hooks**: `afterNextRender` is used for canvas/DOM initializations that depend on rendered layout (e.g., Chart.js in `RevenueStreamWidget`).
- **Data Flow**: Mock data only. Services resolve static arrays via `Promise.resolve(...)`. There is no HTTP backend, no auth token management, and no HTTP interceptor.

---

## Routing & Layout Conventions

- **Admin Shell vs Standalone**:
  - Routes inside `path: ''` with `component: AppLayout` render within the sidebar/topbar layout (`Dashboard`, `/uikit/*`, `/pages/*`, `/documentation`).
  - Standalone top-level routes render outside the shell without sidebar/topbar: `/landing`, `/auth/*`, `/notfound`. Standalone pages embed `<app-floating-configurator />` for theme switching.
- **Route Guards**: No route guards exist (`canActivate`, `canDeactivate` are absent). All routes and auth mock pages are open.
- **Routing Options**: Configured with `withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })` and `withEnabledBlockingInitialNavigation()`.

---

## Styling & Design System

- **Tailwind CSS v4**: Imported in `src/assets/tailwind.css` using `@import 'tailwindcss';` and `@plugin 'tailwindcss-primeui';`.
- **Custom Breakpoints**: Tailwind theme breakpoints are customized in `tailwind.css` to match PrimeNG grid conventions:
  `sm: 576px`, `md: 768px`, `lg: 992px`, `xl: 1200px`, `2xl: 1920px`.
  Desktop vs mobile breakpoint in `LayoutService` is `991px` (`window.innerWidth > 991`).
- **Dark Mode**: Configured as `@custom-variant dark (&:where([class*="app-dark"], [class*="app-dark"] *));`. Toggling dark mode adds or removes `.app-dark` on `document.documentElement` using `document.startViewTransition()` when supported.
- **Dynamic Theming**: Managed by `@primeuix/themes`. Runtime preset switching (Aura, Lara, Nora) and primary/surface palette updates are invoked via `$t().preset(...).use(...)` and `updatePreset(...)` in `AppConfigurator`.
- **CSS Token Bridge**: Layout styles in `src/assets/layout/variables/_common.scss` bridge PrimeNG tokens into CSS variables: `--primary-color: var(--p-primary-color);`, `--surface-border: var(--p-content-border-color);`, `--text-color: var(--p-text-color);`.

---

## Where To Look First

- **Add/Modify Navigation Links**: `src/app/layout/component/app.menu.ts` (`model` array). Submenu parents require a `path` attribute.
- **Add New Internal Admin Page**: Add route to `src/app/pages/pages.routes.ts` or `src/app.routes.ts`, and place component in `src/app/pages/<feature-name>/`.
- **Modify Layout Shell**: `src/app/layout/component/` (`app.layout.ts`, `app.topbar.ts`, `app.sidebar.ts`).
- **Adjust Global Layout/Theme State**: `src/app/layout/service/layout.service.ts`.
- **Theme Palette / Colors / Configurator**: `src/app/layout/component/app.configurator.ts`.
- **CRUD Operations Reference**: `src/app/pages/crud/crud.ts` (demonstrates table sorting, filtering, selection, dialogs, toasts, confirmation dialogs, and signal mutation).
- **Core SCSS / CSS Variables**: `src/assets/layout/variables/` (requires initialized git submodule).
