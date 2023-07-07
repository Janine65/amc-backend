/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, Adresse, Anlass, Budget, Clubmeister, Fiscalyear, Journal, Kegelmeister, Meisterschaft, MeisterschaftAuswertung, OverviewData, ParamData, Receipt } from '../models/datatypes';
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

  updParameterData(parameter: ParamData): Observable<any> {
    const apiURL = environment.apiUrl + '/parameter/data'
    const body = JSON.stringify(parameter)
    return this.http.post<ParamData>(apiURL, body, {headers: this.header});
  }

  addParameterData(parameter: ParamData): Observable<any> {
    const apiURL = environment.apiUrl + '/parameter/data'
    const body = JSON.stringify(parameter)
    return this.http.put<ParamData>(apiURL, body, {headers: this.header});
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

  delMeisterschaft(meisterschaft: Meisterschaft): Observable<any> {
    const apiURL = environment.apiUrl + '/club/meisterschaft/data/';
    return this.http.delete(apiURL, {headers: this.header, body: JSON.stringify(meisterschaft)});
  }

  getClubmeister(jahr: number): Observable<Clubmeister[]> {
    const apiURL = environment.apiUrl + '/club/clubmeister/data?jahr=' + jahr;
    return this.http.get<Clubmeister[]>(apiURL, {headers: this.header});
  }

  refreshClubmeister(jahr: number): Observable<any> {
    const apiURL = environment.apiUrl + '/club/clubmeister/refresh?jahr=' + jahr;
    return this.http.get<any>(apiURL, {headers: this.header});
  }

  getKegelmeister(jahr: number): Observable<Kegelmeister[]> {
    const apiURL = environment.apiUrl + '/club/kegelmeister/data?jahr=' + jahr;
    return this.http.get<Kegelmeister[]>(apiURL, {headers: this.header});
  }

  refreshKegelmeister(jahr: number): Observable<any> {
    const apiURL = environment.apiUrl + '/club/kegelmeister/refresh?jahr=' + jahr;
    return this.http.get<any>(apiURL, {headers: this.header});
  }

  getChartData(jahr: number): Observable<MeisterschaftAuswertung[]> {
    const apiURL = environment.apiUrl + '/club/meisterschaft/getChartData?jahr=' + jahr;
    return this.http.get<any>(apiURL, {headers: this.header});

  }

  getFiscalyear(): Observable<Fiscalyear[]> {
    const apiURL = environment.apiUrl + '/journal/fiscalyear/data';
    return this.http.get<Fiscalyear[]>(apiURL, {headers: this.header});
  }

  // router.post('/fiscalyear/data', authorize(), fiscalyearService.addData);
  addFiscalyear(data: Fiscalyear): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/fiscalyear/data';
    const body = JSON.stringify(data)
    return this.http.post(apiURL, body, {headers: this.header});
  }

  // router.put('/fiscalyear/data', authorize(), fiscalyearService.updateData);
  updFiscalyear(data: Fiscalyear): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/fiscalyear/data';
    const body = JSON.stringify(data)
    return this.http.put(apiURL, body, {headers: this.header});
  }
  // router.delete('/fiscalyear/data', authorize(), fiscalyearService.removeData);
  delFiscalyear(data: Fiscalyear): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/fiscalyear/data';
    const body = JSON.stringify(data)
    return this.http.delete(apiURL, {headers: this.header, body: body});
  }
  // router.get('/fiscalyear/getOneData', fiscalyearService.getOneData);
  getOneFiscalyear(year: string) : Observable<Fiscalyear> {
    const apiURL = environment.apiUrl + '/journal/fiscalyear/getOneData?jahr=' + year;
    return this.http.get<Fiscalyear>(apiURL, {headers: this.header});

  }

  getAccount(): Observable<Account[]> {
    const apiURL = environment.apiUrl + '/journal/account/alldata';
    return this.http.get<Account[]>(apiURL, {headers: this.header});
  }
  addAccount(data: Account): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/account/data';
    const body = JSON.stringify(data)
    return this.http.post(apiURL, body, {headers: this.header});
  }
  updAccount(data: Account): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/account/data';
    const body = JSON.stringify(data)
    return this.http.put(apiURL, body, {headers: this.header});
  }
  delAccount(data: Account): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/account/data';
    const body = JSON.stringify(data)
    return this.http.delete(apiURL, {headers: this.header, body: body});
  }
  getOneDataByOrder(order: number) : Observable<Account> {
    const apiURL = environment.apiUrl + '/journal/account/getOneDataByOrder?order=' + order;
    return this.http.get<Account>(apiURL, {headers: this.header});

  }
  getJournal(jahr: number): Observable<Journal[]> {
    const apiURL = environment.apiUrl + '/journal/journal/data?jahr=' + jahr;
    return this.http.get<Journal[]>(apiURL, {headers: this.header});
  }
  addJournal(data: Journal): Observable<Journal> {
    const apiURL = environment.apiUrl + '/journal/journal/data';
    const body = JSON.stringify(data)
    return this.http.post(apiURL, body, {headers: this.header});
  }
  updJournal(data: Journal): Observable<Journal> {
    const apiURL = environment.apiUrl + '/journal/journal/data';
    const body = JSON.stringify(data)
    return this.http.put(apiURL, body, {headers: this.header});
  }
  delJournal(data: Journal): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/journal/data';
    const body = JSON.stringify(data)
    return this.http.delete(apiURL, {headers: this.header, body: body});
  }
  getOneJournal(id: number) : Observable<Journal> {
    const apiURL = environment.apiUrl + '/journal/journal/onedata?id=' + id;
    return this.http.get<Journal>(apiURL, {headers: this.header});

  }
  getAttachment(id: number, jahr: number) : Observable<Receipt[]> {
    const apiURL = environment.apiUrl + '/journal/journal/getAtt?id=' + id + '&jahr=' + jahr;
    return this.http.get<Receipt[]>(apiURL, {headers: this.header});

  }
  getAllAttachment(jahr: number, journalid?: number) : Observable<Receipt[]> {
    let apiURL = environment.apiUrl + '/journal/journal/getAllAtt?jahr=' + jahr;
    if (journalid)
      apiURL += '&journalid=' + journalid;
    return this.http.get<Receipt[]>(apiURL, {headers: this.header});
  }

  uploadAtt(reciept: string): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/journal/uploadAtt?receipt=' + reciept;
    return this.http.get(apiURL, {headers: this.header, responseType: 'blob'});

  }
  delAtt(journalid: number, receipt: Receipt): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/journal/delAtt';
    const body = {'journalid': journalid, 'receiptid': receipt.id}
    return this.http.delete(apiURL, {headers: this.header, body: JSON.stringify(body)});
  }

  addReceipt(jahr: string, files: string): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/journal/addReceipt';
    const body = {jahr: jahr,  uploadFiles: files};
    return this.http.post(apiURL, JSON.stringify(body), {headers: this.header});
  }

  updReceipt(receipt: Receipt): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/journal/updReceipt';
    const body = receipt;
    return this.http.put(apiURL, JSON.stringify(body), {headers: this.header});
  }

  delReceipt(receipt: Receipt): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/journal/delReceipt';
    const body = receipt
    return this.http.delete(apiURL, {headers: this.header, body: JSON.stringify(body)});
  }

  bulkAddReceipt(jahr: string, journalid: number, files: string): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/journal/bulkAtt?jahr=' + jahr + '&journalid=' + journalid;
    const body = {uploadFiles: files};
    return this.http.post(apiURL, JSON.stringify(body), {headers: this.header});
  }

  addAtt(journalid: number, receipt: Receipt[]): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/journal/addR2J?journalid=' + journalid;
    const body = JSON.stringify(receipt);
    return this.http.put(apiURL, body, {headers: this.header});
  }

  getBudget(jahr: number): Observable<Budget[]> {
    const apiURL = environment.apiUrl + '/journal/budget/data?jahr=' + jahr;
    return this.http.get<Budget[]>(apiURL, {headers: this.header});
  }
  addBudget(data: Budget): Observable<Budget> {
    const apiURL = environment.apiUrl + '/journal/budget/data';
    const body = JSON.stringify(data)
    return this.http.post(apiURL, body, {headers: this.header});
  }
  updBudget(data: Budget): Observable<Budget> {
    const apiURL = environment.apiUrl + '/journal/budget/data';
    const body = JSON.stringify(data)
    return this.http.put(apiURL, body, {headers: this.header});
  }
  delBudget(data: Budget): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/budget/data';
    const body = JSON.stringify(data)
    return this.http.delete(apiURL, {headers: this.header, body: body});
  }
  copyBudget(yearFrom: number, yearTo: number): Observable<any> {
    const apiURL = environment.apiUrl + '/journal/budget/copyyear?from='+yearFrom+'&to='+yearTo;
    return this.http.put(apiURL, {headers: this.header});
  }

  showAccData(jahr: number) : Observable<any> {
    const apiURL = environment.apiUrl + '/journal/account/showData?jahr='+jahr;
    return this.http.get(apiURL, {headers: this.header});

  }

  exportAccData(jahr: number) : Observable<any> {
    const apiURL = environment.apiUrl + '/journal/fiscalyear/export?jahr='+jahr;
    return this.http.get(apiURL, {headers: this.header});
  }
}
