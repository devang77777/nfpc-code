  /**
   * Restore dropdowns from requestOriginal (Change Criteria) for delivery module
   */
 
import { Component, OnInit, Input } from '@angular/core';
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
  
  constructor(
    private apiService: ApiService,
    private ms: MasterService
  ) { 
  }

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
      // this.filterCustomer = result.data.slice(0, 30);
      
      // Try to restore saved state if it was pending
      if (this.pendingSavedState) {
        this.restoreFormValues(this.pendingSavedState);
        this.pendingSavedState = null;
      }
    })
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
        const savedItems = this.itemData.filter(item => 
          savedState.controlValues.items.includes(item.id)
        );
        this.itemsFormControl.setValue(savedItems);
      }

      if (savedState.controlValues.customers && this.customerID && this.customerID.length > 0) {
        const savedCustomers = this.customerID.filter(customer => 
          savedState.controlValues.customers.includes(customer.id)
        );
        this.CustomersFormControl.setValue(savedCustomers);
      }

      if (savedState.controlValues.storage && this.storageLocation && this.storageLocation.length > 0) {
        const savedStorage = this.storageLocation.filter(storage => 
          savedState.controlValues.storage.includes(storage.id)
        );
        this.branchplantsFormControl.setValue(savedStorage);
        // Patch the form value and trigger UI update
        this.selectionchangedstorageLocation();
      }

      if (savedState.controlValues.salesman && this.salesmanList && this.salesmanList.length > 0) {
        const savedSalesmen = this.salesmanList.filter(salesman => 
          savedState.controlValues.salesman.includes(salesman.id)
        );
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
    // Patch all simple fields directly
    const patchFields = [
      'channel_name',
      'delivery_no',
      'startdate',
      'enddate',
      'startrange',
      'endrange',
      'status',
      'current_stage'
    ];
    const patchObj: any = {};
    patchFields.forEach(field => {
      if (requestOriginal[field] !== undefined) {
        patchObj[field] = requestOriginal[field];
      }
    });
    this.form.patchValue(patchObj);

    // Restore customer dropdown (use mapped options with itemName)
    if (requestOriginal.customer_id && this.customerID) {
      const customerIds = Array.isArray(requestOriginal.customer_id)
        ? requestOriginal.customer_id.map(String)
        : [String(requestOriginal.customer_id)];
      const mappedCustomers = this.customerID.map(x => ({
        id: x.id,
        itemName: x.customer_code ? (x.customer_code + ' - ' + x.name) : (x.name || x.firstname + ' ' + x.lastname)
      }));
      const selectedCustomers = mappedCustomers.filter(customer =>
        customerIds.includes(String(customer.id))
      );
      this.CustomersFormControl.setValue(selectedCustomers);
      this.CustomersFormControl.markAsDirty();
      this.CustomersFormControl.updateValueAndValidity();
      this.selectionchangedCustomer();
    }
    // Restore items dropdown (use mapped options with itemName)
    if (requestOriginal.item_id && this.itemData && this.itemData.length > 0) {
      const itemIds = Array.isArray(requestOriginal.item_id)
        ? requestOriginal.item_id.map(String)
        : [String(requestOriginal.item_id)];
      const mappedItems = this.itemData.map(x => ({
        id: x.id,
        itemName: x.item_code + ' - ' + x.item_name
      }));
      const selectedItems = mappedItems.filter(item =>
        itemIds.includes(String(item.id))
      );
      this.itemsFormControl.setValue(selectedItems);
      this.itemsFormControl.markAsDirty();
      this.itemsFormControl.updateValueAndValidity();
      this.selectionchangedItems();
    }
    // Restore storage/branchplant dropdown (use mapped options with itemName)
    if (requestOriginal.storage_location_id && this.storageLocation) {
      const storageIds = Array.isArray(requestOriginal.storage_location_id)
        ? requestOriginal.storage_location_id.map(String)
        : [String(requestOriginal.storage_location_id)];
      const mappedStorage = this.storageLocation.map(x => ({
        id: x.id,
        itemName: x.code + ' - ' + x.name
      }));
      const selectedStorage = mappedStorage.filter(storage =>
        storageIds.includes(String(storage.id))
      );
      this.branchplantsFormControl.setValue(selectedStorage);
      this.branchplantsFormControl.markAsDirty();
      this.branchplantsFormControl.updateValueAndValidity();
      this.selectionchangedstorageLocation();
    }
    // Restore salesman dropdown (use mapped options with itemName)
    if (requestOriginal.salesman && this.salesmanList && this.salesmanList.length > 0) {
      const salesmanIds = Array.isArray(requestOriginal.salesman)
        ? requestOriginal.salesman.map(String)
        : [String(requestOriginal.salesman)];
      const mappedSalesmen = this.salesmanList.map(x => ({
        id: x.id,
        itemName: (x.salesman_info?.salesman_code ? (x.salesman_info.salesman_code + ' - ') : '') + x.firstname + ' ' + x.lastname
      }));
      const selectedSalesmen = mappedSalesmen.filter(salesman =>
        salesmanIds.includes(String(salesman.id))
      );
      this.SalesmanFormControl.setValue(selectedSalesmen);
      this.SalesmanFormControl.markAsDirty();
      this.SalesmanFormControl.updateValueAndValidity();
      this.selectionchangedSalesman();
    }
  }
}
