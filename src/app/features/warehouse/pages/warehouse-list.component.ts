import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-warehouse-list',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="card">
            <div class="font-semibold text-xl mb-4">Omborxona Boshqaruvi</div>
            <p class="text-muted-color">Ushbu modul omborlar, qoldiqlar va harakatlarni kuzatish uchun mo'ljallangan.</p>
        </div>
    `
})
export class WarehouseListComponent {}
