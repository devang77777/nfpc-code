import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { endpoints } from 'src/app/api-list/api-end-points';
import { Observable, of, throwError } from 'rxjs';

@Injectable()
export class InvoiceServices {
  constructor(private http: HttpClient) { }

  public getInvoiceList(formFilter: any): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.invoices.list, formFilter);
  }

  public getInvoiceByID(uuid: string): Observable<any> {
    return this.http.get(endpoints.apiendpoint.invoices.edit(uuid));
  }
  getDeliveryListById(uuid: string): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.delivery.edit(uuid));
  }
  public saveInvoice(invoice: any): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.invoices.add, invoice);
  }

  public editInvoice(uuid: string, invoice: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.invoices.edit(uuid),
      invoice
    );
  }

  public deleteInvoice(uuid: string): Observable<any> {
    return this.http.delete<any>(endpoints.apiendpoint.invoices.delete(uuid));
  }

  public generateInvoice(uuid: string): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.delivery.edit(uuid));
  }

  public nexCommingNumber(code: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.nextUpCommingCode.code,
      code
    );
  }
  public addCollection(data: any): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.collection.add, data);
  }
  public getBankList(): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.bankInfo.list);
  }
  public addReminder(model): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.invoices.sendReminder,
      model
    );
  }
  public stopReminder(uuid): Observable<any> {
    return this.http.get<any>(
      endpoints.apiendpoint.invoices.stopReminder(uuid),
      {}
    );
  }
  public getDocument(model): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.invoices.download, model);
  }
  public exportInvoice(payload) {
    return this.http.post<any>(endpoints.apiendpoint.item.export(), payload);
  }

  public getPromotionItems(Items: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.order.promotionsItems,
      Items
    );
  }

  public importInvoice(payload) {
    return this.http.post<any>(
      endpoints.apiendpoint.item.import('import'),
      payload
    );
  }
}
