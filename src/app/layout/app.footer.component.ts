import { Component, OnInit } from '@angular/core';
import { LayoutService } from "../service/app.layout.service";
import { Package } from '@model/user';
import { AccountService } from '@service/account.service';

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html'
})
export class AppFooterComponent implements OnInit {
    appVersion = '';
    
    constructor(public layoutService: LayoutService,
        private accountService: AccountService) {
     }
    ngOnInit(): void {
        const pkgFrontString = localStorage.getItem('aboutFrontend');
        let pkgFront: Package = {}, pkgBack: Package = {};
        if (pkgFrontString) {
            pkgFront = JSON.parse(pkgFrontString);
            this.appVersion = pkgFront.version ?? '';
        }
        const pkgBackString = localStorage.getItem('aboutBackend');
        if (pkgBackString) {
            pkgBack = JSON.parse(pkgBackString);
            this.appVersion += ' / ' + pkgBack.version;
        }
        
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
    }}
