import { Component, OnInit, Input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS, ORDER_STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-order',
  templateUrl: './advance-search-form-order.component.html',
  styleUrls: ['./advance-search-form-order.component.scss']
})
export class AdvanceSearchFormOrderComponent implements OnInit {
  statusList: Array<any> = STATUS;
  orderStatusList: Array<any> = ORDER_STATUS;

  @Input() storageLocation: Array<any> = [];
  @Input() items: Array<any> = [];
  @Input() orderCreatedUser: Array<any> = [];
  itemsFormControl = new FormControl([]);
  branchplantsFormControl = new FormControl([]);
  customersFormControl = new FormControl([]);
  domain = window.location.host;
  form: FormGroup;
  selectedItems = [];
  settings = {};
  itemfilterValue = '';
  public filterItem = [];

  constructor(
    private detChange: ChangeDetectorRef
  ) { 
    
  }

  ngOnInit(): void {
    this.settings = {
      classes: "myclass custom-class",
      enableSearchFilter: true,
      badgeShowLimit: 2,
      maxHeight: 141,
      autoPosition: false,
      position: 'bottom',
      searchBy: ['item_code', 'item_name'],
      singleSelection:true
    };
    this.form = new FormGroup({
      module: new FormControl('order'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      order_no: new FormControl(),
      customerName: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
      current_stage: new FormControl(),
      approval_status: new FormControl(),
      customer_lpo: new FormControl(),
      delivery_start_date: new FormControl(),
      delivery_end_date: new FormControl(),
      item_id: new FormControl(),
      user_created: new FormControl(),
      storage_location_id: new FormControl(),
    })
    
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.items?.currentValue != changes.items?.previousValue) {
      this.filterItem = [...this.items];
      this.items = this.items.map(i => {
        return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
      });
    }
  };
  
  selectionchangedItems() {
    let items = this.itemsFormControl.value;
    this.form.patchValue({
      item_id: items[0].id
    });
    
  }
  selectionchangedstorageLocation() {
    let storage = this.branchplantsFormControl.value;
    this.form.patchValue({
      storage_location_id: storage[0].id
    });
  }
  selectionchangedorderCreatedUser() {
    let user = this.customersFormControl.value;
    this.form.patchValue({
      user_created: user[0].id
    });
  }
  onItemSelect(item: any) {
    let items = this.itemsFormControl.value;
    this.form.patchValue({
      item_id: items[0].id
    });
  }
  OnItemDeSelect(item: any) {
    //console.log(item);
    //console.log(this.selectedItems);
  }
  onSelectAll(items: any) {

  }
  onDeSelectAll(items: any) {

  }
  onSearch(evt: any) {
    let value = evt.target.value
    if (value !== '') {
      this.itemfilterValue = value.toLowerCase().trim() || "";
      this.items = this.filterItem.filter(x => x.item_code.toLowerCase().trim() === this.itemfilterValue || x.item_name.toLowerCase().trim() === this.itemfilterValue);
      this.items = this.items.map(i => {
        return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
      });
    } else {
      this.items = this.filterItem.map(i => {
        return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
      })
    }
    this.detChange.detectChanges();
  }
}
