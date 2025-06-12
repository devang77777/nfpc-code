import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { NetworkService } from 'src/app/services/network.service';
import { endpoints } from 'src/app/api-list/api-end-points';

@Injectable({ providedIn: 'root' })
export class CreditNoteService {
  constructor(private network: NetworkService) { }

  getCreditNotes(model): Observable<any> {
    return this.network.post(endpoints.apiendpoint.creditNote.list, model);
  }

  addCreditNote(body: any): Observable<any> {
    return this.network.post(endpoints.apiendpoint.creditNote.add, body);
  }
  applyCreditSave(body: any): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.creditNote.applyCredit,
      body
    );
  }
  getPendingInvoice(customerId: any): Observable<any> {
    return this.network.getAll(
      endpoints.apiendpoint.collection.pending(customerId)
    );
  }
  public getcustomerinvoice(body): Observable<any> {
    // return this.network.post(
    //   endpoints.apiendpoint.collection.getcustomerinvoice(), body
    // );
    return this.network.getAll(
      endpoints.apiendpoint.collection.getcustomerinvoice() + '/' + body.customer_id
    );
  }

  public getinvoiceitem(id): Observable<any> {
    return this.network.getAll(
      endpoints.apiendpoint.collection.getinvoiceitem(id),
    );
  }
  getCreditNoteByKey(uuid: string): Observable<any> {
    return this.network.getAll(endpoints.apiendpoint.creditNote.edit(uuid));
  }

  getReturnReasons(): Observable<any> {
    return this.network.getAll(endpoints.apiendpoint.reason.list);
  }

  getReturnReasonsType(): Observable<any> {
    return this.network.getAll(endpoints.apiendpoint.reasonType.allList);
  }

  addNewDelivery(body: any): Observable<any> {
    return this.network.post(endpoints.apiendpoint.delivery.add, body);
  }
  editCreditNote(uuid: string, body: any): Observable<any> {
    return this.network.post(endpoints.apiendpoint.creditNote.edit(uuid), body);
  }
  getOrderItemStats(params: any): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.order.normalPriceDetail,
      params
    );
  }
  deleteCreditNote(id: any): Observable<any> {
    return this.network.onDelete(endpoints.apiendpoint.creditNote.delete(id));
  }
  getAllDepots(): Observable<any> {
    return this.network.getAll(endpoints.apiendpoint.depot.list);
  }
  getAllItems(): Observable<any> {
    return this.network.post(endpoints.apiendpoint.item.list, {});
  }
  getAllItemUoms(): Observable<any> {
    return this.network.getAll(endpoints.apiendpoint.uom.list);
  }
  getCustomers(): Observable<any> {
    return this.network.post(endpoints.apiendpoint.customer.list, {});
  }
  getNextCommingCode(data: any): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.nextUpCommingCode.code,
      data
    );
  }
  public updateCreditNote(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.creditNote.updateImport,
      payload
    );
  }
  public exportCreditNote(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.creditNote.export(),
      payload
    );
  }

  public importCreditNote(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.creditNote.import('import'),
      payload
    );
  }
  public getDocument(model): Observable<any> {
    return this.network.post(endpoints.apiendpoint.creditNote.download, model);
  }
}
