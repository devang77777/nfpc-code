import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { endpoints } from 'src/app/api-list/api-end-points';

@Injectable({
  providedIn: 'root',
})
export class ReasonService {
  constructor(private http: HttpClient) {}

  public getReasons(page = 1, page_size = 10): Observable<any> {
    return this.http.get<any>(
      endpoints.apiendpoint.reasonType.list +
        `?page=${page}&page_size=${page_size}`
    );
  }
  public editReason(id, model): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.reasonType.edit(id),
      model
    );
  }
  public saveReason(model): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.reasonType.add, model);
  }
  public deleteReason(id): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.reasonType.delete(id));
  }
}
