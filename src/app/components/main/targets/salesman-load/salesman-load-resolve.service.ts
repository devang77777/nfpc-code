import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { TargetService } from '../target.service';

@Injectable()
export class SalesmanLoadResolveService implements Resolve<any> {

  constructor(private targetService: TargetService, private apiService: ApiService) {}

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const obj =  {
      "list_data" : ["country", "region", "sales_organisation","area",
        "channel","customer_category","route","customer_type","payment_term"],
      "function_for" : "customer"
    }
    
    // const customerList = this.targetService.customerDetailList().pipe(map(result => result));
    const salesmanLoadAdd = this.targetService.masterList(obj).pipe(map(result => result));
    const salesmanLoadList = this.targetService.getSalesmanLoadList().pipe(map(result => result));

    return forkJoin({ salesmanLoadList, salesmanLoadAdd });
  }
}
