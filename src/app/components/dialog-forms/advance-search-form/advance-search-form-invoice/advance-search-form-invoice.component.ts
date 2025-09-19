import { Component, OnInit, Input, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
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
export class AdvanceSearchFormInvoiceComponent implements OnInit, OnChanges {
  @Input() salesman: Array<any> = [];
  @Input() initialCriteria: any = {};
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.initialCriteria && this.initialCriteria && Object.keys(this.initialCriteria).length > 0) {
      this.setFormValues(this.initialCriteria);
    }
  }
   SalesmanFormControl = new FormControl([]);
  salesmanList: any[] = [];
  channelList: any[] = [];
  @Input() items: Array<any> = [];
  @Input() customers: Array<any> = [];
  itemsFormControl = new FormControl([]);
   selectedItems = [];
  //  customers: any=[];
   public filterItem = [];
   settings = {};
   itemfilterValue = '';
   public filteredItems: any[] = [];
   public itemData: any[] = [];
    public ItemCodeFormControl: FormControl;
    uomList: any = [];
  form: FormGroup;
  statusList: Array<any> = INVOICE_STATUS;
  // @Input() salesman: Array<any> = [];
  @Input() storageLocation: Array<any> = [];
  customersFormControl = new FormControl([]);

  branchplantsFormControl = new FormControl([]);
  private subscriptions: Subscription[] = [];
    customerID: any = [];
    CustomersFormControl = new FormControl([]);
  constructor(private detChange: ChangeDetectorRef,private apiService: ApiService,private ms: MasterService
  ) { }

  setFormValues(criteria: any) {
    if (!criteria) return;
    // Patch primitive fields
    this.form.patchValue({
      startdate: criteria.startdate || null,
      enddate: criteria.enddate || null,
      invoice_no: criteria.invoice_no || null,
      order_no: criteria.order_no || null,
      customer_lpo_no: criteria.customer_lpo_no || null,
      erp_status: criteria.erp_status || null,
      syncdate: criteria.syncdate || null,
      creationDate: criteria.creationDate || null,
    });

    // Branch plants (storage_location_id)
    if (criteria.storage_location_id && this.storageLocation?.length) {
      const ids = Array.isArray(criteria.storage_location_id) ? criteria.storage_location_id.map(String) : [String(criteria.storage_location_id)];
      const selected = this.storageLocation.filter(l => ids.includes(String(l.id)) || ids.includes(String(l.storage_location_id)));
      this.branchplantsFormControl.setValue(selected);
      this.form.patchValue({ storage_location_id: selected.map(l => l.id) });
    }

    // Customers
    if (criteria.customer_id && this.customers?.length) {
      const mappedCustomers = this.customers.map(c => ({
        id: c.id,
        itemName: (c.customer_code ? c.customer_code + ' ' : '') + (c.firstname || c.first_name || '') + (c.lastname || c.last_name ? ' ' + (c.lastname || c.last_name) : '')
      }));
      const ids = Array.isArray(criteria.customer_id) ? criteria.customer_id.map(String) : [String(criteria.customer_id)];
      const selected = mappedCustomers.filter(c => ids.includes(String(c.id)));
      this.CustomersFormControl.setValue(selected);
      this.form.patchValue({ customer_id: selected.map(c => c.id) });
    }

    // Items
    if (criteria.item_id && this.filteredItems?.length) {
      const mappedItems = this.filteredItems.map(i => ({
        id: i.id,
        itemName: (i.item_code ? i.item_code + ' - ' : '') + (i.item_name || '')
      }));
      const ids = Array.isArray(criteria.item_id) ? criteria.item_id.map(String) : [String(criteria.item_id)];
      const selected = mappedItems.filter(i => ids.includes(String(i.id)));
      this.itemsFormControl.setValue(selected);
      this.form.patchValue({ item_id: selected.map(i => i.id) });
    }

    // Salesman (use @Input() salesman for mapping, as used in the template)
    if (criteria.salesman && this.salesman?.length) {
      const mappedSalesmen = this.salesman.map(s => ({
        id: s.id,
        salesman_name: s.salesman_name || s.name || `${s.salesman_code || ''} ${s.firstname || ''} ${s.lastname || ''}`
      }));
      const ids = Array.isArray(criteria.salesman) ? criteria.salesman.map(String) : [String(criteria.salesman)];
      const selected = mappedSalesmen.filter(s => ids.includes(String(s.id)));
      this.SalesmanFormControl.setValue(selected);
      this.form.patchValue({ salesman: selected.map(s => s.id) });
    }

    // Channel (Service Channel)
    if (criteria.channel_name && this.channelList?.length) {
      const mappedChannels = this.channelList.map(ch => ({
        id: ch.id,
        itemName: ch.channel_name || ch.name || ''
      }));
      const ids = Array.isArray(criteria.channel_name) ? criteria.channel_name.map(String) : [String(criteria.channel_name)];
      const selected = mappedChannels.filter(ch => ids.includes(String(ch.id)));
      this.form.patchValue({ channel_name: selected.map(ch => ch.id) });
    }

    this.detChange.detectChanges();
  }

  ngOnInit(): void {
    // Async prefill logic for dropdowns (robust, like order form)
    let itemsLoaded = false;
    let channelsLoaded = false;
    let salesmenLoaded = false;

    const tryPrefill = () => {
      if (
        itemsLoaded &&
        channelsLoaded &&
        salesmenLoaded &&
        this.initialCriteria &&
        Object.keys(this.initialCriteria).length > 0
      ) {
        this.setFormValues(this.initialCriteria);
      }
    };

    this.subscriptions.push(
      this.ms.itemDetailDDllistTable({ page: 1, page_size: 10 }).subscribe((result: any) => {
        this.itemData = result.data;
        this.filteredItems = result.data;
        itemsLoaded = true;
        tryPrefill();
      })
    );
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
      channelsLoaded = true;
      tryPrefill();
    });
    this.apiService.getMasterDataLists().subscribe((result: any) => {
      this.salesmanList = result.data.salesmans;
      for (let salesman of this.salesmanList) {
        salesman['salesman_name'] = `${salesman.salesman_info.salesman_code} - ${salesman.firstname} ${salesman.lastname}`;
      }
      salesmenLoaded = true;
      tryPrefill();
    });
    this.ItemCodeFormControl = new FormControl([], [Validators.required]);
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
  }
  



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

  resetForm() {
    this.form.reset();
    this.SalesmanFormControl.reset();
    this.CustomersFormControl.reset();
    this.itemsFormControl.reset();
    this.branchplantsFormControl.reset();
    this.ItemCodeFormControl.reset();
  }
}
