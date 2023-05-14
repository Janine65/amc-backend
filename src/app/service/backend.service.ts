/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Adresse, Anlass, Fiscalyear, Meisterschaft, OverviewData, ParamData } from '../models/datatypes';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  private header! : HttpHeaders;

  constructor(private http: HttpClient) { 
    this.header = new HttpHeaders({
      //'Access-Control-Allow-Origin': 'http://localhost:4200',
      'Access-Control-Allow-Origin': environment.apiUrlSelf,
      'Access-Control-Allow-Methods': "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers,Access-Control-Allow-Methods,Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization'
      });
    console.log(this.header);   
  }

  getParameterData(): Observable<ParamData[]> {
    const apiURL = environment.apiUrl + '/parameter/data';
    return this.http.get<ParamData[]>(apiURL, {headers: this.header});

  }

  getDashboarJournalData(jahr: string): Observable<Fiscalyear> {
    const apiURL = environment.apiUrl + '/journal/fiscalyear/getOneData?jahr=' + jahr;
    return this.http.get<Fiscalyear>(apiURL, {headers: this.header});

  }

  getDashboardAdressData(): Observable<OverviewData[]> {
    const apiURL = environment.apiUrl + '/club/adressen/overview'
    return this.http.get<OverviewData[]>(apiURL, {headers: this.header});
  }
  getDashboardAnlaesseData(): Observable<OverviewData[]> {
    const apiURL = environment.apiUrl + '/club/anlaesse/overview'
    return this.http.get<OverviewData[]>(apiURL, {headers: this.header});
  }
  getDashboardClubmeisterData(): Observable<OverviewData[]> {
    const apiURL = environment.apiUrl + '/club/clubmeister/overview'
    return this.http.get<OverviewData[]>(apiURL, {headers: this.header});
  }
  getDashboardKegelmeisterData(): Observable<OverviewData[]> {
    const apiURL = environment.apiUrl + '/club/kegelmeister/overview'
    return this.http.get<OverviewData[]>(apiURL, {headers: this.header});
  }
  getAdressenData(): Observable<Adresse[]> {
    const apiURL = environment.apiUrl + '/club/adressen/alldata'
    return this.http.get<Adresse[]>(apiURL, {headers: this.header});
  }

  getAdressenFK(): Observable<any> {
    const apiURL = environment.apiUrl + '/club/adressen/getFkData'
    return this.http.get<Adresse[]>(apiURL, {headers: this.header});
  }

  getOneAdress(id: number): Observable<Adresse> {
    const apiURL = environment.apiUrl + '/club/adressen/data?id=' + id;
    return this.http.get<Adresse>(apiURL, {headers: this.header});
  }

  updateData(adresse: Adresse): Observable<Adresse> {
    const apiURL = environment.apiUrl + '/club/adressen/data'
    const body = JSON.stringify(adresse)
    return this.http.post<Adresse>(apiURL, body, {headers: this.header});
  }

  removeData(adresse: Adresse) : Observable<any> {
    const apiURL = environment.apiUrl + '/club/adressen/data'
    const body = JSON.stringify(adresse)
    const req = new HttpRequest('DELETE', apiURL, body, {headers: this.header});
    return this.http.request(req);
  }

  exportAdressData(filter = {}) : Observable<any> {
    const apiURL = environment.apiUrl + '/club/adressen/export'
    const body = JSON.stringify(filter);
    const req = new HttpRequest('PUT', apiURL, body, {headers: this.header});
    return this.http.request(req);

  }

  uploadFiles(file: File): Observable<any> {
    const apiURL = environment.apiUrl + '/upload';
    const data = new FormData();
    data.append("file", file);
    const req = new HttpRequest('POST', apiURL, data, {headers: this.header});
    return this.http.request(req);
  }

  downloadFile(filename: string): Observable<any> {
    const apiURL = environment.apiUrl + '/download?filename=' + filename;
    const req = new HttpRequest('GET', apiURL, {headers: this.header, responseType: 'blob' as 'json'});
    return this.http.request(req);
  }

  sendEmail(emailbody: any): Observable<any> {
    const apiURL = environment.apiUrl + '/club/adressen/sendmail'
    const body = JSON.stringify(emailbody)
    return this.http.post<any>(apiURL, body, {headers: this.header});

  }

  qrBillAdresse(adresse: Adresse): Observable<any> {
    const apiURL = environment.apiUrl + '/club/adressen/qrbill'
    const body = JSON.stringify(adresse)
    const req = new HttpRequest('POST', apiURL, body, {headers: this.header});
    return this.http.request(req);
  }

  getAnlaesseData(): Observable<Anlass[]> {
    const apiURL = environment.apiUrl + '/club/anlaesse/data'
    return this.http.get<Anlass[]>(apiURL, {headers: this.header});
  }

  getAnlaesseFKData(): Observable<any> {
    const apiURL = environment.apiUrl + '/club/anlaesse/getFkData'
    return this.http.get<Anlass[]>(apiURL, {headers: this.header});
  }

  addAnlaesseData(anlass: Anlass): Observable<Anlass> {
    const apiURL = environment.apiUrl + '/club/anlaesse/data'
    const body = JSON.stringify(anlass)
    return this.http.put<Anlass>(apiURL, body, {headers: this.header});
  }

  updAnlaesseData(anlass: Anlass): Observable<Anlass> {
    const apiURL = environment.apiUrl + '/club/anlaesse/data'
    const body = JSON.stringify(anlass)
    return this.http.post<Anlass>(apiURL, body, {headers: this.header});
  }

  delAnlaesseData(anlass: Anlass): Observable<Anlass> {
    const apiURL = environment.apiUrl + '/club/anlaesse/data'
    const body = JSON.stringify(anlass)
    return this.http.delete<Anlass>(apiURL, {headers: this.header, body: body});
  }

  getSheet(params: any): Observable<any> {
    const apiURL = environment.apiUrl + '/club/anlaesse/sheet'
    const body = JSON.stringify(params)
    return this.http.post(apiURL, body, {headers: this.header});
  }

  getOneAnlass(id: number): Observable<Anlass> {
    const apiURL = environment.apiUrl + '/club/anlaesse/data/' + id;
    return this.http.get(apiURL, {headers: this.header});
  }

  getMeisterschaft(eventid: number): Observable<Meisterschaft[]> {
    const apiURL = environment.apiUrl + '/club/meisterschaft/data?eventid=' + eventid;
    return this.http.get<Meisterschaft[]>(apiURL, {headers: this.header});
  }

  addMeisterschaft(meisterschaft: Meisterschaft): Observable<any> {
    const apiURL = environment.apiUrl + '/club/meisterschaft/data/';
    const body = JSON.stringify(meisterschaft)
    return this.http.post(apiURL, body, {headers: this.header});
  }

  updMeisterschaft(meisterschaft: Meisterschaft): Observable<any> {
    const apiURL = environment.apiUrl + '/club/meisterschaft/data/';
    const body = JSON.stringify(meisterschaft)
    return this.http.put(apiURL, body, {headers: this.header});
  }

  delMeisterschaft(id: number): Observable<any> {
    const apiURL = environment.apiUrl + '/club/meisterschaft/data/' + id;
    return this.http.delete(apiURL, {headers: this.header});
  }


}
