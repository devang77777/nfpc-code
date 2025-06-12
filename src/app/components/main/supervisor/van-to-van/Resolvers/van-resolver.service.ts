import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';


@Injectable()
export class VanToVanResolverService implements Resolve<any> {

  private apiService: ApiService;

  constructor(apiService: ApiService) {
    Object.assign(this, { apiService });
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
     const routedata= this.apiService.getAllRoute().pipe(map(result => result))
    const vantovan = this.apiService.getVantovanList().pipe(map(result => result));
    return forkJoin({ routedata,vantovan });
  }
}
