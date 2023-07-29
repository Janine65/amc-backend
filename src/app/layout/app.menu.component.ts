import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from '../service/app.layout.service';
import { MenuItem } from 'primeng/api';
import { AccountService } from '@service/account.service';
import { User } from '@model/user';
import { ReplaySubject } from 'rxjs';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
    providers: [AccountService]
})

export class AppMenuComponent implements OnInit, OnDestroy, OnChanges {

    public model!: MenuItem[];
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

    constructor(public layoutService: LayoutService, private accountSevice: AccountService) {

    }
    ngOnChanges(): void {
        console.log('ngOnChagnes')
        this.refreshMenu(this.accountSevice.userValue)
    }
    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    ngOnInit() {
        this.refreshMenu(this.accountSevice.userValue);
    }

    refreshMenu(user: User | undefined) {
        this.model = [
            {
                label: '',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
                ]
            }];

        if (user) {
            if (user.role === 'user' || user.role === 'admin') {
                this.model.push(
                    {
                        label: 'Verwaltung',
                        items: [
                            { label: 'Adressen', icon: 'pi pi-fw pi-id-card', routerLink: ['/verwaltung/adressen'] },
                            { label: 'Anlässe', icon: 'pi pi-fw pi-calendar', routerLink: ['/verwaltung/anlaesse'] },
                            user.role === 'admin' ? { label: 'Parameters', icon: 'pi pi-fw pi-bookmark', routerLink: ['/verwaltung/parameter'] } : {},
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
                        (user.role === 'admin' || user.role === 'revisor') ? { label: 'Journal', icon: 'pi pi-fw pi-money-bill', routerLink: ['/buchhaltung/journal'] } : {},
                        { label: 'Kegelkasse', icon: 'pi pi-dollar', routerLink: ['/buchhaltung/kegelkasse'] },
                        (user.role === 'admin' || user.role === 'revisor') ? { label: 'Auswertung', icon: 'pi pi-fw pi-percentage', routerLink: ['/buchhaltung/kto-auswertung'] } : {},
                        user.role === 'admin' ? { label: 'Geschäftsjahr', icon: 'pi pi-fw pi-book', routerLink: ['/buchhaltung/geschaeftsjahr'] } : {},
                        user.role === 'admin' ? { label: 'Budget', disabled: true, icon: 'pi pi-fw pi-calculator', routerLink: ['/buchhaltung/budget'] } : {},
                        user.role === 'admin' ? { label: 'Konten', icon: 'pi pi-fw pi-bitcoin', routerLink: ['/buchhaltung/konten'] } : {},
                    ]
                }
            )
        }
    }

}
