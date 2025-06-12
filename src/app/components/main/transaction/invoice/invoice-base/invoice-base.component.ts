import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { OrderExportComponent } from '../../orders/order-export/order-export.component';
import { InvoiceModel } from '../invoice-models';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { InvoiceExportComponent } from '../invoice-export/invoice-export.component';

@Component({
  selector: 'app-invoice-base',
  templateUrl: './invoice-base.component.html',
  styleUrls: ['./invoice-base.component.scss'],
})
export class InvoiceBaseComponent extends BaseComponent {
  public isDetailVisible: boolean;
  public invoiceData: InvoiceModel;
  checkedRows = [];
  private router: Router;
  newInvoiceData = {};
  constructor(router: Router, fds: FormDrawerService, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {
    super('Invoice');
    Object.assign(this, { router, fds });
  }
  ngOnInit(): void { }

  openInvoiceForm() {
    this.router.navigate(['transaction/invoice', 'add']);
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.invoiceData = data;
    }
  }
  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportInvoice() {
    const dialogRef = this.dialog.open(InvoiceExportComponent);
  }

  openImportInvoice() {
    this.router.navigate(['transaction/invoice', 'import']).then();
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  updateTableData(data) {
    this.newInvoiceData = data;
  }

  public bulkAction(action): void {
    let phrase = action == 'active' || action == "inactive" ? "mark as " + action : action;
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to ${phrase} selected Records `,
          btnText: phrase
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data?.hasConfirmed) {
          this.applyAulkAction(action);
        }
      });
  }

  applyAulkAction(action) {
    let ids = [];
    this.checkedRows.forEach(element => {
      ids.push(element.uuid);
    });
    let body = {
      module: 'invoice',
      action: action,
      ids: ids
    };
    this.apiService.bulkAction(body).subscribe(
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
    )
  }

  downloadInvoiceReport() {
    let body = {
      type: 'invoice',
    };
    this.apiService.getSalesmanData(body).subscribe(
      (res) => {

      })

  }

}
