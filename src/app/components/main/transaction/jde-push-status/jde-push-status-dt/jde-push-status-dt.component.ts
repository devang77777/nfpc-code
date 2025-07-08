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
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { SelectionModel } from '@angular/cdk/collections';
import { OrderModel} from 'src/app/components/main/transaction/orders/order-models'
import { PushStatusFailComponent } from '../push-status-fail/push-status-fail.component';
import { JdePushStatusService } from '../jde-push-status.service';
@Component({
  selector: 'app-jde-push-status-dt',
  templateUrl: './jde-push-status-dt.component.html',
  styleUrls: ['./jde-push-status-dt.component.scss']
})
export class JdePushStatusDtComponent implements OnInit {
  passData : any;
  selectedCode: any ;
  selectedDate: any ;
  showExportButton: boolean = false;
  // isExpansionDetailRow = (i: number, row: any) => row === this.expandedRow;
  // isExpansionDetailRow = (index: number, row: any): boolean => row.hasOwnProperty('isExpandedRow');
  // isExpansionDetailRow = (i: number, row: any) => row.isExpandedRow === true;
  isExpansionDetailRow = (index: number, row: any) => {
  return row === this.expandedElement;
};
  isExpansionDriverlRow = (index: number, row: any) => {
  return row === this.openDriverElement;
};
  isExpansionRouteRow = (index: number, row: any) => {
  return row === this.openRouteCodeElement;
};
// isExpansionDetailRow = (index: number, row: any): boolean => {
//   return row === this.expandedRow;
// };
expandedRow: any;
  // expandedRow: any = null;
    mainDisplayedColumns: string[] = ['customerCode'];
  mainDataSource = [
    { customer_code: 'CUST001', id: 1 },
    { customer_code: 'CUST002', id: 2 }
  ];
  salesmanList = [];
 list:any = []
  public expandedElement: any | null = null;
  public openDriverElement: any | null = null;
  public openRouteCodeElement: any | null = null;
  cus_id: any= [];
   @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
    public selections = new SelectionModel(true, []);
  editingElement: any = null;
  selectedColumnFilter: string;
  filterForm: FormGroup;
  isColumnFilter = false;
  vehiclesList = [];
  warehouseList: any = [];
  channelList: any = [];
  status_list: any = [];
  divisionList = [];
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
  public jdePushStatusDataSource: MatTableDataSource<any>;
  public jdePushStatusSalesmanDataSource: MatTableDataSource<any>;
  public expandedDataSource: MatTableDataSource<any>;
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
  public date : any =[]
  public salesman_code : any =[]
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
  @ViewChild('activePriceCustomerPaginator') activePriceCustomerPaginator: MatPaginator;
  @ViewChild('jdePushStatusDatePaginator') jdePushStatusDatePaginator: MatPaginator;
  @ViewChild('jdePushStatusSalesmanPaginator') jdePushStatusSalesmanPaginator: MatPaginator;
  displayedColumns: string[] = ['name', 'status', 'action'];
   customerDisplayedColumns2: string[] = ['customerCode','customerName','itemCode','itemDesc','uom']
  //  expandedDisplayedColumns: string[] = ['customerName', 'itemCode', 'itemDesc'];
  expandedDisplayedColumns: string[] = ['expandedRow'];
  expandedColumns: string[] = ['trxDate','driverCode','invoiceNumber','invoiceType','status']
    detailDisplayedColumns: string[] = ['trxDate', 'driverCode',  'totalOrders','pushed','inQueue','failed'];
    detailRouteCodeColumns: string[] = ['trxDate', 'salesOrgCode', 'routesCode', 'trxCode','trxType','jdePushStatus'];
  constructor(  public fb: FormBuilder,private api: ApiService, private detChange: ChangeDetectorRef, private masterService: MasterService, private router: Router, private dialog: MatDialog,private modalService: JdePushStatusService
  ) {
   }

