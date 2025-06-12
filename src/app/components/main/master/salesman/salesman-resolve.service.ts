import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { MasterService } from '../master.service';
import { ApiService } from 'src/app/services/api.service';

@Injectable()
export class SalesmanResolveService implements Resolve<any> {
  constructor(
    private masterService: MasterService,
    private apiService: ApiService
  ) { }

  public resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    const obj = {
      list_data: ['salesman_type', 'route', "salesman_supervisor", 'salesman_role', "region"],
    };
    const salesmanAdd = this.masterService
      .masterList(obj)
      .pipe(map((result) => result));
    const salesmanList = this.masterService
      .salesmanList({ page: 1, pageSize: 10 })
      .pipe(map((result) => result));
    const creditLimit = this.apiService.getCreditLimits().pipe(map(result => result));

    return forkJoin({ salesmanAdd, salesmanList, creditLimit });
  }
}
