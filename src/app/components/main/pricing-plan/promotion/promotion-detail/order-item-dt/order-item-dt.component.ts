import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-order-item-dt',
  templateUrl: './order-item-dt.component.html',
  styleUrls: ['./order-item-dt.component.scss'],
})
export class OrderItemDtComponent implements OnInit, OnChanges {
  @Input() orderItems: any[];

  displayColumns: string[] = ['itemName', 'quantity', 'uom', 'price'];
  dataSource = new MatTableDataSource();
  constructor() {}

  ngOnInit(): void {}
  ngOnChanges(): void {
    let structuredOrderItems = [];
    this.orderItems.forEach((item) => {
      let data = {
        itemName: item.item.item_name,
        quantity: item.item_qty,
        uom: item.item_uom.name,
        price: item.price,
      };
      structuredOrderItems.push(data);
    });
    this.dataSource = new MatTableDataSource(structuredOrderItems);
  }
}
