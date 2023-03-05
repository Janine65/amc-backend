import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdressenComponent } from './components/verwaltung/adressen/adressen.component';
import { UserComponent } from './components/verwaltung/user/user.component';
import { ParameterComponent } from './components/verwaltung/parameter/parameter.component';
import { AnlaesseComponent } from './components/verwaltung/anlaesse/anlaesse.component';


@NgModule({
  imports: [RouterModule.forRoot([
    {
    path: '', component: AppLayoutComponent,
    children: [
      { path: '', component: DashboardComponent},
      { path: 'verwaltung/adressen', component: AdressenComponent},
      { path: 'verwaltung/anlaesse', component: AnlaesseComponent},
      { path: 'verwaltung/parameter', component: ParameterComponent},
      { path: 'verwaltung/user', component: UserComponent},
    ]
  }
  ])],
  exports: [RouterModule]
})
export class AppRoutingModule { }
