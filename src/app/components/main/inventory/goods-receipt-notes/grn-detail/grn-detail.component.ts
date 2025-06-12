import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
// import {ItemUoms} from '../../../components/datatables/itemuoms-dt/itemuoms-dt.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { GrnModel, GrnItemsPayload } from '../grn-models';
import { APP_CURRENCY_CODE, CompDataServiceType } from 'src/app/services/constants';
import { ItemAddTableHeader } from '../../../transaction/orders/order-models';
import { ItemUoms } from '../../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { ITEM_GRN_TABLE_HEADS } from '../grn-form/grn-form.component';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { TargetService } from '../../../targets/target.service';
// import { GrnPdfMakerService } from '../grn-pdf-maker.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { NetworkService } from 'src/app/services/network.service';
import { endpoints } from 'src/app/api-list/api-end-points';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-grn-detail',
  templateUrl: './grn-detail.component.html',
  styleUrls: ['./grn-detail.component.scss'],
})
export class GrnDetailComponent extends BaseComponent
  implements OnInit, OnDestroy {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public grnData: any;
  @Input() public isDetailVisible: boolean;

  grnTemplete : any;
  private sanitizer: DomSanitizer;
  public uuid: string;
  public isDepotOrder: boolean;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public hasApprovalPending: boolean;

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public uoms: ItemUoms[] | any = [];

  private router: Router;
  private apiService: ApiService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private dialogRef: MatDialog;
  isEdit = false;
  isDisableSave = true;
  qtyInd = -1;
  itemList = [];
  reasonsList: any = [];
  settings = {};

  constructor(
    apiService: ApiService,
    private CommonToasterService: CommonToasterService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    sanitizer: DomSanitizer,
    private tService: TargetService,
    private network: NetworkService,
    // private grnPdfMakerService: GrnPdfMakerService
  ) {
    super('GRN');
    Object.assign(this, {
      apiService,
      dataService,
      dialogRef,
      formBuilder,
      router,
      route,
      sanitizer
    });

  }

  public ngOnInit(): void {
    this.itemTableHeaders = ITEM_ADD_FORM_TABLE_HEADS;
    this.subscriptions.push(
      this.apiService.getItemUom().subscribe((result) => {
        this.uoms = result.data;
      })
    );
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.grnData) {
        this.settings = {
          enableSearchFilter: true,
          singleSelection: true,
          classes: "myclass custom-class",
          disabled: true,
          badgeShowLimit: 2,
          maxHeight: 141,
          autoPosition: false,
          position: 'bottom'
        };

        let currentValue = changes.grnData.currentValue;
        this.grnData = currentValue;
        this.hasApprovalPending =
          this.grnData?.need_to_approve == 'yes' ? true : false;
        this.apiService.getReturnAllReasonsType().subscribe(res => {
          this.reasonsList = res.data;
          this.itemList = this.reasonsList.map(i => ({ id: i.id, itemName: i.code + ' - ' + i.name }));
        });
        if (this.grnData && this.grnData.goodreceiptnotedetail) {
          this.grnData?.goodreceiptnotedetail?.forEach(element => {
            if (element.reason_id) {
              let reason = { id: element?.reason_type?.id, itemName: element?.reason_type.code + ' - ' + element.reason_type.name };
              element.reason_id = [];
              element.reason_id.push(reason);
            }
            // element.reason ? element.reason.push({ id: element.reason.id, itemName: element.reason.code + ' - ' + element.reason.name }) : null
          });
        }
      }
      if (this.grnData.id) {
        this.getDocument('print');
      }
    }
  }

  
  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }
  enableEdit() {
    this.settings = {
      enableSearchFilter: true,
      singleSelection: true,
      classes: "myclass custom-class",
      disabled: false,
      badgeShowLimit: 2,
      maxHeight: 141,
      autoPosition: false,
      position: 'bottom',
      lazyLoading: true
    };
    this.isEdit = !this.isEdit;
    this.isDisableSave = false;
  }
  changeQty(qty, i) {
    this.qtyInd = i;
    if (+this.grnData.goodreceiptnotedetail[i].original_item_qty != +qty) {
      this.grnData.goodreceiptnotedetail[i]['isQtyChange'] = true;
    } else {
      this.grnData.goodreceiptnotedetail[i]['reason_id'] = null;
      this.grnData.goodreceiptnotedetail[i]['isQtyChange'] = false;
    }
    this.grnData.goodreceiptnotedetail[i].qty = qty;
  }
  OnItemDeSelect(item: any) {
  }
  onSelectAll(items: any) {
  }
  onDeSelectAll(items: any) {
    this.isDisableSave = false;
  }
  onItemSelect(item: any) {
    this.isDisableSave = true;
  }
  public getUomValue(item: GrnItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );

    return selectedUom ? selectedUom.name : '';
  }

  public goToOrders(): void {
    this.router.navigate(['inventory/grn']);
  }

  public editOrder(): void {
    this.router.navigate(['inventory/grn/edit', this.uuid]);
  }
  public Document(model): Observable<any> {
      return this.network.post(endpoints.apiendpoint.goodsReceiptNote.download, model);
    }
    getDocument = (type) => {
      const model = {
        id: this.grnData.id,
        status: type,
      };

      this.Document(model).subscribe((res: any) => {
        if (res.status) {
          if (res.data && res.data.html_string) {
            this.grnTemplete = this.sanitizer.bypassSecurityTrustHtml(
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
  }

  
  
  saveData() {
    this.grnData.items = [...this.grnData.goodreceiptnotedetail];
    const model = {
      "trip_id": this.grnData.trip_id.toString(),
      "customer_refrence_number": this.grnData.customer_refrence_number,
      "grn_number": this.grnData.grn_number,
      "van_id": this.grnData.van_id.toString(),
      "destination_warehouse": this.grnData.destination_warehouse.id.toString(),
      "source_warehouse": this.grnData.source_warehouse,
      "salesman_id": this.grnData.salesman_id.toString(),
      "route_id": this.grnData.route_id.toString(),
      "grn_date": this.grnData.grn_date,
      "status": this.grnData.status.toString(),
      "is_damaged": this.grnData.is_damaged,
      "source": this.grnData.source,
      "items": []
      // {
      //   "item_id": "1126",
      //   "item_uom_id": "1",
      //   "qty": "10.00",
      //   "reason_id": 1,
      //   "reason": "Expiry Return"
      // }

    };
    // delete this.grnData.goodreceiptnotedetail;
    this.grnData.goodreceiptnotedetail.map(i => {
      model.items.push({
        "id": i.good_receipt_note_id,
        "item_id": i.item_id.toString(),
        "item_uom_id": i.item_uom_id.toString(),
        "qty": i.qty,
        "original_item_qty": i.original_item_qty,
        "reason_id": i.reason_id.find(i => i.id).id,
        "reason": i.reason
      });
    })
    this.qtyInd = -1;
    this.tService
      .editGoodsReceiptNote(model, this.grnData.uuid)
      .subscribe((res) => {
        this.isEdit = false;
        this.detailsClosed.emit();
        this.dataService.sendData({
          type: CompDataServiceType.GET_NEW_DATA,
          data: { id: this.grnData.id }
        });
      });

  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.isEdit = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.GET_NEW_DATA });
  }
  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.grnData.grn_number}?`,
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
    this.apiService.deleteGRN(this.grnData.uuid).subscribe((result) => {
      this.CommonToasterService.showSuccess(
        '',
        'Deleted Successfully!Please check the table'
      );
      this.router.navigate(['inventory/grn']);
    });
  }
  


  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
  approve() {
    this.apiService
      .approveItem(this.grnData.objectid)
      .subscribe((res: any) => {
        const approvedStatus: boolean = res.data.approved_or_rejected;
        if (res.status && approvedStatus) {
          this.CommonToasterService.showSuccess(
            'Approved',
            'Order has been Approved'
          );
          this.hasApprovalPending = false;
        }
      });
  }
  reject() {
    this.apiService
      .rejectItemApproval(this.grnData.objectid)
      .subscribe((res: any) => {
        this.CommonToasterService.showSuccess(
          'Reject',
          'Order Approval has been Rejected'
        );
        this.hasApprovalPending = false;
      });
  }
}
const ITEM_ADD_FORM_TABLE_HEADS: ItemAddTableHeader[] = [
  { id: 0, key: 'sequence', label: '#', show: true },
  { id: 2, key: 'item_code', label: 'Item Code', show: true },
  { id: 1, key: 'item', label: 'Item Name', show: true },
  { id: 3, key: 'uom', label: 'UOM', show: true },
  { id: 4, key: 'qty', label: 'Quantity', show: true },
  { id: 5, key: 'reason_id', label: 'Reason', show: true },
  { id: 6, key: 'reason', label: 'Return Reason', show: true }
];
