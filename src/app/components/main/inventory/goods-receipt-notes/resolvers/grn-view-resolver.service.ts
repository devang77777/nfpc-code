import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';

import {Observable,forkJoin} from 'rxjs';
import {map} from 'rxjs/operators';
import {apiGrnMapper} from '../grn-models';
import { ApiService } from 'src/app/services/api.service';

@Injectable()
export class GrnViewResolverService implements Resolve<any> {

  private apiService: ApiService;

  constructor(apiService: ApiService) {
    Object.assign(this, { apiService });
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const returndata=this.apiService.getGRNByKey(route.params.uuid).pipe(map(result => result.data));
    return forkJoin({returndata})
  }
}
