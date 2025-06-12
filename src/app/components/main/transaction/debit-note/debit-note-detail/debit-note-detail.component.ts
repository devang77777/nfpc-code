import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ChangeDetectorRef,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import {
  OrderModel,
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  OrderUpdateProcess
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
import { DebitNoteService } from '../debit-note.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-debit-note-detail',
  templateUrl: './debit-note-detail.component.html',
  styleUrls: ['./debit-note-detail.component.scss'],
})
export class DebitNoteDetailComponent extends BaseComponent
  implements OnInit, OnDestroy {
  public uuid: string;
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public debitNoteData: any;
  @Input() public isDetailVisible: boolean;
  @Output() public toggleHistory: EventEmitter<any> = new EventEmitter<any>();

  debitNoteTemplate: any;
  private sanitizer: DomSanitizer;
  public isDepotOrder: boolean;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public hasApprovalPending: boolean;
  public orderStats: { key: string; label: string }[] = [
    { key: 'total_gross', label: 'Gross Total' },
    { key: 'total_vat', label: 'Vat' },
    { key: 'total_excise', label: 'Excise' },
    { key: 'total_net', label: 'Net Total' },
    { key: 'total_discount_amount', label: 'Discount' },
    { key: 'grand_total', label: 'Invoice Total' },
  ];
  emailData: any;
  public orderTypeTitle = '';
  public reasonTitle = '';
  public paymentTermTitle: string;

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public itemTableHeaders0: ItemAddTableHeader[] = [
    { id: 0, key: 'sequence', label: '#', show: true },
    { id: 1, key: 'item', label: 'Item Name', show: true },
    { id: 2, key: 'amount', label: 'Amount', show: true },
    { id: 3, key: 'price', label: 'Price', show: true },
    { id: 4, key: 'discount', label: 'Discount', show: true },
    { id: 5, key: 'vat', label: 'Vat', show: true },
    { id: 6, key: 'net', label: 'Net', show: true },
    { id: 7, key: 'total', label: 'Total', show: true },
  ]
  public orderTypes: OrderType[] = [];
  public uoms: ItemUoms[] | any = [];
  public terms: PaymentTerms[] = [];
  public showOrderStatusOptions: boolean = true;
  public showOrderEditAndDelete: boolean = true;
  public showCustomerLob: boolean = true;
  public showReasone: boolean = true;

  private router: Router;
  private apiService: ApiService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private dialogRef: MatDialog;
  public debitNoteIsApproved: boolean = false;
  email: any;
  constructor(
    private debitNoteService: DebitNoteService,
    private changeDetectorRef: ChangeDetectorRef,
    private commonToasterService: CommonToasterService,
    apiService: ApiService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    sanitizer: DomSanitizer,
    router: Router,
    route: ActivatedRoute
  ) {
    super('Debit Note');
    Object.assign(this, {
      apiService,
      dataService,
      dialogRef,
      formBuilder,
      router,
      sanitizer,
      route,
    });
  }

  public ngOnInit(): void {
    this.itemTableHeaders = ITEM_ADD_FORM_TABLE_HEADS;
    this.itemTableHeaders.forEach(e => {
      if (e.key == 'weight') {
        e.show = false;
      }
      if (e.key == 'ohq') {
        e.show = false;
      }
    })

  }
  ngOnChanges(changes: SimpleChanges) {
    console.log("render")
    console.log('hello world', this.dataService)
    if (this.debitNoteData?.lob === null) {
      this.showCustomerLob = false;
    }
    else {
      this.showCustomerLob = true;
    }
    if (this.debitNoteData?.reason === null) {
      this.showReasone = false;
    }
    else {
      this.showReasone = true;
    }
    if (this.debitNoteData?.is_debit_note == 0) {
      let amountIndex = this.itemTableHeaders0.findIndex(x => x.label == "Amount");
      this.itemTableHeaders0[amountIndex].show = false;
    }
    if (this.debitNoteData?.is_debit_note == 1) {
      let exciseIndex = this.itemTableHeaders.findIndex(x => x.label == "Excise");
      this.itemTableHeaders[exciseIndex].show = false;
    }

    if (
      changes.debitNoteData?.currentValue !=
      changes.debitNoteData?.previousValue
    ) {
      this.initForm(changes.debitNoteData.currentValue);
      this.uuid = this.debitNoteData.uuid;
      this.hasApprovalPending =
        this.debitNoteData.need_to_approve == 'yes' ? true : false;

      //console.log(this.hasApprovalPending);
      this.isDepotOrder = Boolean(this.debitNoteData.depot);
      this.setTableHeaders();
      this.setTermsTitle();
      this.setReasonTitle();
      this.subscriptions.push(
        this.debitNoteService.getOrderTypes().subscribe((result) => {
          this.orderTypes = result.data;
          let name = this.orderTypes.find(
            (type) => type.id === this.debitNoteData?.order_type_id
          );
          this.orderTypeTitle = name?.name;
        })
      );
      this.subscriptions.push(
        this.apiService.getItemUom().subscribe((result) => {
          this.uoms = result.data;
        })
      );
      this.getOrderStatus(this.debitNoteData.current_stage);
      if (this.debitNoteData.id) {
        this.getDocument('print');
      }
    }

    this.changeDetectorRef.detectChanges();
  };

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
        this.showOrderStatusOptions = false;
        this.showOrderEditAndDelete = false;
        break;
      case OrderUpdateProcess.Approved:
        this.showOrderStatusOptions = false;
        this.showOrderEditAndDelete = false;
        break;
      case OrderUpdateProcess.Cancel:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = true;
        break;
    }
  };



  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }
  onToggleHistory() {
    this.toggleHistory.emit(true);
  }
  initForm(data) {
    const orgName = localStorage.getItem('org_name');
    const subject = `${orgName} sent you an debit note`;
    const message = `${orgName} sent you an debit note`;
    this.emailData = {
      email: data.customer.email,
      subject,
      message,
      type: 'debit note',
    };
  }

  getDocument = (type) => {
    const model = {
      id: this.debitNoteData.id,
      status: type,
    };

    this.debitNoteService.getDocument(model).subscribe((res: any) => {
      if (res.status) {
        if (res.data && res.data.html_string) {
          this.debitNoteTemplate = this.sanitizer.bypassSecurityTrustHtml(
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
  public setTableHeaders(): void {
    this.itemTableHeaders = [...ITEM_ADD_FORM_TABLE_HEADS];
    this.itemTableHeaders.splice(3, 0, {
      id: 4,
      key: 'reason',
      label: 'Reason',
    });
    this.itemTableHeaders.forEach((head, index) => {
      this.itemTableHeaders[index].id = index;
    });
  }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );
    return selectedUom ? selectedUom.name : '';
  }

  public setTermsTitle(): void {
    this.subscriptions.push(
      this.apiService.getPaymenterms().subscribe((result) => {
        this.terms = result.data;
        let name = this.terms.find(
          (item) => item.id === this.debitNoteData.payment_term_id
        );
        this.paymentTermTitle = name?.name;
      })
    );
  }

  public setReasonTitle(): void {
    this.reasonTitle = this.debitNoteData.reason
      ? this.debitNoteData.reason
      : '';
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }
  public editOrder(): void {
    this.router.navigate(['transaction/debit-note/edit', this.uuid]);
  }

  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.debitNoteData?.debit_note_number}?`,
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
    this.debitNoteService.deleteDebitNote(this.uuid).subscribe((res: any) => {
      if (res.status) {
        this.commonToasterService.showInfo(
          'Deleted',
          'Debit Note Deleted Sucessfully'
        );
        this.isDetailVisible = false;
        this.detailsClosed.emit();
        this.dataService.sendData({
          type: CompDataServiceType.CLOSE_DETAIL_PAGE,
          uuid: this.debitNoteData.uuid,
        });
      }
    });
  }
  approve() {
    //console.log(this.debitNoteData);
    if (this.debitNoteData && this.debitNoteData.objectid) {
      this.apiService
        .approveItem(this.debitNoteData.objectid)
        .subscribe((res: any) => {
          const approvedStatus: boolean = res.data.approved_or_rejected;
          if (res.status && approvedStatus) {
            this.commonToasterService.showSuccess(
              'Approved',
              'Debit Note has been Approved'
            );
            this.hasApprovalPending = false;
            this.dataService.sendData({
              type: CompDataServiceType.GET_NEW_DATA,
              data: { id: this.debitNoteData.id }
            });
          }
        });
    }
  }

  reject() {
    if (this.debitNoteData && this.debitNoteData.objectid) {
      this.apiService
        .rejectItemApproval(this.debitNoteData.objectid)
        .subscribe((res: any) => {
          this.commonToasterService.showSuccess(
            'Reject',
            'Debit Note Approval has been Rejected'
          );
          this.hasApprovalPending = true;
          this.dataService.sendData({
            type: CompDataServiceType.GET_NEW_DATA,
            data: { id: this.debitNoteData.id }
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
