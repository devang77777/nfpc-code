import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { DeliveryService } from '../delivery.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveryResolveService implements Resolve<any> {

  constructor(private apiService: ApiService, private deliveryService: DeliveryService) { }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    //const items = this.apiService.getAllItems().pipe(map(result => result));
    const uoms = this.apiService.getAllItemUoms().pipe(map(result => result));
    //const customers = this.apiService.getCustomers().pipe(map(result => result));
    const types = this.deliveryService.getOrderType().pipe(map(result => result));

    //return forkJoin({ items, uoms, customers, types });
    return forkJoin({ uoms, types });
  }
}
