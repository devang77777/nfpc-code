import { NetworkService } from 'src/app/services/network.service';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { endpoints } from 'src/app/api-list/api-end-points';
import {
  SalesTargetEntities,
  SALES_TARGET_ACHIEVED_DATA,
} from 'src/app/features/mocks/sales-target';

@Injectable({
  providedIn: 'root',
})
export class TargetService {
  constructor(private http: NetworkService) { }

  // Sales Target Manager
  public getSalesTargets(page = 1, page_size = 10): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.salesTarget.list + `?page=${page}&page_size=${page_size}`);
  }
  public getTargetEntities(): Observable<any> {
    return of(SalesTargetEntities);
  }
  getSalesMan(): Observable<any> {
    return this.http.post(endpoints.apiendpoint.salesman.list, {});
  }
  getRegion(): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.region.list);
  }
  public getAllBranchDepot(): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.depot.list);
  }

  public getSalesTargetByKey(uuid: string): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.salesTarget.edit(uuid));
  }
  public getAchievedSales(): Observable<any> {
    return of(SALES_TARGET_ACHIEVED_DATA);
  }
  public addSalesTarget(body: any): Observable<any> {
    return this.http.post(endpoints.apiendpoint.salesTarget.add, body);
  }

  public editSalesTarget(uuid: string, body: any): Observable<any> {
    return this.http.post(endpoints.apiendpoint.salesTarget.edit(uuid), body);
  }

  public deleteSalesTarget(uuid: string): Observable<any> {
    return this.http.onDelete(endpoints.apiendpoint.salesTarget.delete(uuid));
  }

  getItemUom(): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.uom.list);
  }

  getSalesmanLoadList(page = 1, pageSize = 10): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.salesmanload.list + `?page=${page}&page_size=${pageSize}`);
  }
  getSalesmanUnloadList(body): Observable<any> {
    return this.http.post(endpoints.apiendpoint.salesmanunload.list, body);
  }

  getLoadRequestList(page = 1, pageSize = 10): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.loadrequest.list + `?page=${page}&page_size=${pageSize}`);
  }
  addSalesmanLoad(data): Observable<any> {
    return this.http.post(endpoints.apiendpoint.salesmanload.add, data);
  }
  addLoadReq(data): Observable<any> {
    return this.http.post(endpoints.apiendpoint.loadrequest.add, data);
  }
  editSalesmanLoad(data, uuid): Observable<any> {
    return this.http.post(
      endpoints.apiendpoint.salesmanload.update(uuid),
      data
    );
  }
  getSalesmanLoadDetails(uuid): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.salesmanload.edit(uuid));
  }
  deleteSalesmanLoad(uuid: string): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.salesmanload.delete(uuid));
  }

  deleteSalesmanUnload(uuid: string): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.salesmanunload.delete(uuid));
  }

  deleteLoadRequest(uuid: string): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.loadrequest.delete(uuid));
  }
  generateToLoad(uuid: any): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.loadrequest.generateToLoad(uuid))
  }
  approveLoadRequest(uuid: string, type): Observable<any> {
    var objectID: any = {
      "uuid": uuid,
      "action": type
    }
    return this.http.post(endpoints.apiendpoint.loadrequest.approve(uuid), objectID);
  }
  rejectLoadRequest(uuid: string, type): Observable<any> {
    var objectID: any = {
      "uuid": uuid,
      "action": type
    }

    return this.http.post(endpoints.apiendpoint.loadrequest.reject(uuid), objectID);
  }
  updateLoadRequest(uuid: string, body): Observable<any> {
    return this.http.post(endpoints.apiendpoint.loadrequest.update(uuid), body);
  }
  editLoadReq(uuid: string): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.loadrequest.edit(uuid));
  }
  masterList(bodyParam: any) {
    return this.http.post(
      endpoints.apiendpoint.masterDataCollection.list,
      bodyParam
    );
  }
  editSalesmanUnload(data, uuid): Observable<any> {
    return this.http.post(endpoints.apiendpoint.salesmanunload.edit(uuid), data);
  }
  editGoodsReceiptNote(data, uuid): Observable<any> {
    return this.http.post(endpoints.apiendpoint.goodsReceiptNote.edit(uuid), data);
  }
  getPalletList(body): Observable<any> {
    return this.http.post(endpoints.apiendpoint.pallet.list, body);
  }
  getListPalletBySaleman(body): Observable<any> {
    return this.http.post(endpoints.apiendpoint.pallet.listPalletBySaleman, body);
  }
  addPallet(data): Observable<any> {
    return this.http.post(endpoints.apiendpoint.pallet.add, data);
  }
  editPallet(data, uuid): Observable<any> {
    return this.http.post(
      endpoints.apiendpoint.pallet.update(uuid),
      data
    );
  }
  getPalletDetails(uuid): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.pallet.edit(uuid));
  }
  getPalletDetailsBySalesman(salesman_id): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.pallet.details(salesman_id));
  }
  deletePallet(uuid: string): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.pallet.delete(uuid));
  }
  getPalletReturn(salesman_id): Observable<any> {
    return this.http.getAll(endpoints.apiendpoint.pallet.palletReturn(salesman_id));
  }
  updatePalletReturn(data): Observable<any> {
    return this.http.post(
      endpoints.apiendpoint.pallet.updatePalletReturn(),
      data
    );
  }
  public exportGRN(payload): Observable<any> {
    return this.http.post(
      endpoints.apiendpoint.creditNote.export(),
      payload
    );
  }
}