  ngOnInit(): void {
    // this.toggleRow();
    // console.log("line number 574 pass the data:",this.passData)
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
      salesman: new FormControl(),
      division  : new FormControl(),
      warehouse : new FormControl(),
      channel_code: new FormControl(),
      page: new FormControl(this.page),
      page_size: new FormControl(this.pageSize),

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
        this.customers = res.data;
        this.filterCustomer = res.data.slice(0, 30);
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
    this.selectedTabChange(this.selectedIndex);
     this.api.getLobs().subscribe(lobs => {
      this.divisionList = lobs.data;
    });
     this.api.getMasterDataLists().subscribe((result: any) => {
      this.customers = result.data.customers;
      this.customerList = result.data.customers;
      for (let customer of this.customerList) {
        customer['customer_name'] = `${customer.customer_info.customer_code} - ${customer.firstname} ${customer.lastname}`;
        customer['id'] = customer?.customer_info.user_id;
      }
      // this.regionList = result.data.region;
      // this.routeList = result.data.route;
      // this.itemCategoryList = result.data.item_major_category_list;
      this.salesmanList = result.data.salesmans;
      this.filterItem = [...result.data.items];
      // this.itemList = result.data.items.map(i => {
      //   return { id: i.id, itemName: i.item_code + ' - ' + i.item_name }
      // })
      // this.createdUserList = result.data.order_created_user;
      for (let salesman of this.salesmanList) {
        salesman['salesman_name'] = `${salesman.salesman_info.salesman_code} - ${salesman.firstname} ${salesman.lastname}`;
      }
    });

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
    this.filterCustomer = this.customers
      .filter((x: any) =>
        x.customer_code?.toLowerCase().trim().indexOf(this.filterValue) > -1
        || x.name?.toLowerCase().trim().indexOf(this.filterValue) > -1)
  }
  showCustomerActiveList() {
    let value = this.activeCustomerPriceForm.value;
     const sideFilterValue = this.sideFiltersForm.value;
    let body = {
      salesman_id:  this.sideFiltersForm.value.salesman.length > 0 ? this.sideFiltersForm.value.salesman.map(i => i.id) : [],
      channel_id: this.sideFiltersForm.value.channel_code.length > 0 ? this.sideFiltersForm.value.channel_code.map(i => i.id) : [],
      division_id: this.sideFiltersForm.value.division.length > 0 ? this.sideFiltersForm.value.division.map(i => i.id) : [],
      warehouse_id: this.sideFiltersForm.value.warehouse.length > 0 ? this.sideFiltersForm.value.warehouse.map(i => i.id) : [],
      page: value.page,
      page_size: value.page_size,
      start_date: value.start_date,
      end_date: value.end_date,
      "export": 0,
    };
    // pricing_status: this.sideFiltersForm.get('price_status').value
    this.api.getJdePushStatus(body).subscribe(res => {
      this.date = res.data.map(item => item.date);


      this.apiResponse = res;
      this.activeCustomerPriceDataSource = new MatTableDataSource<any>(res.data);
      this.activeCustomerPriceDataSource.paginator = this.activePriceCustomerPaginator;
    });
    this.showExportButton = true;
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
   
     this.selectedIndex === 1 
      this.activeCustomerPriceForm.patchValue({
        page: this.page,
        page_size: this.pageSize
      });
       this.showCustomerActiveList();
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
 
 
  public checkFormValidation(target: string = null): boolean {
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
  }
  OnItemDeSelect(item: any) {
  
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
  }

startEdit(element: any) {
  this.editingElement = element;
}

stopEdit() {
  this.editingElement = null;
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
      
    return null
  }
   public toggleSelection(): void {
    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));
  }
  
  
   filterVehicles() {
   
      this.vehiclesList = [];
      this.api.getAllVans().subscribe((response) => {
        response.data.forEach(element => {
          this.vehiclesList.push({ id: element.id, name: element.description + '-' + element.van_code })
        });
      });
    
  }



    filterWarehouse() {
    var divisions = this.sideFiltersForm.get('division').value.length > 0 ? this.sideFiltersForm.get('division').value.map(x => x.id) : [];
    this.api.getWarehouse(divisions).subscribe(x => {
      this.warehouseList = x.data;
      this.warehouseList.forEach(element => {
        element.name = element.code + '-' + element.name;
      });
    });
  }



