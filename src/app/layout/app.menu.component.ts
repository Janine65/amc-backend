import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from '../service/app.layout.service';
import { MenuItem, MessageService } from 'primeng/api';
import { AccountService } from '@service/account.service';
import { User } from '@model/user';
import { ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})

export class AppMenuComponent implements OnInit, OnDestroy, OnChanges {

    public model!: MenuItem[];
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

    constructor(public layoutService: LayoutService, 
        private router: Router,
        private messages: MessageService,
        private accountService: AccountService) {

    }
    ngOnChanges(): void {
        console.log('ngOnChagnes')
        this.refreshMenu(this.accountService.userValue)
    }
    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    ngOnInit() {
        this.refreshMenu(this.accountService.userValue);
    }

    refreshMenu(user: User | undefined) {
        const userMenu = [];
        if (this.isLoggedIn()) {
            userMenu.push({
                label: 'Ausloggen',
                icon: 'pi pi-sign-out',
                command: async () => {
                    await this.loggoutUser();
                }
            },
            {
                label: 'Mein Profil',
                icon: 'pi pi-user-edit',
                routerLink: ['/account/profile']
            },
            {
                label: 'Alle gespeicherten Einstellung löschen',
                icon: 'pi pi-trash',
                command: () => {
                    this.clearStorage();
                }
            });

            if (this.accountService.userValue.role === 'admin')
                userMenu.push({
                label: 'Users',
                icon: 'pi pi-fw pi-users',
                routerLink: ['/users']
                });
        }

        this.model = [
            {
                label: '',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
                ]                
            }];

        if (user?.role) {
            if (user.role === 'user' || user.role === 'admin') {
                this.model.push(
                    {
                        label: 'Verwaltung',
                        items: [
                            { label: 'Adressen', icon: 'pi pi-fw pi-id-card', routerLink: ['/verwaltung/adressen'] },
                            { label: 'Anlässe', icon: 'pi pi-fw pi-calendar', routerLink: ['/verwaltung/anlaesse'] },
                            user.role === 'admin' ? { label: 'Parameters', icon: 'pi pi-fw pi-bookmark', routerLink: ['/verwaltung/parameter'] } : {visible: false},
                        ]
                    },
                    {
                        label: 'Auswertungen',
                        items: [
                            { label: 'Meisterschaft', icon: 'pi pi-fw pi-map', routerLink: ['/auswertung/meisterschaft'] },
                            { label: 'Auswertungen', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/auswertung/auswertung'] },
                        ]
                    }
                )
            }
            this.model.push(
                {
                    label: 'Buchhaltung',
                    items: [
                        (user.role === 'admin' || user.role === 'revisor') ? { label: 'Journal', icon: 'pi pi-fw pi-money-bill', routerLink: ['/buchhaltung/journal'] } : { visible: false },
                        (user.role === 'admin' || user.role === 'user') ? { label: 'Kegelkasse', icon: 'pi pi-dollar', routerLink: ['/buchhaltung/kegelkasse'] } : { visible: false },
                        (user.role === 'admin' || user.role === 'revisor') ? { label: 'Auswertung', icon: 'pi pi-fw pi-percentage', routerLink: ['/buchhaltung/kto-auswertung'] } : { visible: false },
                        user.role === 'admin' ? { label: 'Geschäftsjahr', icon: 'pi pi-fw pi-book', routerLink: ['/buchhaltung/geschaeftsjahr'] } : { visible: false },
                        user.role === 'admin' ? { label: 'Budget', disabled: true, icon: 'pi pi-fw pi-calculator', routerLink: ['/buchhaltung/budget'] } : { visible: false },
                        user.role === 'admin' ? { label: 'Konten', icon: 'pi pi-fw pi-bitcoin', routerLink: ['/buchhaltung/konten'] } : { visible: false },
                    ]
                }
            )
            this.model.push({separator: true});
        }
        if (userMenu.length > 0)
            this.model.push(
                {
                    label: 'User',
                    items: userMenu
                });
        else
        this.model.push(
            { 
                label: '',
                items: [
                    {                
                        label: 'Anmelden',
                        icon: 'pi pi-sign-in',
                        command: () => { this.clickUser() }
                    }
                ]
            });


    }

    async clickUser() {
        if (this.isLoggedIn()) {
            return
        } else {
            await this.router.navigateByUrl('/account/login');
        }
    }

    async loggoutUser() {
        if (this.isLoggedIn()) {
            await this.accountService.logout();
            this.messages.add({ detail: 'Du bist ausgelogged!', summary: 'Ausgelogged', severity: 'info', closable: true, sticky: false })
        }
    }

    clearStorage() {
        const saveUser = localStorage.getItem('user');
        const parameter = localStorage.getItem('parameter');
        localStorage.clear();
        if (saveUser)
            localStorage.setItem('user', saveUser);
        if (parameter)
            localStorage.setItem('parameter', parameter);
    }

    public isLoggedIn(): boolean {
        if (this.accountService.userValue.id) {
            return true;
        }
        return false;

    }
    public getLoggedinUser() {
        if (this.isLoggedIn())
            return this.accountService.userValue.name;

        return 'not logged in';
    }
}
