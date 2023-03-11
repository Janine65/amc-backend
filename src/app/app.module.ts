import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy, CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SidebarModule } from 'primeng/sidebar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { PanelModule } from 'primeng/panel'
import { FieldsetModule} from 'primeng/fieldset';
import { DataViewModule } from 'primeng/dataview'
import {TableModule} from 'primeng/table';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppMenuComponent } from './layout/app.menu.component';
import { AppMenuitemComponent } from './layout/app.menuitem.component';
import { AppSidebarComponent } from './layout/app.sidebar.component';
import { AppTopBarComponent } from './layout/app.topbar.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { AppConfigComponent } from './layout/config/app.config.component';
import { AppFooterComponent } from './layout/app.footer.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdressenComponent } from './components/verwaltung/adressen/adressen.component';
import { AnlaesseComponent } from './components/verwaltung/anlaesse/anlaesse.component';
import { ParameterComponent } from './components/verwaltung/parameter/parameter.component';
import { UserComponent } from './components/verwaltung/user/user.component';
import { BaseTableComponent } from './components/shared/basetable/basetable.component';

@NgModule({
  declarations: [
    AppComponent,
    AppLayoutComponent,
    AppMenuComponent,
    AppMenuitemComponent,
    AppSidebarComponent,
    AppTopBarComponent,
    AppConfigComponent,
    AppFooterComponent,
    DashboardComponent,
    AdressenComponent,
    AnlaesseComponent,
    ParameterComponent,
    UserComponent,
    BaseTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    RouterModule,
    CommonModule,
    FormsModule,
    SidebarModule,
    RadioButtonModule,
    ButtonModule,
    InputSwitchModule,
    HttpClientModule,
    InputTextModule,
    BadgeModule,
    RippleModule,
    PanelModule,
    FieldsetModule,
    DataViewModule,
    TableModule,
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
],
  bootstrap: [AppComponent],
  exports: [AppLayoutComponent]
})
export class AppModule { }
