/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpHeaders, HttpClient, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { ParamData, Fiscalyear, Adresse, Anlass, Meisterschaft, Journal, Account, Kegelkasse, Receipt, Budget } from "@model/index";
import { Package } from "@model/user";
import { Observable } from "rxjs";

export interface RetData {
  data: object | undefined;
  message: string;
  type: string;
}

export interface RetDataFiles extends RetData {
  data: {files: string[]} | undefined
}

export interface RetDataFile extends RetData {
  data: {filename: string} | undefined
}

@Injectable({ providedIn: 'root' })
export class BackendService {

  private header!: HttpHeaders;

  constructor(private http: HttpClient) {
    this.header = new HttpHeaders({
      'Access-Control-Allow-Origin': environment.apiUrlSelf,
      'Access-Control-Allow-Methods': "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers,Access-Control-Allow-Methods,Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization',
      'Content-Type': 'application/json'
    });
    console.log(this.header);
  }

  getAbout(): Observable<Package> {
    const apiURL = environment.apiUrl + '/about';
    return this.http.get<Package>(apiURL, { headers: this.header });
  }

  uploadFiles(file: File): Observable<RetData> {
    const apiURL = environment.apiUrl + '/upload';
    const data = new FormData();
    data.append("file", file);
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': environment.apiUrlSelf,
      'Access-Control-Allow-Methods': "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers,Access-Control-Allow-Methods,Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization'
    });
    const req = this.http.post<RetData>(apiURL, data, { headers: headers });
    return req;
  }

  downloadFile(filename: string): Observable<any> {
    const apiURL = environment.apiUrl + '/download?filename=' + filename;
    const req = new HttpRequest('GET', apiURL, { headers: this.header, responseType: 'blob' as 'json' });
    return this.http.request(req);
  }

  getParameterData(): Observable<RetData> {
    const apiURL = environment.apiUrl + '/parameter/list';
    return this.http.get<RetData>(apiURL, { headers: this.header });

  }

  updParameterData(parameter: ParamData): Observable<RetData> {
    const apiURL = environment.apiUrl + '/parameter/parameter/' + parameter.id;
    const body = JSON.stringify(parameter);
    return this.http.put<RetData>(apiURL, body, { headers: this.header });
  }

  addParameterData(parameter: ParamData): Observable<RetData> {
    const apiURL = environment.apiUrl + '/parameter/parameter';
    const body = JSON.stringify(parameter);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }

  delParameterData(parameter: ParamData): Observable<RetData> {
    const apiURL = environment.apiUrl + '/parameter/parameter/' + parameter.id;
    return this.http.delete<RetData>(apiURL, { headers: this.header });
  }
  
  getDashboarJournalData(jahr: string): Observable<RetData> {
    const apiURL = environment.apiUrl + '/fiscalyear/getbyyear?year=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getDashboardAdressData(): Observable<RetData> {
    const apiURL = environment.apiUrl + '/adresse/overview';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getDashboardAnlaesseData(): Observable<RetData> {
    const apiURL = environment.apiUrl + '/anlass/overview';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getDashboardClubmeisterData(): Observable<RetData> {
    const apiURL = environment.apiUrl + '/clubmeister/overview';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getDashboardKegelmeisterData(): Observable<RetData> {
    const apiURL = environment.apiUrl + '/kegelmeister/overview';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getAdressenData(): Observable<RetData> {
    const apiURL = environment.apiUrl + '/adresse/list';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getAdressenFK(): Observable<RetData> {
    const apiURL = environment.apiUrl + '/adresse/getFkData';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getOneAdress(id: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/adresse/adresse/' + id;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  updateAdresse(adresse: Adresse): Observable<RetData> {
    let apiURL = environment.apiUrl + '/adresse/adresse/';
    const body = JSON.stringify(adresse);
    if (adresse.id == undefined || adresse.id == 0) {
      return this.http.post<RetData>(apiURL, body, { headers: this.header });
    } else {
      apiURL += adresse.id;
      return this.http.put<RetData>(apiURL, body, { headers: this.header });
    }
  }

  removeAdresse(adresse: Adresse): Observable<RetData> {
    const apiURL = environment.apiUrl + '/adresse/adresse/' + adresse.id;
    const body = JSON.stringify(adresse);
    return this.http.delete<RetData>(apiURL, { headers: this.header, body: body });
  }

  exportAdressData(filter = {}): Observable<RetDataFile> {
    const apiURL = environment.apiUrl + '/adresse/export';
    const body = JSON.stringify(filter);
    return this.http.post<RetDataFile>(apiURL, body, { headers: this.header });
  }

  sendEmail(emailbody: any): Observable<RetData> {
    const apiURL = environment.apiUrl + '/adresse/sendmail';
    const body = JSON.stringify(emailbody);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });

  }

  // TODO
  qrBillAdresse(adresse: Adresse): Observable<RetData> {
    const apiURL = environment.apiUrl + '/adresse/qrbill';
    const body = JSON.stringify(adresse);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }

  // TODO: Filter muss noch eingebaut werden
  getAnlaesseData(fromJahr: string, toJahr: string, istkegeln: boolean | undefined): Observable<RetData> {
    let apiURL = environment.apiUrl + `/anlass/list?from=${fromJahr}&to=${toJahr}`;
    if (istkegeln) {
      apiURL += "&istkegeln=" + istkegeln;
    }
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getAnlaesseFKData(jahr: string | undefined): Observable<RetData> {
    let apiURL = environment.apiUrl + '/anlass/getFkData';
    if (jahr)
      apiURL += "?jahr=" + jahr
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  addAnlaesseData(anlass: Anlass): Observable<RetData> {
    const apiURL = environment.apiUrl + '/anlass/anlass';
    const body = JSON.stringify(anlass);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }

  updAnlaesseData(anlass: Anlass): Observable<RetData> {
    const apiURL = environment.apiUrl + '/anlass/anlass/' + anlass.id;
    const body = JSON.stringify(anlass);
    return this.http.put<RetData>(apiURL, body, { headers: this.header });
  }

  delAnlaesseData(anlass: Anlass): Observable<RetData> {
    const apiURL = environment.apiUrl + '/anlass/anlass/' + anlass.id;
    const body = JSON.stringify(anlass);
    return this.http.delete<RetData>(apiURL, { headers: this.header, body: body });
  }

  getSheet(params: any): Observable<RetDataFile> {
    let apiURL = environment.apiUrl + '/anlass/writestammblatt?';
    apiURL += 'jahr=' + params.jahr;
    apiURL += '&type=' + params.type;
    if (params.id && params.id > 0)
      apiURL += '&adresseId=' + params.id;
    return this.http.get<RetDataFile>(apiURL, { headers: this.header });
  }

  getOneAnlass(id: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/anlass/anlass/' + id;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getAdresseMeisterschaft(adresseid: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/meisterschaft/listmitglied?id=' + adresseid;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getAdresseMeister(adresseid: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/meisterschaft/listmitgliedmeister?id=' + adresseid;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getMeisterschaft(eventid: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/meisterschaft/listevent?eventid=' + eventid;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  addMeisterschaft(meisterschaft: Meisterschaft): Observable<RetData> {
    const apiURL = environment.apiUrl + '/meisterschaft/meisterschaft/';
    const body = JSON.stringify(meisterschaft);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }

  updMeisterschaft(meisterschaft: Meisterschaft): Observable<RetData> {
    const apiURL = environment.apiUrl + '/meisterschaft/meisterschaft/' + meisterschaft.id;
    const body = JSON.stringify(meisterschaft);
    return this.http.put<RetData>(apiURL, body, { headers: this.header });
  }

  delMeisterschaft(meisterschaft: Meisterschaft): Observable<RetData> {
    const apiURL = environment.apiUrl + '/meisterschaft/meisterschaft/' + meisterschaft.id;
    return this.http.delete<RetData>(apiURL, { headers: this.header, body: JSON.stringify(meisterschaft) });
  }

  getClubmeister(jahr: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/clubmeister/list?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  refreshClubmeister(jahr: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/clubmeister/calcmeister?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getKegelmeister(jahr: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/kegelmeister/list?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  refreshKegelmeister(jahr: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/kegelmeister/calcmeister?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getChartData(jahr: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/meisterschaft/getchartdata?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });

  }

  getFiscalyear(): Observable<RetData> {
    const apiURL = environment.apiUrl + '/fiscalyear/list';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  addFiscalyear(data: Fiscalyear): Observable<RetData> {
    const apiURL = environment.apiUrl + '/fiscalyear/fiscalyear';
    const body = JSON.stringify(data);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }

  updFiscalyear(data: Fiscalyear): Observable<RetData> {
    const apiURL = environment.apiUrl + '/fiscalyear/fiscalyear/' + data.id;
    const body = JSON.stringify(data);
    return this.http.put<RetData>(apiURL, body, { headers: this.header });
  }
  delFiscalyear(data: Fiscalyear): Observable<RetData> {
    const apiURL = environment.apiUrl + '/fiscalyear/fiscalyear/' + data.id;
    const body = JSON.stringify(data);
    return this.http.delete<RetData>(apiURL, { headers: this.header, body: body });
  }
  getOneFiscalyear(year: string): Observable<RetData> {
    const apiURL = environment.apiUrl + '/fiscalyear/getbyyear?year=' + year;
    return this.http.get<RetData>(apiURL, { headers: this.header });

  }
  closeFiscalyear(jahr: string, status: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/fiscalyear/closeyear?year=' + jahr + '&state=' + status;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getOneAccount(jahr: number, accountid: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/journal/getaccdata?year=' + jahr + '&account=' + accountid;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getAccount(): Observable<RetData> {
    const apiURL = environment.apiUrl + '/account/list';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  addAccount(data: Account): Observable<RetData> {
    const apiURL = environment.apiUrl + '/account/account';
    const body = JSON.stringify(data);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }
  updAccount(data: Account): Observable<RetData> {
    const apiURL = environment.apiUrl + '/account/account/' + data.id;
    const body = JSON.stringify(data);
    return this.http.put<RetData>(apiURL, body, { headers: this.header });
  }
  delAccount(data: Account): Observable<RetData> {
    const apiURL = environment.apiUrl + '/account/account/' + data.id;
    const body = JSON.stringify(data);
    return this.http.delete<RetData>(apiURL, { headers: this.header, body: body });
  }
  getOneDataByOrder(order: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/account/getonedatabyorder?order=' + order;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getAmountOneAcc(datum: string, order: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/account/getamountoneacc?date=' + datum + '&order=' + order;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getJournal(jahr: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/journal/getbyyear?year=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  addJournal(data: Journal): Observable<RetData> {
    const apiURL = environment.apiUrl + '/journal/journal';
    const body = JSON.stringify(data);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }
  updJournal(data: Journal): Observable<RetData> {
    const apiURL = environment.apiUrl + '/journal/journal/' + data.id;
    const body = JSON.stringify(data);
    return this.http.put<RetData>(apiURL, body, { headers: this.header });
  }
  delJournal(data: Journal): Observable<RetData> {
    const apiURL = environment.apiUrl + '/journal/journal/' + data.id;
    const body = JSON.stringify(data);
    return this.http.delete<RetData>(apiURL, { headers: this.header, body: body });
  }
  getKegelkasse(monat: number, jahr: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/kegelkasse/kassebydatum?monat=' + monat + '&jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getAllKegelkasse(jahr: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/kegelkasse/kassebyjahr?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  addKegelkasse(data: Kegelkasse): Observable<RetData> {
    const apiURL = environment.apiUrl + '/keglkasse/kegelkasse';
    const body = JSON.stringify(data);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }
  updKegelkasse(data: Kegelkasse): Observable<RetData> {
    const apiURL = environment.apiUrl + '/kegelkasse/kegelkasse/' + data.id;
    const body = JSON.stringify(data);
    return this.http.put<RetData>(apiURL, body, { headers: this.header });
  }

  createReceipt(id: number): Observable<RetDataFile> {
    const apiURL = environment.apiUrl + '/kegelkasse/genreceipt?kegelkasseId=' + id;
    return this.http.get<RetDataFile>(apiURL, { headers: this.header });
  }

  getOneJournal(id: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/journal/journal/' + id;
    return this.http.get<RetData>(apiURL, { headers: this.header });

  }
  exportJournal(jahr: number, receipt: number): Observable<RetDataFile> {
    const apiURL = environment.apiUrl + '/journal/write?year=' + jahr + '&receipt=' + receipt;
    return this.http.get<RetDataFile>(apiURL, { headers: this.header });

  }
  getAttachment(id: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/receipt/findatt?journalid=' + id;
    return this.http.get<RetData>(apiURL, { headers: this.header });

  }
  getAllAttachment(jahr: number, journalid?: number): Observable<RetData> {
    let apiURL = environment.apiUrl + '/receipt/findallatt?jahr=' + jahr;
    if (journalid)
      apiURL += '&journalid=' + journalid;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  uploadAtt(reciept: string): Observable<any> {
    const apiURL = environment.apiUrl + '/receipt/uploadatt?receipt=' + reciept;
    return this.http.get(apiURL, { headers: this.header, responseType: 'blob' });

  }
  delAtt(journalid: number, receipt: Receipt): Observable<RetData> {
    const apiURL = environment.apiUrl + '/receipt/receipt/' + receipt.id;
    return this.http.delete<RetData>(apiURL, { headers: this.header });
  }

  addReceipt(jahr: string, files: string): Observable<RetDataFiles> {
    const apiURL = environment.apiUrl + '/receipt/receipt';
    const body = { jahr: jahr, uploadFiles: files };
    return this.http.post<RetDataFiles>(apiURL, JSON.stringify(body), { headers: this.header });
  }

  updReceipt(receipt: Receipt): Observable<RetData> {
    const apiURL = environment.apiUrl + '/receipt/receipt/' + receipt.id;
    const body = receipt;
    return this.http.put<RetData>(apiURL, JSON.stringify(body), { headers: this.header });
  }

  delReceipt(receipt: Receipt): Observable<RetData> {
    const apiURL = environment.apiUrl + '/receipt/receipt/' + receipt.id;
    return this.http.delete<RetData>(apiURL, { headers: this.header });
  }

  bulkAddReceipt(jahr: string, journalid: number, files: string): Observable<RetDataFiles> {
    const apiURL = environment.apiUrl + '/receipt/att2journal';
    const body = { uploadFiles: files, year: jahr, journalid: journalid };
    return this.http.post<RetDataFiles>(apiURL, JSON.stringify(body), { headers: this.header });
  }

  addAtt(journalid: number, receipt: Receipt[]): Observable<RetData> {
    const apiURL = environment.apiUrl + '/journalreceipt/add2journal?journalid=' + journalid;
    const body = JSON.stringify(receipt);
    return this.http.put<RetData>(apiURL, body, { headers: this.header });
  }

  getBudget(jahr: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/budget/list?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  addBudget(data: Budget): Observable<RetData> {
    const apiURL = environment.apiUrl + '/budget/budget';
    const body = JSON.stringify(data);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }
  updBudget(data: Budget): Observable<RetData> {
    const apiURL = environment.apiUrl + '/budget/budget/' + data.id;
    const body = JSON.stringify(data);
    return this.http.put<RetData>(apiURL, body, { headers: this.header });
  }
  delBudget(data: Budget): Observable<RetData> {
    const apiURL = environment.apiUrl + '/budget/budget/' + data.id;
    return this.http.delete<RetData>(apiURL, { headers: this.header });
  }
  copyBudget(yearFrom: number, yearTo: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/budget/copyyear?from=' + yearFrom + '&to=' + yearTo;
    return this.http.put<RetData>(apiURL, { headers: this.header });
  }

  showAccData(jahr: number): Observable<RetData> {
    const apiURL = environment.apiUrl + '/account/getaccountsummary?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  exportAccData(jahr: number): Observable<RetDataFile> {
    const apiURL = environment.apiUrl + '/fiscalyear/writebilanz?year=' + jahr;
    return this.http.get<RetDataFile>(apiURL, { headers: this.header });
  }
  exportAccountData(jahr: number): Observable<RetDataFile> {
    const apiURL = environment.apiUrl + '/account/writekontoauszug?year=' + jahr;
    return this.http.get<RetDataFile>(apiURL, { headers: this.header });
  }
}
