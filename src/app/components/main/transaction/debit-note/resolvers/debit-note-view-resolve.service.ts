import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DebitNoteService } from '../debit-note.service';

@Injectable({
  providedIn: 'root'
})

export class DebitNoteViewResolveService implements Resolve<any> {
  constructor(private debitNoteService: DebitNoteService) { }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.debitNoteService.getDebitNoteListById(route.params.uuid).pipe(map(result => result.data));
  }
}
