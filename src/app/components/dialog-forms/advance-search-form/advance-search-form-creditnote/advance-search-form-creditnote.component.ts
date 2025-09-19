import { Component, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
import { Subscription,Subject } from 'rxjs';
import { MasterService } from 'src/app/components/main/master/master.service';
@Component({
  selector: 'app-advance-search-form-creditnote',
  templateUrl: './advance-search-form-creditnote.component.html',
  styles: [
  ]
})
export class AdvanceSearchFormCreditnoteComponent implements OnInit, OnChanges, OnDestroy {
  @Input() customers: Array<any> = [];
  @Input() initialCriteria: any = {};
  @Input() salesman: Array<any> = [];
  @Input() items: Array<any> = [];
  @Input() channelList: any[] = [];
  code : any;
  salesmanList: any[] = [];
   public filteredItems: any[] = [];
   public itemData: any[] = [];
   itemsFormControl = new FormControl([]);
  statusList: Array<any> = STATUS;
  domain = window.location.host;
  form: FormGroup
   private subscriptions: Subscription[] = [];
    customerID: any = [];
    CustomersFormControl = new FormControl([]);
    SalesmanFormControl = new FormControl([]);

  constructor(private apiService: ApiService, private ms: MasterService, private detChange: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle items input change and create mapped filteredItems
    if (changes.items && changes.items.currentValue) {
      this.filteredItems = [...this.items].map(i => ({ 
        id: i.id,
        itemName: (i.item_code || i.code || '') + (i.item_name || i.name ? ' - ' + (i.item_name || i.name) : ''),
        item_code: i.item_code || i.code || '',
        item_name: i.item_name || i.name || ''
      }));
    }
    
    // Handle initial criteria change
    if (changes.initialCriteria && changes.initialCriteria.currentValue !== changes.initialCriteria.previousValue) {
      if (this.initialCriteria && Object.keys(this.initialCriteria).length > 0) {
        this.prefillFormIfReady();
      } else {
        this.resetForm();
      }
    }

    // Check if any data inputs changed and we have criteria to prefill
    if ((changes.customers || changes.salesman || changes.channelList) &&
        this.initialCriteria && Object.keys(this.initialCriteria).length > 0) {
      this.prefillFormIfReady();
    }
  }

  /** Helper: normalize into array */
  private ensureArray(value: any) {
    return Array.isArray(value) ? value : value !== undefined && value !== null ? [value] : [];
  }

  /** Prefill only when all inputs and dropdowns are ready */
  private prefillFormIfReady() {
    if (!this.initialCriteria) return;

    if (this.customers?.length && this.salesman?.length && this.filteredItems?.length && this.channelList?.length) {
      this.prefillForm(this.initialCriteria);
    }
  }

  private prefillForm(criteria: any) {
    // Convert array format [{key,value}] into object if needed
    if (Array.isArray(criteria)) {
      const obj: any = {};
      criteria.forEach(item => {
        if (item.key && item.value !== null && item.value !== undefined) {
          obj[item.key] = item.value;
        }
      });
      criteria = obj;
    }

    // Patch primitive values
    this.form.patchValue({
      startdate: criteria.startdate || null,
      enddate: criteria.enddate || null,
      credit_notes_no: criteria.credit_notes_no || null,
      customer_ref_no: criteria.customer_ref_no || null,
      startrange: criteria.startrange || null,
      endrange: criteria.endrange || null,
      channel_name: criteria.channel_name || null,
      erp_status: criteria.erp_status || null,
      approval_status: criteria.approval_status || null,
    });

    // Customers - map to {id, itemName: 'customer_code - firstname lastname'}
    if (criteria.customer_id && this.customers?.length) {
      const mappedCustomers = this.customers.map(c => ({
        id: c.id,
        itemName: (c.customer_code ? c.customer_code + ' - ' : '') + 
                 (c.name || c.firstname || c.first_name || '') + 
                 (c.lastname || c.last_name ? ' ' + (c.lastname || c.last_name) : '')
      }));
      const ids = this.ensureArray(criteria.customer_id).map(String);
      const selected = mappedCustomers.filter(c => ids.includes(String(c.id)));
      this.CustomersFormControl.setValue(selected);
      this.form.patchValue({ customer_id: selected.map(c => c.id) });
    }

    // Items - use the already mapped filteredItems
    if (criteria.item_id && this.filteredItems?.length) {
      const ids = this.ensureArray(criteria.item_id).map(String);
      const selected = this.filteredItems.filter(i => ids.includes(String(i.id)));
      this.itemsFormControl.setValue(selected);
      this.form.patchValue({ item_id: selected.map(i => i.id) });
    }

    // Salesman - map to {id, itemName: 'salesman_code - firstname lastname'}
    if (criteria.salesman && this.salesman?.length) {
      const mappedSalesman = this.salesman.map(s => ({
        id: s.id,
        itemName: (s.salesman_code ? s.salesman_code + ' - ' : '') + 
                 (s.name || s.firstname || s.first_name || '') + 
                 (s.lastname || s.last_name ? ' ' + (s.lastname || s.last_name) : '')
      }));
      const ids = this.ensureArray(criteria.salesman).map(String);
      const selected = mappedSalesman.filter(s => ids.includes(String(s.id)));
      this.SalesmanFormControl.setValue(selected);
      this.form.patchValue({ salesman: selected.map(s => s.id) });
    }

    // Channel - mat-select multiple expects array of IDs
    if (criteria.channel_name && this.channelList?.length) {
      const channelIds = this.ensureArray(criteria.channel_name).map(String);
      // Find matching channels by id
      const matchingChannels = this.channelList.filter(ch => 
        channelIds.includes(String(ch.id))
      );
      
      if (matchingChannels.length > 0) {
        this.form.patchValue({ channel_name: matchingChannels.map(ch => ch.id) });
      }
    }

    this.detChange.detectChanges();
  }

  /** Reset form method */
  resetForm() {
    this.form.reset();
    this.CustomersFormControl.setValue([]);
    this.SalesmanFormControl.setValue([]);
    this.itemsFormControl.setValue([]);
    this.detChange.detectChanges();
  }

  setFormValues(criteria: any) {
    if (!criteria || Object.keys(criteria).length === 0) {
      this.resetForm();
      return;
    }
    
    // Use the new prefill method
    this.prefillForm(criteria);
  }

  ngOnInit(): void {
    // Initialize filteredItems from input items with proper mapping
    this.filteredItems = this.items?.map(i => ({ 
      id: i.id,
      itemName: (i.item_code || i.code || '') + (i.item_name || i.name ? ' - ' + (i.item_name || i.name) : ''),
      item_code: i.item_code || i.code || '',
      item_name: i.item_name || i.name || ''
    })) || [];

    // Load channel list if not provided as input (fallback)
    if (!this.channelList || this.channelList.length === 0) {
      this.apiService.getAllCustomerCategory().subscribe((res: any) => {
        this.channelList = res.data;
      });
    }

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
    });
    // Prefill if initial criteria exists
    if (this.initialCriteria && Object.keys(this.initialCriteria).length > 0) {
      this.setFormValues(this.initialCriteria);
    }
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

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
