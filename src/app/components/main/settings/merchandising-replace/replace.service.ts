import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { endpoints } from 'src/app/api-list/api-end-points';

@Injectable({
  providedIn: 'root'
})
export class ReplaceService {
  constructor(private http: HttpClient) { }

  public getReplace(page = 1, page_size = 10): Observable<any> {
    return this.http.get<any>(
      endpoints.apiendpoint.replace.list +
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
  public saveReplace(model, type): Observable<any> {
    if(type == "replace"){
      return this.http.post<any>(endpoints.apiendpoint.replace.add, model);
    }else{
      return this.http.post<any>(endpoints.apiendpoint.swap.add, model);
    }
    
  }
  public deleteReplace(id): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.replace.delete(id));
  }
}
