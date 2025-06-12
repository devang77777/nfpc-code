import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
@Component({
  selector: 'app-market-promo-master',
  templateUrl: './market-promo-master.component.html',
  styleUrls: ['./market-promo-master.component.scss']
})
export class MarketPromoMasterComponent extends BaseComponent implements OnInit {
  public isDetailVisible: boolean;
  public newMarketPromoData = {};
  public marketPromo = {};
  checkedRows = [];
  constructor() {
    super('Market Promotion');
  }

  ngOnInit(): void {
  }

  public itemClicked(data: any): void {
    if (data) {
      // this.isDetailVisible = true;
      this.marketPromo = data;
    }
  }

  updateTableData(data) {
    //console.log(data);
    this.newMarketPromoData = data;
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

}
