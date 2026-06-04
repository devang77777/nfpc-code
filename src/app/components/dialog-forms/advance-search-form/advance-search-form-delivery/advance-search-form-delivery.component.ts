  /**
   * Restore dropdowns from requestOriginal (Change Criteria) for delivery module
   */
 
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS, DELIVERY_STATUS, ORDER_STATUS } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
import { Subscription,Subject } from 'rxjs';
import { MasterService } from 'src/app/components/main/master/master.service';
import { SavedSearchValues } from '../services/advance-search-state.service';
import { SimpleChanges } from '@angular/core';
import {ORDER_STATUS_ADVANCE_SEARCH} from '../advance-search-form.component';
@Component({
  selector: 'app-advance-search-form-delivery',
  templateUrl: './advance-search-form-delivery.component.html',
  styleUrls: ['./advance-search-form-delivery.component.scss']
})
export class AdvanceSearchFormDeliveryComponent implements OnInit {
  channelList: any[] = [];
   SalesmanFormControl = new FormControl([]);
  salesmanList: any[] = [];
  statusList: Array<any> = ORDER_STATUS_ADVANCE_SEARCH;
  private subscriptions: Subscription[] = [];
  customerID: any = [];
   itemsFormControl = new FormControl([]);
   public filteredItems: any[] = [];
   public itemData: any[] = [];
  orderStatusList: Array<any> = ORDER_STATUS_ADVANCE_SEARCH;
  @Input() salesman: Array<any> = []
  form: FormGroup
  @Input() storageLocation: Array<any> = [];
  branchplantsFormControl = new FormControl([]);
   CustomersFormControl = new FormControl([]);
  private pendingSavedState: any = null; // Store pending saved state
  
  // Flags to track async data loading
  private _customerLoaded = false;
  private _itemLoaded = false;
  private _salesmanLoaded = false;
  private _storageLoaded = false;
  private _pendingRestore: any = null;
  
  constructor(
    private detChange: ChangeDetectorRef,
    private apiService: ApiService,
    private ms: MasterService
  ) { 
  }

