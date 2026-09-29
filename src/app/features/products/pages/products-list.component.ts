import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-products-list',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="card">
            <div class="font-semibold text-xl mb-4">Mahsulotlar Boshqaruvi</div>
            <p class="text-muted-color">Ushbu modul mahsulotlar ro'yxati va ularni boshqarish uchun mo'ljallangan.</p>
        </div>
    `
})
export class ProductsListComponent {}
