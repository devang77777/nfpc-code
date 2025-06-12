import { CreditNoteService } from './../credit-note.service';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CreditNoteResolveService implements Resolve<any> {
  private creditNoteService: CreditNoteService;

  constructor(creditNoteService: CreditNoteService) {
    Object.assign(this, { creditNoteService });
  }

  public resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    const items = this.creditNoteService
      .getAllItems()
      .pipe(map((result) => result));
    const uoms = this.creditNoteService
      .getAllItemUoms()
      .pipe(map((result) => result));
    const customers = this.creditNoteService
      .getCustomers()
      .pipe(map((result) => result));
    const editData = this.creditNoteService
      .getCreditNoteByKey(route.params.uuid)
      .pipe(map((result) => result));
    //let request : any= { items, uoms, customers };
    let request: any = { uoms };
    request = route.params.uuid ? { ...request, editData } : { ...request };
    console.log(editData, request);
    return forkJoin(request);
  }
}
