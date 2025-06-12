import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { MasterService } from '../master.service';
import { ApiService } from 'src/app/services/api.service';

@Injectable()
export class ItemResolveService implements Resolve<any> {
  constructor(
    private masterService: MasterService,
    private apiService: ApiService
  ) { }

  public resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    const obj = {
      list_data: ['major_category', 'brand', 'item_group', 'item_uom'],
    };
    const itemList = this.masterService
      .itemDetailListTable({ page: 1, page_size: 10 })
      .pipe(map((result) => result));
    const itemAdd = this.masterService
      .masterList(obj)
      .pipe(map((result) => result));

    return forkJoin({ itemList, itemAdd });
    // return forkJoin({ itemAdd });
  }
}
