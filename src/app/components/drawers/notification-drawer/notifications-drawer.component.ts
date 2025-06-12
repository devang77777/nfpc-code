import { Component, OnInit } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { array } from '@amcharts/amcharts4/core';
import { NotificationModel, NotificationPaginationModel, NotificationPagingRequestModel } from 'src/app/interfaces/notification.interface';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { RejectReasonComponent } from './reject-reason/reject-reason.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

export interface DialogData {
  reason: string;
  name: string;
}


@Component({
  selector: 'app-notifications-drawer',
  templateUrl: './notifications-drawer.component.html',
  styleUrls: ['./notifications-drawer.component.scss']
})
export class NotificationsDrawerComponent implements OnInit {
  notifications: Array<NotificationModel> = [];
  pagingRequestModel: NotificationPagingRequestModel;
  paginationModel: NotificationPaginationModel;
  reason: string;
  name: string;
  panelOpenState = false;
  isNotification: any = '';
  notificationStatus: any = { "status": true, "data": [{ "id": 3293, "uuid": "cf01ee40-4ab9-11ec-800e-fd03c19e7764", "organisation_id": 2, "user_id": 10644, "other": null, "url": null, "type": "Load Request", "message": "Load Request Created, Load Number is 02O100029", "is_read": 1, "status": 1, "created_at": "2021-11-21T10:57:24.000000Z", "updated_at": "2021-11-21T10:57:24.000000Z" }, { "id": 3291, "uuid": "a374b6e0-4ab4-11ec-b802-53e66684e814", "organisation_id": 2, "user_id": 10644, "other": null, "url": null, "type": "Load Request", "message": "Load Request Created, Load Number is 02O100028", "is_read": 1, "status": 1, "created_at": "2021-11-21T10:20:23.000000Z", "updated_at": "2021-11-21T10:20:23.000000Z" }, { "id": 3289, "uuid": "290b92c0-4aa7-11ec-8f54-0f98d7f40383", "organisation_id": 2, "user_id": 10644, "other": null, "url": null, "type": "Load Request", "message": "Load Request Created, Load Number is 02O100027", "is_read": 1, "status": 1, "created_at": "2021-11-21T08:43:55.000000Z", "updated_at": "2021-11-21T08:43:55.000000Z" }, { "id": 3269, "uuid": "4b6fa210-445d-11ec-b84e-49577f674c56", "organisation_id": 2, "user_id": 10644, "other": null, "url": null, "type": "Load Request", "message": "Load Request Created, Load Number is 02O100026", "is_read": 1, "status": 1, "created_at": "2021-11-13T08:40:03.000000Z", "updated_at": "2021-11-13T08:40:03.000000Z" }, { "id": 3247, "uuid": "cdd82ba0-42a1-11ec-bfc8-6904c7842c97", "organisation_id": 2, "user_id": 10644, "other": null, "url": null, "type": "Load Request", "message": "Load Request Created, Load Number is 10O100025", "is_read": 1, "status": 1, "created_at": "2021-11-11T03:45:25.000000Z", "updated_at": "2021-11-11T03:45:25.000000Z" }, { "id": 3206, "uuid": "b76da1e0-420b-11ec-b7a3-07321a186466", "organisation_id": 2, "user_id": 10644, "other": null, "url": null, "type": "Geo Approval", "message": "Load Request Created, Load Number is 05O100019", "is_read": 1, "status": 0, "created_at": "2021-11-10T09:51:03.000000Z", "updated_at": "2021-11-10T09:51:03.000000Z" }, { "id": 3205, "uuid": "98d6bc30-420b-11ec-acab-d988f3802ed6", "organisation_id": 2, "user_id": 10644, "other": null, "url": null, "type": "Load Request", "message": "Load Request Created, Load Number is 09O000024", "is_read": 1, "status": 1, "created_at": "2021-11-10T09:50:11.000000Z", "updated_at": "2021-11-10T09:50:11.000000Z" }, { "id": 3204, "uuid": "40dc5820-4205-11ec-aad3-a553d5c19ea0", "organisation_id": 2, "user_id": 10644, "other": null, "url": null, "type": "Load Request", "message": "Load Request Created, Load Number is 01O000018", "is_read": 1, "status": 1, "created_at": "2021-11-10T09:04:47.000000Z", "updated_at": "2021-11-10T09:04:47.000000Z" }, { "id": 3203, "uuid": "194911a0-4204-11ec-b3e4-2bb23065e912", "organisation_id": 2, "user_id": 10644, "other": null, "url": null, "type": "Geo Approval", "message": "Load Request Created, Load Number is 13O100019", "is_read": 1, "status": 0, "created_at": "2021-11-10T08:56:31.000000Z", "updated_at": "2021-11-10T08:56:31.000000Z" }, { "id": 3202, "uuid": "a1353120-41fe-11ec-9ede-519097fae575", "organisation_id": 2, "user_id": 10644, "other": null, "url": null, "type": "Load Request", "message": "Load Request Created, Load Number is 12O100023", "is_read": 1, "status": 1, "created_at": "2021-11-10T08:17:22.000000Z", "updated_at": "2021-11-10T08:17:22.000000Z" }], "message": "Notificaiton listing", "errors": [], "pagination": { "total_pages": 45, "current_page": 1, "total_records": 443, "status_count": 443, "unread_count": 443 } }
  statusText: string;
  constructor(
    private fds: FormDrawerService,
    private apiService: ApiService,
    private router: Router,
    private dataEditor: DataEditor,
    public dialog: MatDialog,
    private toaster: CommonToasterService
  ) {
    this.pagingRequestModel = {
      page: 1,
      page_size: 10
    }
    this.paginationModel = {
      total_records: 0,
    }
  }

