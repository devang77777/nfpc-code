// import { Component, OnInit, Input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
// import { FormGroup, FormControl,Validators } from '@angular/forms';
// import { STATUS, ORDER_STATUS } from 'src/app/app.constant';
// import { Subscription,Subject } from 'rxjs';
// import { ApiService } from 'src/app/services/api.service';
// import { MasterService } from 'src/app/components/main/master/master.service';
// import { ORDER_STATUS_ADVANCE_SEARCH } from '../advance-search-form.component';

// @Component({
//   selector: 'app-advance-search-form-order',
//   templateUrl: './advance-search-form-order.component.html',
//   styleUrls: ['./advance-search-form-order.component.scss']
//     let storage = this.branchplantsFormControl.value;
//     let storageIds = storage.map((item: any) => item.id);
//     this.form.patchValue({
//       storage_location_id: storageIds
//     });
//   }
//   selectionchangedorderCreatedUser() {
//     let user = this.customersFormControl.value;
//     let userIds = user.map((item: any) => item.id);
//     this.form.patchValue({
//       user_created: userIds
//     });
//   }
//    selectionchangedCustomer() {
//     let user = this.CustomersFormControl.value;

//   // Extract the ids from the selected items
//   const itemIds = user.map((item: any) => item.id);

//   // Patch the form with the array of item IDs
//   this.form.patchValue({
//     customer_id: itemIds
//   });
//     // this.form.patchValue({
//     //   customerName: user[0].id
//     //   // customerName: user[0].name
//     // });
//   }

//   selectionchangedItems() {
//     // let items = this.itemsFormControl.value;
//     // this.form.patchValue({
//     //   item_id: items[0].id
//     // });
//     let items = this.itemsFormControl.value;

//   // Extract the ids from the selected items
//   const itemIds = items.map((item: any) => item.id);

//   // Patch the form with the array of item IDs
//   this.form.patchValue({
//     item_id: itemIds
//   });
//   }
//   onItemSelect(item: any) {
//     let items = this.itemsFormControl.value;
//     this.form.patchValue({
//       item_id: items[0].id
//     });
//   }
//   OnItemDeSelect(item: any) {
//     //console.log(item);
//     //console.log(this.selectedItems);
//   }
//   onSelectAll(items: any) {

//   }
//   onDeSelectAll(items: any) {

//   }
//   onSearch(evt: any) {
//     let value = evt.target.value
//     if (value !== '') {
//       this.itemfilterValue = value.toLowerCase().trim() || "";
//       this.items = this.filterItem.filter(x => x.item_code.toLowerCase().trim() === this.itemfilterValue || x.item_name.toLowerCase().trim() === this.itemfilterValue);
//       this.items = this.items.map(i => {
//         return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
//       });
//     } else {
//       this.items = this.filterItem.map(i => {
//         return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
//       })
//     }
//     this.detChange.detectChanges();
//   }
//     // getCustomerLobList(customer) {

//     //   this.apiService.getLobsByCustomerId(customer?.user_id).subscribe((result) => {
//     //     this.customerID = result.data?.customers?.firstname + ' ' + result.data?.customers?.lastname;

//     //   });
//     // }

//   // getCreatedByList(name: string = '') {

//   //   this.apiService.getAllCreatedByUserList(name).subscribe((res: any) => {
//   //     this.orderCreatedUser = res.data;
//   //   });
//   // }

//   getCreatedByList(name: string = '') {

//     this.apiService.getAllCreatedByUserList(name).subscribe((res: any) => {
//       this.createdByList = res.data;
//     });
//   }

//   resetForm() {
//     if (this.form) {
//       this.form.reset();
//       // Clear any additional form controls that might not be part of the main form
//       this.itemsFormControl.reset();
//       this.branchplantsFormControl.reset();
//       this.customersFormControl.reset();
//       this.CustomersFormControl.reset();
//     }
//   }

// }


// import { Component, OnInit, Input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
// import { FormGroup, FormControl } from '@angular/forms';
// import { STATUS } from 'src/app/app.constant';
// import { Subscription, Subject } from 'rxjs';
// import { ApiService } from 'src/app/services/api.service';
// import { MasterService } from 'src/app/components/main/master/master.service';
// import { ORDER_STATUS_ADVANCE_SEARCH } from '../advance-search-form.component';

// @Component({
//   selector: 'app-advance-search-form-order',
//   templateUrl: './advance-search-form-order.component.html',
//   styleUrls: ['./advance-search-form-order.component.scss']
// })
// export class AdvanceSearchFormOrderComponent implements OnInit {
//   // Lists
//   @Input() storageLocation: Array<any> = [];
//   @Input() items: Array<any> = [];
//   @Input() orderCreatedUser: Array<any> = [];
//   @Input() customers: Array<any> = [];
//   @Input() initialCriteria: any = {};

