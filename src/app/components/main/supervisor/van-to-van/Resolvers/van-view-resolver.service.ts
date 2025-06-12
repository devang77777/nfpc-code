import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable,forkJoin} from 'rxjs';
import {map} from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';

@Injectable()
export class VantoVanViewResolveService implements Resolve<any> {

  private apiService: ApiService;

  constructor(apiService: ApiService) {
    Object.assign(this, { apiService });
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const returnPurchase = this.apiService.getVantoVannKey(route.params.uuid).pipe(map(result => result.data));

    return forkJoin({returnPurchase})
  }
}
