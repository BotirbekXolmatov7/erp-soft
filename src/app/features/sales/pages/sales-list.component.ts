import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-sales-list',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="card">
            <div class="font-semibold text-xl mb-4">Savdo va Moliya Boshqaruvi</div>
            <p class="text-muted-color">Ushbu modul savdo buyurtmalari, schot-fakturalar va to'lovlarni boshqarish uchun mo'ljallangan.</p>
        </div>
    `
})
export class SalesListComponent {}
