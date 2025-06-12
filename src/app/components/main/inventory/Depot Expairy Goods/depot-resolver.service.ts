import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';


@Injectable()
export class DepotExpairyResolveService implements Resolve<any> {

  private apiService: ApiService;

  constructor(apiService: ApiService) {
    Object.assign(this, { apiService });
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const depotExpairy = this.apiService.getDepotExpairyGoods().pipe(map(result => result));
    const branchDepot = this.apiService.getAllBranchDepot().pipe(map(result => result));
    const reason =this.apiService.getReasonlist().pipe(map(result => result));
    const items = this.apiService.getAllItems().pipe(map(result => result));
    const uoms = this.apiService.getAllItemUoms().pipe(map(result => result));
    return forkJoin({ branchDepot,depotExpairy,reason,items, uoms});
  }
}