//   channelList: any[] = [];
//   itemData: any[] = [];
//   filteredItems: any[] = [];

//   // Dropdown controls
//   itemsFormControl = new FormControl([]);
//   branchplantsFormControl = new FormControl([]);
//   customersFormControl = new FormControl([]);  // order created user
//   CustomersFormControl = new FormControl([]);  // customers

//   // Form
//   form: FormGroup;

//   // Constants
//   statusList: Array<any> = STATUS;
//   orderStatusList: Array<any> = ORDER_STATUS_ADVANCE_SEARCH;

//   // Other
//   keyUp = new Subject<string>();
//   domain = window.location.host;
//   settings = {};
//   private subscriptions: Subscription[] = [];

//   constructor(
//     private detChange: ChangeDetectorRef,
//     private apiService: ApiService,
//     private ms: MasterService
//   ) { }

//   ngOnInit(): void {
//     // Load items
//     this.subscriptions.push(
//       this.ms.itemDetailDDllistTable({ page: 1, page_size: 10 }).subscribe((result: any) => {
//         this.itemData = result.data;
//         this.filteredItems = result.data;
//       })
//     );

//     // Load channels
//     this.apiService.getAllCustomerCategory().subscribe((res: any) => {
//       this.channelList = res.data;
//       // Try prefill again after channel list loads
//       if (this.initialCriteria?.channel_name) {
//         this.prefillForm(this.initialCriteria);
//       }
//     });

//     // Multi-select dropdown settings
//     this.settings = {
//       classes: "myclass custom-class",
//       enableSearchFilter: true,
//       badgeShowLimit: 2,
//       maxHeight: 141,
//       autoPosition: false,
//       position: 'bottom',
//       searchBy: ['item_code', 'item_name'],
//       singleSelection: true
//     };

//     // Build form
//     this.form = new FormGroup({
//       module: new FormControl('order'),
//       startdate: new FormControl(),
//       enddate: new FormControl(),
//       order_no: new FormControl(),
//       customer_id: new FormControl(),
//       channel_name: new FormControl(),
//       status: new FormControl(),
//       customer_lpo: new FormControl(),
//       delivery_start_date: new FormControl(),
//       delivery_end_date: new FormControl(),
//       item_id: new FormControl(),
//       user_created: new FormControl(),
//       storage_location_id: new FormControl(),
//     });

//     // Prefill if initial criteria exists
//     if (this.initialCriteria && Object.keys(this.initialCriteria).length > 0) {
//       this.prefillForm(this.initialCriteria);
//     }
//   }

//   ngOnChanges(changes: SimpleChanges) {
//     // Ensure item display formatting
//     if (changes.items?.currentValue !== changes.items?.previousValue) {
//       this.filteredItems = [...this.items];
//       this.items = this.items.map(i => {
//         return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
//       });
//     }

//     // Retry prefill when input data arrives
//     if ((changes.customers || changes.orderCreatedUser || changes.storageLocation) &&
//       this.initialCriteria && Object.keys(this.initialCriteria).length > 0) {
//       if (this.customers?.length && this.storageLocation?.length && this.orderCreatedUser?.length) {
//         this.prefillForm(this.initialCriteria);
//       }
//     }
//   }

//   /** Helper: normalize into array */
//   private ensureArray(value: any) {
//     return Array.isArray(value) ? value : value !== undefined && value !== null ? [value] : [];
//   }

//   /** Prefill dropdowns and form values */
//   private prefillForm(criteria: any) {
//     // Convert array format [{key,value}] into object if needed
//     if (Array.isArray(criteria)) {
//       const obj: any = {};
//       criteria.forEach(item => {
//         if (item.key && item.value !== null && item.value !== undefined) {
//           obj[item.key] = item.value;
//         }
//       });
//       criteria = obj;
//     }

//     // Patch primitive values
//     this.form.patchValue({
//       startdate: criteria.startdate || null,
//       enddate: criteria.enddate || null,
//       order_no: criteria.order_no || null,
//       customer_lpo: criteria.customer_lpo || null,
//       delivery_start_date: criteria.delivery_start_date || null,
//       delivery_end_date: criteria.delivery_end_date || null,
//     });

//     // Customers
//     if (criteria.customer_id && this.customers?.length) {
//       const ids = this.ensureArray(criteria.customer_id);
//       const selected = this.customers.filter(c => ids.includes(c.id));
//       this.CustomersFormControl.setValue(selected);
//       this.form.patchValue({ customer_id: ids });
//     }

