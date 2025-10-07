import { Component, OnInit, Input, ChangeDetectorRef, SimpleChanges, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS, ORDER_STATUS } from 'src/app/app.constant';
import { Subscription,Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { MasterService } from 'src/app/components/main/master/master.service';
import { SavedSearchValues } from '../services/advance-search-state.service';
import {ORDER_STATUS_ADVANCE_SEARCH} from '../advance-search-form.component';
@Component({
  selector: 'app-advance-search-form-order',
  templateUrl: './advance-search-form-order.component.html',
  styleUrls: ['./advance-search-form-order.component.scss']
})
export class AdvanceSearchFormOrderComponent implements OnInit, OnDestroy {
  channelList: any[] = [];
  public itemData: any[] = [];
  public filteredItems: any[] = [];
  statusList: Array<any> = STATUS;
  orderStatusList: Array<any> = ORDER_STATUS_ADVANCE_SEARCH;
  public customerID: any;
  @Input() storageLocation: Array<any> = [];
  @Input() items: Array<any> = [];
  @Input() orderCreatedUser: Array<any> = [];
  itemsFormControl = new FormControl([]);
  branchplantsFormControl = new FormControl([]);
  customersFormControl = new FormControl([]);
  CustomersFormControl = new FormControl([]);
  // public customerFormControl: FormControl;
  keyUp = new Subject<string>();
  domain = window.location.host;
  form: FormGroup;
  selectedItems = [];
  settings = {};
  itemfilterValue = '';
  public filterItem = [];
  private subscriptions: Subscription[] = [];
  private pendingSavedState: any = null; // Store pending saved state
  
  // Flags to track async data loading
  private _customerLoaded = false;
  private _itemLoaded = false;
  private _orderUserLoaded = false;
  private _storageLoaded = false;
  private _pendingRestore: any = null;

  constructor(
    private detChange: ChangeDetectorRef,
    private apiService: ApiService,
    private ms: MasterService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.ms.itemDetailDDllistTable({ page: 1, page_size: 10 }).subscribe((result: any) => {
        this.itemData = result.data;
        this.filteredItems = result.data;
        this._itemLoaded = true;
        this._tryRestoreDropdowns();
      }, (error) => {
        console.error('Error loading item data:', error);
      })
    );
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
      console.log('Channel data loaded:', this.channelList?.length, 'channels');
    }, (error) => {
      console.error('Error loading channel data:', error);
    });
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
      customer_id: new FormControl(),
      status: new FormControl(),
      channel_name: new FormControl(),
      customer_lpo: new FormControl(),
      delivery_start_date: new FormControl(),
      delivery_end_date: new FormControl(),
      item_id: new FormControl(),
      user_created: new FormControl(),
      storage_location_id: new FormControl(),
    });
    this.ms.customerDetailDDlListTable({}).subscribe((result) => {
      this.customerID = result.data;
      this._customerLoaded = true;
      this._tryRestoreDropdowns();
    }, (error) => {
      console.error('Error loading customer data:', error);
    });
    // If orderCreatedUser or storageLocation are loaded via @Input, handle in ngOnChanges
    setTimeout(() => {
      this._tryRestoreDropdowns();
    }, 3000);
  }
  // Try to restore dropdowns if all data is loaded and pending restore exists
  private _tryRestoreDropdowns() {
    if (this._customerLoaded && this._itemLoaded && this._orderUserLoaded && this._storageLoaded && this._pendingRestore) {
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
          itemName: (customer.customer_info.customer_code ? customer.customer_info.customer_code + ' - ' : '') + (customer.firstname || customer.firstname || '')
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
    // User created
    if (requestOriginal.user_created && this.orderCreatedUser) {
      const userIds = Array.isArray(requestOriginal.user_created)
        ? requestOriginal.user_created.map(String)
        : [String(requestOriginal.user_created)];
      const selectedUsers = this.orderCreatedUser
        .filter(user => userIds.includes(String(user.id)))
        .map(user => ({
          ...user,
          itemName: (user.user_code ? user.user_code + ' - ' : '') + (user.name || user.username || '')
        }));
      this.customersFormControl.setValue(selectedUsers);
      this.customersFormControl.updateValueAndValidity();
      this.selectionchangedorderCreatedUser();
    }
    this.detChange.detectChanges();
  }

  /**
   * Restore form values from saved state
   * @param savedState - The saved search state containing form and control values
   */
  restoreFormValues(savedState: SavedSearchValues) {
    if (!savedState) return;
    
    console.log('restoreFormValues called with:', savedState);
    
    // Clear any pending state since we're processing it now
    this.pendingSavedState = null;
    
    // Restore basic form values first
    if (savedState.formValues) {
      this.form.patchValue(savedState.formValues);
      console.log('Form values restored:', savedState.formValues);
    }

    // Ensure all data is available before restoring controls
    this.ensureDataAndRestore(savedState);
  }

  /**
   * Restore form values from requestOriginal data (used when "Change Criteria" is clicked)
   * @param requestOriginal - The original request data from the search
   */
  restoreFromRequestOriginal(requestOriginal: any) {
    if (!requestOriginal) return;
    // Remove fields that shouldn't be in the form
    const formValues = { ...requestOriginal };
    delete formValues.page;
    delete formValues.page_size;
    delete formValues.export;
    delete formValues.allData;
    this.form.patchValue(formValues);

    // Restore dropdowns with mapped objects for correct display
    // Customers
    if (requestOriginal.customer_id && this.customerID) {
      const customerIds = Array.isArray(requestOriginal.customer_id)
        ? requestOriginal.customer_id.map(String)
        : [String(requestOriginal.customer_id)];
      const selectedCustomers = this.customerID
        .filter(customer => customerIds.includes(String(customer.id)))
        .map(customer => ({
          ...customer,
          itemName: (customer.customer_code ? customer.customer_code + ' - ' : '') + (customer.customer_name || customer.name || '')
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
    // User created
    if (requestOriginal.user_created && this.orderCreatedUser) {
      const userIds = Array.isArray(requestOriginal.user_created)
        ? requestOriginal.user_created.map(String)
        : [String(requestOriginal.user_created)];
      const selectedUsers = this.orderCreatedUser
        .filter(user => userIds.includes(String(user.id)))
        .map(user => ({
          ...user,
          itemName: (user.user_code ? user.user_code + ' - ' : '') + (user.name || user.username || '')
        }));
      this.customersFormControl.setValue(selectedUsers);
      this.customersFormControl.updateValueAndValidity();
      this.selectionchangedorderCreatedUser();
    }
    this.detChange.detectChanges();
    // Save for later restore if data not loaded (for async cases)
    this._pendingRestore = requestOriginal;
    this._tryRestoreDropdowns();
  }

  /**
   * Restore dropdown selections from requestOriginal data
   */
  private restoreDropdownSelections(requestOriginal: any) {
    // Only proceed if we have the required data loaded
    if (!this.customerID || !this.itemData) {
      console.log('Data not ready for dropdown restoration, skipping...');
      return;
    }

    console.log('Attempting dropdown restoration with available data');

    // Restore customers
    if (requestOriginal.customer_id) {
      const customerIds = Array.isArray(requestOriginal.customer_id)
        ? requestOriginal.customer_id.map(String)
        : [String(requestOriginal.customer_id)];

      const selectedCustomers = this.customerID.filter(customer =>
        customerIds.includes(String(customer.id))
      );

      if (selectedCustomers.length > 0) {
        console.log('Restoring customers from requestOriginal:', selectedCustomers.length, 'of', customerIds.length);
        this.CustomersFormControl.setValue(selectedCustomers);
        this.CustomersFormControl.markAsDirty();
        this.CustomersFormControl.updateValueAndValidity();
        this.selectionchangedCustomer();
      }
    }

    // Restore items
    if (requestOriginal.item_id) {
      const itemIds = Array.isArray(requestOriginal.item_id)
        ? requestOriginal.item_id.map(String)
        : [String(requestOriginal.item_id)];

      const selectedItems = this.itemData.filter(item =>
        itemIds.includes(String(item.id))
      );

      if (selectedItems.length > 0) {
        console.log('Restoring items from requestOriginal:', selectedItems.length, 'of', itemIds.length);
        this.itemsFormControl.setValue(selectedItems);
        this.itemsFormControl.markAsDirty();
        this.itemsFormControl.updateValueAndValidity();
        this.selectionchangedItems();
      }
    }

    // Restore storage locations
    if (requestOriginal.storage_location_id && this.storageLocation?.length > 0) {
      const storageIds = Array.isArray(requestOriginal.storage_location_id)
        ? requestOriginal.storage_location_id.map(String)
        : [String(requestOriginal.storage_location_id)];

      const selectedStorage = this.storageLocation.filter(storage =>
        storageIds.includes(String(storage.id))
      );

      if (selectedStorage.length > 0) {
        console.log('Restoring storage from requestOriginal:', selectedStorage.length, 'of', storageIds.length);
        this.branchplantsFormControl.setValue(selectedStorage);
        this.branchplantsFormControl.markAsDirty();
        this.branchplantsFormControl.updateValueAndValidity();
        this.selectionchangedstorageLocation();
      }
    }

    // Restore order created users
    if (requestOriginal.user_created && this.orderCreatedUser?.length > 0) {
      const userIds = Array.isArray(requestOriginal.user_created)
        ? requestOriginal.user_created.map(String)
        : [String(requestOriginal.user_created)];

      const selectedUsers = this.orderCreatedUser.filter(user =>
        userIds.includes(String(user.id))
      );

      if (selectedUsers.length > 0) {
        console.log('Restoring users from requestOriginal:', selectedUsers.length, 'of', userIds.length);
        this.customersFormControl.setValue(selectedUsers);
        this.customersFormControl.markAsDirty();
        this.customersFormControl.updateValueAndValidity();
        this.selectionchangedorderCreatedUser();
      }
    }

    // Force change detection
    this.detChange.detectChanges();
  }

  /**
   * Ensure all required data is loaded and then restore control values
   */
  private ensureDataAndRestore(savedState: SavedSearchValues) {
    // Check if all required data is available
    const isCustomerDataReady = this.customerID && this.customerID.length > 0;
    const isStorageDataReady = this.storageLocation && this.storageLocation.length > 0;
    const isOrderUserDataReady = this.orderCreatedUser && this.orderCreatedUser.length > 0;
    const isItemDataReady = this.itemData && this.itemData.length > 0;

    console.log('Data readiness check:', {
      customers: isCustomerDataReady,
      storage: isStorageDataReady,
      orderUsers: isOrderUserDataReady,
      items: isItemDataReady,
      savedState: !!savedState
    });

    // If customer data is not ready, wait and try again (most critical)
    if (!isCustomerDataReady) {
      console.log('Customer data not ready, storing as pending state');
      this.pendingSavedState = savedState;
      return;
    }

    // Restore immediately and with progressive delays for reliability
    this.performRestore(savedState);
    setTimeout(() => this.performRestore(savedState), 100);
    setTimeout(() => this.performRestore(savedState), 500);
    setTimeout(() => this.performRestore(savedState), 1000);
    setTimeout(() => this.performRestore(savedState), 2000);
  }

  /**
   * Perform the actual restoration of control values
   */
  private performRestore(savedState: SavedSearchValues) {
    if (!savedState.controlValues) {
      console.log('No control values to restore');
      return;
    }

    console.log('Performing restore with control values:', savedState.controlValues);

    // Restore customers - with debugging and multiple approaches
    if (savedState.controlValues.customers && savedState.controlValues.customers.length > 0 && this.customerID && this.customerID.length > 0) {
      const savedCustomers = this.customerID.filter(customer => 
        savedState.controlValues.customers.includes(customer.id)
      );
      if (savedCustomers.length > 0) {
        console.log('=== CUSTOMER RESTORATION DEBUG ===');
        console.log('Saved customer IDs:', savedState.controlValues.customers);
        console.log('Available customers:', this.customerID.length, 'customers');
        console.log('Filtered saved customers:', savedCustomers);
        console.log('Current CustomersFormControl value:', this.CustomersFormControl.value);
        
        // Use the most reliable restoration method
        this.restoreCustomersWithMultipleAttempts(savedCustomers);
      }
    }

    // Restore storage/branch plants
    if (savedState.controlValues.storage && savedState.controlValues.storage.length > 0 && this.storageLocation && this.storageLocation.length > 0) {
      const savedStorage = this.storageLocation.filter(storage => 
        savedState.controlValues.storage.includes(storage.id)
      );
      if (savedStorage.length > 0) {
        console.log('Setting storage:', savedStorage.length, 'items');
        this.branchplantsFormControl.setValue(savedStorage);
        this.branchplantsFormControl.markAsDirty();
        this.branchplantsFormControl.updateValueAndValidity();
        // Update the form immediately
        this.form.patchValue({ storage_location_id: savedStorage.map(s => s.id) });
      }
    }

    // Restore items
    if (savedState.controlValues.items && savedState.controlValues.items.length > 0 && this.itemData && this.itemData.length > 0) {
      const savedItems = this.itemData.filter(item => 
        savedState.controlValues.items.includes(item.id)
      );
      if (savedItems.length > 0) {
        console.log('Setting items:', savedItems.length, 'items');
        this.itemsFormControl.setValue(savedItems);
        this.itemsFormControl.markAsDirty();
        this.itemsFormControl.updateValueAndValidity();
        // Update the form immediately
        this.form.patchValue({ item_id: savedItems.map(i => i.id) });
      }
    }

    // Restore order created users
    if (savedState.controlValues.orderCreatedUser && savedState.controlValues.orderCreatedUser.length > 0 && this.orderCreatedUser && this.orderCreatedUser.length > 0) {
      const savedUsers = this.orderCreatedUser.filter(user => 
        savedState.controlValues.orderCreatedUser.includes(user.id)
      );
      if (savedUsers.length > 0) {
        console.log('Setting order users:', savedUsers.length, 'users');
        this.customersFormControl.setValue(savedUsers);
        this.customersFormControl.markAsDirty();
        this.customersFormControl.updateValueAndValidity();
        // Update the form immediately
        this.form.patchValue({ user_created: savedUsers.map(u => u.id) });
      }
    }

    // Force change detection
    this.detChange.detectChanges();
  }

  /**
   * Restore customers with multiple attempts and different strategies
   */
  private restoreCustomersWithMultipleAttempts(savedCustomers: any[]) {
    console.log('Attempting customer restoration with multiple strategies...', savedCustomers.length, 'customers');
    
    // Strategy 1: Immediate setValue
    try {
      this.CustomersFormControl.setValue(savedCustomers);
      this.CustomersFormControl.markAsDirty();
      this.CustomersFormControl.updateValueAndValidity();
      this.form.patchValue({ customer_id: savedCustomers.map(c => c.id) });
      this.detChange.detectChanges();
      console.log('Strategy 1 applied - Direct setValue');
    } catch (error) {
      console.error('Strategy 1 failed:', error);
    }
    
    // Verify immediate result
    setTimeout(() => {
      console.log('After immediate attempt - Control value:', this.CustomersFormControl.value?.length || 0, 'items');
    }, 10);
    
    // Strategy 2: Reset and set with delay (for multi-autocomplete components that might be finicky)
    setTimeout(() => {
      try {
        console.log('Strategy 2: Reset and set');
        this.CustomersFormControl.reset();
        this.detChange.detectChanges();
        
        setTimeout(() => {
          this.CustomersFormControl.setValue(savedCustomers);
          this.CustomersFormControl.markAsDirty();
          this.CustomersFormControl.updateValueAndValidity();
          this.form.patchValue({ customer_id: savedCustomers.map(c => c.id) });
          this.detChange.detectChanges();
          
          // Trigger selection changed event manually to ensure UI updates
          setTimeout(() => {
            this.selectionchangedCustomer();
            console.log('After strategy 2 - Control value:', this.CustomersFormControl.value?.length || 0, 'items');
          }, 50);
        }, 50);
      } catch (error) {
        console.error('Strategy 2 failed:', error);
      }
    }, 200);
    
    // Strategy 3: Forceful approach with new control instance (most aggressive)
    setTimeout(() => {
      try {
        console.log('Strategy 3: Recreate control approach');
        // Don't actually recreate the control, but force a complete reset and set
        const currentValue = [...savedCustomers]; // Create new reference
        this.CustomersFormControl.reset();
        this.detChange.detectChanges();
        
        setTimeout(() => {
          this.CustomersFormControl.setValue(currentValue);
          this.CustomersFormControl.markAsDirty();
          this.CustomersFormControl.updateValueAndValidity();
          
          // Ensure form is also updated
          this.form.patchValue({ customer_id: currentValue.map(c => c.id) });
          
          // Trigger all related events
          this.selectionchangedCustomer();
          this.detChange.detectChanges();
          
          console.log('After strategy 3 - Control value:', this.CustomersFormControl.value?.length || 0, 'items');
        }, 100);
      } catch (error) {
        console.error('Strategy 3 failed:', error);
      }
    }, 500);
    
    // Strategy 4: Final verification and force update if needed
    setTimeout(() => {
      const currentValue = this.CustomersFormControl.value;
      const expectedCount = savedCustomers.length;
      const actualCount = currentValue?.length || 0;
      
      console.log('=== FINAL VERIFICATION ===');
      console.log('Expected customers:', expectedCount);
      console.log('Actual customers in control:', actualCount);
      console.log('Form customer_id value:', this.form.get('customer_id')?.value);
      
      // If we still don't have the right values, try one more time
      if (actualCount !== expectedCount) {
        console.log('Final recovery attempt...');
        this.CustomersFormControl.setValue(savedCustomers);
        this.CustomersFormControl.updateValueAndValidity();
        this.form.patchValue({ customer_id: savedCustomers.map(c => c.id) });
        this.detChange.detectChanges();
      }
    }, 1000);
  }

  /**
   * Get current control values for saving state
   * @returns Object containing current control values
   */
  getControlValues() {
    try {
      const controlValues = {
        items: this.itemsFormControl.value?.map((item: any) => item.id) || [],
        customers: this.CustomersFormControl.value?.map((customer: any) => customer.id) || [],
        storage: this.branchplantsFormControl.value?.map((storage: any) => storage.id) || [],
        orderCreatedUser: this.customersFormControl.value?.map((user: any) => user.id) || []
      };
      
      console.log('Getting control values for save:');
      console.log('- Items:', controlValues.items.length, 'selected');
      console.log('- Customers:', controlValues.customers.length, 'selected');
      console.log('- Storage:', controlValues.storage.length, 'selected');
      console.log('- Order Users:', controlValues.orderCreatedUser.length, 'selected');
      
      return controlValues;
    } catch (error) {
      console.error('Error getting control values:', error);
      return {
        items: [],
        customers: [],
        storage: [],
        orderCreatedUser: []
      };
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.items?.currentValue != changes.items?.previousValue) {
      this.filterItem = [...this.items];
      this.items = this.items.map(i => {
        return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
      });
      this._itemLoaded = true;
    }
    if (changes.orderCreatedUser && changes.orderCreatedUser.currentValue?.length > 0) {
      this._orderUserLoaded = true;
    }
    if (changes.storageLocation && changes.storageLocation.currentValue?.length > 0) {
      this._storageLoaded = true;
    }
    this._tryRestoreDropdowns();
  }
  
  // selectionchangedItems() {
  //   let items = this.itemsFormControl.value;
  //   this.form.patchValue({
  //     item_id: items[0].id
  //   });
    
  // }
  selectionchangedstorageLocation() {
    const ids = (this.branchplantsFormControl.value || []).map((i: any) => i.id);
    this.form.patchValue({ storage_location_id: ids });
  }
  selectionchangedorderCreatedUser() {
    const ids = (this.customersFormControl.value || []).map((i: any) => i.id);
    this.form.patchValue({ user_created: ids });
  }
   selectionchangedCustomer() {
    const ids = (this.CustomersFormControl.value || []).map((i: any) => i.id);
    this.form.patchValue({ customer_id: ids });
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
  
  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => {
      if (sub && !sub.closed) {
        sub.unsubscribe();
      }
    });
    this.subscriptions = [];
    
    // Clear any pending saved state
    this.pendingSavedState = null;
    
    console.log('AdvanceSearchFormOrderComponent destroyed');
  }
    // getCustomerLobList(customer) {
   
    //   this.apiService.getLobsByCustomerId(customer?.user_id).subscribe((result) => {
    //     this.customerID = result.data?.customers?.firstname + ' ' + result.data?.customers?.lastname;
       
    //   });
    // }
  
  
}
