import { Component, OnInit, Input, ChangeDetectorRef,SimpleChanges } from '@angular/core';
import { FormGroup, FormControl,Validators } from '@angular/forms';
import { STATUS, INVOICE_STATUS } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
import { Subscription,Subject } from 'rxjs';
import { MasterService } from 'src/app/components/main/master/master.service';
import { SavedSearchValues } from '../services/advance-search-state.service';
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
  private pendingSavedState: any = null; // Store pending saved state
  
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
  this.ItemCodeFormControl = new FormControl([]);
    this.form = new FormGroup({
     module: new FormControl('invoice'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      invoice_no: new FormControl(),
      customer_id: new FormControl(),
      salesman: new FormControl(),
      channel_name: new FormControl(),
      order_no: new FormControl(),
      customer_lpo_no: new FormControl(),
      storage_location_id: new FormControl(),
      item_id: new FormControl(),
      erp_status: new FormControl(),
      syncdate: new FormControl(),
      creationDate: new FormControl(),
    });
     this.ms.customerDetailDDlListTable({}).subscribe((result) => {
      this.customers = result.data;
      // this.filterCustomer = result.data.slice(0, 30);
      
      // Try to restore saved state if it was pending
      if (this.pendingSavedState) {
        this.restoreFormValues(this.pendingSavedState);
        this.pendingSavedState = null;
      }
    })
   
  }

  /**
   * Restore form values from saved state
   * @param savedState - The saved search state containing form and control values
   */
  restoreFormValues(savedState: SavedSearchValues) {
    // If data is not loaded yet, store the state for later restoration
    if (!this.customers || this.customers.length === 0) {
      this.pendingSavedState = savedState;
      return;
    }

    if (savedState.formValues) {
      // Restore basic form values
      this.form.patchValue(savedState.formValues);
    }

    if (savedState.controlValues) {
      // Restore multi-select control values with mapped objects for correct display
      if (savedState.controlValues.items && this.itemData.length > 0) {
        const savedItems = this.itemData
          .filter(item => savedState.controlValues.items.includes(item.id))
          .map(item => ({
            ...item,
            itemName: (item.item_code ? item.item_code + ' - ' : '') + (item.item_name || '')
          }));
        this.itemsFormControl.setValue(savedItems);
      }

      if (savedState.controlValues.customers && this.customers && this.customers.length > 0) {
        const savedCustomers = this.customers
          .filter(customer => savedState.controlValues.customers.includes(customer.id))
          .map(customer => ({
            ...customer,
            itemName: (customer.customer_code ? customer.customer_code + ' - ' : '') + (customer.customer_name || customer.name || '')
          }));
        this.CustomersFormControl.setValue(savedCustomers);
      }

      if (savedState.controlValues.storage && this.storageLocation && this.storageLocation.length > 0) {
        // Debug logs to help diagnose selection issues
        console.log('storageLocation:', this.storageLocation);
        console.log('savedState.controlValues.storage:', savedState.controlValues.storage);
        // Ensure type match for IDs
        const savedStorage = this.storageLocation
          .filter(storage => savedState.controlValues.storage.map(String).includes(String(storage.id)))
          .map(storage => ({
            ...storage,
            itemName: (storage.storage_location_code ? storage.storage_location_code + ' - ' : '') + (storage.storage_location_name || storage.name || '')
          }));
        console.log('savedStorage to set:', savedStorage);
        this.branchplantsFormControl.setValue(savedStorage);
        this.selectionchangedstorageLocation();
      }

      if (savedState.controlValues.salesman && this.salesmanList && this.salesmanList.length > 0) {
        const savedSalesmen = this.salesmanList
          .filter(salesman => savedState.controlValues.salesman.includes(salesman.id))
          .map(salesman => ({
            ...salesman,
            salesman_name: (salesman.salesman_info?.salesman_code ? salesman.salesman_info.salesman_code + ' - ' : '') + (salesman.firstname || '') + ' ' + (salesman.lastname || '')
          }));
        this.SalesmanFormControl.setValue(savedSalesmen);
      }
    }
  }

  /**
   * Get current control values for saving state
   * @returns Object containing current control values
   */
  getControlValues() {
    return {
      items: this.itemsFormControl.value?.map((item: any) => item.id) || [],
      customers: this.CustomersFormControl.value?.map((customer: any) => customer.id) || [],
      storage: this.branchplantsFormControl.value?.map((storage: any) => storage.id) || [],
      salesman: this.SalesmanFormControl.value?.map((salesman: any) => salesman.id) || []
    };
  }

    ngOnChanges(changes: SimpleChanges) {
      if (changes.items?.currentValue != changes.items?.previousValue) {
        this.filterItem = [...this.items];
        this.items = this.items.map(i => {
          return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
        });
      }

      // Check if storage location or other input properties have changed and we have pending saved state
      if (this.pendingSavedState) {
        if ((changes.storageLocation && changes.storageLocation.currentValue?.length > 0) ||
            (changes.salesman && changes.salesman.currentValue?.length > 0)) {
          this.restoreFormValues(this.pendingSavedState);
          this.pendingSavedState = null;
        }
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
    let storageIds = storage.map((item: any) => item.id);
    this.form.patchValue({
      storage_location_id: storageIds
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
    let items = this.SalesmanFormControl.value;

  // Extract the ids from the selected items
  const itemIds = items.map((item: any) => item.id);
  // Extract the ids from the selected items
  // const itemIds = user.map((item: any) => item.id);

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
