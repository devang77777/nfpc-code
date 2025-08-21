import { Component, OnInit, Input, ChangeDetectorRef,SimpleChanges } from '@angular/core';
import { FormGroup, FormControl,Validators } from '@angular/forms';
import { STATUS, INVOICE_STATUS } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
import { Subscription,Subject } from 'rxjs';
import { MasterService } from 'src/app/components/main/master/master.service';
@Component({
  selector: 'app-advance-search-form-invoice',
  templateUrl: './advance-search-form-invoice.component.html',
  styleUrls: ['./advance-search-form-invoice.component.scss']
})
export class AdvanceSearchFormInvoiceComponent implements OnInit {
   SalesmanFormControl = new FormControl([]);
  salesmanList: any[] = [];
  channelList: any[] = [];
  @Input() items: Array<any> = [];
  itemsFormControl = new FormControl([]);
   selectedItems = [];
   customers: any=[];
   public filterItem = [];
   settings = {};
   itemfilterValue = '';
   public filteredItems: any[] = [];
   public itemData: any[] = [];
    public ItemCodeFormControl: FormControl;
    uomList: any = [];
  form: FormGroup;
  statusList: Array<any> = INVOICE_STATUS;
  @Input() salesman: Array<any> = [];
  @Input() storageLocation: Array<any> = [];
  customersFormControl = new FormControl([]);

  branchplantsFormControl = new FormControl([]);
  private subscriptions: Subscription[] = [];
    customerID: any = [];
    CustomersFormControl = new FormControl([]);
  constructor(private detChange: ChangeDetectorRef,private apiService: ApiService,private ms: MasterService
  ) { }

  ngOnInit(): void {
     this.subscriptions.push(
      this.ms.itemDetailDDllistTable({ page: 1, page_size: 10 }).subscribe((result: any) => {
        this.itemData = result.data;
        this.filteredItems = result.data;
      })
    );
     this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
     this.apiService.getMasterDataLists().subscribe((result: any) => {
      
      this.salesmanList = result.data.salesmans;
      
      for (let salesman of this.salesmanList) {
        salesman['salesman_name'] = `${salesman.salesman_info.salesman_code} - ${salesman.firstname} ${salesman.lastname}`;
      }
    });
    this.ItemCodeFormControl = new FormControl([], [Validators.required]);
    this.form = new FormGroup({
      module: new FormControl('invoice'),
      // export: new FormControl('0'),
      startdate: new FormControl(),
      syncdate: new FormControl(),
      creationDate: new FormControl(),
      enddate: new FormControl(),
      invoice_no: new FormControl(),
      customer_id: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
      salesman: new FormControl(),
      // current_stage: new FormControl(),
      channel_name: new FormControl(),
      order_no: new FormControl(),
      storage_location_id: new FormControl(),
      item_id: new FormControl(),
      erp_status: new FormControl(),
    });
     this.ms.customerDetailDDlListTable({}).subscribe((result) => {
      this.customers = result.data;
      // this.filterCustomer = result.data.slice(0, 30);
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

  //   selectionchangedItems() {
  //   let items = this.itemsFormControl.value;
  //   this.form.patchValue({
  //     item_id: items[0].id
  //   });
    
  // }
//   selectionchangedItems() {
//   const item = this.itemsFormControl.value;

//   if (item && item.id) {
//     this.form.patchValue({
//       item_id: item.id
//     });
//   } else {
//     this.form.patchValue({
//       item_id: null
//     });
//   }
// }
  // onChange(event) {
  //   let uomLists = this.filteredItems.find(i => i.id === event.id);
  //   // this.uomList.push(uomLists.item_uom_lower_unit);
  //   this.getItemDetailByName(event.item_name).subscribe(res => {
  //     var _items = res.data || [];

  //     const selectedItem: any = _items.find((res: any) => res.id === event.id);
  //     this.setItemRelatedUOM(selectedItem);
  //   });
  // }

  // getItemDetailByName(name) {
  //   return this.ms
  //     .itemDetailListTable({ item_name: name.toLowerCase(), })

  // }
  // setItemRelatedUOM(selectedItem: any) {
  //   // const uomControl = formGroup.controls.item_uom_id;
  //   let lowerUnitUOM = [selectedItem.item_uom_lower_unit];
  //   let baseUnitUOM = [];
  //   let itemUOMArray = [];
  //   if (selectedItem.item_main_price.length > 0) {
  //     selectedItem.item_main_price.forEach(element => {
  //       baseUnitUOM.push(element.item_uom);
  //     });
  //     itemUOMArray = [...baseUnitUOM, ...lowerUnitUOM];
  //   } else {
  //     itemUOMArray = lowerUnitUOM;
  //   }
  //   this.uomList = itemUOMArray
  //   // formGroup.controls.item_uom_list.setValue(itemUOMArray);
  //   // if (isEdit) {

  //   //   uomControl.setValue(selectedItem?.uom_info?.id);
  //   // } else {

  //   //   uomControl.setValue(selectedItem?.lower_unit_uom_id);
  //   // }

  // }

  //  onItemSelect(item: any) {
  //   let items = this.itemsFormControl.value;
  //   this.form.patchValue({
  //     item_id: items[0].id
  //   });
  // }
  // OnItemDeSelect(item: any) {
  //   //console.log(item);
  //   //console.log(this.selectedItems);
  // }
  // onSelectAll(items: any) {

  // }
  // onDeSelectAll(items: any) {

  // }

  //  onSearch(evt: any) {
  //   let value = evt.target.value
  //   if (value !== '') {
  //     this.itemfilterValue = value.toLowerCase().trim() || "";
  //     this.items = this.filterItem.filter(x => x.item_code.toLowerCase().trim() === this.itemfilterValue || x.item_name.toLowerCase().trim() === this.itemfilterValue);
  //     this.items = this.items.map(i => {
  //       return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
  //     });
  //   } else {
  //     this.items = this.filterItem.map(i => {
  //       return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
  //     })
  //   }
  //   this.detChange.detectChanges();
  // }
  selectionchangedstorageLocation() {
    const storage = this.branchplantsFormControl.value;
    this.form.patchValue({
      storage_location_id: storage[0].id
    });
  }

   selectionchangedCustomer() {
    let user = this.CustomersFormControl.value;

  // Extract the ids from the selected items
  const itemIds = user.map((item: any) => item.id);

  // Patch the form with the array of item IDs
  this.form.patchValue({
    customer_id: itemIds
  });
    // this.form.patchValue({
    //   customerName: user[0].id
    //   // customerName: user[0].name
    // });
  }

  selectionchangedItems() {
    // let items = this.itemsFormControl.value;
    // this.form.patchValue({
    //   item_id: items[0].id
    // });
    let items = this.itemsFormControl.value;

  // Extract the ids from the selected items
  const itemIds = items.map((item: any) => item.id);

  // Patch the form with the array of item IDs
  this.form.patchValue({
    item_id: itemIds
  });
  }
   selectionchangedSalesman() {
    let user = this.SalesmanFormControl.value;

  // Extract the ids from the selected items
  const itemIds = user.map((item: any) => item.id);

  // Patch the form with the array of item IDs
  this.form.patchValue({
    salesman: itemIds
  });
    // this.form.patchValue({
    //   customerName: user[0].id
    //   // customerName: user[0].name
    // });
  }
}
