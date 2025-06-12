import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { endpoints } from 'src/app/api-list/api-end-points';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverReplacementService {

  constructor(private http: HttpClient) { }

  public getReplace(page, page_size): Observable<any> {
    return this.http.get<any>(
      endpoints.apiendpoint.driverReplace.list +
      `?page=${page}&page_size=${page_size}`
    );
  }
  public editReplace(id, model): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.replace.edit(id),
      model
    );
  }
  salesmanList() {
    return this.http.post<any>(endpoints.apiendpoint.salesman.list, {});
  }
  public saveReplace(model): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.driverReplace.add, model);
  }
}
