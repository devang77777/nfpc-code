import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

const OFFER_ITEMS: any[] = [
  { itemName: 'item1', uom: 'PCS', offeredQty: '1' },
  { itemName: 'item2', uom: 'BOX', offeredQty: '7' },
];
@Component({
  selector: 'app-offer-item-dt',
  templateUrl: './offer-item-dt.component.html',
  styleUrls: ['./offer-item-dt.component.scss'],
})
export class OfferItemDtComponent implements OnInit, OnChanges {
  @Input() offerItems: any[];
  displayColumns: string[] = ['itemName', 'uom', 'offeredQty'];
  dataSource = new MatTableDataSource();
  constructor() {}

  ngOnInit(): void {}
  ngOnChanges(): void {
    let structuredOfferItems = [];
    this.offerItems.forEach((item) => {
      let data: any = new OfferItem();
      data.itemName = item.item.item_name;
      data.uom = item.item_uom.name;
      data.offeredQty = item.offered_qty;
      structuredOfferItems.push(data);
    });
    this.dataSource = new MatTableDataSource(structuredOfferItems);
  }
}
class OfferItem {
  itemName: any;
  uom: any;
  offeredQty: any;
}