  ngOnInit(): void {
     this.subscriptions.push(
      this.ms.itemDetailDDllistTable({ page: 1, page_size: 10 }).subscribe((result: any) => {
        this.itemData = result.data;
        this.filteredItems = result.data;
        this._itemLoaded = true;
        this._tryRestoreDropdowns();
      })
    );
     this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
     this.apiService.getMasterDataLists().subscribe((result: any) => {
      
      this.salesmanList = result.data.salesmans;
      this._salesmanLoaded = true;
      
      for (let salesman of this.salesmanList) {
        salesman['salesman_name'] = `${salesman.salesman_info.salesman_code} - ${salesman.firstname} ${salesman.lastname}`;
      }
      this._tryRestoreDropdowns();
    });
    this.form = new FormGroup({
      module: new FormControl('delivery'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      delivery_no: new FormControl(),
      customer_id: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
      salesman: new FormControl(),
      current_stage: new FormControl(),
      channel_name: new FormControl(),
      storage_location_id: new FormControl(),
      item_id: new FormControl(),
    })
    this.ms.customerDetailDDlListTable({}).subscribe((result) => {
      this.customerID = result.data;
      this._customerLoaded = true;
      // this.filterCustomer = result.data.slice(0, 30);
      
      // Try to restore saved state if it was pending
      if (this.pendingSavedState) {
        this.restoreFormValues(this.pendingSavedState);
        this.pendingSavedState = null;
      }
      this._tryRestoreDropdowns();
    })
  }

  // Try to restore dropdowns if all data is loaded and pending restore exists
  private _tryRestoreDropdowns() {
    if (this._customerLoaded && this._itemLoaded && this._salesmanLoaded && this._storageLoaded && this._pendingRestore) {
      this._restoreDropdownSelections(this._pendingRestore);
      this._pendingRestore = null;
    }
  }

  // New restore method, only for dropdowns
  private _restoreDropdownSelections(requestOriginal: any) {
    // Customers
    if (requestOriginal.customer_id && this.customerID) {
      const customerIds = Array.isArray(requestOriginal.customer_id)
        ? requestOriginal.customer_id.map(String)
        : [String(requestOriginal.customer_id)];
      const selectedCustomers = this.customerID
        .filter(customer => customerIds.includes(String(customer.id)))
        .map(customer => ({
          ...customer,
          itemName: (customer.customer_code ? customer.customer_code + ' - ' : '') + (customer.customer_name || customer.name || customer.firstname + ' ' + customer.lastname || '')
        }));
      this.CustomersFormControl.setValue(selectedCustomers);
      this.CustomersFormControl.updateValueAndValidity();
      this.selectionchangedCustomer();
    }
    // Items
    if (requestOriginal.item_id && this.itemData) {
      const itemIds = Array.isArray(requestOriginal.item_id)
        ? requestOriginal.item_id.map(String)
        : [String(requestOriginal.item_id)];
      const selectedItems = this.itemData
        .filter(item => itemIds.includes(String(item.id)))
        .map(item => ({
          ...item,
          itemName: (item.item_code ? item.item_code + ' - ' : '') + (item.item_name || '')
        }));
      this.itemsFormControl.setValue(selectedItems);
      this.itemsFormControl.updateValueAndValidity();
      this.selectionchangedItems();
    }
    // Storage/branchplant
    if (requestOriginal.storage_location_id && this.storageLocation) {
      const storageIds = Array.isArray(requestOriginal.storage_location_id)
        ? requestOriginal.storage_location_id.map(String)
        : [String(requestOriginal.storage_location_id)];
      const selectedStorage = this.storageLocation
        .filter(storage => storageIds.includes(String(storage.id)))
        .map(storage => ({
          ...storage,
          itemName: (storage.storage_location_code ? storage.storage_location_code + ' - ' : '') + (storage.storage_location_name || storage.name || '')
        }));
      this.branchplantsFormControl.setValue(selectedStorage);
      this.branchplantsFormControl.updateValueAndValidity();
      this.selectionchangedstorageLocation();
    }
    // Salesman
    if (requestOriginal.salesman && this.salesmanList) {
      const salesmanIds = Array.isArray(requestOriginal.salesman)
        ? requestOriginal.salesman.map(String)
        : [String(requestOriginal.salesman)];
      const selectedSalesmen = this.salesmanList
        .filter(salesman => salesmanIds.includes(String(salesman.id)))
        .map(salesman => ({
          ...salesman,
          itemName: (salesman.salesman_info?.salesman_code ? salesman.salesman_info.salesman_code + ' - ' : '') + (salesman.firstname || '') + ' ' + (salesman.lastname || '')
        }));
      this.SalesmanFormControl.setValue(selectedSalesmen);
      this.SalesmanFormControl.updateValueAndValidity();
      this.selectionchangedSalesman();
    }
    this.detChange.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Check if storage location or other input properties have changed and we have pending saved state
    if (this.pendingSavedState) {
      if ((changes.storageLocation && changes.storageLocation.currentValue?.length > 0) ||
          (changes.salesman && changes.salesman.currentValue?.length > 0)) {
        this.restoreFormValues(this.pendingSavedState);
        this.pendingSavedState = null;
      }
    }
    
    if (changes.storageLocation && changes.storageLocation.currentValue?.length > 0) {
      this._storageLoaded = true;
    }
    if (changes.salesman && changes.salesman.currentValue?.length > 0) {
      this._salesmanLoaded = true;
    }
    this._tryRestoreDropdowns();
  }

  /**
   * Restore form values from saved state
   * @param savedState - The saved search state containing form and control values
   */
  restoreFormValues(savedState: SavedSearchValues) {
    // If data is not loaded yet, store the state for later restoration
    if (!this.customerID || this.customerID.length === 0) {
      this.pendingSavedState = savedState;
      return;
    }

    if (savedState.formValues) {
      // Restore basic form values
      this.form.patchValue(savedState.formValues);
    }

    if (savedState.controlValues) {
      // Restore multi-select control values
      if (savedState.controlValues.items && this.itemData.length > 0) {
        const savedItems = this.itemData
          .filter(item => savedState.controlValues.items.includes(item.id))
          .map(item => ({
            ...item,
            itemName: (item.item_code ? item.item_code + ' - ' : '') + (item.item_name || '')
          }));
        this.itemsFormControl.setValue(savedItems);
        this.itemsFormControl.markAsDirty();
        this.itemsFormControl.updateValueAndValidity();
        this.selectionchangedItems();
      }

      if (savedState.controlValues.customers && this.customerID && this.customerID.length > 0) {
        const savedCustomers = this.customerID
          .filter(customer => savedState.controlValues.customers.includes(customer.id))
          .map(customer => ({
            ...customer,
            itemName: (customer.customer_code ? customer.customer_code + ' - ' : '') + (customer.customer_name || customer.name || customer.firstname + ' ' + customer.lastname || '')
          }));
        this.CustomersFormControl.setValue(savedCustomers);
        this.CustomersFormControl.markAsDirty();
        this.CustomersFormControl.updateValueAndValidity();
        this.selectionchangedCustomer();
      }

      if (savedState.controlValues.storage && this.storageLocation && this.storageLocation.length > 0) {
        const savedStorage = this.storageLocation
          .filter(storage => savedState.controlValues.storage.includes(storage.id))
          .map(storage => ({
            ...storage,
            itemName: (storage.storage_location_code ? storage.storage_location_code + ' - ' : '') + (storage.storage_location_name || storage.name || '')
          }));
        this.branchplantsFormControl.setValue(savedStorage);
        this.branchplantsFormControl.markAsDirty();
        this.branchplantsFormControl.updateValueAndValidity();
        this.selectionchangedstorageLocation();
      }

      if (savedState.controlValues.salesman && this.salesmanList && this.salesmanList.length > 0) {
        const savedSalesmen = this.salesmanList
          .filter(salesman => savedState.controlValues.salesman.includes(salesman.id))
          .map(salesman => ({
            ...salesman,
            itemName: (salesman.salesman_info?.salesman_code ? salesman.salesman_info.salesman_code + ' - ' : '') + (salesman.firstname || '') + ' ' + (salesman.lastname || '')
          }));
        this.SalesmanFormControl.setValue(savedSalesmen);
        this.SalesmanFormControl.markAsDirty();
        this.SalesmanFormControl.updateValueAndValidity();
        this.selectionchangedSalesman();
      }
    }

    this.detChange.detectChanges();
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
  selectionchangedstorageLocation() {
    let storage = this.branchplantsFormControl.value;
    this.form.patchValue({
      storage_location_id: storage.map(i=>i.id)
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
  //  selectionchangedSalesman() {
  //   let user = this.SalesmanFormControl.value;

  // // Extract the ids from the selected items
  // const itemIds = user.map((item: any) => item.id);

  // // Patch the form with the array of item IDs
  // this.form.patchValue({
  //   salesman: itemIds
  // });
  //   // this.form.patchValue({
  //   //   customerName: user[0].id
  //   //   // customerName: user[0].name
  //   // });
  // }
  selectionchangedSalesman() {
    let user = this.SalesmanFormControl.value;

  // Extract the ids from the selected items
  const itemIds = user.map((item: any) => item.id);

  // Patch the form with the array of item IDs
  this.form.patchValue({
    salesman: itemIds
  });
}

 restoreFromRequestOriginal(requestOriginal: any) {
    if (!requestOriginal) return;
    // Remove fields that shouldn't be in the form
    const formValues = { ...requestOriginal };
    delete formValues.page;
    delete formValues.page_size;
    delete formValues.export;
    delete formValues.allData;
    
    // Patch all simple fields directly
    this.form.patchValue(formValues);

    // Restore dropdowns with mapped objects for correct display
    this._restoreDropdownSelections(requestOriginal);
    
    this.detChange.detectChanges();
    // Save for later restore if data not loaded (for async cases)
    this._pendingRestore = requestOriginal;
    this._tryRestoreDropdowns();
  }
}
