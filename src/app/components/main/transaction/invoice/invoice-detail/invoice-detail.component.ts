import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Sanitizer,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { InvoicePdfMakerService } from '../invoice-pdf-maker.service';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import {
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  OrderUpdateProcess,
} from 'src/app/components/main/transaction/orders/order-models';
import {
  CompDataServiceType,
} from 'src/app/services/constants';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { InvoiceServices } from '../invoice.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss'],
})
export class InvoiceDetailComponent extends BaseComponent
  implements OnInit, OnDestroy {
  @ViewChild('formDrawer2') fromDrawer: MatDrawer;
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public toggleHistory: EventEmitter<any> = new EventEmitter<any>();
  @Input() public invoiceData: any;
  @Input() public isDetailVisible: boolean;
  selectedRightBar: string;
  emailData: any;
  invoiceTemplate: any;
  public uuid: string;
  public isDepotOrder: boolean;
  public exchangeNumber: boolean;
  public hasApprovalPending: boolean;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public orderStats: { key: string; label: string }[] = [
    { key: 'total_gross', label: 'Gross Total' },
    { key: 'total_discount_amount', label: 'Discount' },
    { key: 'total_net', label: 'Net Total' },
    { key: 'total_excise', label: 'Excise' },
    { key: 'total_vat', label: 'Vat' },
    { key: 'rounding_off_amount', label: 'Rounding off' },
    { key: 'grand_total', label: 'Total' },
  ];

  public invoiceTypeTitle: string = '';
  public paymentTermTitle: string = '';

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public invoiceTypes: OrderType[] = [];
  public uoms: ItemUoms[] | any = [];
  public terms: PaymentTerms[] = [];
  public showOrderStatusOptions: boolean = false;
  public showEditDel: boolean = true;
  public LPO: boolean = false;
  private router: Router;
  private apiService: ApiService;
  private fds: FormDrawerService;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private dialogRef: MatDialog;
  private pdfGenerator: InvoicePdfMakerService;
  private sanitizer: DomSanitizer;
  private dataService: DataEditor;
  public invoiceIsApproved: boolean = false;

  module: any;
  isRemindedAdded: boolean;
  constructor(
    apiService: ApiService,
    private commonToasterService: CommonToasterService,
    private invoiceServices: InvoiceServices,
    fds: FormDrawerService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    pdfGenerator: InvoicePdfMakerService,
    sanitizer: DomSanitizer
  ) {
    super('Invoice');
    Object.assign(this, {
      apiService,
      fds,
      dataService,
      dialogRef,
      formBuilder,
      router,
      sanitizer,
      route,
      pdfGenerator,
    });
  }

  public ngOnInit(): void {
    this.module = {
      module: 'Invoice',
      module_id: '',
    };
    this.itemTableHeaders = ITEM_INVOICE_TABLE_HEADS;
    if (this.isDetailVisible) {
      this.subscriptions.push(
        this.apiService.getItemUom().subscribe((result) => {
          this.uoms = result.data;
        })
      );
    }
    if (this.invoiceData?.customer_lpo != null) {
      this.LPO == true;
    }
  }
  ngAfterViewChecked() {
    const popover = document.querySelector('.popover');
    if (!popover) return;

    const width = '200px';
    popover['style'].maxWidth = width;
    popover['style'].width = width;
    const slider = document.querySelector('.mat-slide-toggle-bar');
    if (!slider) return;
    if (!this.isRemindedAdded) {
      slider['style'].backgroundColor = 'red';
    } else {
      slider['style'].backgroundColor = 'green';
    }
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }
  onToggleHistory() {
    this.toggleHistory.emit(true);
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log("render")
    console.log(this.invoiceData)
    if (
      changes.invoiceData?.currentValue != changes.invoiceData?.previousValue
    ) {
      this.uuid = changes.invoiceData.currentValue.uuid;

      this.initForm(changes.invoiceData.currentValue);
      this.isRemindedAdded = this.invoiceData.invoice_reminder ? true : false;
      const newModule = { ...this.module };
      newModule.module_id = this.invoiceData.id;
      this.module = JSON.parse(JSON.stringify(newModule));

      this.hasApprovalPending =
        this.invoiceData.need_to_approve == 'yes' ? true : false;
      if (this.invoiceData.exchange_number == null) {
        this.exchangeNumber = false;
      }
      else {
        this.exchangeNumber = true;
      }
      this.isDepotOrder = Boolean(this.invoiceData.depot);
      this.setTermsTitle();
      this.setTypesTitle();
      this.getInvoiceStatus(this.invoiceData.current_stage, this.invoiceData.pending_credit);

      if (this.invoiceData.id) {
        //  this.getDocument('print');
      }
    }
  }
  initForm(data) {
    const orgName = localStorage.getItem('org_name');
    const subject = `${orgName} sent you an invoice (${data?.invoice_number})`;
    const message = `${orgName} sent you an invoice (${data?.invoice_number}) for ${data.total_gross} that's due on ${data.invoice_due_date}`;
    this.emailData = {
      email: data.user.email,
      subject,
      message,
      type: 'invoice',
    };
  }

  getInvoiceStatus(status: any, pending_credit: any) {
    switch (status) {
      case OrderUpdateProcess.Pending:
        this.showOrderStatusOptions = false;
        this.showEditDel = true;
        break;
      case OrderUpdateProcess.PartialInvoice:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.InProcess:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.Accept:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.Invoiced:
        this.showOrderStatusOptions = false;
        break;
      case OrderUpdateProcess.Completed:
        this.showOrderStatusOptions = false;
        break;
      case OrderUpdateProcess.Approved:
        this.showOrderStatusOptions = true;
        this.showEditDel = true;

        break;
      case OrderUpdateProcess.Rejected:
        this.showEditDel = false;
        break;
    }
    if (pending_credit == 0) {
      this.showOrderStatusOptions = false;
      this.showEditDel = false;
    }
    else if (this.invoiceData.grand_total == pending_credit) {
      this.showEditDel = true;
    }

  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );

    return selectedUom ? selectedUom?.name : '';
  }

  public goToInvoices(): void {
    this.router.navigate(['transaction/invoice']);
  }

  public setTermsTitle(): void {
    this.subscriptions.push(
      this.apiService.getPaymenterms().subscribe((result) => {
        this.terms = result.data;

        const selectedTerm = this.terms.find(
          (item) => item.id === this.invoiceData.payment_term_id
        );
        this.paymentTermTitle = selectedTerm ? selectedTerm?.name : '';
      })
    );
  }
  openRightbar(item) {
    this.fds.setFormName('collect-invoice-form');
    this.fds.open();
    this.selectedRightBar = item;
  }
  public setTypesTitle(): void {
    this.subscriptions.push(
      this.apiService.getOrderTypes().subscribe((result) => {
        this.invoiceTypes = result.data;

        const selectedType = this.invoiceTypes.find(
          (type) => type.id === this.invoiceData.order_type_id
        );
        this.invoiceTypeTitle = selectedType ? selectedType?.name : '';
      })
    );
  }
  onClose() {
    this.fds.close();
  }
  public toggleReminder(event: MatSlideToggleChange) {
    if (this.isRemindedAdded) {
      this.stopReminder();
      return;
    }
    this.fds.setFormName('collect-invoice-form');
    this.fds.open();
    this.selectedRightBar = 'setting';
  }
  onReminderAdded(data) {
    this.invoiceData.invoice_reminder = data;
    this.isRemindedAdded = true;
  }
  stopReminder() {
    this.invoiceServices
      .stopReminder(this.invoiceData.invoice_reminder.uuid)
      .subscribe((result) => {
        this.isRemindedAdded = false;
        this.invoiceData.invoice_reminder = null;
        this.commonToasterService.showSuccess('Reminder deleted');
      });
  }
  getDocument = (type) => {
    const model = {
      id: this.invoiceData.id,
      status: type,
    };

    this.invoiceServices.getDocument(model).subscribe((res: any) => {
      if (res.status) {
        if (res.data && res.data.html_string) {
          this.invoiceTemplate = this.sanitizer.bypassSecurityTrustHtml(
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
  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.invoiceData?.invoice_number}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteInvoice();
        }
      });
  }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }

  public generatePDF(): void {
    this.pdfGenerator.invoiceData = this.invoiceData;
    this.pdfGenerator.generateAndOpenPDF();
  }

  public downloadPDF(): void {
    this.pdfGenerator.invoiceData = this.invoiceData;
    this.pdfGenerator.generateAndDownloadPDF();
  }

  private deleteInvoice(): void {
    this.invoiceServices.deleteInvoice(this.invoiceData.uuid).subscribe(() => {
      this.commonToasterService.showInfo('Invoice Deleted sucessfully');
      // this.router.navigate(['transaction/invoice']);
      this.isDetailVisible = false;
      this.detailsClosed.emit();
      this.dataService.sendData({
        type: CompDataServiceType.CLOSE_DETAIL_PAGE,
        uuid: this.invoiceData.uuid,
      });
    });
  }

  approve() {
    if (this.invoiceData && this.invoiceData.objectid) {
      this.apiService
        .approveItem(this.invoiceData.objectid)
        .subscribe((res: any) => {
          const approvedStatus: boolean = res.data.approved_or_rejected;
          if (res.status && approvedStatus) {
            this.commonToasterService.showSuccess(
              'Approved',
              'Invoice has been Approved'
            );
            this.hasApprovalPending = false;
            this.dataService.sendData({
              type: CompDataServiceType.GET_NEW_DATA,
              data: { id: this.invoiceData.id }
            });
          }
        });
    }
  }

  reject() {
    if (this.invoiceData && this.invoiceData.objectid) {
      this.apiService
        .rejectItemApproval(this.invoiceData.objectid)
        .subscribe((res: any) => {
          this.commonToasterService.showSuccess(
            'Reject',
            'Invoice Approval has been Rejected'
          );
          this.hasApprovalPending = false;
          this.dataService.sendData({
            type: CompDataServiceType.GET_NEW_DATA,
            data: { id: this.invoiceData.id }
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


}
export const ITEM_INVOICE_TABLE_HEADS: ItemAddTableHeader[] = [
  { id: 0, key: 'sequence', label: '#', show: true },
  { id: 1, key: 'item', label: 'Item Code', show: true },
  { id: 2, key: 'itemName', label: 'Item Name', show: true },
  { id: 3, key: 'uom', label: 'UOM', show: true },
  { id: 4, key: 'qty', label: 'Quantity', show: true },
  { id: 8, key: 'price', label: 'Price', show: true },
  { id: 9, key: 'excise', label: 'Excise', show: true },
  { id: 10, key: 'discount', label: 'Discount', show: true },
  { id: 11, key: 'net', label: 'Net', show: true },
  { id: 12, key: 'vat', label: 'Vat', show: true },
  { id: 13, key: 'total', label: 'Total', show: true },
];