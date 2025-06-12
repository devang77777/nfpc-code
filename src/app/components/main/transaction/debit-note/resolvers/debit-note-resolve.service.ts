import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class DebitNoteResolveService implements Resolve<any> {

  private apiService: ApiService;

  constructor(apiService: ApiService) {
    Object.assign(this, { apiService });
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    //const items = this.apiService.getAllItems().pipe(map(result => result));
    const uoms = this.apiService.getAllItemUoms().pipe(map(result => result));
    //const customers = this.apiService.getCustomers().pipe(map(result => result));

    return forkJoin({ uoms });
  }
}
