/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Adresse, Fiscalyear, OverviewData, ParamData } from '../models/datatypes';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }

  getParameterData(): Observable<ParamData[]> {
    const apiURL = environment.apiUrl + '/parameter/data';
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    });
    return this.http.get<ParamData[]>(apiURL, {headers: header});

  }

  getDashboarJournalData(jahr: string): Observable<Fiscalyear> {
    const apiURL = environment.apiUrl + '/journal/fiscalyear/getOneData?jahr=' + jahr;
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    });
    return this.http.get<Fiscalyear>(apiURL, {headers: header});

  }

  getDashboardAdressData(): Observable<OverviewData[]> {
    const apiURL = environment.apiUrl + '/club/adressen/overview'
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    })
    return this.http.get<OverviewData[]>(apiURL, {headers: header});
  }
  getDashboardAnlaesseData(): Observable<OverviewData[]> {
    const apiURL = environment.apiUrl + '/club/anlaesse/overview'
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    })
    return this.http.get<OverviewData[]>(apiURL, {headers: header});
  }
  getDashboardClubmeisterData(): Observable<OverviewData[]> {
    const apiURL = environment.apiUrl + '/club/clubmeister/overview'
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    })
    return this.http.get<OverviewData[]>(apiURL, {headers: header});
  }
  getDashboardKegelmeisterData(): Observable<OverviewData[]> {
    const apiURL = environment.apiUrl + '/club/kegelmeister/overview'
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    })
    return this.http.get<OverviewData[]>(apiURL, {headers: header});
  }
  getAdressenData(): Observable<Adresse[]> {
    const apiURL = environment.apiUrl + '/club/adressen/data'
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    })
    return this.http.get<Adresse[]>(apiURL, {headers: header});
  }

  getAdressenFK(): Observable<any> {
    const apiURL = environment.apiUrl + '/club/adressen/getFkData'
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    })
    return this.http.get<Adresse[]>(apiURL, {headers: header});
  }

  updateData(adresse: Adresse): Observable<Adresse> {
    const apiURL = environment.apiUrl + '/club/adressen/data'
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    })
    const body = JSON.stringify(adresse)
    return this.http.post<Adresse>(apiURL, body, {headers: header});
  }

  sendEmail(emailbody: any) {
    const apiURL = environment.apiUrl + '/club/adressen/sendemail'
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    })
    const body = JSON.stringify(emailbody)
    return this.http.post<any>(apiURL, body, {headers: header});

  }
}
