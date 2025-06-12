import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';

@Injectable()
export class InvoiceResolveService implements Resolve<any> {

  private apiService: ApiService;

  constructor(apiService: ApiService) {
    Object.assign(this, { apiService });
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    //const items = this.apiService.getAllItems().pipe(map(result => result));
    const uoms = this.apiService.getAllItemUoms().pipe(map(result => result));
    //const customers = this.apiService.getCustomers().pipe(map(result => result));
    const types = this.apiService.getOrderTypes().pipe(map(result => result));

    //return forkJoin({ items, uoms, customers, types });
    return forkJoin({ uoms, types });
  }
}
