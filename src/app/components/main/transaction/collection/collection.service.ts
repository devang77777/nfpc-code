import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { NetworkService } from 'src/app/services/network.service';
import { endpoints } from 'src/app/api-list/api-end-points';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  constructor(private network: NetworkService) { }
  public getPendingInvoice(customerId: any): Observable<any> {
    return this.network.getAll(
      endpoints.apiendpoint.collection.pending(customerId)
    );
  }
  public getPendingGroupInvoice(customerId: any): Observable<any> {
    return this.network.getAll(
      endpoints.apiendpoint.collection.pendingGroupFilter(customerId)
    );
  }
  public getPendingInvoiceByDates(body): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.collection.pendingFilter(), body
    );
  }
  public getPendingGroupInvoiceByDates(body): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.collection.pendingGroupFilterByDate(), body
    );
  }
  getCollections(page = 1, page_size = 10): Observable<any> {
    return this.network.getAll(endpoints.apiendpoint.collection.list + `?page=${page}&page_size=${page_size}`);
  }

  getCollectionByKey(uuid: string): Observable<any> {
    return this.network.getAll(endpoints.apiendpoint.collection.edit(uuid));
  }

  editCollectionByKey(uuid: string, model: any): Observable<any> {
    return this.network.post(endpoints.apiendpoint.collection.edit(uuid), model);
  }

  addCollection(body: any): Observable<any> {
    return this.network.post(endpoints.apiendpoint.collection.add, body);
  }


  addRelease(body: any): Observable<any> {
    return this.network.post(endpoints.apiendpoint.collection.addRelease, body);
  }
  getCustomers(): Observable<any> {
    return this.network.getAll(endpoints.apiendpoint.customer.list);
  }

  getNextCommingCode(data: any): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.nextUpCommingCode.code,
      data
    );
  }

  exportCollection(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.collection.export(),
      payload
    );
  }

  importCollection(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.collection.import('import'),
      payload
    );
  }
  public getDocument(model): Observable<any> {
    return this.network.post(endpoints.apiendpoint.collection.download, model);
  }
}
