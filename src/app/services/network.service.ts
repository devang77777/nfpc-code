import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  public domain = window.location.host;
  public baseUrl: string = this.domain == 'devmobiato.nfpc.net' ? environment.nfpcApiUrl : environment.baseApiUrl;
  // baseUrl = 'https://mobiato-msfa.com/application-backend/public/api';
  constructor(private http: HttpClient) { }

  getAll(url: string, params?: Object): Observable<any> {
    if (params) {
      Object.keys(params).forEach((key) => {
        if (!params[key]) return;
        url += `${key}=${params[key]}&`;
      });
    }
    return this.http
      .get<any>(url, {})
      .pipe(catchError(this.errorHandler), retry(1));
  }

  getById(url): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}${url}`, {})
      .pipe(catchError(this.errorHandlerMessage), retry(1));
  }

  post(url: string, model: any, options?): Observable<any> {
    return this.http
      .post<any[]>(url, model, options)
      .pipe(catchError(this.errorHandlerMessage), retry(1));
  }

  onUpdate(url: string, model: any): Observable<any> {
    return this.http
      .put<any[]>(url, model)
      .pipe(catchError(this.errorHandlerMessage), retry(1));
  }

  onDelete(url: string): Observable<any> {
    return this.http
      .delete<any[]>(url, {})
      .pipe(catchError(this.errorHandlerMessage), retry(1));
  }

  errorHandler(error: HttpErrorResponse) {
    return observableThrowError(error.error || 'Server Error');
  }

  errorHandlerMessage(error: HttpErrorResponse) {
    return observableThrowError(error.error || 'Server Error');
  }
}
