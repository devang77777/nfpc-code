import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { FormDrawerService } from './services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';
import { slideInAnimation } from './route-animation';
import {
  RouterOutlet,
  Router,
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
} from '@angular/router';
import { CommonSpinnerService } from './components/shared/common-spinner/common-spinner.service';
import { registerLocaleData } from '@angular/common';
import { setCurrency } from './services/constants';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from './services/data-editor.service';
import { CommonToasterService } from './services/common-toaster.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideInAnimation],
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'SFA-SAAS';
  formName = '';
  isCashierReceiptReload: boolean = false;
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  notificationCount: any;
  dataRefresher: any;
  timeout: any;
  err: any;
  isNotification: any = '';
  constructor(
    private fds: FormDrawerService,
    private router: Router,
    private commonSpinnerService: CommonSpinnerService,
    public apiService: ApiService,
    private dataEditor: DataEditor,
    private toasterService: CommonToasterService
  ) {
    this.router.events.subscribe((event: any) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.commonSpinnerService.show();
          if (this.isLoggedIn()) {
            if (event.url.includes('/reports')) {
              this.getNotifications(false);
            }
            else {
              this.getNotifications(true);
            }
          }
          break;
        }
        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.commonSpinnerService.hide();
          break;
        }
      }
    });
  }
  ngOnInit() {
    this.dataEditor.getMessage().subscribe(message => {
      this.isNotification = message.export;
    });
    const themeName = localStorage.getItem('selected-theme');
    let currency = localStorage.getItem('currency');
    if (currency && currency !== 'null') {
      currency = JSON.parse(currency);
      setCurrency(currency['code']);
    }
    document.documentElement.setAttribute('data-theme', themeName);
    this.fds.formName.subscribe((x) => (this.formName = x));
    if (localStorage.getItem('isLoggedIn') == 'true') {
      this.getPermissions();
    }
  }

  ngOnDestroy() {
  }

  getPermissions() {
    this.apiService.getLoggedInPermissions().subscribe((res) => {
      localStorage.setItem(
        'permissions',
        JSON.stringify(res)
      );
    })
  }

  ngAfterViewInit(): void {
    this.fds.setNavDrawer(this.fromDrawer);
  }
  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }
  isLoggedIn(): boolean {
    if (localStorage.getItem('isLoggedIn') == 'true') {
      return true;
    } else {
      return false;
    }
  }

  getNotifications(val?) {
    if (val) {
      var pagingRequestModel = {
        page: 1,
        page_size: 10
      }
      this.timeout = setTimeout(() => {
        if (this.router.url !== '/pricing-plan/pricing'
          && this.router.url !== '/transaction/delivery/update'
          && !this.router.url.includes('/reports')
          && this.router.url !== '/settings/master-download'
          && this.router.url !== '/masters/customer'
          && this.router.url !== '/masters/item'
          && this.router.url !== '/transaction/invoice'
          && this.router.url !== '/transaction/order/import'
          && this.router.url !== '/pricing-plan/pricing/import'
          && this.router.url !== '/transaction/credit-note/import'
          && this.router.url !== '/transaction/debit-note/import'
          && this.router.url !== '/pricing-plan/pricing/item-import'
          && this.router.url !== '/pricing-plan/pricing/copy-pricing'
          && this.router.url !== '/transaction/delivery/import'
          && this.router.url !== '/masters/salesman/import'
          && this.router.url !== '/masters/journey-plan/import'
          && this.router.url !== '/masters/customer-region/import'
          && this.router.url !== '/masters/customer-branch-plant/import'
          && this.router.url !== '/masters/customer-ksm-mapping/import'
          && this.router.url !== '/masters/item/import'
          && this.router.url !== '/transaction/invoice/import'
          && !this.router.url.includes('/transaction/order/edit')
          && !this.router.url.includes('/transaction/delivery/edit')
          && !this.router.url.includes('/inventory/grn/edit')
          && !this.router.url.includes('/transaction/order/add')
          && !this.router.url.includes('/transaction/order/view')
          && this.isNotification !== 'export') {
          this.apiService.getNotificationsList(pagingRequestModel).subscribe((res) => {
            this.dataEditor.updateNotificationCount(res.pagination.unread_count);
            this.showNotificationToaster(res);
          }, (error) => {
            console.log('notificationError', error);
            this.err = error
          });
        }
        if (this.err) {
          this.getNotifications(false);
        }
        else {
          if (window.location.href.includes('/reports')) {
            this.getNotifications(false);
          }
          else {
            this.getNotifications(true);
          }
        }
      }, 600000)
    }
  }

  isSideBar(): boolean {
    if (JSON.parse(localStorage.getItem('sidebar')) == null) {
      return false;
    } else {
      return true;
    }
  }

  showNotificationToaster(notificationData) {
    let notifications = JSON.parse(localStorage.getItem("notifications"));
    if (notifications && notifications?.data?.length) {
      let result = notificationData.data.filter(o1 => !notifications?.data.some(o2 => o1.id === o2.id));
      console.log('not--differneces', result);
      if (result?.length) {
        result.map(x => {
          this.toasterService.showInfo(x?.message);
        })
      }
      localStorage.removeItem("notifications");
    }
    localStorage.setItem("notifications", JSON.stringify(notificationData));
  }
}