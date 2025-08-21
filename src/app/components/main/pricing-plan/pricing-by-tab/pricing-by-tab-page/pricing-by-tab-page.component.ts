import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef, Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, Validators,FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, Subject, of } from 'rxjs';
import { Customer } from '../../../transaction/collection/collection-models';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, mergeMap, delay } from 'rxjs/operators';
import { MasterService } from '../../../master/master.service';
import { Router } from '@angular/router';
import { ExportDialogComponent } from '../../../master/export-dialog/export-dialog.component';
import { PricingExportComponent } from '../pricing-export/pricing-export.component';
import { CustomerPricingExportComponent } from '../customer-pricing-export/customer-pricing-export.component';
import { ActiveCustomerPricingExportComponent } from '../active-customer-pricing-export/active-customer-pricing-export.component';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { id } from 'date-fns/locale';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { SelectionModel } from '@angular/cdk/collections';
import { OrderModel} from 'src/app/components/main/transaction/orders/order-models'
import { ActiveCustomerPricingImportComponent } from '../active-customer-pricing-import/active-customer-pricing-import.component';
@Component({
  selector: 'app-pricing-by-tab-page',
  templateUrl: './pricing-by-tab-page.component.html',
  styleUrls: ['./pricing-by-tab-page.component.scss']
})

export class PricingByTabPageComponent implements OnInit {
  today: string = new Date().toISOString().split('T')[0];
  list:any = []
   showPopUp = false
  statusOptions = [
  { id: '1', name: 'Active' },
  { id: '2', name: 'In-Active' },
  { id: '3', name: 'Both' }
];
  cus_id: any= [];
   @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
    public selections = new SelectionModel(true, []);
  editingElement: any = null;
  selectedColumnFilter: string;
  filterForm: FormGroup;
  isColumnFilter = false;
//   public filterColumns: ColumnConfig[] = [];
// public customerDisplayedColumns: ColumnConfig[] = [
//     { def: 'customerCode', title: 'Customer Code', show: true },
//     { def: 'customerName', title: 'Customer Name', show: true },
//     { def: 'itemCode', title: 'Item Code', show: true },
//     { def: 'itemDesc', title: 'Item Desc', show: true },
//     { def: 'uom', title: 'Uom', show: true },
//     { def: 'basePrice', title: 'Base Price', show: true },
//     { def: 'discountPrice', title: 'Discount Price', show: true },
//     { def: 'modifiedDate', title: 'Modified Date', show: true },

//     { def: 'customerPrice', title: 'Customer Price', show: true },
//     { def: 'startDate', title: 'Start Date', show: true },
//     { def: 'endDate', title: 'End Date', show: true },
//     { def: 'primaryKey', title: 'Primary Key', show: true },
//   ];
// public displayedColumnDefs: string[] = this.customerDisplayedColumns.map(c => c.def);

  warehouseList: any = [];
  channelList: any = [];
  status_list: any = [];
  
  sideFiltersForm;
  customerForm;
  activeCustomerPriceForm;
  activeCustomerUpdateEndDatePriceForm;
  selectedItems = [];
  settings = {};
  activeCustomerSettings = {};
  itemfilterValue = '';
  public filterItem = [];
  customerList: any = [];
  items: any = [];
  public dataSource: MatTableDataSource<any>;
  public customerDataSource: MatTableDataSource<any>;
  public activeCustomerPriceDataSource: MatTableDataSource<any>;
  public updateEndDatePriceDataSource: MatTableDataSource<any>;
  public customerFormControl: FormControl;
  public statusFormControl: FormControl;
  public channelFormControl: FormControl;
  keyUp = new Subject<string>();
  channelKeyUp = new Subject<string>();
  
