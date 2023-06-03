import { ErrorHandler, NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy, CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
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
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import {DialogModule } from 'primeng/dialog'
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {CalendarModule} from 'primeng/calendar';
import {InputNumberModule} from 'primeng/inputnumber';
import {ToolbarModule} from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import {ToastModule} from 'primeng/toast';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {SelectButtonModule} from 'primeng/selectbutton';
import { PasswordModule } from 'primeng/password';
import {ContextMenuModule} from 'primeng/contextmenu';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { SplitterModule } from 'primeng/splitter';
import { NgxEditorModule } from 'ngx-editor';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ChartModule } from 'primeng/chart';

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
import { BaseTableComponent } from './components/shared/basetable/basetable.component';
import { BaseeditComponent } from './components/shared/baseedit/baseedit.component';
import { AdresseEditComponent } from './components/verwaltung/adresse-edit/adresse-edit.component';
import { InputValidationComponent } from './components/shared/input-validation/input-validation.component';
import { JwtInterceptor, ErrorInterceptor } from './service';
import { LoginComponent } from './components/account/login/login.component';
import { ListComponent } from './components/users/list/list.component';
import { AddEditComponent } from './components/users/add-edit/add-edit.component';
import { AlertComponent } from './components/shared/alert/alert.component';
import { MessageService } from 'primeng/api';
import { GlobalErrorHandler } from './service/global-error-handler';
import { ProfileComponent } from './components/account/profile/profile.component';
import { EmailDialogComponent } from './components/shared/email-dialog/email-dialog.component';
import { AnlaesseEditComponent } from './components/verwaltung/anlaesse-edit/anlaesse-edit.component';
import { AnlassBookComponent } from './components/verwaltung/anlass-book/anlass-book.component';
import { MeisterschaftComponent } from './components/auswertung/meisterschaft/meisterschaft.component';
import { AuswertungComponent } from './components/auswertung/auswertung/auswertung.component';
import { GeschaeftsjahrComponent } from './components/buchhaltung/geschaeftsjahr/geschaeftsjahr.component';
import { KontenComponent } from './components/buchhaltung/konten/konten.component';
import { JournalComponent } from './components/buchhaltung/journal/journal.component';
import { KtoAuswertungComponent } from './components/buchhaltung/kto-auswertung/kto-auswertung.component';
import { BudgetComponent } from './components/buchhaltung/budget/budget.component';
import { AttachementListComponent } from './components/buchhaltung/attachement-list/attachement-list.component';
import { AttachementShowComponent } from './components/buchhaltung/attachement-show/attachement-show.component';

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
    BaseTableComponent,
    BaseeditComponent,
    AdresseEditComponent,
    InputValidationComponent,
    LoginComponent,
    ListComponent,
    AddEditComponent,
    AlertComponent,
    ProfileComponent,
    EmailDialogComponent,
    AnlaesseEditComponent,
    AnlassBookComponent,
    MeisterschaftComponent,
    AuswertungComponent,
    GeschaeftsjahrComponent,
    KontenComponent,
    JournalComponent,
    KtoAuswertungComponent,
    BudgetComponent,
    AttachementListComponent,
    AttachementShowComponent,
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
    DynamicDialogModule,
    ScrollPanelModule,
    CalendarModule,
    InputNumberModule,
    ToolbarModule,
    DropdownModule,
    ToastModule,
    MessagesModule,
    MessageModule,
    SelectButtonModule,
    PasswordModule,
    ContextMenuModule,
    ConfirmDialogModule,    
    DialogModule,
    NgxEditorModule,
    FileUploadModule,
    SplitterModule,
    ReactiveFormsModule,
    InputTextareaModule,
    ChartModule,
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: MessageService, useClass: MessageService },
],
  bootstrap: [AppComponent],
  exports: [AppLayoutComponent]
})
export class AppModule { }
