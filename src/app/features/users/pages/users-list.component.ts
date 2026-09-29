import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-users-list',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="card">
            <div class="font-semibold text-xl mb-4">Foydalanuvchilar va Huquqlar Boshqaruvi</div>
            <p class="text-muted-color">Ushbu modul xodimlar, rollar va ruxsatnomalar (RBAC) ni boshqarish uchun mo'ljallangan.</p>
        </div>
    `
})
export class UsersListComponent {}
