import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../service/app.layout.service';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})

export class AppMenuComponent implements OnInit {

    public model!: MenuItem[];
    private username = 'nicht angemeldet';

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        
        this.model = [
            {
                label: '',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
                ]
            },
            {
                label: 'Verwaltung',
                items: [
                    { label: 'Adressen', icon: 'pi pi-fw pi-id-card', routerLink: ['/verwaltung/adressen'] },
                    { label: 'Anlässe', icon: 'pi pi-fw pi-calendar', routerLink: ['/verwaltung/anlaesse'] },
                    { label: 'Parameters', icon: 'pi pi-fw pi-bookmark', routerLink: ['/verwaltung/parameter'] },
                ]
            },
            {
                label: 'Auswertungen',
                items: [
                    { label: 'Meisterschaft', icon: 'pi pi-fw pi-map', routerLink: ['/auswertung/meisterschaft'] },
                    { label: 'Auswertungen', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/auswertung/auswertung']},
                ]
            },
            {
                label: 'Buchhaltung',
                items: [
                    { label: 'Geschäftsjahr', icon: 'pi pi-fw pi-book', routerLink: ['/buchhaltung/geschaeftsjahr'] },
                    { label: 'Konten', icon: 'pi pi-fw pi-bitcoin', routerLink: ['/buchhaltung/konten'] },
                    { label: 'Journal', disabled: true, icon: 'pi pi-fw pi-money-bill', routerLink: ['/buchhaltung/journal']},
                    { label: 'Auswertung', disabled: true, icon: 'pi pi-fw pi-percentage', routerLink: ['/buchhaltung/kto-auswertung']},
                ]
            },

        ];
    }

}
