
import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';

@Injectable()
export class StockAdjustmentResolveService implements Resolve<any> {

  private apiService: ApiService;

  constructor(apiService: ApiService) {
    Object.assign(this, { apiService });
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const items = this.apiService.getAllItems().pipe(map(result => result));
    const uoms = this.apiService.getAllItemUoms().pipe(map(result => result));
    const stockaAdjudtment = this.apiService.getStockAdjustments().pipe(map(result => result))
    const warehouse= this.apiService.getwarehouseMainList().pipe(map(result => result))
    const reason = this.apiService.getReasonlist().pipe(map(result => result))
    const account = this.apiService.getAccount().pipe(map(result => result))
    return forkJoin({ items, uoms,stockaAdjudtment,reason,warehouse,account });
  }
}
