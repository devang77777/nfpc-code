import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';

import {Observable,forkJoin} from 'rxjs';
import {map} from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';

@Injectable()
export class StockAdjustmentViewResolveService implements Resolve<any> {

  private apiService: ApiService;

  constructor(apiService: ApiService) {
    Object.assign(this, { apiService });
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
   const returnStock=this.apiService.getStockAdjustmentByKey(route.params.uuid).pipe(map(result => result.data));
   return forkJoin({returnStock})

}
}
