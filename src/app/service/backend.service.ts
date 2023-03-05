import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Adresse, Fiscalyear, OverviewData, ParamData } from './datatypes';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }

  getParameterData(): Observable<ParamData[]> {
    const apiURL = environment.apiUrl + '/Parameter/data';
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    });
    return this.http.get<ParamData[]>(apiURL, {headers: header});

  }

  getDashboarJournalData(jahr: string): Observable<Fiscalyear> {
    const apiURL = environment.apiUrl + '/Fiscalyear/getOneData?jahr=' + jahr;
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    });
    return this.http.get<Fiscalyear>(apiURL, {headers: header});

  }

  getDashboardAdressData(): Observable<OverviewData[]> {
    const apiURL = environment.apiUrl + '/Adressen/getOverviewData'
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    })
    return this.http.get<OverviewData[]>(apiURL, {headers: header});
  }
  getDashboardAnlaesseData(): Observable<OverviewData[]> {
    const apiURL = environment.apiUrl + '/Anlaesse/getOverviewData'
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    })
    return this.http.get<OverviewData[]>(apiURL, {headers: header});
  }
  getDashboardClubmeisterData(): Observable<OverviewData[]> {
    const apiURL = environment.apiUrl + '/Clubmeister/getOverviewData'
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    })
    return this.http.get<OverviewData[]>(apiURL, {headers: header});
  }
  getDashboardKegelmeisterData(): Observable<OverviewData[]> {
    const apiURL = environment.apiUrl + '/Kegelmeister/getOverviewData'
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    })
    return this.http.get<OverviewData[]>(apiURL, {headers: header});
  }
  getAdressenData(): Observable<Adresse[]> {
    const apiURL = environment.apiUrl + '/Adressen/data'
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    })
    return this.http.get<Adresse[]>(apiURL, {headers: header});
  }
}
