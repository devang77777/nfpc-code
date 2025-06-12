import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { endpoints } from 'src/app/api-list/api-end-points';

@Injectable()
export class DebitNoteService {
  constructor(private http: HttpClient) { }

  getDebitNoteList(filterForm: any): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.debitNote.list, filterForm);
  }

  addDebitNote(debitData: any): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.debitNote.add, debitData);
  }

  editDebitNoteList(uuid: string, debitData: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.debitNote.edit(uuid),
      debitData
    );
  }

  getDebitNoteListById(uuid: string): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.debitNote.edit(uuid));
  }

  deleteDebitNote(uuid: string): Observable<any> {
    return this.http.delete<any>(endpoints.apiendpoint.debitNote.delete(uuid));
  }

  getOrderTypes(): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.orderType.list);
  }

  getNextCommingCode(nextNumber: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.nextUpCommingCode.code,
      nextNumber
    );
  }

  getReasonList(): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.reason.list);
  }

  getReturnReasonsType(): Observable<any> {
    return this.http.get(endpoints.apiendpoint.reasonType.allList);
  }

  exportDebit(payload): Observable<any> {
    return this.http.post(endpoints.apiendpoint.debitNote.export(), payload);
  }

  importDebit(payload): Observable<any> {
    return this.http.post(
      endpoints.apiendpoint.debitNote.import('import'),
      payload
    );
  }

  public getDocument(model): Observable<any> {
    return this.http.post(endpoints.apiendpoint.debitNote.download, model);
  }
}
