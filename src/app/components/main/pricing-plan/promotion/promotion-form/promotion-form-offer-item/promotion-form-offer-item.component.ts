import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  OnChanges,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';


import { startWith, map } from 'rxjs/operators';
import { getLocaleNumberSymbol } from '@angular/common';

@Component({
  selector: 'app-promotion-form-offer-item',
  templateUrl: './promotion-form-offer-item.component.html',
  styleUrls: ['./promotion-form-offer-item.component.scss'],
})
export class PromotionFormOfferItemComponent implements OnInit, OnChanges {
  @Input() public overviewFormGroup: FormGroup;
  @Input() public offerItems: any[];

  data: OfferData[] = [{ item_id: '', item_uom_id: '', offered_qty: '' }];
  uoms: any;

  uomArray: any[] = [];
  control = new FormControl();
  items: any[];
  // items: any[] = [
  //   { item_name: 'a item1', id: 1 },
  //   { item_name: 'b item2', id: 2 },
  //   { item_name: 'c item3', id: 3 },
  //   { item_name: 'd item4', id: 4 },
  // ];
  selectedItem;
  filteredItemNames: Observable<any>[] = [];

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  displayColumns = ['itemName', 'uom', 'offeredQty', 'action'];
  rows: FormArray = this.fb.array([]);
  offerItemFormGroup: FormGroup = this.fb.group({
    offerItemFormArray: this.rows,
  });

  constructor(private fb: FormBuilder, private apiService: ApiService) { }

  ngOnInit() {
    this.data.forEach((d: OfferData) => this.addRow(d, false));
    this.updateView();
    this.apiService.getAllItemUoms().subscribe((uoms) => {
      this.uoms = uoms.data;
    });

    this.overviewFormGroup.addControl('offerItems', this.rows);
    // this.apiService.getAllItems().subscribe((items) => {
    //   this.items = items.data;
    // });
    // this.subscriptions.push(
    this.apiService.getMasterDataLists().subscribe((result: any) => {
      this.items = result.data.items;
    })
    // );

  }
  ngOnChanges() {
    if (this.offerItems) {
      this.uomArray = []
      this.rows.removeAt(0);
      this.offerItems.forEach(offerItem => {
        let row = this.fb.group({
          item_id: [offerItem.item_id],
          item_uom_id: [offerItem.item_uom_id],
          offered_qty: [offerItem.offered_qty],
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

  addRow(d?: OfferData, noUpdate?: boolean) {
    const row = this.fb.group({
      // itemCode: [''],
      item_id: [''],
      item_uom_id: [''],
      offered_qty: [''],
    });
    this.rows.push(row);
    if (!noUpdate) {
      this.updateView();
    }
    this.uomArray.push([]);
    // this.manageNameControl(this.rows.length - 1);
  }
  deleteItem(index) {
    this.rows.removeAt(index);
    this.updateView();
    this.filteredItemNames.slice(index, 1);
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

export interface OfferData {
  // itemCode: any;
  item_id: any;
  item_uom_id: any;
  offered_qty: any;
}
export interface Item {
  item_name: string;
  id: string;
}
