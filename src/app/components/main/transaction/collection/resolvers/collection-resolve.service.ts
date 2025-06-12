import { ApiService } from 'src/app/services/api.service';
import { CollectionService } from './../collection.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CollectionResolveService implements Resolve<any> {
  constructor(private service: CollectionService, public apiService: ApiService) { }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

    const customers = this.apiService.getCustomers().pipe(map(result => result));
    return forkJoin({ customers });
  }
}
