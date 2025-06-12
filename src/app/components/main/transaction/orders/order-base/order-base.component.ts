import { OrderBulkPdfService } from './../order-bulk-pdf.service';
import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { OrderExportComponent } from '../order-export/order-export.component';
import { OrderModel } from '../order-models';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { HistoryComponent } from 'src/app/features/shared/history/history.component';
import { PdfOcrUploadDialogComponent } from 'src/app/components/dialogs/pdf-ocr-upload-dialog/pdf-ocr-upload-dialog.component';
import { OrderService } from '../order.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { InfiniteOrderExportComponent } from '../infinite-order-export/infinite-order-export.component';

@Component({
  selector: 'app-order-base',
  templateUrl: './order-base.component.html',
  styleUrls: ['./order-base.component.scss'],
})
export class OrderBaseComponent extends BaseComponent {
  public isDetailVisible: boolean;
  public orderData: OrderModel;
  checkedRows = [];
  private router: Router;
  public newOrderData = {};
  public updatedLists = [];
  public allOrderList = [];
  currentRole = '';
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  @ViewChild(HistoryComponent) history: HistoryComponent;
  private fds: FormDrawerService;
  module: any;
  constructor(
    router: Router, fds: FormDrawerService, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog,
    private orderService: OrderService,
    private dataService: DataEditor,
    private orderBulkPdfService: OrderBulkPdfService,
  ) {
    super('Order');
    Object.assign(this, { router, fds });
    this.module = {
      module: 'Order',
      module_id: '',
    };
    this.currentRole = localStorage.getItem('roleName');
  }
  onClose() {
    this.fds.close();
  }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }
  public openForm() {
    this.router.navigate(['transaction/order', 'add']);
  }
  public openOrderView() {
    this.router.navigate(['transaction/order', 'view']);
  }
  openHistoryView() {
    this.fds.setFormName('History');
    this.fds.setFormType('Add');
    this.fds.open();
    this.history.getHistory();
  }

  public itemClicked(data: OrderModel): void {
    if (data) {
      this.isDetailVisible = true;
      this.orderData = data;
      const newModule = { ...this.module };
      newModule.module_id = data.id;
      this.module = JSON.parse(JSON.stringify(newModule));
    }
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }
  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportOrder() {
    const dialogRef = this.dialog.open(OrderExportComponent);
  }
  openUpdateDelivery() {
    this.router.navigate(['transaction/order', 'update']).then();
  }
  openReadOCR() {
    this.router.navigate(['transaction/order', 'pdf-ocr-read']).then();
  }
  openImportOrder() {
    this.router.navigate(['transaction/order', 'import']).then();
  }

  updateTableData(data) {
    this.newOrderData = data;
  }
  infiniteOrder() {
    const dialogRef = this.dialog.open(InfiniteOrderExportComponent, {
      width: '500px',
    });

    // this.apiService.infiniteOrder().subscribe(res => {
    //   if (res.status) {
    //     this.dataService.sendData({
    //       type: CompDataServiceType.GET_NEW_DATA,
    //       data: { id: 0 }
    //     });
    //     this.cts.showSuccess('Success', res.message);
    //   } else {
    //     this.cts.showSuccess('error', res.message);
    //   }
    // })
  }
  public bulkAction(action): void {
    let phrase = action == 'active' || action == "inactive" ? "mark as " + action : action;
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to Generate Pickslip for selected Records`,
          btnText: 'Generate'
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data?.hasConfirmed) {
          this.applyAulkAction(action);
        }
      });
  }
  public confirOrderApprovedReject(action): void {
    // let phrase = action == 'active' || action == "inactive" ? "mark as " + action : action;
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to ${action}  for selected Records`,
          btnText: `${action}`
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data?.hasConfirmed) {
          this.orderApprovedReject(action);
        }
      });
  }
  public openPDFOCRRead() {
    this.deleteDialog
      .open(PdfOcrUploadDialogComponent, {
      });
  }
  orderApprovedReject(action) {
    let ids = [];
    this.checkedRows.forEach(element => {
      if (element.isCheckEnable) {
        ids.push(element.objectid);
      }
    });
    let body = {
      action: action == 'Approved' ? true : false,
      uuids: ids
    };
    this.orderService.approvedRejected(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.checkedRows = [];
          this.cts.showSuccess('Success', 'Action Successfull');
          this.updateTableData({});
          this.newOrderData = res;

        } else {
          this.cts.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.cts.showError('Error', 'Action Un-successfull');
      }
    )
  }
  print() {
    let printContents, popupWin, text;
    let comp = [];
    for (var i = 0; i < this.checkedRows.length; i++) {
      if (this.checkedRows[i]?.isCheckEnable) {
        printContents = document.getElementById("print-section" + i).innerHTML;
        comp.push(printContents);
        text = comp?.join();
      }
    }
    // printContents = document.getElementById('print-section1').innerHTML;
    popupWin = window.open('', '_blank');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
        <link href="//netdna.bootstrapcdn.com/bootstrap/3.1.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
<script src="//netdna.bootstrapcdn.com/bootstrap/3.1.0/js/bootstrap.min.js"></script>
<script src="//code.jquery.com/jquery-1.11.1.min.js"></script>
<style>
@media print {
  .pagebreak {
      clear: both;
      page-break-after: always;
  }
}
tr,td{
  font-size:10px
  font-family: "Times New Roman", Times, serif;
  border-bottom: 1px solid black;
}
table {
  border-collapse: collapse;
}

.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  text-align: center;
}
.question-arrow
{
  font-family: "Times New Roman", Times, serif;
    float:left;
    width:auto;
    height:25px;
    margin-right:10px;
    font-size:10px;
}
.indent-text{
  font-family: "Times New Roman", Times, serif;
    display:block;
    overflow:hidden;
    font-weight:none
 }
 .dateTime{
  font-family: "Times New Roman", Times, serif;
  font-size:10px;
  font-weight:none
 }
  </style>
        </head>
    <body onload="window.print();window.close()">${text}</div>
    </body>
      </html>`
    );
    popupWin.document.close();
    setTimeout(() => {
      this.checkedRows = [];
    }, 2000);

  }
  viewOrders() {
    console.log('New Page');
  }
  getDocument(checkedRows) {
    const pdfOrderData = [...checkedRows];
    pdfOrderData?.forEach(element => {
      element.order_details = element?.order_details.filter(i => +i?.item_qty > 0);
    });
    this.orderBulkPdfService.orderData = pdfOrderData;
    this.orderBulkPdfService.isSingleData = false;
    this.orderBulkPdfService.generatePDF();
  }
  updatedList(e) {
    this.allOrderList = e.data;
    this.updatedLists = this.getUpdatedList(e.data);
  }
  getUpdatedList(list) {
    return list.filter(i => this.checkedRows.some(o => i.id == o.id));
  }
  applyAulkAction(action) {
    let ids = [];
    let arrays = [];
    this.checkedRows.forEach(element => {
      if (element.isCheckEnable) {
        ids.push(element.id);
        arrays.push(element);
      }
    });
    let body = {
      order_ids: ids
    };
    // this.updateTableData({});
    // this.getDocument(arrays)
    //  this.print();
    //   this.checkedRows = [];
    this.orderService.orderToPicking(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.cts.showSuccess('Success', 'Action Successfull');
          this.updateTableData({});
          this.newOrderData = res;
          this.getDocument(res.data);
        } else {
          this.cts.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.cts.showError('Error', 'Action Un-successfull');
      }
    )
  }
}
