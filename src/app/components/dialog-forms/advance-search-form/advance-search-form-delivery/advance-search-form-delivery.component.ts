import { Component, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS, DELIVERY_STATUS, ORDER_STATUS } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
import { Subscription,Subject } from 'rxjs';
import { MasterService } from 'src/app/components/main/master/master.service';
@Component({
  selector: 'app-advance-search-form-delivery',
  templateUrl: './advance-search-form-delivery.component.html',
  styleUrls: ['./advance-search-form-delivery.component.scss']
})
export class AdvanceSearchFormDeliveryComponent implements OnInit, OnChanges, OnDestroy {
  @Input() salesman: Array<any> = [];
  @Input() customers: Array<any> = [];
  @Input() items: Array<any> = [];
  @Input() initialCriteria: any = {};
  ngOnChanges(changes: SimpleChanges): void {
    // Handle items input change and create mapped filteredItems
    if (changes.items && changes.items.currentValue) {
      console.log('Raw items data:', this.items);
      this.filteredItems = [...this.items].map(i => ({ 
        id: i.id,
        itemName: (i.item_code || i.code || '') + (i.item_name || i.name ? ' - ' + (i.item_name || i.name) : ''),
        item_code: i.item_code || i.code || '',
        item_name: i.item_name || i.name || ''
      }));
      console.log('Mapped filteredItems:', this.filteredItems);
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
    if ((changes.customers || changes.salesman || changes.storageLocation || changes.channelList) &&
        this.initialCriteria && Object.keys(this.initialCriteria).length > 0) {
      if (changes.channelList) {
        console.log('Channel list changed:', this.channelList);
      }
      this.prefillFormIfReady();
    }
  }

  /** Prefill only when all inputs and dropdowns are ready */
  private prefillFormIfReady() {
    if (!this.initialCriteria) return;

    if (this.customers?.length && this.salesman?.length && this.storageLocation?.length && 
        this.channelList?.length && this.filteredItems?.length) {
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
      delivery_no: criteria.delivery_no || null,
      startrange: criteria.startrange || null,
      endrange: criteria.endrange || null,
    });

    // Customers - map to {id, itemName: 'customer_code - firstname lastname'}
    if (criteria.customer_id) {
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
      console.log('Setting items with criteria.item_id:', criteria.item_id);
      console.log('Available filteredItems:', this.filteredItems);
      
      const ids = this.ensureArray(criteria.item_id).map(String);
      const selected = this.filteredItems.filter(i => ids.includes(String(i.id)));
      console.log('Selected items:', selected);
      
      if (selected.length > 0) {
        this.itemsFormControl.setValue(selected);
        this.form.patchValue({ item_id: selected.map(i => i.id) });
      }
    }

    // Salesman - map to {id, itemName: 'salesman_code - firstname lastname'}
    if (criteria.salesman) {
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

    // Storage Location - map to {id, itemName: 'code - name'}
    if (criteria.storage_location_id) {
      const mappedStorage = this.storageLocation.map(l => ({
        id: l.id,
        itemName: (l.code ? l.code + ' - ' : '') + (l.name || ''),
        code: l.code,
        name: l.name
      }));
      const ids = this.ensureArray(criteria.storage_location_id).map(String);
      const selected = mappedStorage.filter(l => ids.includes(String(l.id)));
      this.branchplantsFormControl.setValue(selected);
      this.form.patchValue({ storage_location_id: selected.map(l => l.id) });
    }

    // Status - mat-select multiple expects array of values
    if (criteria.status) {
      const statusValues = this.ensureArray(criteria.status);
      this.form.patchValue({ status: statusValues });
    }

    // Channel - mat-select multiple expects array of IDs
    if (criteria.channel_name && this.channelList?.length) {
      console.log('Setting channels with criteria.channel_name:', criteria.channel_name);
      console.log('Available channelList:', this.channelList);
      
      const channelIds = this.ensureArray(criteria.channel_name).map(String);
      // Find matching channels by id
      const matchingChannels = this.channelList.filter(ch => 
        channelIds.includes(String(ch.id))
      );
      console.log('Matching channels found:', matchingChannels);
      
      if (matchingChannels.length > 0) {
        this.form.patchValue({ channel_name: matchingChannels.map(ch => ch.id) });
      }
    }

    this.detChange.detectChanges();
  }
  @Input() channelList: any[] = [];
   SalesmanFormControl = new FormControl([]);
  salesmanList: any[] = [];
  statusList: Array<any> = STATUS;
  private subscriptions: Subscription[] = [];
  customerID: any = [];
   itemsFormControl = new FormControl([]);
   public filteredItems: any[] = [];
   public itemData: any[] = [];
  orderStatusList: Array<any> = ORDER_STATUS;
  // @Input() salesman: Array<any> = []
  form: FormGroup
  @Input() storageLocation: Array<any> = [];
  branchplantsFormControl = new FormControl([]);
   CustomersFormControl = new FormControl([]);
  constructor(
    private apiService: ApiService,
    private ms: MasterService,
    private detChange: ChangeDetectorRef
  ) {}

  /** Helper: normalize into array */
  private ensureArray(value: any) {
    return Array.isArray(value) ? value : value !== undefined && value !== null ? [value] : [];
  }

  /** Prefill dropdowns and form values, matching order form logic */
  setFormValues(criteria: any) {
    if (!criteria || Object.keys(criteria).length === 0) {
      this.resetForm();
      return;
    }
    
    // Use the new prefill method
    this.prefillForm(criteria);
  }

  /** Method to be called by parent component for initial criteria population */
  populateFormWithInitialCriteria() {
    if (this.initialCriteria && Object.keys(this.initialCriteria).length > 0) {
      this.setFormValues(this.initialCriteria);
    }
  }

  /** Reset form method */
  resetForm() {
    this.form.reset();
    this.CustomersFormControl.setValue([]);
    this.SalesmanFormControl.setValue([]);
    this.itemsFormControl.setValue([]);
    this.branchplantsFormControl.setValue([]);
    this.detChange.detectChanges();
  }

  ngOnInit(): void {
    // Initialize filteredItems from input items with proper mapping
    this.filteredItems = this.items?.map(i => ({ 
      id: i.id,
      itemName: (i.item_code || i.code || '') + (i.item_name || i.name ? ' - ' + (i.item_name || i.name) : ''),
      item_code: i.item_code || i.code || '',
      item_name: i.item_name || i.name || ''
    })) || [];
    console.log('Initial filteredItems:', this.filteredItems);
    
    // Initialize form first
    this.form = new FormGroup({
      module: new FormControl('delivery'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      delivery_no: new FormControl(),
      customer_id: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
      salesman: new FormControl(),
      status: new FormControl(),
      channel_name: new FormControl(),
      storage_location_id: new FormControl(),
      item_id: new FormControl(),
    });

    // Robust async prefill logic for dropdowns
    let itemsLoaded = false;
    let salesmenLoaded = false;

    const tryPrefill = () => {
      if (
        itemsLoaded &&
        salesmenLoaded &&
        this.customers?.length &&
        this.storageLocation?.length &&
        this.channelList?.length &&
        this.initialCriteria &&
        Object.keys(this.initialCriteria).length > 0
      ) {
        this.setFormValues(this.initialCriteria);
      }
    };

    // Load items data
    this.subscriptions.push(
      this.ms.itemDetailDDllistTable({ page: 1, page_size: 10 }).subscribe((result: any) => {
        this.itemData = result.data;
        this.filteredItems = result.data;
        itemsLoaded = true;
        tryPrefill();
      })
    );

    // Load salesman data
    this.subscriptions.push(
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.salesmanList = result.data.salesmans;
        for (let salesman of this.salesmanList) {
          salesman['salesman_name'] = `${salesman.salesman_info.salesman_code} - ${salesman.firstname} ${salesman.lastname}`;
        }
        salesmenLoaded = true;
        tryPrefill();
      })
    );
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
