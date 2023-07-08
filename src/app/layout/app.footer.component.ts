import { Component } from '@angular/core';
import { LayoutService } from "../service/app.layout.service";
import app from './../../../package.json';

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html'
})
export class AppFooterComponent {
    appVersion = app.version;
    
    constructor(public layoutService: LayoutService) { }
}
