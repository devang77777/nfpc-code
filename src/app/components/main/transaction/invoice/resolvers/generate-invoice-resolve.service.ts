import { ApiService } from 'src/app/services/api.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { InvoiceServices } from '../invoice.service';

@Injectable()
export class GenerateInvoiceResolveService implements Resolve<any>{

  constructor(private service: InvoiceServices,private apiService:ApiService) {}

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const customers = this.apiService.getCustomers().pipe(map(result => result));
    const delivery= this.service.generateInvoice(route.params.uuid).pipe(map(result => result.data));
  return  forkJoin({ customers, delivery });

  }
}
