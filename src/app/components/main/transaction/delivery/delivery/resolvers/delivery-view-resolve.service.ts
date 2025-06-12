import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeliveryService } from '../delivery.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveryViewResolveService implements Resolve<any> {

  constructor(private deliveryService: DeliveryService) { }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.deliveryService.getDeliveryListById(route.params.uuid).pipe(map(result => result.data));
  }
}
