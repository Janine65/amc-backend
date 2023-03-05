import { Component, OnInit } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
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
                    { label: 'Auswertungen', icon: 'pi pi-fw pi-globe', routerLink: []},
                ]
            },
            {
                label: 'Buchhaltung',
                items: [
                    { label: 'Journal', icon: 'pi pi-fw pi-desktop', routerLink: []},
                    { label: 'Geschäftsjahr', icon: 'pi pi-fw pi-prime', routerLink: ['/utilities/icons'] },
                    { label: 'Konten', icon: 'pi pi-fw pi-prime', routerLink: ['/utilities/icons'] },
                ]
            },
            {
                label: 'User',
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    {
                        label: 'Login',
                        id: 'login',
                        icon: 'pi pi-fw pi-sign-in',
                        routerLink: ['/auth/login']
                    },
                    {
                        label: 'Nicht angemeldet',
                        id: 'username',
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: 'logout',
                                icon: 'pi pi-fw pi-sign-out',
                                routerLink: ['/auth/error']
                            },
                            {
                                label: 'Profile',
                                icon: 'pi pi-fw pi-user',
                                routerLink: ['/auth/access']
                            }
                        ]
                    },
                ]
            },
        ];
    }
}
