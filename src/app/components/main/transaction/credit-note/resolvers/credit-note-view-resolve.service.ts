import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { CreditNoteService } from '../credit-note.service';



@Injectable()
export class CreditNoteViewResolveService implements Resolve<any> {

  private creditNoteService: CreditNoteService;

  constructor(creditNoteService: CreditNoteService) {
    Object.assign(this, { creditNoteService });
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.creditNoteService.getCreditNoteByKey(route.params.uuid);
  }
}
