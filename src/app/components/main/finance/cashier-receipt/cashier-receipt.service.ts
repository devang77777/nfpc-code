import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { endpoints } from 'src/app/api-list/api-end-points';

@Injectable()

export class CashierReceiptService {
    private cashierSubject = new Subject<any>();
    public cashierSubject$ = this.cashierSubject.asObservable();

    private cashierChange: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public cashierChange$ = this.cashierChange.asObservable();

    constructor(private http: HttpClient) { }

    currentCashierReceiptData(cashierReceipt: any) {
        this.cashierSubject.next(cashierReceipt);
    }

    cashierChanges(cashierChange: boolean) {
        this.cashierChange.next(cashierChange);
    }

    getCashierReceiptList(page = 1, page_size = 10): Observable<any> {
        return this.http.get<any>(endpoints.apiendpoint.cashierReceipt.list + `?page=${page}&page_size=${page_size}`);
    }

    addCashierReceipt(cashierData: any): Observable<any> {
        return this.http.post<any>(endpoints.apiendpoint.cashierReceipt.add, cashierData);
    }

    getCollectionList(id: number): Observable<any> {
        return this.http.get<any>(endpoints.apiendpoint.cashierReceipt.getcollection(id));
    }

    deleteCashierReceipt(uuid: string): Observable<any> {
        return this.http.delete<any>(endpoints.apiendpoint.cashierReceipt.delete(uuid));
    }

    getRoute(): Observable<any> {
        return this.http.get<any>(endpoints.apiendpoint.route.list);
    }

    getSalesmanByRoute(id: number): Observable<any> {
        return this.http.get<any>(endpoints.apiendpoint.route.getSalemanByRoute(id));
    }

    getBankDetails(): Observable<any> {
        return this.http.get<any>(endpoints.apiendpoint.bankInfo.list);
    }
}