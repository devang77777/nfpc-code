import { Component, OnInit, Input } from '@angular/core';
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
  
  constructor(private apiService: ApiService,private ms : MasterService) { }

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
      // this.filterCustomer = result.data.slice(0, 30);
      
      // Try to restore saved state if it was pending
      if (this.pendingSavedState) {
        this.restoreFormValues(this.pendingSavedState);
        this.pendingSavedState = null;
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    // Check if salesman or other input properties have changed and we have pending saved state
    if (this.pendingSavedState) {
      if (changes.salesman && changes.salesman.currentValue?.length > 0) {
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

      if (savedState.controlValues.customers && this.customerID && this.customerID.length > 0) {
        const savedCustomers = this.customerID
          .filter(customer => savedState.controlValues.customers.includes(customer.id))
          .map(customer => ({
            ...customer,
            itemName: (customer.customer_code ? customer.customer_code + ' - ' : '') + (customer.customer_name || customer.name || '')
          }));
        this.CustomersFormControl.setValue(savedCustomers);
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