  public filterCustomer: Customer[] = [];
  // public filterChannel: Channel[] = [];
  
  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];
  // public page = 0;
  filterValue = '';
  public isEditForm: boolean;
  public is_lob: boolean = false;
  public selectedPaymentTermId: number;
  customerLobList = [];
  channelIdList : any;
  public lookup$: Subject<any> = new Subject();
  selectedIndex = 0;
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  // @ViewChild(MatPaginator, { static: true }) customerPaginator: MatPaginator;
  // @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('customerPaginator') customerPaginator: MatPaginator;
  @ViewChild('basePricePaginator') basePricePaginator: MatPaginator;
  @ViewChild('activePriceCustomerPaginator') activePriceCustomerPaginator: MatPaginator;
  @ViewChild('updateEndDateCustomerPaginator') updateEndDateCustomerPaginator: MatPaginator;

  // public columns: any[] = [
  //   { field: 'Item', value: 'item' },
  //   { field: 'Branchplant', value: 'branchplant' },
  //   { field: 'UOM', value: 'uom' },
  //   { field: 'Price', value: 'price' },
  //   { field: 'Start Date', value: 'start_date' },
  //   { field: 'End Date', value: 'end_date' },  'exciseTax','modifiedDate',
  // ];
  displayedColumns: string[] = ['item', 'branchplant', 'uom','channel', 'price', 'startDate', 'endDate'];
  customerDisplayedColumns: string[] = ['customerCode','customerName','itemCode','itemDesc','uom', 'basePrice', 'discountPrice','customerPrice', 'startDate', 'endDate','primaryKey']
   customerDisplayedColumns2: string[] = ['customerCode','customerName','itemCode','itemDesc','uom', 'basePrice', 'discountPrice','exciseTax','customerPrice', 'startDate', 'endDate','primaryKey','modifiedDate','modifyBy','status']
   customerDisplayedColumns3: string[] = ['customerCode','customerName','itemCode','itemDesc','uom', 'basePrice', 'discountPrice','exciseTax','customerPrice', 'startDate', 'endDate','primaryKey','modifiedDate','modifyBy','status']
  constructor(  public fb: FormBuilder,private api: ApiService, private detChange: ChangeDetectorRef, private masterService: MasterService, private router: Router, private dialog: MatDialog
  ) {
   }

  ngOnInit(): void {
    // this.customerDisplayedColumns = [...this.customerDisplayedColumns];
    // this.displayedColumns = this.allColumns;
    // this.filterColumns = [...[...this.allColumns].splice(2)];
    this.filterForm = this.fb.group({
      order_number: [''],
      branch_plant_code: [''],
      customer_code: [''],
      customer_lpo: [''],
      date: [''],
      due_date: [''],
      delivery_date: [''],
      current_stage: [''],
      customer_name: [''],
      channel_name: [[]],
      created_id: [''],
      route_code: [''],
      route_name: [''],
      salesman_code: [''],
      salesman: [''],
      page: [this.page],
      page_size: [this.pageSize],
      approval_status: [''],
      invoice_number: [''],
      // status: ['both'],
      //  price_status: ['both'],
    });
    this.getChannelList();
    console.log(this.channelIdList)
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
    this.activeCustomerSettings = {
      classes: "myclass custom-class",
      enableSearchFilter: true,
      badgeShowLimit: 2,
      maxHeight: 141,
      autoPosition: false,
      position: 'bottom',
      searchBy: ['item_code', 'item_name'],
      singleSelection: false
    };
    this.sideFiltersForm = new FormGroup({
      item_code: new FormControl([]),
      uom_code: new FormControl(),
      warehouse_code: new FormControl(),
      channel_code: new FormControl(),
      page: new FormControl(this.page),
      page_size: new FormControl(this.pageSize),
      price_status: new FormControl([{ id: '1', name: 'Active' }],Validators.required) 

    });
    this.customerForm = new FormGroup({
      channel_code: new FormControl(),
      key: new FormControl(),
      page: new FormControl(this.page),
      page_size: new FormControl(this.pageSize)
    });
    this.activeCustomerPriceForm = new FormGroup({
      channel_code: new FormControl(),
      item_code: new FormControl([]),
      uom_code: new FormControl(),
      key: new FormControl(),
      page: new FormControl(this.page),
      page_size: new FormControl(this.pageSize),
      start_date: new FormControl(),
      end_date: new FormControl(),
      created_date: new FormControl(),
    });
    this.activeCustomerUpdateEndDatePriceForm = new FormGroup({
      channel_code: new FormControl(),
      item_code: new FormControl([]),
      uom_code: new FormControl(),
      key: new FormControl(),
      page: new FormControl(this.page),
      page_size: new FormControl(this.pageSize),
      start_date: new FormControl(),
      end_date: new FormControl(),
      created_date: new FormControl(),
    });
  this.customerFormControl = new FormControl('', [Validators.required]);
    this.channelFormControl = new FormControl('', [Validators.required]);
    this.statusFormControl = new FormControl('', [Validators.required]);
    this.api.getMasterDataLists().subscribe((result: any) => {
      this.filterItem = [...result.data.items];
      this.items = result.data.items.map(i => {
        return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
      })
      this.warehouseList = result?.data?.storage_location;
    });
    this.api.customerDetailDDlListTable({}).subscribe((result) => {
      this.customers = result.data;
      this.filterCustomer = result.data.slice(0, 30);
      // this.filterChannel = result.data.slice(0, 30);
    })
    this.lookup$
      .pipe(exhaustMap(() => {
        return this.masterService.customerDetailDDlListTable({ search: this.filterValue.toLowerCase() })

        // return this.masterService.customerDetailListTable({ name: this.filterValue.toLowerCase(), page: this.page, page_size: this.page_size })
      }))
      .subscribe(res => {
        // this.isLoading = false;
        this.customers = res.data;
        this.filterCustomer = res.data.slice(0, 30);
        // this.filterChannel = res.data.slice(0, 30);
        // if (this.filterValue == "") {
        //   if (this.page > 1) {
        //     this.customers = [...this.customers, ...res.data];
        //     this.filterCustomer = [...this.filterCustomer, ...res.data];
        //   } else {
        //     this.customers = res.data;
        //     this.filterCustomer = res.data;
        //   }
        //   this.page++;
        //   this.total_pages = res?.pagination?.total_pages;
        // } else {
        //   this.page = 1;
        //   this.customers = res.data;
        //   this.filterCustomer = res.data;
        // }

      })
    this.keyUp.pipe(
      map((event: any) => event.target.value),
      debounceTime(1000),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(100),
      )),
    ).subscribe(res => {
      if (!res) {
        res = '';
      }
      this.filterCustomers(res);
      
    });


    // this.channelKeyUp.pipe(
    //   map((event: any) => event.target.value),
    //   debounceTime(1000),
    //   distinctUntilChanged(),
    //   mergeMap(search => of(search).pipe(
    //     delay(100),
    //   )),
    // ).subscribe(res => {
    //   if (!res) {
    //     res = '';
    //   }
    //   this.filterCustomers(res);
      
    // });
   
    
    this.selectedTabChange(this.selectedIndex);


  }

  selectedTabChange(index) {
    this.selectedIndex = index;
  }

  getChannelList(){
    this.api.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
  }


  filterCustomers(customerName: string) {
    this.page = 1;
    this.filterValue = customerName.toLowerCase().trim() || "";
    // this.customers = [];
    this.filterCustomer = this.customers
      .filter((x: any) =>
        x.customer_code?.toLowerCase().trim().indexOf(this.filterValue) > -1
        || x.name?.toLowerCase().trim().indexOf(this.filterValue) > -1)


    // this.filterCustomer = [];
    // this.isLoading = true
    // this.lookup$.next(this.page)
  }
  

 
  

  showOrder() {
    let value = this.sideFiltersForm.value;
    let body = {
      warehouse_code: value.warehouse_code?.length > 0 ? value?.warehouse_code[0]?.id : 0,
      // channel_id: [[value.channel_code?.length > 0 ? value?.channel_code[0]?.id:0]],
      channel_id: value.channel_code.length > 0 ? value.channel_code.map(i => i.id) : [],
      uom_code: value.uom_code,
      item_code: value.item_code?.length > 0 ? value?.item_code[0]?.id : 0,
      page: value.page,
      page_size: value.page_size
      // customer_name: this.customerFormControl.value?.name,
      // customer_code: this.customerFormControl.value?.customer_code
    };
    this.api.getPricingByItem(body).subscribe(res => {
      this.apiResponse = res;
      this.dataSource = new MatTableDataSource<any>(res.data);
      this.dataSource.paginator = this.basePricePaginator;
    });
  }

  showCustomer() {
    let value = this.sideFiltersForm.value;
    let body = {
      // warehouse_code: value.warehouse_code?.length > 0 ? value?.warehouse_code[0]?.id : 0,
      uom_code: value.uom_code,
      item_code: value.item_code?.length > 0 ? value?.item_code[0]?.id : 0,
      channel_id: value.channel_code.length > 0 ? value.channel_code.map(i => i.id) : [],
      // item_code: value.item_code?.length > 0 ? value?.item_code[0]?.id : 0,
      customer_name: this.customerFormControl.value?.name,
      customer_code: this.customerFormControl.value?.customer_code,
      customer_id: this.customerFormControl.value?.id,
      key: this.customerForm.value.key,
      page: value.page,
      page_size: value.page_size
    };
    this.api.getPricingByCustomer(body).subscribe(res => {
      this.apiResponse = res;
      this.customerDataSource = new MatTableDataSource<any>(res.data);
      this.customerDataSource.paginator = this.customerPaginator;
    });
  }
 
  
  showCustomerActiveList() {
    let value = this.activeCustomerPriceForm.value;
     const sideFilterValue = this.sideFiltersForm.value;

  const statusMap = {
    '1': 'active',
    '2': 'inactive',
    '3': 'both'
  };

  const selectedStatusObj = sideFilterValue.price_status?.[0];
  const statusLabel = selectedStatusObj?.id ? statusMap[selectedStatusObj.id] : 'active';
    // this.status_list = this.statusOptions
    let body = {
      uom_code: value.uom_code,
    //  item_code: this.sideFiltersForm.value.item_code?.length > 0 ? this.sideFiltersForm.value?.item_code[0]?.id : [],
    item_code: this.sideFiltersForm.value.item_code?.length > 0 
  ? [this.sideFiltersForm.value.item_code[0]?.id] 
  : [],

    //  item_code: [138],
      // channel_id: this.sideFiltersForm.value.channel_code[0]?.id,
      channel_id: this.sideFiltersForm.value.channel_code.length > 0 ? this.sideFiltersForm.value.channel_code.map(i => i.id) : [],
      customer_name: this.customerFormControl.value?.name,
      customer_code: this.customerFormControl.value?.customer_code,
      customer_id: this.customerFormControl.value?.id,
      key: this.activeCustomerPriceForm.value.key,
      page: value.page,
      page_size: value.page_size,
      start_date: value.start_date,
      end_date: value.end_date,
      created_date: value.created_date,
      //  price_status: this.sideFiltersForm.value.price_status,
      price_status: statusLabel,  
       export: 1
    };
    // pricing_status: this.sideFiltersForm.get('price_status').value
    this.api.getActiveCustomer(body).subscribe(res => {
        
      this.apiResponse = res;
      this.activeCustomerPriceDataSource = new MatTableDataSource<any>(res.data);
      this.activeCustomerPriceDataSource.paginator = this.activePriceCustomerPaginator;
    });
  }

   showUpdateEndDate() {
    let value = this.activeCustomerUpdateEndDatePriceForm.value;
     const sideFilterValue = this.sideFiltersForm.value;

  const statusMap = {
    '1': 'active',
    '2': 'inactive',
    '3': 'both'
  };

  const selectedStatusObj = sideFilterValue.price_status?.[0];
  const statusLabel = selectedStatusObj?.id ? statusMap[selectedStatusObj.id] : 'active';
    // this.status_list = this.statusOptions
    let body = {
      uom_code: value.uom_code,
    //  item_code: this.sideFiltersForm.value.item_code?.length > 0 ? this.sideFiltersForm.value?.item_code[0]?.id : [],
    item_code: this.sideFiltersForm.value.item_code?.length > 0 
  ? [this.sideFiltersForm.value.item_code[0]?.id] 
  : [],

    //  item_code: [138],
      // channel_id: this.sideFiltersForm.value.channel_code[0]?.id,
      channel_id: this.sideFiltersForm.value.channel_code.length > 0 ? this.sideFiltersForm.value.channel_code.map(i => i.id) : [],
      customer_name: this.customerFormControl.value?.name,
      customer_code: this.customerFormControl.value?.customer_code,
      customer_id: this.customerFormControl.value?.id,
      key: this.activeCustomerUpdateEndDatePriceForm.value.key,
      page: value.page,
      page_size: value.page_size,
      start_date: value.start_date,
      end_date: value.end_date,
      created_date: value.created_date,
      //  price_status: this.sideFiltersForm.value.price_status,
      price_status: statusLabel,  
       export: 1
    };
    // pricing_status: this.sideFiltersForm.get('price_status').value
    this.api.getActiveCustomer(body).subscribe(res => {
        
      this.apiResponse = res;
      this.updateEndDatePriceDataSource = new MatTableDataSource<any>(res.data);
      this.updateEndDatePriceDataSource.paginator = this.updateEndDateCustomerPaginator;
    });
  }
  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    if (this.selectedIndex === 0) {
      this.sideFiltersForm.patchValue({
        page: this.page,
        page_size: this.pageSize
      });
      this.showOrder();
    } else if (this.selectedIndex === 1) {
      this.customerForm.patchValue({
        page: this.page,
        page_size: this.pageSize
      });
      this.showCustomer();
    } else if (this.selectedIndex === 2) {
      this.activeCustomerPriceForm.patchValue({
        page: this.page,
        page_size: this.pageSize
      });
       this.showCustomerActiveList();
    }else if (this.selectedIndex === 3) {
      this.activeCustomerUpdateEndDatePriceForm.patchValue({
        page: this.page,
        page_size: this.pageSize
      });
       this.showUpdateEndDate();
      
     
    }

  }
  onScroll() {

    var totalPages = this.customers.length / 30;
    if (this.filterCustomer.length == this.customers.length) return;
    this.page = this.page + 30;
    var pageEndNumber = 30 + this.page;
    this.filterCustomer = [...this.filterCustomer, ...this.customers.slice(this.page, pageEndNumber)]

  }

  onChannelScroll(){
    var totalPages = this.channelIdList.length / 30;
    // if (this.filterChannel.length == this.customers.length) return;
    this.page = this.page + 30;
    var pageEndNumber = 30 + this.page;
    // this.filterCustomer = [...this.filterCustomer, ...this.customers.slice(this.page, pageEndNumber)]
  }
  
  getCustomerLobList(customer, editData?) {
    this.filterValue = "";
    let paymentTermId
    if (this.isEditForm && editData) {
      paymentTermId = editData?.payment_term_id;
    } else {
      paymentTermId = customer?.payment_term_id;
    }
    if (customer?.is_lob == 1 || editData?.lob) {
      this.is_lob = true;
      this.selectedPaymentTermId = paymentTermId
      // this.customerLobFormControl.setValidators([Validators.required]);
      // this.customerLobFormControl.updateValueAndValidity();
      this.api.getLobsByCustomerId(customer?.user_id).subscribe((result) => {
        this.customerLobList = result.data[0] && result.data[0]?.customerlob || [];
        if (editData) {
          // this.paymentTermFormControl.patchValue(this.selectedPaymentTermId);
          // let customerLob = [{ id: this.orderData?.lob_id, itemName: this.orderData?.lob?.name }];
          // this.customerLobFormControl.setValue(customerLob);
        } else {
          // this.showLob = true;
          // this.showWareHs = true;
          // this.customerLobFormControl.setValue([]);
          // this.warehouseFormControl.setValue([]);
        }
      });
    }
    else {
      this.is_lob = false;
      // this.customerLobFormControl.clearValidators();
      // this.customerLobFormControl.updateValueAndValidity();
      // this.selectedPaymentTermId = paymentTermId
      // this.paymentTermFormControl.patchValue(this.selectedPaymentTermId);
    }

  }
  
  

  
  public copyPricing() {
    if (this.selectedIndex === 1) {
      this.router.navigate(['pricing-plan/pricing', 'copy-pricing']).then();
    }
  }
  public exportCustomerPricing(type) {
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.api
      .exportCustomers({
        module: 'customer-based-price',
        criteria: 'all',
        start_date: '',
        end_date: '',
        file_type: type,
        is_password_protected: 'no',
        customer_id: this.customerFormControl.value?.id,
      })
      .subscribe(
        (result: any) => {
          if (result.status) {
            this.api.downloadFile(result.data.file_url, type);
          }
        }
      );
  }
  public exportActiveCustomerPricing(type) {
    let value = this.sideFiltersForm.value;
     const sideFilterValue = this.sideFiltersForm.value;

  const statusMap = {
    '1': 'active',
    '2': 'inactive',
    '3': 'both'
  };

  const selectedStatusObj = sideFilterValue.price_status?.[0];
  const statusLabel = selectedStatusObj?.id ? statusMap[selectedStatusObj.id] : 'active';
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.api
      .exportCustomers({
        module: 'customer-based-price-active',
        criteria: 'all',
        start_date: '',
        end_date: '',
        file_type: type,
        is_password_protected: 'no',
        customer_id: this.customerFormControl.value?.id,
        channel_id: value.channel_code.length > 0 ? value.channel_code.map(i => i.id) : [],
        // item_code: value.item_code?.length > 0 ? value?.item_code[0]?.id : 0,
         item_code: this.sideFiltersForm.value.item_code?.length > 0 
  ? [this.sideFiltersForm.value.item_code[0]?.id] 
  : [],
   price_status: statusLabel,  
        customer_code: this.customerFormControl.value?.customer_code,
        price_key: this.activeCustomerPriceForm?.value?.key,
        created_date: this.activeCustomerPriceForm?.value?.created_date,
      })
      .subscribe(
        (result: any) => {
          if (result.status) {
            this.api.downloadFile(result.data.file_url, type);
          }
        }
      );
  }
  public checkFormValidation(target: string = null): boolean {
    // if (this.orderTypeFormControl.invalid) {
    //   Utils.setFocusOn('typeFormField');
    //   return false;
    // }
    // if (!this.isDepotOrder && this.customerFormControl.invalid) {
    //   Utils.setFocusOn('customerFormField');
    //   return false;
    // }
    // if (!this.isDepotOrder && this.customerLobFormControl.invalid) {
    //   return false;
    // }
    // if (this.isDepotOrder && this.depotFormControl.invalid) {
    //   Utils.setFocusOn('depotFormField');
    //   return false;
    // }
    // if (target == 'orderDelivery') {
    //   if (!this.salesmanFormControl.value || this.salesmanFormControl.value.length == 0) {
    //     Utils.setFocusOn('salesmanFormField');
    //     return false;
    //   }
    // }
    // if (this.paymentTermFormControl.invalid) {
    //   Utils.setFocusOn('termFormField');
    //   return false;
    // }
    return true;
  }

  public customerControlDisplayValue(customer: any): string {
    if (customer?.user) {
      return `${customer?.user?.customer_info?.customer_code ? customer?.user?.customer_info?.customer_code : ''} ${customer?.user?.firstname ? customer?.user?.firstname + ' ' + customer?.user?.lastname : ''} `

    } else
      return `${customer?.customer_code ? customer?.customer_code : ''} ${customer?.name ? customer?.name : ''} `
  }

  public channelControlDisplayValue(channel: any): string {
    return channel?.name
  }
  
  onItemSelect(item: any) {
    // let items = this.sideFiltersForm.value;
    // this.sideFiltersForm.patchValue({
    //   item_id: items[0].id
    // });
    // console.log(this.sideFiltersForm);
  }
  OnItemDeSelect(item: any) {
    // e.log(item);
    // console.log(this.selectedItems);
  }
  onSelectAll(items: any) {

  }
  onDeSelectAll(items: any) {

  }
  exportPricing() {
    if (this.selectedIndex === 0) {
      const dialogRef = this.dialog.open(PricingExportComponent, {
        data: {
          module: 'customer-warehouse-mapping',
          title: 'Customer Branch Plant'
        }
      });
    } else if (this.selectedIndex === 1) {
      const dialogRef = this.dialog.open(CustomerPricingExportComponent, {
        data: {
          module: 'customer-warehouse-mapping',
          title: 'Customer Branch Plant'
        }
      });
    } else if (this.selectedIndex === 2) {
      const dialogRef = this.dialog.open(ActiveCustomerPricingExportComponent, {
        data: {
          module: 'customer-warehouse-mapping',
          title: 'Customer Branch Plant'
        }
      });
    }
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
  openImportPricing() {
    if (this.selectedIndex === 1) {
      this.router.navigate(['pricing-plan/pricing', 'import']).then();
    } else if (this.selectedIndex === 0) {
      this.router.navigate(['pricing-plan/pricing', 'item-import']).then();
    }else if (this.selectedIndex === 2) {
      // this.router.navigate(['pricing-plan/pricing', 'item-import']).then();
       const dialogRef = this.dialog.open(ActiveCustomerPricingImportComponent, {
        data: {
          module: 'customer-warehouse-mapping',
          title: 'Customer Branch Plant'
        }
      });
    }
  }
  resetFilter() {
    this.activeCustomerPriceForm.reset();
    this.sideFiltersForm.reset();
    this.customerFormControl.clearValidators();
    this.customerFormControl.updateValueAndValidity();
    this.customerFormControl.setValue('');
  }


  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item;
  }

  
  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.isColumnFilter = status;
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
      sessionStorage.clear();
    } else {
      this.isColumnFilter = status;
      this.filterForm.patchValue({
        page: this.page,
        page_size: this.pageSize
      });
      sessionStorage.setItem('columnfilter', JSON.stringify(this.filterForm.value));
    }
    this.showOrder();
  }
  // public getDisplayedColumns(): string[] {
  //   return this.displayedColumns
  //     .filter((column) => column.show)
  //     .map((column) => column.def);
  // }

