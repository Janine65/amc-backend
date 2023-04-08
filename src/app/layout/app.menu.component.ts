import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../service/app.layout.service';
import { MenuItem } from 'primeng/api';
import { User } from '@app/models';
import { BehaviorSubject } from 'rxjs';

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
                    { label: 'Anlässe', icon: 'pi pi-fw pi-check-square', routerLink: ['/verwaltung/anlaesse'] },
                    { label: 'Parameters', icon: 'pi pi-fw pi-bookmark', routerLink: ['/verwaltung/parameter'] },
                    { label: 'User', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/verwaltung/user'] },
                ]
            },
            {
                label: 'Auswertungen',
                items: [
                    { label: 'Meisterschaft', icon: 'pi pi-fw pi-eye', routerLink: ['/blocks'], badge: 'NEW' },
                    { label: 'Auswertungen', icon: 'pi pi-fw pi-globe', routerLink: ['/blocks']},
                ]
            },
            {
                label: 'Buchhaltung',
                items: [
                    { label: 'Journal', icon: 'pi pi-fw pi-desktop', routerLink: ['/blocks']},
                    { label: 'Geschäftsjahr', icon: 'pi pi-fw pi-prime', routerLink: ['/blocks'] },
                    { label: 'Konten', icon: 'pi pi-fw pi-prime', routerLink: ['/blocks'] },
                ]
            },

        ];
    }

}
