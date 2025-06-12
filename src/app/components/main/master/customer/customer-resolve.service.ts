import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { MasterService } from '../master.service';
import { ApiService } from 'src/app/services/api.service';

@Injectable()
export class CustomerResolveService implements Resolve<any> {

  constructor(private masterService: MasterService, private apiService: ApiService) { }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const obj = {
      "list_data": ["country", "country_master", "region", "sales_organisation", "area",
        "channel", "customer_category", "route", "customer_type", "payment_term", "merchandiser"],
      "function_for": "customer"
    }
    const customerList = this.masterService.customerDetailListTable({ page: 1, page_size: 10 }).pipe(map(result => result));
    const customerAdd = this.masterService.masterList(obj).pipe(map(result => result));
    const lobList = this.masterService.customerLobList().pipe(map(result => result));

    // const lobList = this.masterService.customerLobList().pipe(map(result => result));
    return forkJoin({ customerList, customerAdd,lobList });
  }
}