toggleRow(element: any): void {
  if (this.expandedElement === element) {
    this.expandedElement = null;
    this.openDriverElement = null;
    this.openRouteCodeElement = null;
  } else {
    this.expandedElement = element;
    this.openDriverElement = null;
    this.openRouteCodeElement = null;
    this.scrollToExpandedRow();
  }

   this.selectedDate = element.date;

  let value = this.activeCustomerPriceForm.value;
  const sideFilterValue = this.sideFiltersForm.value;

  let body = {
    date: this.selectedDate,
    "export": 0,
  };

    console.log('the payload date is:',this.selectedDate)
   this.api.getJdePushStatusByDate(body).subscribe(res => {
      this.salesman_code = res.data.map(item => item.salesman_code);
      // this.apiResponse = res;
      this.jdePushStatusDataSource = new MatTableDataSource<any>(res.data);
      this.jdePushStatusDataSource.paginator = this.jdePushStatusDatePaginator;
    });
}
toggleFunction(element: any,detail: any): void {
  const isSameRowClicked = this.openDriverElement === element;
  if (this.openDriverElement === element) {
    this.openDriverElement = element;
  } else {
    this.openDriverElement = element;
    this.scrollToExpandedRow();
    setTimeout(() => this.scrollToExpandedRow(), 250);
  }
   
 
  console.log("Button is clicked")
   const selectedDate = element.date;
   this.selectedCode = detail.salesman_code;

  let value = this.activeCustomerPriceForm.value;
  const sideFilterValue = this.sideFiltersForm.value;

  let body = {
    date: selectedDate,
    salesman_code: this.selectedCode,
    "export": 0,
  };
  
    // console.log('the payload date is:',selectedCode)
   this.api.getJdePushStatusBySalesman(body).subscribe(res => {
        
      // this.apiResponse = res;
      this.jdePushStatusSalesmanDataSource = new MatTableDataSource<any>(res.data);
      this.jdePushStatusSalesmanDataSource.paginator = this.jdePushStatusSalesmanPaginator;
    });
}



scrollToExpandedRow(): void {
  this.detChange.detectChanges();
  setTimeout(() => {
    const el = document.querySelector('.expanded-row-content');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Extra scroll offset (e.g., scroll up 100px more)
      setTimeout(() => {
        window.scrollBy({ top: -200, behavior: 'smooth' });
      }, 300); // Delay allows initial scrollIntoView to finish
    }
  }, 100);
}

 exportDateWiseTotalInvoice(){
  let type = 'file.csv';
   let value = this.activeCustomerPriceForm.value;
   let body = {
      salesman_id:  this.sideFiltersForm.value.salesman.length > 0 ? this.sideFiltersForm.value.salesman.map(i => i.id) : [],
      channel_id: this.sideFiltersForm.value.channel_code.length > 0 ? this.sideFiltersForm.value.channel_code.map(i => i.id) : [],
      division_id: this.sideFiltersForm.value.division.length > 0 ? this.sideFiltersForm.value.division.map(i => i.id) : [],
      warehouse_id: this.sideFiltersForm.value.warehouse.length > 0 ? this.sideFiltersForm.value.warehouse.map(i => i.id) : [],
      page: value.page,
      page_size: value.page_size,
      start_date: value.start_date,
      end_date: value.end_date,
      "export": 1,
    };
    // pricing_status: this.sideFiltersForm.get('price_status').value
    this.api.exportJdePushStatus(body).subscribe(
        (result: any) => {
          if (result.status) {
            this.api.downloadFile(result.data.file_url,'csv');
          }
        }
      );
      
 }
 exportSalesmanDateWiseTotalInvoice(element: any){
  const selectedDate = element.date;
   let body = {
    date: selectedDate,
    "export": 1,
  };

    // console.log('the payload date is:',selectedCode)
   this.api.exportJdePushStatusByDate(body).subscribe(
        (result: any) => {
          if (result.status) {
            this.api.downloadFile(result.data.file_url,'csv');
          }
        }
      );
 }
 exportSalesmanAndDateWiseTotalInvoice(element: any){
 const selectedDate = element.date;
  //  const selectedCode = detail.salesman_code;
  let body = {
    date: selectedDate,
    salesman_code: this.selectedCode,
    "export": 1,
  };
  
    // console.log('the payload date is:',selectedCode)
   this.api.exportJdePushStatusBySalesman(body).subscribe(
        (result: any) => {
          if (result.status) {
            this.api.downloadFile(result.data.file_url,'csv');
          }
        }
      );
 }

//  onStatusFailed(){
// //    // Replace 'YourDialogComponent' with the actual component you want to open
// //    this.dialog.open(onStatusFailed(), {
// //       width: '95vw',
// //       height: '95vh',
// //       maxWidth: '95vw !important',
// //       maxHeight: '95vh !important',
// //       disableClose: true
// //     });
//   }
 
   openTotalCreditSalesDialogue(id: any) {
    this.onStatusFailed(id)
  }

  onStatusFailed(rowData: any) {
   const selectedDate = rowData?.date;

  const body = {
    date: selectedDate,
    export: 0
  };
  this.modalService.setModal(body)
    this.dialog.open(PushStatusFailComponent, {
      data: body,
      width: '95vw',
      height: '95vh',
      maxWidth: '95vw !important',
      maxHeight: '95vh !important',
      disableClose: true
    });
  }
}
