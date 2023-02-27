import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }

  private backendServer = 'http://localhost:8081/'

  getDashboardData(): Observable<any> {
    this.http.get<any>('backend/getDashboard')
    .subscribe((result) => {
      return result
    })
    
    return new Observable<any>()
  }
}
