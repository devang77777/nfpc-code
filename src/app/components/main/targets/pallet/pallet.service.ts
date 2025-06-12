import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { endpoints } from 'src/app/api-list/api-end-points';

@Injectable({
  providedIn: 'root'
})
export class PalletService {

  constructor(private http: HttpClient) { }
  public exportPallet(payload) {
    return this.http.post<any>(endpoints.apiendpoint.pallet.export(), payload);
  }
}
