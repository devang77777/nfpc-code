import { CommonToasterService } from './../../../../../services/common-toaster.service';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { ItemUoms } from '../../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { FormBuilder } from '@angular/forms';
import { ItemAddTableHeader } from '../../../transaction/orders/order-models';
import { StockAdjustItemsPayload } from '../../stock-adjustment/stock-adjustment-model';
import { BaseComponent } from '../../../../../features/shared/base/base.component';

@Component({
  selector: 'app-depot-expairy-detail',
  templateUrl: './depot-expairy-detail.component.html',
  styleUrls: ['./depot-expairy-detail.component.scss'],
})
export class DepotExpairyDetailComponent extends BaseComponent {
  public uuid: string;
  public isDepotOrder: boolean;
  public stckAdjData: any;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public storeExpairy: any[] = [];
  public depotExpairyTableHeaders: ItemAddTableHeader[] = [];
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
    super('Depot Damage Expiry');
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
    this.depotExpairyTableHeaders = DEPOT_EXPAIRY_TABLE_HEADS;
    this.uuid = this.route.snapshot.params.uuid;
    this.stckAdjData = this.route.snapshot.data['data'].returndata;
    this.storeExpairy.push(this.stckAdjData.depotdamageexpiry_detail);

    //console.log(this.stckAdjData);
    //console.log(this.storeExpairy);
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
    this.router.navigate(['inventory/depot-expairy']);
  }

  public editOrder(): void {
    this.router.navigate(['inventory/depot-expairy/edit', this.uuid]);
  }

  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.stckAdjData.reference_code}?`,
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
      .deleteDepotExpairyGoods(this.stckAdjData.uuid)
      .subscribe((result) => {
        this.CommonToasterService.showSuccess(
          '',
          'Deleted Successfully!Please check the table'
        );
        this.router.navigate(['inventory/depot-expairy']);
      });
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
export const DEPOT_EXPAIRY_TABLE_HEADS: ItemAddTableHeader[] = [
  { id: 0, key: 'sequence', label: '#' },
  { id: 1, key: 'item_id', label: 'Item Name' },
  { id: 2, key: 'item_uom_id', label: 'UOM' },
  { id: 3, key: 'qty', label: ' Qty' },
  { id: 4, key: 'reason', label: 'Reason' },
];
