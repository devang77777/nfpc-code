import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
// import {ItemUoms} from '../../../components/datatables/itemuoms-dt/itemuoms-dt.component';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

import {
  StockAdjustItemsPayload,
  StockAdjustmentModel,
} from '../stock-adjustment-model';
import {
  QTY_STOCK_ADJUST_TABLE_HEADS,
  VALUE_STOCK_ADJUST_TABLE_HEADS,
} from '../sa-form/sa-form.component';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { ItemAddTableHeader } from '../../../transaction/orders/order-models';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from '../../../../../features/shared/base/base.component';

@Component({
  selector: 'app-sa-detail',
  templateUrl: './sa-detail.component.html',
  styleUrls: ['./sa-detail.component.scss'],
})
export class SaDetailComponent extends BaseComponent
  implements OnInit, OnDestroy {
  public uuid: string;
  public isDepotOrder: boolean;
  public stckAdjData: any;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public storeStock: any[] = [];
  public qtyTableHeaders: ItemAddTableHeader[] = [];
  public valueTableHeaders: ItemAddTableHeader[] = [];
  public uoms: ItemUoms[] | any = [];

  private router: Router;
  private apiService: ApiService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private dialogRef: MatDialog;

  constructor(
    apiService: ApiService,
    private CommonToasterService: CommonToasterService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute
  ) {
    super('Stock Adjustment');
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
    this.qtyTableHeaders = QTY_STOCK_ADJUST_TABLE_HEADS;
    this.valueTableHeaders = VALUE_STOCK_ADJUST_TABLE_HEADS;
    this.uuid = this.route.snapshot.params.uuid;
    this.stckAdjData = this.route.snapshot.data['stock'].returnStock;
    this.storeStock.push(this.stckAdjData.stock_adjustment_detail);
    //console.log(this.storeStock);
    //console.log(this.stckAdjData);

    this.subscriptions.push(
      this.apiService.getItemUom().subscribe((result) => {
        this.uoms = result.data;
      })
    );
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public getUomValue(item: StockAdjustItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );

    return selectedUom ? selectedUom.name : '';
  }

  public goToList(): void {
    this.router.navigate(['inventory/stock-adjustment']);
  }

  public editOrder(): void {
    this.router.navigate(['inventory/stock-adjustment/edit', this.uuid]);
  }

  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.stckAdjData[0].reference_number}?`,
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
    this.apiService
      .deleteStockAdjustment(this.stckAdjData[0].uuid)
      .subscribe((result) => {
        this.CommonToasterService.showSuccess(
          '',
          'Deleted Successfully!Please check the table'
        );
        this.router.navigate(['inventory/stock-adjustment']);
      });
  }
  converttoAdjustment() {
    this.apiService
      .convertToStockAdjustment(this.stckAdjData[0].uuid)
      .subscribe((result) => {
        this.CommonToasterService.showSuccess(
          '',
          'Converted Successfully!Please check the table'
        );
        this.router.navigate(['inventory/stock-adjustment']);
      });
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
