import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CommonSpinnerService } from './common-spinner.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class SpinnerInterceptor implements HttpInterceptor {
    // Add API end path for which you want to stop interceptor spinner
    listNotToShowSpinner: string[] = [];
    inUrlCheck: boolean = false;

    constructor(public spinnerService: CommonSpinnerService) {
        this.listNotToShowSpinner.push(
            `${environment.baseApiUrl}/customer/list`,
            `${environment.baseApiUrl}/item/list`,
            `${environment.baseApiUrl}/customer/dropdown-list`,
            `${environment.baseApiUrl}/item/dropdown-list`,
            `${environment.baseApiUrl}/notifications`,
            `${environment.baseApiUrl}/notification/read-all`,
            `${environment.baseApiUrl}/storagedetail/routeItemQty`,
            `${environment.baseApiUrl}/order/item-apply-price`);
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.listNotToShowSpinner.forEach((item) => {
            if (req.url.includes(item)) {
                this.inUrlCheck = true;
            }
        });
        if (this.inUrlCheck) {
            this.spinnerService.hide();
        }
        else {
            this.spinnerService.show();
        }
        return next.handle(req).pipe(
            finalize(() => this.spinnerService.hide())
        );
    }
}
