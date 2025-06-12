import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, Subject } from 'rxjs';
import { map, retry, catchError, } from 'rxjs/operators';
import { endpoints } from 'src/app/api-list/api-end-points';

@Injectable({
    providedIn: 'root',
})

export class MasterService {
    private customerList = new Subject<any>();
    customerList$ = this.customerList.asObservable();

    constructor(private http: HttpClient) { }

    currentCustomerList(customer: any) {
        this.customerList.next(customer);
    }

    masterList(bodyParam: any) {
        return this.http.post<any>(endpoints.apiendpoint.masterDataCollection.list, bodyParam);
    }

    customerDetailListTable(model) {
        return this.http.post<any>(endpoints.apiendpoint.customer.list, model);
    }
    customerDetailDDlListTable(model) {
        return this.http.post<any>(endpoints.apiendpoint.customer.dropdownList, model);
    }

    customerLobList() {
        return this.http.get<any>(endpoints.apiendpoint.lob.list);
    }

    deleteCustomer(uuid: string) {
        return this.http.get<any>(endpoints.apiendpoint.customer.delete(uuid));
    }

    itemDetailListTable(model) {
        return this.http.post<any>(endpoints.apiendpoint.item.list, model);
    }
    itemDetailDDllistTable(model) {
        return this.http.post<any>(endpoints.apiendpoint.item.DDllist, model);
    }
    itemList() {
        return this.http.get<any>(endpoints.apiendpoint.item.itemList);
    }
    itemAdd(bodyParam: any) {
        return this.http.post<any>(endpoints.apiendpoint.item.add, bodyParam);
    }

    itemEdit(id: string, bodyParam: any) {
        return this.http.post<any>(endpoints.apiendpoint.item.edit(id), bodyParam);
    }

    itemDelete(id: string) {
        return this.http.delete<any>(endpoints.apiendpoint.item.delete(id));
    }

    exportItem(payload) {
        return this.http.post<any>(endpoints.apiendpoint.item.export(), payload);
    }



    salesmanList(model) {
        return this.http.post<any>(endpoints.apiendpoint.salesman.list, model);
    }
    collectionList(model) {
        return this.http.post<any>(endpoints.apiendpoint.collection.list, model);
    }
    exportSalesman(payload: any) {
        return this.http.post<any>(endpoints.apiendpoint.salesman.export(), payload);
    }



    vendordetailList(page = 1, page_size = 10) {
        return this.http.get<any>(endpoints.apiendpoint.vendor.list + `?page=${page}&page_size=${page_size}`);
    }

    getAllJourneyPlans(model): Observable<any> {
        return this.http.post<any>(endpoints.apiendpoint.journeyplan.list, model);
    }

    getJourneyPlanByKey(uuid: string): Observable<any> {
        return this.http.get<any>(endpoints.apiendpoint.journeyplan.show(uuid));
    }

    addJourneyPlan(body: any): Observable<any> {
        return this.http.post<any>(endpoints.apiendpoint.journeyplan.add, body);
    }

    editJourneyPlan(uuid: string, body: any): Observable<any> {
        return this.http.post<any>(endpoints.apiendpoint.journeyplan.edit(uuid), body);
    }

    deleteJourneyPlan(uuid: string): Observable<any> {
        return this.http.delete<any>(endpoints.apiendpoint.journeyplan.delete(uuid));
    }
    // approve Journey
    approveJourney(uuid: string): Observable<any> {
        let payload = {
            "action": true
        };
        return this.http.post<any>(endpoints.apiendpoint.approvalRequest.requestForApproval(uuid), payload);
    }
    // Reject Item approval
    rejectJourneyApproval(uuid: string): Observable<any> {
        let payload = {
            "action": false
        };
        return this.http.post<any>(endpoints.apiendpoint.approvalRequest.requestForApproval(uuid), payload);
    }

    exportJourneyPlan(payload) {
        return this.http.post<any>(endpoints.apiendpoint.journeyplan.export(), payload);
    }



    getCustomerVisitList(obj) {
        return this.http.post<any>(endpoints.apiendpoint.journeyplan.customerVisitList, obj);
    }
    downloadCustomerVisitList(obj) {
        return this.http.post<any>(endpoints.apiendpoint.journeyplan.downloadCustomerVisitList, obj);
    }
    getCustomerActivityList(id, page, page_size, filter = 'all', value = true) {
        return this.http.get<any>(endpoints.apiendpoint.journeyplan.customerActivityList(id) + `?page=${page}&page_size=${page_size}&${filter}=${value}`);
    }

    importItem(payload) {
        return this.http.post<any>(endpoints.apiendpoint.item.import('import'), payload);
    }

    submitImportItem(payload): Observable<any> {
        return this.http.post<any>(
            endpoints.apiendpoint.item.finalimport(),
            payload
        );
    }
    itemMappingfield() {
        return this.http.get<any>(endpoints.apiendpoint.item.mapingField());
    }
    importJourneyPlan(payload) {
        return this.http.post<any>(endpoints.apiendpoint.journeyplan.import('import'), payload);
    }

    submitImportJourneyPlan(payload): Observable<any> {
        return this.http.post<any>(
            endpoints.apiendpoint.journeyplan.finalimport(),
            payload
        );
    }
    journeyPlanMappingfield() {
        return this.http.get<any>(endpoints.apiendpoint.journeyplan.mapingField());
    }

    importSalesman(payload: any) {
        return this.http.post<any>(endpoints.apiendpoint.salesman.import('import'), payload);
    }

    submitImportSalesman(payload): Observable<any> {
        return this.http.post<any>(
            endpoints.apiendpoint.salesman.finalimport(),
            payload
        );
    }
    salesmanMappingfield() {
        return this.http.get<any>(endpoints.apiendpoint.salesman.mapingField());
    }
    getItemBranchPlantList(payload): Observable<any> {
        return this.http.post<any>(endpoints.apiendpoint.item.itemBranchList, payload);
    }
}
