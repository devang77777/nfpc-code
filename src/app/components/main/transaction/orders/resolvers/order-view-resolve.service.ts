import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderService } from '../order.service';
import { apiOrderMapper } from '../order-models';

@Injectable()
export class OrderViewResolveService implements Resolve<any> {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    Object.assign(this, { orderService });
  }

  public resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    return this.orderService.getOrderById(route.params.uuid)
      .pipe(
        map((result) => result.data),
        map((item) => {
          return apiOrderMapper(item);
        })
      );
  }
}
