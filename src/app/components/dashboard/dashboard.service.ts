import { ApiService } from './../../services/api.service';
import { MasterService } from './../main/master/master.service';
import { Observable, forkJoin } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map, filter } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient, public masterService: MasterService, public apiService: ApiService) { }

  getData(): Observable<any> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .get<any>('../../assets/constants/dashboard.json', { headers })
      .pipe(map((r) => r));
  }

  getMasterList(): Observable<any> {
    const obj = {
      "list_data": ["org-role", "nsm", "asm", "region", "channel", "merchandiser", "salesman_supervisor", 'item_major_category', 'item', 'brand_list'],
      "function_for": "customer"
    }
    const masterData = this.masterService.masterList(obj).pipe(map(result => result));
    return forkJoin({ masterData });
  }

  getDashboardFiltersData(filterdata): Observable<any> {
    const dashboardData = this.apiService.getDashboarddata(filterdata).pipe(map(result => result));
    return forkJoin({ dashboardData });
  }
  getDashboard2FiltersData(filterdata): Observable<any> {
    const obj = {
      "list_data": ["org-role", "nsm", "asm", "region", "channel", "merchandiser", "salesman_supervisor", 'item_major_category', 'item', 'brand_list'],
      "function_for": "customer"
    }
    const dashboardData = this.apiService.getDashboard2data(filterdata).pipe(map(result => result));
    const masterData = this.masterService.masterList(obj).pipe(map(result => result));

    return forkJoin({ masterData, dashboardData });
  }

  getDashboard3FiltersData(filterdata): Observable<any> {
    const obj = {
      "list_data": ["org-role", "nsm", "asm", "region", "channel", "merchandiser", "salesman_supervisor"],
      "function_for": "customer"
    }
    const dashboardData = this.apiService.getDashboard3data(filterdata).pipe(map(result => result));
    const masterData = this.masterService.masterList(obj).pipe(map(result => result));

    return forkJoin({ masterData });
  }

  getDashboard4FiltersData(filterdata): Observable<any> {
    const dashboardData = this.apiService.getDashboard4data(filterdata).pipe(map(result => result));
    return forkJoin({ dashboardData });
  }

  getDashboardDataByFilter(body): Observable<any> {
    return this.apiService.getDashboarddata(body).pipe(map(result => result));
  }
  getDashboard2DataByFilter(body): Observable<any> {
    return this.apiService.getDashboard2data(body).pipe(map(result => result));
  }
  getDashboard3DataByFilter(body): Observable<any> {
    return this.apiService.getDashboard3data(body).pipe(map(result => result));
  }
  getDashboard4DataByFilter(body): Observable<any> {
    return this.apiService.getDashboard4data(body).pipe(map(result => result));
  }
}
