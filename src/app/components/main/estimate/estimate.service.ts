import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { endpoints } from 'src/app/api-list/api-end-points';
import { NetworkService } from 'src/app/services/network.service';

@Injectable({
  providedIn: 'root',
})
export class EstimateService {
  constructor(private http: NetworkService) {}

  public getDocument(model): Observable<any> {
    return this.http.post(endpoints.apiendpoint.estimate.download, model);
  }
}
