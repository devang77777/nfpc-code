import { Injectable } from '@angular/core';

import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InvoiceServices } from '../invoice.service';

@Injectable()
export class InvoiceViewResolveService implements Resolve<any>{

  constructor(private apiService: InvoiceServices) { }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.apiService.getInvoiceByID(route.params.uuid).pipe(map(result => result.data));
  }
}
