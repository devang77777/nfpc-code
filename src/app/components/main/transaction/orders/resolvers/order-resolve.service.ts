import { MasterService } from './../../../master/master.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';


@Injectable()
export class OrderResolveService implements Resolve<any> {

  private apiService: ApiService;
  private masterService: MasterService;

  constructor(apiService: ApiService, masterService: MasterService) {
    Object.assign(this, { apiService, masterService });
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const items = this.masterService.itemDetailListTable({ page: 1, page_size: 10 }).pipe(map(result => result));
    const uoms = this.apiService.getAllItemUoms().pipe(map(result => result));
    const customers = this.masterService.customerDetailListTable({ page: 1, page_size: 10 }).pipe(map(result => result));
    const types = this.apiService.getOrderTypes().pipe(map(result => result));
    const salesman = this.apiService.getSalesMan().pipe(map(result => result.data))

    return forkJoin({ items, uoms, customers, types, salesman });
  }
}
