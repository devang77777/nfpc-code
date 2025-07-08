import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { NetworkService } from 'src/app/services/network.service';
import { endpoints } from 'src/app/api-list/api-end-points';
import { ApiService } from 'src/app/services/api.service';
@Injectable({
  providedIn: 'root'
})
export class ReportService {
  public domain = window.location.host.split('.')[0];
  constructor(private apiService: ApiService, private network: NetworkService) {
    Object.assign(this, { apiService });
  }

  public routeSupervisorSalesman(id): Observable<any> {
    return this.network.getAll(endpoints.apiendpoint.reports.routeSupervisorSalesman(id));
  }

  public regionSupervisorSalesman(id): Observable<any> {
    return this.network.getAll(endpoints.apiendpoint.reports.routeSupervisorSalesman(id));
  }

  public filterSalesman(divisions, regions, routes): Observable<any> {
    var body = {
      "division": divisions,
      "region": regions,
      "route": routes
    };
    if (divisions.length == 0) {
      return;
    }
    return this.network.post(endpoints.apiendpoint.reports.filterSalesman(), body);
  }

  public supervisorList(divisions, regions, routes): Observable<any> {
    var body = {
      "division": divisions,
      "region": regions,
      "route": routes
    };
    if (divisions.length == 0) {
      return;
    }
    return this.network.post(endpoints.apiendpoint.reports.supervisorList(), body);
  }

  public customerList(divisions): Observable<any> {
    var body = {
      "division": divisions,
    };

    return this.network.post(endpoints.apiendpoint.reports.customersList(), body);
  }

  public getFilterData(divisions, regions, routes): Observable<any> {
    var body = {
      "division": divisions,
      "region": regions,
      "route": routes
    };
    if (divisions.length == 0) {
      return;
    }
    return this.network.post(endpoints.apiendpoint.reports.getFilterData(), body);
  }

  public getReportData(body): Observable<any> {
    let moduleArr = body?.module?.split('/');
    let module = moduleArr[0];
    if (moduleArr.length > 1) {
      body.module = moduleArr[1];
    }
    return this.network.post(
      endpoints.apiendpoint.reports.ReportData(module),
      body
    );
    // switch (this.domain) {
    //   case "merchandising":
    //     return this.merchandisingReports(body);
    //     break;
    //   case "vansales":
    //     return this.vansalesReports(body);
    //     break;
    //   default:
    //     return this.vansalesReports(body);
    //     break;
    // }

  }
  merchandisingReports(body) {
    return this.network.post(
      endpoints.apiendpoint.reports.ReportData("merchandiser"),
      body
    );
  }

  vansalesReports(body) {
    return this.network.post(
      endpoints.apiendpoint.reports.ReportData(body.module),
      body
    );
  }

  cfrReportsData(body) {
    return this.network.post(
      endpoints.apiendpoint.reports.ReportData('CfrRegionReport'),
      body
    );

  }
  grvReportsData(body) {
    return this.network.post(
      endpoints.apiendpoint.reports.ReportData('grvreport'),
      body
    );

  }
  spotReturnReportsData(body) {
    return this.network.post(
      endpoints.apiendpoint.reports.ReportData('spot_report'),
      body
    );
  }
  dailyCancelOrderReportsData(body) {
    return this.network.post(endpoints.apiendpoint.reports.ReportData('cancel_return'),
      body);
  }
  salesmanPerformanceReportsData(body) {
    return this.network.post(endpoints.apiendpoint.reports.ReportData('driver_utilisation'),
      body);
  }
  dailyOperationReportsData(body) {
    return this.network.post(endpoints.apiendpoint.reports.ReportData('orderSCReport'),
      body);
  }
  deliveryData(body) {
    return this.network.post(endpoints.apiendpoint.reports.ReportDataApi('total_delivery_report'),
      body);
  }
  ReportGeoData(body) {
    return this.network.post(endpoints.apiendpoint.reports.ReportGeoData('geo-approval '),
      body);
  }
  ReportdeliveryData(body) {
    return this.network.post(endpoints.apiendpoint.reports.ReportdeliveryData('delivery/report '),
      body);
  }
  exportReportPalletData(body) {
    return this.network.post(endpoints.apiendpoint.reports.ReportPalletData('palette/palette-report'),
      body);
  }
  ReportPalletData(body) {
    return this.network.post(endpoints.apiendpoint.reports.ReportPalletData('palette/palette-report'),
      body);
  }

  driverLoadedReportsData(body) {
    return this.network.post(endpoints.apiendpoint.reports.ReportData('driver_commission'),
      body);
  }
}
