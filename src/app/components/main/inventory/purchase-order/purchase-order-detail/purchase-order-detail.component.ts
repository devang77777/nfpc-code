import { CommonToasterService } from './../../../../../services/common-toaster.service';

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
// import {ItemUoms} from '../../../components/datatables/itemuoms-dt/itemuoms-dt.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { PurchaseOrderModel } from '../purchase-order-model';
import {
  APP_CURRENCY_CODE,
  CompDataServiceType,
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';

import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import {
  ItemAddTableHeader,
  OrderItemsPayload,
} from '../../../transaction/orders/order-models';
import { ItemUoms } from '../../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { ITEM_ADD_FORM_TABLE_HEADS } from '../../../transaction/orders/order-form/order-form.component';
import { BaseComponent } from '../../../../../features/shared/base/base.component';

@Component({
  selector: 'app-purchase-order-detail',
  templateUrl: './purchase-order-detail.component.html',
  styleUrls: ['./purchase-order-detail.component.scss'],
})
export class PurchaseOrderDetailComponent extends BaseComponent
  implements OnInit, OnDestroy {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public purchaseOrderData: any;
  @Input() public isDetailVisible: boolean;
  public uuid: string;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public hasApprovalPending: boolean;
  public orderStats: { key: string; label: string }[] = [
    { key: 'price', label: 'Gross Total' },
    { key: 'vat', label: 'Vat' },
    { key: 'excise', label: 'Excise' },
    { key: 'total_net', label: 'Net Total' },
    { key: 'discount', label: 'Discount' },
    { key: 'total', label: 'Total' },
  ];

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public uoms: ItemUoms[] | any = [];
  public terms: PaymentTerms[] = [];

  private router: Router;
  private apiService: ApiService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private dialogRef: MatDialog;
  public storepurchas: any[] = [];
  constructor(
    apiService: ApiService,
    private CommonToasterService: CommonToasterService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute
  ) {
    super('Purchase Order');
    Object.assign(this, {
      apiService,
      dataService,
      dialogRef,
      formBuilder,
      router,
      route,
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
    if (
      changes.purchaseOrderData?.currentValue !=
      changes.purchaseOrderData?.previousValue
    ) {
      this.uuid = this.purchaseOrderData.uuid;
      // this.storepurchas.push(this.purchaseOrderData[0].purchaseorderdetail);
    }
  }
  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );

    return selectedUom ? selectedUom.name : '';
  }

  public goToOrders(): void {
    this.router.navigate(['inventory/purchase-order']);
  }

  public editOrder(): void {
    this.router.navigate(['inventory/purchase-order/edit', this.uuid]);
  }

  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.purchaseOrderData.purchase_order}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteOder();
        }
      });
  }

  public startDelivery(): void {
    this.router.navigate([
      'inventory/purchase-order/start-delivery',
      this.uuid,
    ]);
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }
  private deleteOder(): void {
    this.apiService
      .deletPurchaseeOrder(this.purchaseOrderData.uuid)
      .subscribe((result) => {
        this.isDetailVisible = false;
        this.detailsClosed.emit();
        this.dataService.sendData({
          type: CompDataServiceType.CLOSE_DETAIL_PAGE,
          uuid: this.purchaseOrderData.uuid,
        });
      });
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
