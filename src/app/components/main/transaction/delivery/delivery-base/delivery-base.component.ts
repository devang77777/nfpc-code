import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DeliveryExportComponent } from '../delivery-export/delivery-export.component';
import { DeliveryModel } from '../delivery-model';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { HistoryComponent } from 'src/app/features/shared/history/history.component';
import { DownloadPdfComponent } from '../download-pdf/download-pdf.component';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-delivery-base',
  templateUrl: './delivery-base.component.html',
  styleUrls: ['./delivery-base.component.scss'],
})
export class DeliveryBaseComponent extends BaseComponent {
  public isDetailVisible: boolean = false;
  public deliveryData: DeliveryModel;
  private router: Router;
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  @ViewChild(HistoryComponent) history: HistoryComponent;

  private fds: FormDrawerService;
  module: any;
  checkedRows = [];
  newDeliveryData = {};
  currentRole = '';
  public isOpenAllReason:any
  constructor(router: Router, fds: FormDrawerService,
    public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {
    super('Delivery');
    Object.assign(this, { router, fds });
    this.module = {
      module: 'Delivery',
      module_id: '',
    };
    this.currentRole = localStorage.getItem('roleName');

  }
  public selections = new SelectionModel(true, [])

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }

  openHistoryView() {
    this.fds.setFormName('History');
    this.fds.setFormType('Add');
    this.fds.open();
    this.history.getHistory();
  }
  openDialogAllChangeReason()
  {
    document.getElementById("isShow").style.display = "flex"
    console.log(this.selections)
  }
  onClose() {
    this.fds.close();
  }
  public openForm() {
    this.router.navigate(['transaction/delivery', 'add']);
  }
  public itemClicked(data: DeliveryModel): void {
    if (data) {
      this.isDetailVisible = true;
      this.deliveryData = data;
      const newModule = { ...this.module };
      newModule.module_id = data.id;
      this.module = JSON.parse(JSON.stringify(newModule));
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportDelivery() {
    const dialogRef = this.dialog.open(DeliveryExportComponent);
  }

  openUpdateDelivery() {
    this.router.navigate(['transaction/delivery', 'update']).then();
  }

  openImportDelivery() {
    this.router.navigate(['transaction/delivery', 'import']).then();
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  updateTableData(data) {
    this.newDeliveryData = data;
  }

  public confirmShipment(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to Confirm Shipment for selected Records`,
          btnText: 'Generate'
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data?.hasConfirmed) {
          this.applyAulkAction();
        }
      });
  }

  applyAulkAction() {
    let ids = [];
    this.checkedRows.forEach(element => {
      if (element.isCheckEnable) {
        ids.push(element.id);
      }
    });
    let body = {
      delivery_id: ids
    };
    this.apiService.confirmShipment(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.checkedRows = [];
          this.cts.showSuccess('Success', 'Action Successfull');
          this.updateTableData(body);
        } else {
          this.cts.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.cts.showError('Error', 'Action Un-successfull');
      }
    );
  }
  sendEmail() {
    this.apiService.orderSendEmail().subscribe(res => {
      if (res.status == true) {
        this.cts.showSuccess('Success', res.message);
      } else {
        this.cts.showError('Error', res.message);
      }
    });
  }
  downloadLuLuPdf() {
    const dialogRef = this.dialog.open(DownloadPdfComponent, {
      width: '500px',
    });
  }
}
