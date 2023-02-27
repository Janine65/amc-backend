import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { DashboardComponent } from './components/dashboard/dashboard.component';


@NgModule({
  imports: [RouterModule.forRoot([
    {
    path: '', component: AppLayoutComponent,
    children: [
      { path: '', component: DashboardComponent}
    ]
  }
  ])],
  exports: [RouterModule]
})
export class AppRoutingModule { }
