import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  SalesAchievedStats,
  SalesTargetItemDetail,
  SalesTargetModel,
} from '../../sales-target-model';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { InfoModal } from 'src/app/components/main/transaction/collection/collection-models';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { Utils } from 'src/app/services/utils';
import { TargetService } from '../../../target.service';

@Component({
  selector: 'app-st-detail-sales-achieved',
  templateUrl: './st-detail-sales-achieved.component.html',
  styleUrls: ['./st-detail-sales-achieved.component.scss'],
})
export class StDetailSalesAchievedComponent implements OnInit, OnDestroy {
  @Input() public salesTargetData: SalesTargetModel;

  public itmes: SalesTargetItemDetail;
  public owners: number;
  public isItemLevel: boolean;
  public statsData: SalesAchievedStats;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();

  private subscriptions: Subscription[] = [];
  private targetService: TargetService;

  constructor(targetService: TargetService) {
    Object.assign(this, { targetService });
  }

  public ngOnInit(): void {
    this.isItemLevel = Boolean(this.salesTargetData.items_detail);
    this.owners = this.salesTargetData.TargetOwnerId;

    this.subscriptions.push(
      this.targetService.getAchievedSales().subscribe((result) => {
        this.statsData = result.data;
      })
    );
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }
}
