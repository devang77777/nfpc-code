import { TargetService } from './../../target.service';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Injectable()
export class SalesTargetViewResolveService implements Resolve<any> {
  private apiService: TargetService;

  constructor(apiService: TargetService) {
    Object.assign(this, { apiService });
  }

  public resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    return this.apiService.getSalesTargetByKey(route.params.uuid);
  }
}