//     // Items
//     if (criteria.item_id && this.filteredItems?.length) {
//       const ids = this.ensureArray(criteria.item_id);
//       const selected = this.filteredItems.filter(i => ids.includes(i.id));
//       this.itemsFormControl.setValue(selected);
//       this.form.patchValue({ item_id: ids });
//     }

//     // Created users
//     if (criteria.user_created && this.orderCreatedUser?.length) {
//       const ids = this.ensureArray(criteria.user_created);
//       const selected = this.orderCreatedUser.filter(u => ids.includes(u.id));
//       this.customersFormControl.setValue(selected);
//       this.form.patchValue({ user_created: ids });
//     }

//     // Branch plants
//     if (criteria.storage_location_id && this.storageLocation?.length) {
//       const ids = this.ensureArray(criteria.storage_location_id);
//       const selected = this.storageLocation.filter(l => ids.includes(l.id));
//       this.branchplantsFormControl.setValue(selected);
//       this.form.patchValue({ storage_location_id: ids });
//     }

//     // Channels
//     if (criteria.channel_name && this.channelList?.length) {
//       const ids = this.ensureArray(criteria.channel_name);
//       this.form.patchValue({ channel_name: ids });
//     }

//     // Status
//     if (criteria.status) {
//       const ids = this.ensureArray(criteria.status);
//       this.form.patchValue({ status: ids });
//     }
//   }

//   /** Selection changes (push ids into form) */
//   selectionchangedstorageLocation() {
//     const ids = (this.branchplantsFormControl.value || []).map((i: any) => i.id);
//     this.form.patchValue({ storage_location_id: ids });
//   }

//   selectionchangedorderCreatedUser() {
//     const ids = (this.customersFormControl.value || []).map((i: any) => i.id);
//     this.form.patchValue({ user_created: ids });
//   }

//   selectionchangedCustomer() {
//     const ids = (this.CustomersFormControl.value || []).map((i: any) => i.id);
//     this.form.patchValue({ customer_id: ids });
//   }

//   selectionchangedItems() {
//     const ids = (this.itemsFormControl.value || []).map((i: any) => i.id);
//     this.form.patchValue({ item_id: ids });
//   }

//   resetForm() {
//     if (this.form) {
//       this.form.reset();
//       this.itemsFormControl.reset();
//       this.branchplantsFormControl.reset();
//       this.customersFormControl.reset();
//       this.CustomersFormControl.reset();
//     }
//   }
// }