startEdit(element: any) {
  this.editingElement = element;
}

stopEdit() {
  this.editingElement = null;
}

onEndDateChange(newValue: string, element: any) {
  element.end_date = newValue;

  const body = {
    customer_id: element.customer_id, // adjust keys as needed
    end_date: element.end_date
    // add other necessary fields here if required by the API
  };

  this.api.getActiveCustomer(body).subscribe(
    (res) => {
      this.apiResponse = res;
      this.updateEndDatePriceDataSource = new MatTableDataSource<any>(res.data);
      this.stopEdit(); // exit edit mode
    },
    (err) => {
      console.error('Failed to update end_date:', err);
      // optionally show a toaster error
    }
  );
}
public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

   public checkboxLabel(row?: OrderModel): string {
      if (!row) {
        return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
      }
      return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
        }`;
    }

     public isAllSelected(): boolean {
      
    // return this.selections.selected.length === this.dataSource.data.length;
    return null
  }
   public toggleSelection(): void {
    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));
  }
  
   openPopUp()
  {
    this.showPopUp = true
    
  }
  closePopUp()
{
  this.showPopUp = false
}

updateDate()
{
  this.api.updateCustomerDate({
    // "id":this.list.map((dt:any)=>dt.id),
    "id":(this.apiResponse as any)?.data?.map((dt:any)=>dt.id) || [],
    // "id": [486792],
   "end_date":this.updated_date
  }).subscribe((res)=>{
    this.showUpdateEndDate()
  this.showPopUp = false
  this.showCustomerActiveList();

  })
}

  importActiveCustomerPricing(){
    this.showPopUp = true
  }
  updated_date:any
}
