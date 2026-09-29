import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-production-list',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="card">
            <div class="font-semibold text-xl mb-4">Ishlab Chiqarish Boshqaruvi</div>
            <p class="text-muted-color">Ushbu modul ishlab chiqarish rejalari, buyurtmalar va bosqichlarni nazorat qilish uchun mo'ljallangan.</p>
        </div>
    `
})
export class ProductionListComponent {}
