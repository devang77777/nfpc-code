import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ApiKeySelectionService {
  public domain = window.location.host;
  public baseUrl: string = this.domain == 'devmobiato.nfpc.net' ? environment.nfpcApiUrl : environment.baseApiUrl;
  // baseUrl: string = 'https://mobiato-msfa.com/application-backend/public/api';
  constructor(private http: HttpClient) { }

  getCountries(data): Observable<any> {
    let url = `${this.baseUrl}/get/combination-country`;
    return this.http.post(url, data);
  }
  getRegions(data): Observable<any> {
    let url = `${this.baseUrl}/get/regions`;
    return this.http.post(url, data);
  }
  getAreas(data): Observable<any> {
    let url = `${this.baseUrl}/get/areas`;
    return this.http.post(url, data);
  }
  getCombinationItems(data): Observable<any> {
    let url = `${this.baseUrl}/get/combination-items`;
    return this.http.post(url, data);
  }
}
