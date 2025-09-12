import { PAGE_SIZE_10 } from './../../app.constant';
import { Subscription } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { AdvanceSearchFormComponent } from '../dialog-forms/advance-search-form/advance-search-form.component';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MatMenuTrigger, MatMenuPanel } from '@angular/material/menu';
import { SidenavService } from 'src/app/services/sidenav.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { ToastrService } from 'ngx-toastr';
import { RouteService } from '../sidenav/route-active.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  searchText: string = '';
  org_name: string;
  checkedOption = '';
  advanceSearchConfig1 = [];
  advanceSearchConfig = [];
  sidebar = [];
  private subscriptions: Subscription[] = [];
  notificationCount: number = 0;
  notifyInterval: any;
  isNotification: any = '';
  @ViewChild('clickMenuTrigger') menuTrigger: MatMenuTrigger;
  public avatarImage: string = 'https://secure.gravatar.com/avatar/1aedb8d9dc4751e229a335e371db8058?&amp;d=mm';
  constructor(
    private fds: FormDrawerService,
    private dialog: MatDialog,
    private router: Router,
    private eventService: EventBusService,
    private sidenavService: SidenavService,
    private apiService: ApiService,
    private auth: AuthService,
    private dataEditor: DataEditor,
    private toastrService: ToastrService,
    public routeService: RouteService,
    public cts: CommonToasterService,
  ) { 
    this.checkedOption = this.router.url;
  }

  login_track_activity = JSON.parse(localStorage.getItem('login_track_activity'));
  is_trial;
  domain = window.location.host;
  ngOnInit(): void {
     this.router.events.subscribe(() => {
      this.checkedOption = this.router.url;
    });
    this.dataEditor.getMessage().subscribe(message => {
      this.isNotification = message.export;
    });
    this.subscriptions.push(
      this.eventService.on(Events.CHANGE_CRITERIA, ({ reset, module, route }) => {
        this.checkedOption = route;
        if (reset) {
          this.resetFilter({ module });
        } else
          this.openAdvanceSearch()
      })
    );

    setTimeout(() => {
      this.avatarImage = this.auth.avatar_img ? this.auth.avatar_img : this.avatarImage;
      this.org_name = localStorage.getItem('org_name');
      let obj = this.login_track_activity.filter(
        (x) => {
          return x.software.slug.toLowerCase().replace(/\s/g, '') == this.domain.toLowerCase().replace(/\s/g, '')
        });
      if (obj.length > 0) {
        this.is_trial = obj[0].is_trial;
      }
    }, 2000);
    this.dataEditor.notificationCount.subscribe(res => {
      this.notificationCount = res;
    });
    var pagingRequestModel = {
      page: 1,
      page_size: 10
    }
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
        this.notificationCount = res.pagination.unread_count;
        let unread = res?.data?.filter(i => i.is_read === 1);
        if (unread.length > 0) {
          this.toastrService.info(unread[0]?.message, `${unread[0]?.type} Notification`, {
            closeButton: true,
            timeOut: 3000,
            positionClass: 'toast-top-right',
            tapToDismiss: true,
            newestOnTop: true,
          }).onHidden.subscribe(() => { if (unread[0]?.is_read === 1) { this.toasterClickedHandler() } });
        }
      });
    }
    this.startTimer();

  }
  startTimer() {
    var pagingRequestModel = {
      page: 1,
      page_size: 10
    }

    this.notifyInterval = setInterval(() => {
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
        this.apiService?.getNotificationsList(pagingRequestModel).subscribe((res) => {
          this.notificationCount = res.pagination.unread_count;
          let unread = res?.data?.filter(i => i.is_read === 1)
          if (unread.length > 0) {
            this.toastrService.info(unread[0]?.message, `${unread[0]?.type} Notification`, {
              closeButton: true,
              timeOut: 3000,
              positionClass: 'toast-top-right',
              tapToDismiss: true,
              newestOnTop: true,
            }).onHidden.subscribe(() => { if (unread[0]?.is_read === 1) { this.toasterClickedHandler() } });
          }
        });
      }
    }, 600000);
  }
  toasterClickedHandler() {
    var pagingRequestModel = {
      page: 1,
      page_size: 10
    }
    this.apiService?.readAllNotification().subscribe(res => {
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
        this.apiService?.getNotificationsList(pagingRequestModel).subscribe((res) => {
          this.notificationCount = res.pagination.unread_count;
        });
      }
    })
  }
  ngAfterViewInit(): void {
    if (this.advanceSearchConfig.length == 0) {
      this.getAdvanceSearch();
    }
  }

  getAdvanceSearch() {
    this.sidenavService.getAdvanceSearch().subscribe((res) => {
      this.advanceSearchConfig = res;
      this.advanceSearchConfig1 = res.map(item => '/' + item.routeTo);  // only routeTo values
    console.log(this.advanceSearchConfig1);
    });
  }

  featureCheck(value) {
    return this.sidenavService.featureCheck(value);
  }
  resetFilter(model) {
    model['allData'] = true;
    model['page'] = 1;
    model['page_size'] = PAGE_SIZE_10;
    this.apiService.onSearch(model).subscribe((response) => {
      this.eventService.emit(new EmitEvent(model.module, {
        response: response
      }));
    });
  }
  openDrawer(s: string) {
    this.fds.closeNav();
    this.fds.setFormName(s);
    this.fds.openNav();
  }
openAdvanceSearch() {
  // this.menuTrigger.closeMenu()
  if(this.checkedOption === this.checkedOption){
  const dialogRef = this.dialog.open(AdvanceSearchFormComponent, {
    width: '1200px',
    position: { top: '0px' },
    data: this.checkedOption,
  });
  }
}

 check(route: string) {
  this.router.navigateByUrl(route);
}
  isChecked(route) {
    return this.checkedOption === '/' + route;
  }
}

