import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  SalesTargetItemDetail,
  SalesTargetModel,
  SALES_TARGET_ITEM_HEADER,
  SALES_TARGET_HEAD_HEADER_QTY,
  SALES_TARGET_HEAD_HEADER_VALUE,
  SALES_TARGET_HEAD_HEADER_FIXED_QTY,
  SALES_TARGET_HEAD_HEADER_FIXED_VALUE,
  TargetControl,
  SalesTargetItemModalData,
} from '../../sales-target-model';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';

import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { ItemAddTableHeader } from 'src/app/components/main/transaction/orders/order-models';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { TargetService } from '../../../target.service';
import { SalesTargetItemModalComponent } from '../../sales-target-item-modal/sales-target-item-modal.component';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-st-detail-overview',
  templateUrl: './st-detail-overview.component.html',
  styleUrls: ['./st-detail-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StDetailOverviewComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public salesTargetData: SalesTargetModel;

  public uuid: string;
  public isDepotOrder: boolean;
  public objectValues = Object.values;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public itemTableHeaders: ItemAddTableHeader[] = [];
  public headTableHeadersQty: ItemAddTableHeader[] = [];
  public headTableHeadersFixedQty: ItemAddTableHeader[] = [];
  public headTableHeadersValue: ItemAddTableHeader[] = [];
  public headTableHeadersFixedValue: ItemAddTableHeader[] = [];

  private subscriptions: Subscription[] = [];
  private dialogRef: MatDialog;
  private changeDetectorRef: ChangeDetectorRef;
  private targetService: TargetService;
  constructor(
    public apiService: ApiService,
    targetService: TargetService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    router: Router,
    route: ActivatedRoute,
    changeDetectorRef: ChangeDetectorRef
  ) {
    Object.assign(this, {
      targetService,
      changeDetectorRef,
      dataService,
      dialogRef,
      elemRef,
      router,
      route,
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (
      changes.salesTargetData.currentValue &&
      !changes.salesTargetData.isFirstChange()
    ) {
      this.changeDetectorRef.detectChanges();
    }
  }

  public ngOnInit(): void {
    this.itemTableHeaders = SALES_TARGET_ITEM_HEADER;
    this.headTableHeadersQty = SALES_TARGET_HEAD_HEADER_QTY;
    this.headTableHeadersValue = SALES_TARGET_HEAD_HEADER_VALUE;
    this.headTableHeadersFixedQty = SALES_TARGET_HEAD_HEADER_FIXED_QTY;
    this.headTableHeadersFixedValue = SALES_TARGET_HEAD_HEADER_FIXED_VALUE;
    const data = this.salesTargetData;
    this.salesTargetData['Applyon'] =
      data['Applyon'] == '1' ? 'item' : 'header';
    this.salesTargetData['TargetVariance'] =
      data['TargetVariance'] == '1' ? 'fixed' : 'slab';
    this.salesTargetData['CommissionType'] =
      data['CommissionType'] == '1' ? 'fixed' : 'percentage';
    this.salesTargetData['TargetType'] =
      data['TargetType'] == '1' ? 'quantity' : 'value';

    this.subscriptions.push(
      this.targetService.getTargetEntities().subscribe((result) => {
        const data = result.data.find(
          (x) => x.id == this.salesTargetData['TargetEntity']
        );
        this.salesTargetData['TargetEntity'] = data ? data.name : 'N/A';
      })
    );
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public get targetControl(): TargetControl {
    if (this.salesTargetData.apply_type === 'item') {
      if (this.salesTargetData.TargetType === 'quantity') {
        return this.salesTargetData.TargetVariance === 'fixed'
          ? TargetControl.ITEM_FIXED_QTY
          : TargetControl.ITEM_QTY;
      } else {
        return this.salesTargetData.TargetVariance === 'fixed'
          ? TargetControl.ITEM_FIXED_VALUE
          : TargetControl.ITEM_VALUE;
      }
    } else {
      if (this.salesTargetData.TargetType === 'quantity') {
        return this.salesTargetData.TargetVariance === 'fixed'
          ? TargetControl.HEAD_FIXED_QTY
          : TargetControl.HEAD_QTY;
      } else {
        return this.salesTargetData.TargetVariance === 'fixed'
          ? TargetControl.HEAD_FIXED_VALUE
          : TargetControl.HEAD_VALUE;
      }
    }
  }

  public openItemTargetModal(
    itemDetail: SalesTargetItemDetail,
    index: number
  ): void {
    const data: SalesTargetItemModalData = {
      itemDetail,
      itemIndex: index,
      targetControl: this.targetControl,
      commissionType: this.salesTargetData.CommissionType,
    };

    this.dialogRef
      .open(SalesTargetItemModalComponent, {
        width: '500px',
        position: { top: '0px' },
        data,
      })
      .afterClosed()
      .subscribe((customData: SalesTargetItemModalData) => {
        //console.log(customData);
      });
  }
  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
