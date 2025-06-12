import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import {
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  OrderUpdateProcess,
} from '../order-models';
import {
  APP_CURRENCY_CODE,
  CompDataServiceType,
} from 'src/app/services/constants';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { ItemUoms } from '../../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { OrderService } from '../order.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { DomSanitizer } from '@angular/platform-browser';
import { IsPrintOrDownloadComponent } from 'src/app/components/dialogs/is-print-or-download/is-print-or-download.component';
import { OrderBulkPdfService } from '../order-bulk-pdf.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent extends BaseComponent
  implements OnInit, OnDestroy {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public orderData: any;
  @Input() public updatedLists: any;
  @Input() public isDetailVisible: boolean;
  @Output() public toggleHistory: EventEmitter<any> = new EventEmitter<any>();
  firstname;
  lastname;
  emailData: any;
  public color: ThemePalette = 'primary';
  public mode: ProgressSpinnerMode = 'indeterminate';
  public showSpinner: boolean = false;
  public uuid: string;
  domain = window.location.host.split('.')[0];
  public isDepotOrder: boolean;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public hasApprovalPending: boolean;
  public orderStats: { key: string; label: string }[] = [
    { key: 'total_gross', label: 'Gross Total' },
    { key: 'total_discount_amount', label: 'Discount' },
    { key: 'total_net', label: 'Net Total' },
    { key: 'total_excise', label: 'Excise' },
    { key: 'total_vat', label: 'Vat' },
    { key: 'grand_total', label: 'Invoice Total' },
  ];
  ordertypehidden: boolean = true;
  public orderTypeTitle = '';
  public paymentTermTitle: string;

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public orderTypes: OrderType[] = [];
  public uoms: ItemUoms[] | any = [];
  public terms: PaymentTerms[] = [];
  public showOrderStatusOptions: boolean = true;
  public showOrderEditAndDelete: boolean = true;
  private router: Router;
  private apiService: ApiService;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private dialogRef: MatDialog;
  public orderIsApproved: boolean = false;
  private dataService: DataEditor;
  orderTemplate: any;
  private sanitizer: DomSanitizer;
  public ShowGenerateInvoice: boolean = true;
  currentRole = '';
  constructor(
    private commonToasterService: CommonToasterService,
    private orderService: OrderService,
    apiService: ApiService,
    dataService: DataEditor,
    sanitizer: DomSanitizer,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    private orderBulkPdfService: OrderBulkPdfService
  ) {
    super('Order');
    Object.assign(this, {
      apiService,
      sanitizer,
      dataService,
      dialogRef,
      formBuilder,
      router,
      route,
    });

  }

  public ngOnInit(): void {
    this.firstname = localStorage.getItem("firstname");
    this.lastname = localStorage.getItem("lastname");
    this.itemTableHeaders = ITEM_DETAILS_TABLE_HEADS;
    this.currentRole = localStorage.getItem('roleName');

    // this.subscriptions.push(
    //   this.apiService.getItemUom().subscribe((result) => {
    //     this.uoms = result.data;
    //   })
    // );

  }

  
  // public toggleStatus(): void {
  //   let action = this.orderData.orderTypes === '' ? 'Horeca' : 'Modern Trade';
  //   let ids = [];
  //   ids.push(this.orderData.uuid);
  //   let body = {
  //     module: 'OrderInfo',
  //     action: action,
  //     ids: ids
  //   };
  //   this.apiService.bulkAction(body).subscribe(
  //     (res) => {
  //       if (res.status == true) {
  //         this.commonToasterService.showSuccess('Success', 'Action Successfull');
  //         body['edit'] = true;
  //         // this.salesMan.status = this.salesMan.status === 0 ? 1 : 0;
  //       } else {
  //         this.commonToasterService.showError('Error', 'Action Un-successfull');
  //       }
  //     },
  //     (error) => {
  //       this.commonToasterService.showError('Error', 'Action Un-successfull');
  //     }
  //   )
  // }


  setOrderType(type: string) {
    this.orderData.orderTypes = type;
    this.router.navigate(['/transaction/order/add'])
  }



  

  ngOnChanges(changes: SimpleChanges) {
    this.sort();
    if (changes.orderData?.currentValue != changes.orderData?.previousValue) {
      if (this.orderData?.current_stage == "Approved" && this.orderData?.approval_status == "Completed") {
        this.ShowGenerateInvoice = false;
      }
      else {
        this.ShowGenerateInvoice = true;
      }
      this.initForm(changes.orderData.currentValue);
      // this.subscriptions.push(
      //   this.orderService.orderTypeList().subscribe((result) => {
      //     this.orderTypes = result.data;
      //     let name = this.orderTypes.find(
      //       (type) => type.id === this.orderData.order_type_id
      //     );
      //     this.orderTypeTitle = name?.name;
      //   })
      // );
      this.hasApprovalPending =
        this.orderData.need_to_approve == 'yes' ? true : false;
      this.isDepotOrder = Boolean(this.orderData.depot);
      // this.setTermsTitle();
      this.getOrderStatus(this.orderData.current_stage);
      this.uuid = this.orderData.uuid;
      this.orderData.order_details = this.orderData?.order_details?.sort((a, b) => {
        if (a.id > b.id) {
          return 1;
        } else {
          return -1;
        }
      });
      // if (this.orderData.id) {
      //   this.getDocument('print');
      // }
    }

    if (this.orderData?.source === 5) {
      this.itemTableHeaders.find(i => i.id == 12).show = true;
    }

  }
  sort() {
    this.orderData?.order_details?.sort((a, b) => a['item']['item_code'] > b['item']['item_code'] ? 1 : a['item']['item_code'] < b['item']['item_code'] ? -1 : 0)
  }
  onToggleHistory() {
    this.toggleHistory.emit(true);
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }
  getOrderStatus(status: any) {
    switch (status) {
      case OrderUpdateProcess.Pending:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = true;
        break;
      case OrderUpdateProcess.PartialDeliver:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = false;
        break;
      case OrderUpdateProcess.InProcess:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = true;
        break;
      case OrderUpdateProcess.Accept:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = true;
        break;
      case OrderUpdateProcess.Delivered:
        this.showOrderStatusOptions = false;
        this.showOrderEditAndDelete = false;
        break;
      case OrderUpdateProcess.Completed:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = false;
        break;
      case OrderUpdateProcess.Rejected:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = true;
        break;
      case OrderUpdateProcess.Approved:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = true;
        break;
    }
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }
  checkDownloadOrPrint() {
    this.dialogRef.open(IsPrintOrDownloadComponent).afterClosed()
      .subscribe((data) => {
        if (data === 'print') {
          // this.print();
          this.getDocumentForPDF(this.orderData);
        } else if (data === 'pdf') {
          this.getDocument('pdf')
        }
      });
  }
  getDocumentForPDF(orderData) {
    const pdfOrderData = { ...orderData };
    pdfOrderData.order_details = orderData?.order_details.filter(i => +i?.item_qty > 0);
    this.orderBulkPdfService.singleOrderData = pdfOrderData;
    this.orderBulkPdfService.isSingleData = true;
    this.orderBulkPdfService.generatePDF();
  }
  print() {
    let printContents, popupWin;
    printContents = document.getElementById('print-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
        <link href="//netdna.bootstrapcdn.com/bootstrap/3.1.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
<script src="//netdna.bootstrapcdn.com/bootstrap/3.1.0/js/bootstrap.min.js"></script>
<script src="//code.jquery.com/jquery-1.11.1.min.js"></script>
          <style>
          
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
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
  }
  getDocument = (type) => {
    const model = {
      id: this.orderData.id,
      status: type,
    };

    this.orderService.getDocument(model).subscribe((res: any) => {
      if (res.status) {
        if (res.data && res.data.html_string) {
          this.orderTemplate = this.sanitizer.bypassSecurityTrustHtml(
            res.data.html_string
          );
        } else {
          const link = document.createElement('a');
          link.setAttribute('target', '_blank');
          link.setAttribute('href', `${res.data.file_url}`);
          link.setAttribute('download', `statement.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      }
    });
  };
  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );
    return selectedUom ? selectedUom.name : '';
  }

  public goToOrders(): void {
    this.router.navigate(['transaction/order']);
  }

  public setTermsTitle(): void {
    this.subscriptions.push(
      this.orderService.getPaymentTerm().subscribe((result) => {
        this.terms = result.data;
        this.paymentTermTitle = this.terms.find(
          (item) => item.id === this.orderData.payment_term_id
        )?.name;
      })
    );
  }

  public editOrder(): void {
    this.showSpinner = true;
    this.router.navigate(['transaction/order/edit', this.uuid]);
    this.showSpinner = false;
  }
  initForm(data) {
    const orgName = localStorage.getItem('org_name');
    const subject = `${orgName} sent you an order`;
    const message = `${orgName} sent you an order`;
    this.emailData = {
      email: data.customer.email,
      subject,
      message,
      type: 'order',
    };
  }
  public openDeleteBox(value): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: value ? `Are you sure want to cancel ${this.orderData.order_number}?` : `Are you sure want to delete ${this.orderData.order_number}?`,
          isReason: value
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          const orderModal = {
            order_id: this.orderData.id,
            uuid: this.orderData.uuid
          }
          if (value) {
            orderModal['reason_id'] = +data.reason_id,
              this.cancelOder(orderModal);
          } else {
            this.deleteOder(orderModal);
          }
        }
      });
  }
  updatedList() {
    return this.getUpdatedList(this.updatedLists);
  }
  getUpdatedList(list) {
    const ol = list?.filter(i => i.id == this.orderData.id)
    return ol[0];
  }
  public startDelivery(): void {
    let body = {
      order_ids: [this.orderData.id]
    };
    this.orderService.orderToPicking(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.dataService.sendData({
            type: CompDataServiceType.GET_NEW_DATA,
            data: { id: this.orderData.id }
          });
          // this.print();
          this.getDocumentForPDF(res.data[0]);
          this.closeDetailView();
          this.commonToasterService.showSuccess('Success', 'Action Successfull');
        } else {
          this.commonToasterService.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.commonToasterService.showError('Error', 'Action Un-successfull');
      }
    )
  }
  private cancelOder(payload): void {
    this.orderService.cancelOrder(payload).subscribe(() => {
      this.commonToasterService.showInfo(
        'Order Cancelled',
        'Order Cancelled sucessfully'
      );
      this.isDetailVisible = false;
      this.detailsClosed.emit();
      this.dataService.sendData({
        type: CompDataServiceType.CLOSE_DETAIL_PAGE,
        uuid: this.orderData.uuid,
      });
    });
  }
  private deleteOder(payload): void {
    this.orderService.deleteOrder(payload).subscribe(() => {
      this.commonToasterService.showInfo(
        'Order Deleted',
        'Order deleted sucessfully'
      );
      this.isDetailVisible = false;
      this.detailsClosed.emit();
      this.dataService.sendData({
        type: CompDataServiceType.CLOSE_DETAIL_PAGE,
        uuid: this.orderData.uuid,
      });
    });
  }

  approve() {
    if (this.orderData && this.orderData.objectid) {
      this.apiService
        .approveItem(this.orderData.objectid)
        .subscribe((res: any) => {
          const approvedStatus: boolean = res.data.approved_or_rejected;
          if (res.status && approvedStatus) {
            this.commonToasterService.showSuccess(
              'Approved',
              'Order has been Approved'
            );
            this.hasApprovalPending = false;
            this.dataService.sendData({
              type: CompDataServiceType.GET_NEW_DATA,
              data: { id: this.orderData.id }
            });
          }
        });
    }
  }
  reject() {
    if (this.orderData && this.orderData.objectid) {
      this.apiService
        .rejectItemApproval(this.orderData.objectid)
        .subscribe((res: any) => {
          this.commonToasterService.showSuccess(
            'Reject',
            'Order Approval has been Rejected'
          );
          this.hasApprovalPending = false;
          this.dataService.sendData({
            type: CompDataServiceType.GET_NEW_DATA,
            data: { id: this.orderData.id }
          });
        });
    }
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }

  checkUserCanEdit(status) {
    let statusList = ['Created', 'Updated'];
    if (statusList.includes(status) && (this.currentRole == 'Storekeeper' || this.currentRole == 'org-admin' || this.currentRole == 'Warehouse')) {
      return false;
    } else {
      return true;
    }
  }
  checkWarehosePersmission(status, role) {
    let statusList = ['Completed', 'Cancelled', 'Shipment'];
    if (role == 'Warehouse' || role == 'org-admin' || role == 'super-admin') {
      if (statusList.includes(status)) {
        return false;
      } else {
        return true;
      }
    }
  }
}
export const ITEM_DETAILS_TABLE_HEADS: ItemAddTableHeader[] = [
  { id: 0, key: 'sequence', label: '#', show: true },
  { id: 1, key: 'item', label: 'Item Code', show: true },
  { id: 12, key: 'customerItemCode', label: 'Customer Item Code', show: false },
  { id: 2, key: 'itemName', label: 'Item Name', show: true },
  { id: 3, key: 'uom', label: 'UOM', show: true },
  { id: 4, key: 'qty', label: 'Quantity', show: true },
  { id: 5, key: 'reason', label: 'Reason', show: true },
  { id: 6, key: 'price', label: 'Price', show: true },
  { id: 7, key: 'excise', label: 'Excise', show: true },
  { id: 8, key: 'discount', label: 'Discount', show: true },
  { id: 9, key: 'net', label: 'Net', show: true },
  { id: 10, key: 'vat', label: 'Vat', show: true },
  { id: 11, key: 'total', label: 'Total', show: true },
];