import { Component, OnInit, Input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';
import { Subscription, Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { MasterService } from 'src/app/components/main/master/master.service';
import { ORDER_STATUS_ADVANCE_SEARCH } from '../advance-search-form.component';

@Component({
  selector: 'app-advance-search-form-order',
  templateUrl: './advance-search-form-order.component.html',
  styleUrls: ['./advance-search-form-order.component.scss']
})
export class AdvanceSearchFormOrderComponent implements OnInit {
  @Input() storageLocation: Array<any> = [];
  @Input() items: Array<any> = [];
  @Input() orderCreatedUser: Array<any> = [];
  @Input() customers: Array<any> = [];
  @Input() initialCriteria: any = {};

  channelList: any[] = [];
  itemData: any[] = [];
  filteredItems: any[] = [];

  itemsFormControl = new FormControl([]);
  branchplantsFormControl = new FormControl([]);
  customersFormControl = new FormControl([]);  // order created user
  CustomersFormControl = new FormControl([]);  // customers

  form: FormGroup;

  statusList: Array<any> = STATUS;
  orderStatusList: Array<any> = ORDER_STATUS_ADVANCE_SEARCH;

  keyUp = new Subject<string>();
  domain = window.location.host;
  settings = {};
  private subscriptions: Subscription[] = [];

  constructor(
    private detChange: ChangeDetectorRef,
    private apiService: ApiService,
    private ms: MasterService
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('order'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      order_no: new FormControl(),
      customer_id: new FormControl(),
      channel_name: new FormControl(),
      status: new FormControl(),
      customer_lpo: new FormControl(),
      delivery_start_date: new FormControl(),
      delivery_end_date: new FormControl(),
      item_id: new FormControl(),
      user_created: new FormControl(),
      storage_location_id: new FormControl(),
    });

    // Load items
    this.subscriptions.push(
      this.ms.itemDetailDDllistTable({ page: 1, page_size: 10 }).subscribe((result: any) => {
        this.itemData = result.data;
        this.filteredItems = result.data;
        this.prefillFormIfReady();
      })
    );

    // Load channels
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
      this.prefillFormIfReady();
    });

    this.settings = {
      classes: "myclass custom-class",
      enableSearchFilter: true,
      badgeShowLimit: 2,
      maxHeight: 141,
      autoPosition: false,
      position: 'bottom',
      searchBy: ['item_code', 'item_name'],
      singleSelection: true
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.items?.currentValue !== changes.items?.previousValue) {
      this.filteredItems = [...this.items].map(i => ({ id: i.id, itemName: i.item_code + ' - ' + i.item_name }));
    }

    if ((changes.customers || changes.orderCreatedUser || changes.storageLocation) &&
        this.initialCriteria && Object.keys(this.initialCriteria).length > 0) {
      this.prefillFormIfReady();
    }
  }

  private ensureArray(value: any) {
    return Array.isArray(value) ? value : value !== undefined && value !== null ? [value] : [];
  }

  /** Prefill only when all inputs and dropdowns are ready */
  private prefillFormIfReady() {
    if (!this.initialCriteria) return;

    if (this.customers?.length && this.storageLocation?.length && this.orderCreatedUser?.length && this.channelList?.length && this.filteredItems?.length) {
      this.prefillForm(this.initialCriteria);
    }
  }

  private prefillForm(criteria: any) {
    // Patch primitive fields
    this.form.patchValue({
      module: criteria.module || 'order',
      startdate: criteria.startdate || null,
      enddate: criteria.enddate || null,
      order_no: criteria.order_no || null,
      customer_lpo: criteria.customer_lpo || null,
      delivery_start_date: criteria.delivery_start_date || null,
      delivery_end_date: criteria.delivery_end_date || null,
    });

    // Customers
    if (criteria.customer_id) {
      // Map customers to {id, itemName: 'customer_code firstname lastname'}
      const mappedCustomers = this.customers.map(c => ({
        id: c.id,
        itemName: (c.customer_code ? c.customer_code + ' ' : '') + (c.firstname || c.first_name || '') + (c.lastname || c.last_name ? ' ' + (c.lastname || c.last_name) : '')
      }));
      const ids = this.ensureArray(criteria.customer_id).map(String);
      const selected = mappedCustomers.filter(c => ids.includes(String(c.id)));
      this.CustomersFormControl.setValue(selected);
      this.form.patchValue({ customer_id: selected.map(c => c.id) });
    }

    // Items
    if (criteria.item_id) {
      // Map items to {id, itemName: 'item_code - item_name'}
      const mappedItems = this.filteredItems.map(i => ({
        id: i.id,
        itemName: (i.item_code ? i.item_code + ' - ' : '') + (i.item_name || '')
      }));
      const ids = this.ensureArray(criteria.item_id).map(String);
      const selected = mappedItems.filter(i => ids.includes(String(i.id)));
      this.itemsFormControl.setValue(selected);
      this.form.patchValue({ item_id: selected.map(i => i.id) });
    }

    // Created users
    if (criteria.user_created) {
      // Map orderCreatedUser to {id, itemName: 'code firstname lastname'}
      const mappedUsers = this.orderCreatedUser.map(u => ({
        id: u.id,
        itemName: (u.code ? u.code + ' ' : '') + (u.firstname || u.first_name || '') + (u.lastname || u.last_name ? ' ' + (u.lastname || u.last_name) : '')
      }));
      const ids = this.ensureArray(criteria.user_created).map(String);
      const selected = mappedUsers.filter(u => ids.includes(String(u.id)));
      this.customersFormControl.setValue(selected);
      this.form.patchValue({ user_created: selected.map(u => u.id) });
    }

    // Branch plants
    if (criteria.storage_location_id) {
      const ids = this.ensureArray(criteria.storage_location_id).map(String);
      const selected = this.storageLocation.filter(l => ids.includes(String(l.id)) || ids.includes(String(l.storage_location_id)));
      this.branchplantsFormControl.setValue(selected);
      this.form.patchValue({ storage_location_id: selected.map(l => l.id) });
    }

    // Channels
    if (criteria.channel_name) {
      // Map channels to {id, itemName: channel_name}
      const mappedChannels = this.channelList.map(ch => ({
        id: ch.id,
        itemName: ch.channel_name || ch.name || ''
      }));
      const ids = this.ensureArray(criteria.channel_name).map(String);
      const selected = mappedChannels.filter(ch => ids.includes(String(ch.id)));
      this.form.patchValue({ channel_name: selected.map(ch => ch.id) });
    }

    // Status
    if (criteria.status) {
      this.form.patchValue({ status: this.ensureArray(criteria.status).map(String) });
    }

    this.detChange.detectChanges();
  }

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
    const ids = (this.itemsFormControl.value || []).map((i: any) => i.id);
    this.form.patchValue({ item_id: ids });
  }

  resetForm() {
    if (this.form) {
      this.form.reset();
      this.itemsFormControl.reset();
      this.branchplantsFormControl.reset();
      this.customersFormControl.reset();
      this.CustomersFormControl.reset();
    }
  }
}