  ngOnInit(): void {
    this.dataEditor.getMessage().subscribe(message => {
      this.isNotification = message.export;
    });
    this.notifications = [];
    this.getNotifications();
    //this.onReject('not');
  }

  close() {
    this.fds.closeNav();
  }
  onApprove(notification) {
    if (notification.type == 'Route Deviation') {
      let data = {
        route_approval: "Approve",
        reason: ""
      }
      this.apiService.approveRouteNotification(notification.uuid, data).subscribe((res) => {
        if (res.status) {
          this.statusText = "Approved successfully";
          this.toaster.showSuccess(this.statusText);

          //this.getNotifications();
          this.updateRecord(res.data);
        }
      })
    }
    else {
      let data = {
        uuid: notification.uuid,
        status: "Approve",
        reason: ""
      }
      this.apiService.approveNotification(data).subscribe((res) => {
        if (res.status) {
          this.statusText = "Approved successfully";
          this.toaster.showSuccess(this.statusText);
          this.updateRecord(res.data);
          //this.getNotifications();
        }
      })
    }
  }

  getColor(notification) {
    if (notification.approval_status == "Approved") {
      return 'green'
    }
    else if (notification.approval_status == "Reject" || notification.approval_status == "Rejected") {
      return 'red'
    }
    else if (notification.approval_status == "Pending") {
      return 'black';
    }

  }

  getNotificationStatus(notification) {
    if (notification.approval_status == "Approved" || notification.approval_status == "Approve") {
      return '(Approved)'
    }
    else if (notification.approval_status == "Reject" || notification.approval_status == "Rejected") {
      return '(Rejected)'
    }
    else {
      return "";
    }
    // else if(notification.approval_status == "Pending"){
    //   return 'black';
    // }
  }

  updateRecord(notification) {
    this.notifications.map(x => {
      if (x.uuid == notification.uuid) {
        x.approval_status = notification.status;
        x.reason = notification.reason;
      }
    })
  }

  onReject(notification) {
    const dialogRef = this.dialog.open(RejectReasonComponent, {
      width: '500px',
      data: { name: this.name, reason: '' },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.reason = result;
      if (result) {
        this.onRejecting(notification, this.reason)
      }
    });
  }

