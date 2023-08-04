import { Component, OnInit } from '@angular/core';
import { Package } from '@model/user';

@Component({
  selector: 'app-app.about',
  templateUrl: './app.about.component.html',
  styleUrls: ['./app.about.component.scss']
})
export class AppAboutComponent implements OnInit{
  pkgFrontend: Package = {}
  pkgBackend: Package = { }

  ngOnInit(): void {
    const pkgFrontString = localStorage.getItem('aboutFrontend');
    if (pkgFrontString) {
        this.pkgFrontend = JSON.parse(pkgFrontString);
    }
    const pkgBackString = localStorage.getItem('aboutBackend');
    if (pkgBackString) {
        this.pkgBackend = JSON.parse(pkgBackString);
    }
  }
}
