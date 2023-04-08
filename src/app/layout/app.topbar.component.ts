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

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(public layoutService: LayoutService,
        private accountService: AccountService,
        private router: Router,
        private messages: MessageService,
    ) { }

    ngOnInit() {
        this.userItems = [
            {
                label: 'Account',
                items: [
                    {
                    label: 'Mein Profil',
                    icon: 'pi pi-user-edit',
                    routerLink: ['/account/profile']
                    },
                    {
                        label: 'Ausloggen',
                        icon: 'pi pi-sign-out',
                        command: () => {
                            this.loggoutUser();
                        }
                    }
                ]
            },
            {
                label: 'Users',
                icon: 'pi pi-fw pi-users',
                routerLink: ['/users']
            }
        ];
    }

    clickUser() {
        if (this.user) {
            return
        } else {
            this.router.navigateByUrl('/account/login');
        }
    }

    loggoutUser() {
        if (this.user) {
            this.accountService.logout();
            this.user = undefined;
            this.messages.add({detail: 'Du bist ausgelogged!', summary: 'Ausgelogged', severity: 'info'})
        }
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
