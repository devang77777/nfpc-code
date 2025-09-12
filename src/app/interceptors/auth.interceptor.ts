import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Statement } from '@angular/compiler';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService: AuthService;

  constructor(authService: AuthService) {
    Object.assign(this, { authService });
  }

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const statment = req.url.includes('balance_statement.pdf');
    if (statment) {
      req = req.clone({
        setHeaders: {
          'Content-Type': 'application/pdf',
          Accept: 'application/pdf',
          Authorization: `Bearer ${this.authService.getToken()}`,
          'x-domain': 'presales.prodmobiato.nfpc.net',
        },
      });
    } else if (req.url.includes('import') || req.url.includes('customer-warehouse-mapping') || req.url.includes('customer-region-mapping') || req.url.includes('customer-ksm-kam-mapping') || req.url.includes('item-base-price-mapping') || req.url.includes('customer-copy-price') || req.url.includes('copy-item-base-price')) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.authService.getToken()}`,
          'x-domain': 'presales.prodmobiato.nfpc.net',
        },
      });
    } else if (req.url.includes('ZGETMIGO_DETAILS_SRV')) {
      req = req.clone({
        setHeaders: {
          'accept': '',

        }
      });
    } else if (req.url.includes('ocr-order/add')) {
      req = req.clone({
        setHeaders: {
          // 'Content-Type': 'multipart/form-data;boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"',
          Authorization: `Bearer ${this.authService.getToken()}`,
          'x-domain': 'presales.prodmobiato.nfpc.net',
        },
      });
    } else if (req.url.includes('https://devmobiato.nfpc.net/merchandising/odbc_customer_master_prd.php') || req.url.includes('https://devmobiato.nfpc.net/merchandising/odbc_item_prd.php') || req.url.includes('https://devmobiato.nfpc.net/merchandising/odbc_item_branch_prd.php') || req.url.includes('https://devmobiato.nfpc.net/merchandising/odbc_stock_date_prd.php') || req.url.includes('https://devmobiato.nfpc.net/merchandising/odbc_order_posting_prd.php') || req.url.includes('https://devmobiato.nfpc.net/merchandising/odbc_order_return_posting_prd.php') || req.url.includes('https://devmobiato.nfpc.net/merchandising/public/api/orderpostingprd/add') || req.url.includes('https://devmobiato.nfpc.net/merchandising/odbc_order_return_posting_drebit_prd.php')) {
      // req = req.clone({
      //   setHeaders: {
      //     // 'Content-Type': 'multipart/form-data;boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"',
      //     Authorization: `Bearer ${this.authService.getToken()}`,
      //     'x-domain': window.location.host,
      //   },
      // });
    }
    // else if (req.url.includes('https://prodmobiato.nfpc.net/production/public/api/salesman/list')) {
    //   req = req.clone({
    //     setHeaders: {
    //       // 'Content-Type': 'multipart/form-data;boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"',
    //       Authorization: `Bearer ${this.authService.getToken()}`,
    //       'x-domain': 'merchandising.prodmobiato.nfpc.net',
    //     },
    //   });
    // }
    else {
      let domain = window.location.host;
      if (domain.split(':')[0] == 'localhost' || domain.split('.')[0] == 'mobiato-msfa') {
        domain = 'merchandising.prodmobiato.nfpc.net'
      }
      req = req.clone({
        setHeaders: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
          'x-domain': 'presales.prodmobiato.nfpc.net',
          Authorization: `Bearer ${this.authService.getToken()}`,
        },
      });
    }
    return next.handle(req);
  }
}
