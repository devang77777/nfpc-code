import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router, ActivationEnd, NavigationStart } from '@angular/router';
import { takeUntil, finalize, tap } from 'rxjs/operators';
import { HttpCancelService } from '../services/httpcancel.service';
import { CommonSpinnerService } from '../components/shared/common-spinner/common-spinner.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable()
export class ManageHttpInterceptor implements HttpInterceptor {
    notCancelReqList: string[];
    serviceCount: any = 0

    constructor(router: Router,
        private httpCancelService: HttpCancelService, private spinnerService: NgxSpinnerService) {
            console.log('router', router);
            this.notCancelReqList = ['merchandiser',' data-collection']
            router.events.subscribe(event => {
              //debugger
              if(event)
                // this.spinnerService.show()
                // this.serviceCount--
                // An event triggered at the end of the activation part of the Resolve phase of routing.
                if (event instanceof ActivationEnd) {
                  // Cancel pending calls
                  this.httpCancelService.cancelPendingRequests();
                  //this.serviceCount--;
                  //localStorage.setItem('service-counts', this.serviceCount);
                  console.log('cancel');
                  //setTimeout(() => { 
                  //   if(this.serviceCount == 0){                  
                  // this.spinnerService.hide();
                  //   }
                  //console.log('cancel-hide');
                  //}, 50000);
                //   this.serviceCount--
                //   if(this.serviceCount ===0){
                //   this.spinnerService.hide();
                //   }
                }
            });
    }

    intercept<T>(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
        console.log('cancel-req', req);
        var part = req?.url.split('/').pop();
        //this.serviceCount++;
        
        // this.notCancelReqList.map((x, i)=>{
           
        //     if (part == x){
        //         debugger
        //         return next.handle(req);
        //     }
        //         //return next.handle(req).pipe(takeUntil(this.httpCancelService.onCancelPendingRequests()))
        // })
        // return next.handle(req).pipe(takeUntil(this.httpCancelService.onCancelPendingRequests()))
        //return;
      //   if(req.url.includes('notifications')){
      //     //debugger
      //     this.serviceCount--
      //     if(this.serviceCount == 0){
      //     this.spinnerService.hide();
      //     console.log('3', new Date())       
      //     }
      // }
      // else{
      // this.spinnerService.show();
      // console.log('2', new Date())
      // //this.service_count++;
      // }
        if (part.includes('data-collection')) {            
            //this.serviceCount--;
            return next.handle(req);
        }
        else{
          //this.serviceCount++;
        return next.handle(req).pipe(
        //   tap(evt => {if (evt instanceof HttpResponse && !req.url.includes('notifications')) {
        //               debugger
        //               if(evt){
        //                   this.serviceCount--
        //                   if (this.serviceCount === 0) {
        //                       setTimeout(() => {
        //                           this.spinnerService.hide()
        //                           console.log('1', new Date())                              
        //                       }, 200);
        //                   }
        //               }}}), 
                      takeUntil(this.httpCancelService.onCancelPendingRequests())
        // ,tap(evt => {if (evt instanceof HttpResponse && !req.url.includes('notifications')) {
        //             debugger
        //             if(evt){
        //                 this.serviceCount--
        //                 if (this.serviceCount === 0) {
        //                     setTimeout(() => {
        //                         this.spinnerService.hide()
        //                         console.log('1', new Date())                              
        //                     }, 200);
        //                 }
        //             }}})
                     )
        }
        
        //}
    }
}

