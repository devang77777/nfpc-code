import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, finalize } from 'rxjs/operators';
import { CommonToasterService } from '../services/common-toaster.service';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HttpErrorInterceptor implements HttpInterceptor {
    listNotToShowSpinner: string[] = [];
    constructor(
        private commonToasterService: CommonToasterService,
        private spinner: NgxSpinnerService,
        private router: Router,
    ) {
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

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.listNotToShowSpinner.forEach((item) => {
            if (request.url.includes(item)) {
                this.spinner.hide();
            }
            else {
                this.spinner.show();
            }
        });
        return next.handle(request)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    let errorMessage = '';
                    console.log(request.url.includes('order/lpo'));
                    if (error.error instanceof ErrorEvent) {
                        // client-side error
                        errorMessage = `Error: ${error.message}`;
                        if (!request.url.includes('order/lpo')) {
                            this.commonToasterService.showError("Error", errorMessage);
                        }
                    } else {
                        // server-side error
                        console.log(error);
                        if (error?.error?.error == "Unauthenticated.") {
                            localStorage.setItem('isLoggedIn', 'false');
                            localStorage.removeItem('token');
                            this.router.navigate(['/auth/login']);
                        }
                        if (!request.url.includes('order/lpo')) {
                            this.commonToasterService.showError(error.error.message);
                        }
                        // const isArray = Array.isArray(error.error.errors);
                        // const objectKeys = Object.keys(error.error.errors);
                        // const isObject = objectKeys.length;
                        // if (isArray) {
                        //     const errorsLen = Object.keys(error.error.errors).length;
                        //     if (errorsLen) {
                        //         Object.keys(error.error.errors).forEach((item, i) => {
                        //             if (i < 2) {
                        //                 this.commonToasterService.showError(`Error in : ${item}`, `${error.error.errors[item]}`);
                        //             }
                        //         });
                        //     }
                        // }
                        // else if (isObject) {
                        //     Object.keys(error.error.errors).forEach((item, i) => {
                        //         if (i < 2) {
                        //             this.commonToasterService.showWarning(`Error in : ${item}`, `${error.error.errors[item]}`);
                        //         }
                        //     });
                        // }
                        // else {
                        //     if (error.error.errors) {
                        //         const errors = error.error.errors.toString().slice(0, 70);
                        //         this.commonToasterService.showError(`Error Code: ${error.status}`, errors);
                        //     }
                        //     else {
                        //         this.commonToasterService.showError(`Error Code: ${error.status}`, `${error.error.message}`);
                        //     }
                        // }
                    }
                    return throwError(error);
                }),
                finalize(() => {
                    this.spinner.hide();
                })
            )
    }
}
