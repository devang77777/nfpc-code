import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DeliveryModel } from '../delivery-model';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import {
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  OrderUpdateProcess,
} from 'src/app/components/main/transaction/orders/order-models';
import { ITEM_ADD_FORM_TABLE_HEADS } from 'src/app/components/main/transaction/orders/order-form/order-form.component';
import {
  APP_CURRENCY_CODE,
  CompDataServiceType,
} from 'src/app/services/constants';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DeliveryService } from '../delivery.service';
import { array } from '@amcharts/amcharts4/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';
import { DeliveryTripDialogComponent } from '../delivery-trip-dialog/delivery-trip-dialog.component';

@Component({
  selector: 'app-delivery-detail',
  templateUrl: './delivery-detail.component.html',
  styleUrls: ['./delivery-detail.component.scss'],
})
export class DeliveryDetailComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public deliveryData: any;
  @Input() public isDetailVisible: boolean;
  @Output() public toggleHistory: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  emailData: any;
  isPickingDeliveryData: any = [];
  @ViewChild('drawer') public drawer: MatDrawer;
  @ViewChild('formDrawer') public formDrawer: MatDrawer;
  currentRole = '';

  public uuid: string;
  public isDepotOrder: boolean;
  wholeReason:any;
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
  public showOrderStatusOptions: boolean = true;
  public ShowGenerateInvoice: boolean = true;
  public orderTypeTitle: string = '';
  public paymentTermTitle: string = '';

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public itemDetailsTableHeaders: ItemAddTableHeader[] = [];
  public IitemTableHeadersDeliveryNote: any = [];
  public orderTypes: OrderType[] = [];
  public uoms: ItemUoms[] | any = [];
  public terms: PaymentTerms[] = [];
  itemDetails: any = [];
  tempItemDetails: any = [];
  isEdit = false;
  isDisableSave = true;
  private router: Router;
  private apiService: ApiService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private dialogRef: MatDialog;
  public deliveryIsApproved: boolean = false;
  private sanitizer: DomSanitizer;
  deliveryTemplate: any;
  private deliveryService: DeliveryService;
  showEditDel: boolean = true;
  blankData = '-';
  deliveryNoteData: any = [];
  settings = {};
  settings2 = {
    enableSearchFilter: true,
    singleSelection: true,
    classes: 'myclass custom-class',
    disabled: false,
    badgeShowLimit: 2,
    maxHeight: 141,
    autoPosition: false,
    position: 'bottom',
  }
  isShowData:any = false
  itemList: any = [];
  reasonsList: any = [];
  editDeliveryNote: any;
  constructor(
    apiService: ApiService,
    deliveryService: DeliveryService,
    private commonToasterService: CommonToasterService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    sanitizer: DomSanitizer,
    private fds: FormDrawerService,
    private chdet: ChangeDetectorRef
  ) {
    super('Delivery');
    Object.assign(this, {
      apiService,
      dataService,
      dialogRef,
      formBuilder,
      router,
      route,
      sanitizer,
      deliveryService,
    });
    this.itemTableHeaders = ITEM_DELIVERY_FORM_TABLE_HEADS;
    this.itemDetailsTableHeaders = ITEM_DETAILS_FORM_TABLE_HEADS;
    this.IitemTableHeadersDeliveryNote =
      ITEM_DETAILS_FORM_TABLE_HEADS_DELIVERY_NOTE;
  }
  changeAllReason(){
    console.log(this.wholeReason,"hii")
    console.log(this.deliveryNoteData,"jkl")
    let items:any = []
    this.deliveryNoteData.map((dlv:any)=>{
      items.push({
        item_id:dlv.id,
        reason:this.wholeReason[0].id
      })
    })

    let data:any = {
      delivery_id:this.deliveryNoteData[0].delivery_id,
      full_order_cancel:this.deliveryNoteData[0].is_cancel,
      detail:items
    }


    this.apiService.bulkReasonSave(data).subscribe((res)=>{
      this.wholeReason = []
      // this.closeReasonAll()
      // window.location.reload()
    })
  }
  salesmen:any
  selectedSalesmanData:any
  public ngOnInit(): void {
    this.currentRole = localStorage.getItem('roleName');
    if (this.isDetailVisible) {
      this.subscriptions.push(
        this.apiService.getItemUom().subscribe((result) => {
          this.uoms = result.data;
        })
      );
    }
    this.apiService.getSalesMan().subscribe((result) => {
      let data:any = []
      result.data.map(((dta:any)=>{
           data.push({
            itemName:`${dta?.salesman_code}-${dta?.user?.firstname}`,
            id:dta?.user?.id,
            code:dta?.salesman_code
           })
      }))
      this.salesmen = data;
    })
  }
  onToggleHistory() {
    this.toggleHistory.emit(true);
  }
  editDelivery() {
    this.isEdit = !this.isEdit;
    this.isDisableSave = false;
    this.settings = {
      enableSearchFilter: true,
      singleSelection: true,
      classes: 'myclass custom-class',
      disabled: false,
      badgeShowLimit: 2,
      maxHeight: 141,
      autoPosition: false,
      position: 'bottom',
    };
  }
  closeReasonAll()  {
     document.getElementById("isShowInner").style.display = "none"
  }
  saveDeliveryNote() {
    const model = this.deliveryNoteData.map((i) => ({
      id: i.id,
      reason: i.reason ? i.reason[0].id : null,
    }));
    this.apiService.updateDeliveryNote({delivery_id: this.deliveryData.id, detail: model }).subscribe((res) => {
      this.isEdit = false;
      this.detailsClosed.emit();
      this.closeDetailView();
      this.isEdit = !this.isEdit;
      // this.isDisableSave = false;
      this.settings = {
        enableSearchFilter: true,
        singleSelection: true,
        classes: 'myclass custom-class',
        disabled: true,
        badgeShowLimit: 2,
        maxHeight: 141,
        autoPosition: false,
        position: 'bottom',
      }
    });
  }

  onClickTripDialog() {
    this.dialogRef
      .open(DeliveryTripDialogComponent, {
        width: '250px',
        data: this.itemDetails,
      })
      .componentInstance.updateTrip.subscribe((res: any) => {
        if (res) {
          this.dataService.sendData({
            type: CompDataServiceType.GET_NEW_DATA,
            data: { id: this.deliveryData.id },
          });
          this.formDrawer.close();
        }
      });
  }

  onClickDriverDialog() {
    this.isShowData = true

  }

  getDocument = (type) => {
    const model = {
      id: this.deliveryData.id,
      status: type,
    };

    this.deliveryService.getDocument(model).subscribe((res: any) => {
      if (res.status) {
        if (res.data && res.data.html_string) {
          this.deliveryTemplate = this.sanitizer.bypassSecurityTrustHtml(
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

  changeDriverCode()
  {
    let body = {
      delivery_id: this.deliveryData.id,
      delivery_driver_id:this.salesmen[0].id
    };

    this.apiService.changeDriverCode(body).subscribe((dta:any)=>{
      console.log(dta,"mlk")
      if(dta?.status)
      {
      window.location.reload()
      }
    })

    console.log(body)
  }

  closeDriver()
  {
    this.isShowData = false
  }

  public confirmShipment(): void {
    let body = {
      delivery_id: [this.deliveryData.id],
    };
    this.apiService.confirmShipment(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.dataService.sendData({
            type: CompDataServiceType.GET_NEW_DATA,
            data: { id: this.deliveryData.id },
          });
          this.closeDetailView();
          this.commonToasterService.showSuccess(
            'Success',
            'Action Successfull'
          );
        } else {
          this.commonToasterService.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.commonToasterService.showError('Error', 'Action Un-successfull');
      }
    );
  }
  getDeliveryNotesData() {
    this.apiService.getDeliveryNote(this.deliveryData?.id).subscribe((res) => {
      this.deliveryNoteData = res.data;
      console.log(this.deliveryNoteData,"jkllk")
      if (this.deliveryNoteData) {
        this.deliveryNoteData?.forEach((element) => {
          if (element.reason) {
            const reason = {
              id: element?.reason?.id,
              itemName: element?.reason.code + ' - ' + element.reason.name,
            };
            element.reason = [];
            element.reason.push(reason);
          }
          // element.reason ? element.reason.push({ id: element.reason.id, itemName: element.reason.code + ' - ' + element.reason.name }) : null
        });
      }
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.deliveryData?.currentValue != changes.deliveryData?.previousValue
    ) {
      if (
        this.deliveryData?.current_stage == 'Approved' &&
        this.deliveryData?.approval_status == 'Completed'
      ) {
        this.ShowGenerateInvoice = false;
      } else {
        this.ShowGenerateInvoice = true;
      }
      this.settings = {
        enableSearchFilter: true,
        singleSelection: true,
        classes: 'myclass custom-class',
        disabled: true,
        badgeShowLimit: 2,
        maxHeight: 141,
        autoPosition: false,
        position: 'bottom',
      };
      this.initForm(changes.deliveryData.currentValue);
      this.uuid = this.deliveryData.uuid;
      this.hasApprovalPending =
        this.deliveryData.need_to_approve == 'yes' ? true : false;
      this.isDepotOrder = Boolean(this.deliveryData.depot);
      //    this.setTermsTitle();
      this.getDeliveryStatus(this.deliveryData.current_stage);
      this.showEditDelOptions(this.deliveryData.current_stage);
      if (
        this.currentRole == 'SC' &&
        this.deliveryData?.approval_status == 'Completed' || this.deliveryData?.approval_status == 'Cancel'
      ) {
        this.getDeliveryNotesData();
        this.apiService.getReturnAllReasonsType().subscribe((res) => {
          this.reasonsList = res.data;
          this.reasonsList = this.reasonsList.map((i) => ({
            id: i.id,
            itemName: i.code + ' - ' + i.name,
          }));
        });
      }
      // this.subscriptions.push(
      //   this.apiService.getOrderTypes().subscribe((result) => {
      //     this.orderTypes = result.data;
      //     let title = this.orderTypes.find(
      //       (type) => +type.id === +this.deliveryData.delivery_type
      //     );
      //     this.orderTypeTitle = title ? title?.name : '';
      //   })
      // );
      this.isPickingDeliveryData = this.deliveryData.delivery_details.filter(
        (i) => i.is_picking === 1
      );
      // if (this.deliveryData.id) {
      //   this.getDocument('print');
      // }

      if (this.deliveryData?.is_truck_allocated == 1) {
        this.apiService
          .getItemDetails(this.deliveryData.id)
          .subscribe((res) => {
            res.data.forEach((element) => {
              if (!element.delivery_driver_info) {
                element.delivery_driver_info = {
                  id: null,
                  salesman_code: null,
                  user_id: null,
                };
              }
            });
            this.itemDetails = res.data;

            console.log(this.itemDetails,"hiii",this.deliveryData)
            this.tempItemDetails = [...this.itemDetails];
          });
      }
    }
  }
  openReasonBlock()
  {
     document.getElementById("isShowInner").style.display = "flex"

  }
  enableEdit() {
    this.settings = {
      enableSearchFilter: true,
      singleSelection: true,
      classes: 'myclass custom-class',
      disabled: false,
      badgeShowLimit: 2,
      maxHeight: 141,
      autoPosition: false,
      position: 'bottom',
    };
    this.isEdit = !this.isEdit;
    this.isDisableSave = false;
  }
  OnItemDeSelect(item: any) {}
  onSelectAll(items: any) {}
  onDeSelectAll(items: any) {
    this.isDisableSave = false;
  }
  onItemSelect(item: any) {
    this.isDisableSave = true;
  }
  callAPI() {
    this.tempItemDetails = [...this.tempItemDetails];
    this.chdet.detectChanges();
  }
  submitTamp() {
    let model: any = {
      delivery_id: 0,
      items: [],
    };
    this.itemDetails.forEach((element) => {
      model.delivery_id = element.delivery_id;
      model.items.push({
        delivery_details_id: element.delivery_details_id,
        qty: element.qty,
        trip: element.trip,
        delivery_sequence: element.delivery_sequence,
        delivery_driver_id: element?.delivery_driver_info?.salesman_code,
        van_id: element.van?.van_code,
        is_last_trip: element.is_last_trip ? 1 : 0,
        is_deleted: element.is_deleted,
        reason_id: element.reason_id,
        id: element.id,
      });
    });
    this.apiService.updateDeliveryTamp(model).subscribe(
      (res) => {
        this.commonToasterService.showSuccess('Successfully!', res.message);
      },
      (err) => {
        if (err.error.errors.length > 0) {
          err.error.errors.forEach((element) => {
            this.commonToasterService.showError(element);
          });
        }
      }
    );
  }
  initForm(data) {
    const orgName = localStorage.getItem('org_name');
    const subject = `${orgName} sent you an delivery`;
    const message = `${orgName} sent you an delivery`;
    this.emailData = {
      email: data.customer.email,
      subject,
      message,
      type: 'delivery',
    };
  }
  showEditDelOptions(status) {
    switch (status) {
      case OrderUpdateProcess.PartialInvoice:
        this.showEditDel = false;
        break;
      case OrderUpdateProcess.Completed:
        this.showEditDel = false;
        break;
      case OrderUpdateProcess.Approved:
        this.showEditDel = true;
        break;
      case OrderUpdateProcess.Rejected:
        this.showEditDel = true;
        break;
      default:
        this.showEditDel = true;
        break;
    }
  }

  getDeliveryStatus(status: any) {
    switch (status) {
      case OrderUpdateProcess.Pending:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.PartialDeliver:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.PartialInvoice:
        status = true;
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.InProcess:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.Accept:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.Delivered:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.Invoiced:
        status = true;
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.Completed:
        this.showOrderStatusOptions = false;
        break;
      case OrderUpdateProcess.Rejected:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.Approved:
        this.showOrderStatusOptions = true;
        break;
    }
  }
  openItemDeleteBox(item, i) {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete this item ${item?.item?.item_code}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.itemDetails[i].is_deleted = 1;
          // this.deleteOder();
        }
      });
  }
  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find((uom) => uom.id === item.item_uom_id);
    return selectedUom ? selectedUom.name : '';
  }

  public getCustomer(): string {
    return this.deliveryData?.customer
      ? this.deliveryData?.customer?.firstname +
          ' ' +
          this.deliveryData?.customer?.lastname
      : '';
  }
  public getCustomerLob(): string {
    return this.deliveryData?.lob ? this.deliveryData?.lob?.name : '';
  }

  public generateInvoice(): void {
    if (!this.deliveryData) {
      return;
    }
    const stringifiedData: string = JSON.stringify(this.deliveryData);
    window.localStorage.setItem('deliveryData', stringifiedData);
    this.router.navigate(['transaction/invoice/generate-invoice', this.uuid]);
  }

  public setTermsTitle(): void {
    this.subscriptions.push(
      this.apiService.getPaymenterms().subscribe((result) => {
        this.terms = result.data;
        let title = this.terms.find(
          (item) => item.id === this.deliveryData.payment_term_id
        );
        this.paymentTermTitle = title ? title.name : '';
      })
    );
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }
  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.deliveryData?.order?.order_number}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteOder();
        }
      });
  }

  private deleteOder(): void {
    this.apiService.deleteOrder(this.deliveryData.uuid).subscribe((result) => {
      this.isDetailVisible = false;
      this.detailsClosed.emit();
      this.dataService.sendData({
        type: CompDataServiceType.CLOSE_DETAIL_PAGE,
        uuid: this.deliveryData.uuid,
      });
    });
  }

  approve() {
    if (this.deliveryData && this.deliveryData.objectid) {
      this.apiService
        .approveItem(this.deliveryData.objectid)
        .subscribe((res: any) => {
          const approvedStatus: boolean = res.data.approved_or_rejected;
          if (res.status && approvedStatus) {
            this.commonToasterService.showSuccess(
              'Approved',
              'Delivery has been Approved'
            );
            this.hasApprovalPending = false;
            this.dataService.sendData({
              type: CompDataServiceType.GET_NEW_DATA,
              data: { id: this.deliveryData.id },
            });
          }
        });
    }
  }

  reject() {
    if (this.deliveryData && this.deliveryData.objectid) {
      this.apiService
        .rejectItemApproval(this.deliveryData.objectid)
        .subscribe((res: any) => {
          this.commonToasterService.showSuccess(
            'Reject',
            'Delivery has been Rejected'
          );
          this.hasApprovalPending = false;
          this.dataService.sendData({
            type: CompDataServiceType.GET_NEW_DATA,
            data: { id: this.deliveryData.id },
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
  checkPermission(role) {
    if (role === 'Warehouse' || role === 'org-admin') {
      return false;
    } else {
      return true;
    }
  }

  checkTempDeliveryStatus() {
    if (
      this.currentRole === 'Warehouse' ||
      this.currentRole === 'org-admin' ||
      this.currentRole === 'SC'
    ) {
      if (
        this.deliveryData?.approval_status == 'Shipment' ||
        this.deliveryData?.approval_status == 'Completed' ||
        this.deliveryData?.approval_status == 'Cancel'
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
}
export const ITEM_DELIVERY_FORM_TABLE_HEADS: ItemAddTableHeader[] = [
  { id: 0, key: 'check', label: 'checkBox', show: true },
  { id: 1, key: 'sequence', label: '#', show: true },
  { id: 2, key: 'item', label: 'Item Code', show: true },
  { id: 3, key: 'itemName', label: 'Item Name', show: true },
  { id: 4, key: 'uom', label: 'UOM', show: true },
  { id: 5, key: 'qty', label: 'Quantity', show: true },
  { id: 6, key: 'reason', label: 'Reason', show: true },
  { id: 7, key: 'price', label: 'Price', show: true },
  { id: 8, key: 'excise', label: 'Excise', show: true },
  { id: 9, key: 'discount', label: 'Discount', show: true },
  { id: 10, key: 'net', label: 'Net', show: true },
  { id: 11, key: 'vat', label: 'Vat', show: true },
  { id: 12, key: 'total', label: 'Total', show: true },
  // { id: 13, key: 'driverName', label: 'Driver Name', show: true },
  // { id: 14, key: 'vehicleNo', label: 'Vehicle No', show: true },
];
export const ITEM_DETAILS_FORM_TABLE_HEADS: ItemAddTableHeader[] = [
  { id: 0, key: 'sequence', label: '#', show: true },
  { id: 1, key: 'item', label: 'Item Code', show: true },
  { id: 2, key: 'itemName', label: 'Item Name', show: true },
  { id: 4, key: 'qty', label: 'Quantity', show: true },
  { id: 5, key: 'salesman_code', label: 'Driver Code', show: true },
  { id: 7, key: 'trip', label: 'Trip', show: true },
  { id: 8, key: 'delivery_sequence', label: 'Delivery Sequance', show: true },
  { id: 9, key: 'invoice', label: 'Invoice', show: true },
  { id: 10, key: 'action', label: 'Action', show: true },
];
export const ITEM_DETAILS_FORM_TABLE_HEADS_DELIVERY_NOTE: ItemAddTableHeader[] =
  [
    { id: 0, key: 'sequence', label: '#', show: true },
    { id: 1, key: 'item', label: 'Item Code', show: true },
    { id: 2, key: 'itemName', label: 'Item Name', show: true },
    { id: 4, key: 'qty', label: 'Quantity', show: true },
    { id: 5, key: 'salesman_code', label: 'Driver Code', show: true },
    { id: 6, key: 'reason', label: 'Reason', show: true },
    // { id: 7, key: 'action', label: 'Action', show: true }
  ];
