import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { endpoints } from 'src/app/api-list/api-end-points';

@Injectable()
export class DeliveryService {
  constructor(private http: HttpClient) { }

  getDeliveryList(body): Observable<any> {
    // let page = body.page;
    // let page_size = body.page_size;
    // return this.http.get<any>(endpoints.apiendpoint.delivery.list + `?page=${page}&page_size=${page_size}`);
    return this.http.post<any>(endpoints.apiendpoint.delivery.list, body);
  }

  getDeliveryListById(uuid: string): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.delivery.edit(uuid));
  }

  editDelivery(uuid: string, deliveryData: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.delivery.edit(uuid),
      deliveryData
    );
  }

  addDelivery(deliveryData: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.delivery.add,
      deliveryData
    );
  }

  deleteDelivery(uuid): Observable<any> {
    return this.http.delete<any>(endpoints.apiendpoint.delivery.delete(uuid));
  }

  getOrderType(): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.orderType.list);
  }

  getPaymentTerm(): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.paymentTerms.term);
  }

  public exportDelivery(payload): Observable<any> {
    return this.http.post(endpoints.apiendpoint.delivery.export(), payload);
  }

  public importDelivery(payload): Observable<any> {
    return this.http.post(
      endpoints.apiendpoint.delivery.import('import'),
      payload
    );

  }

  public updateDelivery(payload): Observable<any> {
    return this.http.post(
      endpoints.apiendpoint.delivery.import('update-import'),
      payload
    );
  }


  public getDocument(model): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.delivery.download, model);
  }
}
