import { Injectable } from '@angular/core';
import { endpoints } from 'src/app/api-list/api-end-points';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { NetworkService } from 'src/app/services/network.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private network: NetworkService) {
    Object.assign(this, {});
  }

  exportRegion(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.Settings.Region.export(), payload
    );
  }

  importRegion(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.Settings.Region.import('import'), payload
    );
  }

  exportRoute(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.Settings.Route.export(), payload
    );
  }

  importRoute(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.Settings.Route.import('import'), payload
    );
  }

  getFeaturePlans(domain): Observable<any> {
    return this.network.getAll(endpoints.apiendpoint.Settings.plan.plansList + domain);
  }




}
