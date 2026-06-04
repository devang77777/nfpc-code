import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
import { Subscription,Subject } from 'rxjs';
import { MasterService } from 'src/app/components/main/master/master.service';
import { SavedSearchValues } from '../services/advance-search-state.service';
import { SimpleChanges } from '@angular/core';
@Component({
  selector: 'app-advance-search-form-creditnote',
  templateUrl: './advance-search-form-creditnote.component.html',
  styles: [
  ]
})
export class AdvanceSearchFormCreditnoteComponent implements OnInit {
  code : any;
  channelList: any[] = [];
  salesmanList: any[] = [];
   public filteredItems: any[] = [];
   public itemData: any[] = [];
   itemsFormControl = new FormControl([]);
  statusList: Array<any> = STATUS;
  @Input() salesman: Array<any> = [];
  domain = window.location.host;
  form: FormGroup
   private subscriptions: Subscription[] = [];
    customerID: any = [];
    CustomersFormControl = new FormControl([]);
    SalesmanFormControl = new FormControl([]);
  private pendingSavedState: any = null; // Store pending saved state
  
  // Flags to track async data loading
  private _customerLoaded = false;
  private _itemLoaded = false;
  private _salesmanLoaded = false;
  private _pendingRestore: any = null;
  
  constructor(private detChange: ChangeDetectorRef, private apiService: ApiService,private ms : MasterService) { }

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
       module: new FormControl('credit_note'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      credit_notes_no: new FormControl(),
      customer_ref_no: new FormControl(),
      customer_id: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
      salesman: new FormControl(),
      // current_stage: new FormControl(),
      channel_name: new FormControl(),
      item_id: new FormControl(),
      erp_status: new FormControl(),
      approval_status: new FormControl(),
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
    if (this._customerLoaded && this._itemLoaded && this._salesmanLoaded && this._pendingRestore) {
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
    // Check if salesman or other input properties have changed and we have pending saved state
    if (this.pendingSavedState) {
      if (changes.salesman && changes.salesman.currentValue?.length > 0) {
        this.restoreFormValues(this.pendingSavedState);
        this.pendingSavedState = null;
      }
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
      // Restore multi-select control values with mapped objects for correct display
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

      if (savedState.controlValues.salesman && this.salesmanList && this.salesmanList.length > 0) {
        const savedSalesmen = this.salesmanList
          .filter(salesman => savedState.controlValues.salesman.includes(salesman.id))
          .map(salesman => ({
            ...salesman,
            salesman_name: (salesman.salesman_info?.salesman_code ? salesman.salesman_info.salesman_code + ' - ' : '') + (salesman.firstname || '') + ' ' + (salesman.lastname || '')
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
    
    // Patch all simple fields directly
    this.form.patchValue(formValues);

    // Restore dropdowns with mapped objects for correct display
    this._restoreDropdownSelections(requestOriginal);
    
    this.detChange.detectChanges();
    // Save for later restore if data not loaded (for async cases)
    this._pendingRestore = requestOriginal;
    this._tryRestoreDropdowns();
  }

  /**
   * Get current control values for saving state
   * @returns Object containing current control values
   */
  getControlValues() {
    return {
      items: this.itemsFormControl.value?.map((item: any) => item.id) || [],
      customers: this.CustomersFormControl.value?.map((customer: any) => customer.id) || [],
      salesman: this.SalesmanFormControl.value?.map((salesman: any) => salesman.id) || []
    };
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

}