  onRejecting(notification, reason) {
    if (notification.type == 'Route Deviation') {
      let data = {
        route_approval: "Reject",
        reason: reason
      }
      this.apiService.approveRouteNotification(notification.uuid, data).subscribe((res) => {
        if (res.status) {
          this.statusText = "Rejected successfully";
          this.toaster.showWarning(this.statusText);
          this.updateRecord(res.data);
          //this.getNotifications();
        }
      })
    }
    else {
      let data = {
        uuid: notification.uuid,
        status: "Reject",
        reason: reason
      }
      this.apiService.rejectNotification(data).subscribe((res) => {
        if (res.status) {
          this.statusText = "Rejected successfully";
          this.toaster.showWarning(this.statusText);
          this.updateRecord(res.data);
          //this.getNotifications();
        }
      })
    }
  }
  deleteAll() {

  }
  markAsRead() {

  }
  readNotification(notification: NotificationModel) {
    this.apiService.readNotification(notification.id, null).subscribe((res) => {
      this.notifications.map(x => {
        if (x.id == notification.id && x.is_read == 0) {
          x.is_read = 1;
          this.paginationModel.unread_count = this.paginationModel.unread_count ? this.paginationModel.unread_count - 1 : this.paginationModel.unread_count ?? 0;
          this.dataEditor.updateNotificationCount(this.paginationModel.unread_count)

        }

      });
      //this.close();
      switch (notification.type.toLowerCase()) {
        case 'load request':
          this.router.navigate(['/target/load-request'], { queryParams: { uuid: notification.uuid } })
          break;
        case 'customer':
          this.router.navigate(['/masters/customer'], { queryParams: { uuid: notification.uuid } })
          break;
        case 'invoice':
          this.router.navigate(['/transaction/invoice'], { queryParams: { uuid: notification.uuid } })
          break;
        case 'order':
          this.router.navigate(['/transaction/order'], { queryParams: { uuid: notification.uuid } })
          break;
        case 'delivery':
          this.router.navigate(['/transaction/delivery'], { queryParams: { uuid: notification.uuid } })
          break;
        case 'invoice canceled':
          if (notification.other) {
            this.router.navigate(['/transaction/invoice'], { queryParams: { uuid: notification.uuid, status: 'cancel' } })
          } else {
            this.router.navigate(['/transaction/invoice'], { queryParams: { uuid: notification.uuid } })
          }
          break;
        case 'collection':
          this.router.navigate(['/transaction/collection'], { queryParams: { uuid: notification.uuid } })
          break;
        case 'credit note':
          this.router.navigate(['/transaction/credit-note'], { queryParams: { uuid: notification.uuid } })
          break;
        case 'debit note':
          this.router.navigate(['/transaction/debit-note'], { queryParams: { uuid: notification.uuid } })
          break;
      }
    });
  }

  loadNotification() {
    this.pagingRequestModel.page++;
    this.getNotifications();
  }

  getNotifications() {
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
      this.apiService.getNotificationsList(this.pagingRequestModel).subscribe((res) => {
        var notifications = res.data;
        this.paginationModel = res.pagination;
        this.dataEditor.updateNotificationCount(this.paginationModel.unread_count);

        notifications.map(x => {
          let date = moment(x.created_at);
          let days = moment().diff(date, 'days');

          if (days == 1) {
            x.postTiming = "Tomorrow";

          } else if (days > 1) {
            x.postTiming = date.format('YYYY-MM-DD HH:mm a');

          } else if (days == 0) {

            let hours = moment().diff(date, 'hours');
            if (hours > 0) {
              x.postTiming = hours + (hours == 1 ? " hour ago" : " hours ago");
            }
            if (hours == 0) {
              let minutes = moment().diff(date, 'minutes');
              if (minutes > 0) {
                x.postTiming = (minutes == 1 ? "A minute ago" : minutes + " minutes ago");
              } else {
                x.postTiming = "Now";
              }
            }
          }
          this.notifications.push(x);
        });
      });
    }
    // if(!this.notifications || this.notifications.length == 0){
    //    this.notifications = this.notificationStatus.data
    // }
  }


}
