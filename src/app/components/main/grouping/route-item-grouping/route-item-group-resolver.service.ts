import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { MasterService } from '../../master/master.service';
import { GroupingService } from '../grouping.service';

@Injectable()
export class RouteItemGroupResolveService implements Resolve<any> {

  constructor(private masterService: MasterService,
    private groupingService: GroupingService, private apiService: ApiService) { }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const obj = {
      "list_data": ["route_item_grouping", "route", "item"],
      "function_for": "route_item_grouping"
    }
    const routeItemList = this.apiService.getRouteItemGroup({ page: 1, page_size: 10 }).pipe(map(result => result));
    const routeItemAdd = this.masterService.masterList(obj).pipe(map(result => result));

    return forkJoin({ routeItemList, routeItemAdd });
  }
}
