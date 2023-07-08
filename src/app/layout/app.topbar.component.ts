import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { LayoutService } from "../service/app.layout.service";
import { User } from '@app/models';
import { AccountService } from '@app/service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {

    items!: MenuItem[];
    userItems!: MenuItem[];
    user?: User;

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(public layoutService: LayoutService,
        private accountService: AccountService,
        private router: Router,
        private messages: MessageService,
    ) { }

    ngOnInit() {
        this.userItems = [
            {
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
            },
            (this.isLoggedIn() && this.accountService.userValue.role === 'admin') ? {
                label: 'Users',
                icon: 'pi pi-fw pi-users',
                routerLink: ['/users']
            } : {}
        ];
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
            this.user = undefined;
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
        const user = localStorage.getItem('user')
        if (user) {
            this.user = JSON.parse(user);

            return true;
        }
        return false;

    }
    public getLoggedinUser() {
        if (this.isLoggedIn())
            return this.user?.name

        return 'not logged in'
    }
}
