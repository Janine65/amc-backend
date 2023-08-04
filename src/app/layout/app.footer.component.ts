import { Component, OnInit } from '@angular/core';
import { LayoutService } from "../service/app.layout.service";
import { Package } from '@model/user';

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html'
})
export class AppFooterComponent implements OnInit {
    appVersion = '';
    
    constructor(public layoutService: LayoutService) {
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
            this.appVersion += ' / ' + pkgBack.version ?? '';
        }
        
    }
}
