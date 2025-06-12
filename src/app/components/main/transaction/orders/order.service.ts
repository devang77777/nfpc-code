import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from 'src/app/api-list/api-end-points';
import { DeliveryPayload } from './order-models';

@Injectable()
export class OrderService {
  constructor(private http: HttpClient) { }

  public orderList(model): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.order.list, model);
  }

  public getOrderById(uuid: string): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.order.edit(uuid));
  }

  public addOrderType(orderTypeData: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.orderType.addType,
      orderTypeData
    );
  }

  public orderTypeList(): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.orderType.list);
  }

  public getOrderItemStats(itemData: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.order.priceDetail,
      itemData
    );
  }

  public addNewOrder(order: any): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.order.add, order);
  }

  public editOrder(uuid: string, order: any): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.order.edit(uuid), order);
  }

  public getNextCommingCode(code: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.nextUpCommingCode.code,
      code
    );
  }

  public postDelivery(
    deliveryData: DeliveryPayload
  ): Observable<DeliveryPayload> {
    return this.http.post<DeliveryPayload>(
      endpoints.apiendpoint.delivery.add,
      deliveryData
    );
  }

  public getPaymentTerm(): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.paymentTerms.term);
  }

  public deleteOrder(payload): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.order.delete, payload);
  }
  public cancelOrder(payload): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.order.cancel, payload);
  }
  public getPromotionItems(Items: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.order.promotionsItems,
      Items
    );
  }

  public exportOrder(payload) {
    return this.http.post<any>(endpoints.apiendpoint.item.export(), payload);
  }

  public importOrder(payload) {
    return this.http.post<any>(
      endpoints.apiendpoint.item.import('import'),
      payload
    );
  }
  public orderToPicking(payload) {
    return this.http.post<any>(
      endpoints.apiendpoint.order.orderToPicking,
      payload
    );
  }
  public approvedRejected(payload) {
    return this.http.post<any>(
      endpoints.apiendpoint.order.approvedRejected,
      payload
    );
  }
  public getDocument(model): Observable<any> {
    return this.http.post(endpoints.apiendpoint.order.download, model);
  }
  public updateDelivery(payload): Observable<any> {
    return this.http.post(
      endpoints.apiendpoint.delivery.import('update-import'),
      payload
    );
  }
  public updateOrder(payload): Observable<any> {
    return this.http.post(
      endpoints.apiendpoint.order.import('import-order'),
      payload
    );
  }
  public getOHQ(model): Observable<any> {
    return this.http.post(endpoints.apiendpoint.order.onhandQty, model);
  }
  // public postOCROrder(model): Observable<any> {
  //   return this.http.post(endpoints.apiendpoint.order.OCROrder, model);
  // }
  public postOCROrder(payload): Observable<any> {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('file_type', payload.type);
    formData.append('customer_id', payload.customer_id);
    return this.http.post(
      endpoints.apiendpoint.order.OCROrder,
      formData
    );
  }

}
