import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';


@Injectable()
export class EstimateResolveService implements Resolve<any> {

  private apiService: ApiService;

  constructor(apiService: ApiService) {
    Object.assign(this, { apiService });
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const items = this.apiService.getAllItems().pipe(map(result => result));
    const uoms = this.apiService.getAllItemUoms().pipe(map(result => result));
    const customers = this.apiService.getCustomers().pipe(map(result => result));
    const estimation= this.apiService.getEstimate().pipe(map(result => result))
    const salesperson =this.apiService.getSalesperson().pipe(map(result => result))
    return forkJoin({ items, uoms, customers,estimation, salesperson});
    // return forkJoin({ items, uoms, customers });

  }
}
