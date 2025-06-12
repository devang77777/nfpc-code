import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-promotion-form-order-item',
  templateUrl: './promotion-form-order-item.component.html',
  styleUrls: ['./promotion-form-order-item.component.scss'],
})
export class PromotionFormOrderItemComponent implements OnInit, OnChanges {
  @Input() public overviewFormGroup: FormGroup;
  @Input() public orderItems: any[];

  data: ItemData[] = [
    { item_id: '', item_qty: '', item_uom_id: '', price: '' },
  ];
  uoms: any[];
  items: any[];
  uomArray: any[] = [];
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  displayColumns = ['itemDesc', 'quantity', 'uom', 'price', 'action'];
  rows: FormArray = this.fb.array([]);
  orderItemFormGroup: FormGroup = this.fb.group({
    orderItemFormArray: this.rows,
  });

  constructor(private fb: FormBuilder, private apiService: ApiService) { }

  ngOnInit() {
    this.data.forEach((d: ItemData) => this.addRow(d, false));
    this.updateView();
    this.apiService.getAllItemUoms().subscribe((uoms) => {
      this.uoms = uoms.data;
    });
    // this.apiService.getAllItems().subscribe((items) => {
    //   this.items = items.data;
    // });
    // this.subscriptions.push(
    this.apiService.getMasterDataLists().subscribe((result: any) => {
      this.items = result.data.items;
    })
    // );
    this.overviewFormGroup.addControl('orderItems', this.rows);
  }
  ngOnChanges() {
    if (this.orderItems) {
      this.rows.removeAt(0);
      this.orderItems.forEach(orderItem => {
        let row = this.fb.group({
          item_id: [orderItem.item_id],
          item_uom_id: [orderItem.item_uom_id],
          item_qty: [orderItem.item_qty],
          price: [orderItem.price]
        });
        this.rows.push(row);
      })
      this.updateView();
    }
  }
  emptyTable() {
    while (this.rows.length !== 0) {
      this.rows.removeAt(0);
    }
  }

  addRow(d?: ItemData, noUpdate?: boolean) {
    const row = this.fb.group({
      item_id: [d && d.item_id ? d.item_id : null, []],
      item_qty: [d && d.item_qty ? d.item_qty : null, []],
      item_uom_id: [d && d.item_uom_id ? d.item_uom_id : null, []],
      price: [d && d.price ? d.price : null, []],
    });
    this.rows.push(row);
    if (!noUpdate) {
      this.updateView();
    }
    this.uomArray.push([]);
  }
  deleteItem(index) {
    this.rows.removeAt(index);
    this.updateView();
    this.uomArray.splice(index, 1);
  }
  onItemChange(event, i) {
    let filteredUOMs = [];
    if (event) {
      let secondaryUOMs = [];
      event?.item_main_price.forEach(uom => {
        secondaryUOMs.push(uom.item_uom);
      })
      filteredUOMs = [...filteredUOMs, ...secondaryUOMs]
      filteredUOMs.push(event?.item_uom_lower_unit)
    }
    this.uomArray[i] = filteredUOMs;
  }
  updateView() {
    this.dataSource.next(this.rows.controls);
  }
  isFirstRow(index) {
    if (index === 0) {
      return true;
    } else {
      return false;
    }
  }
}

export interface ItemData {
  item_id: any;
  item_qty: any;
  item_uom_id: any;
  price: any;
}
