import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  OnChanges
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  OrderModel,
  ApiOrderModel,
  apiOrderMapper,
  OrderUpdateProcess,
  OrderUpdateProcessColor,
} from '../order-models';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import {
  APP_CURRENCY_CODE,
  CompDataServiceType,
} from 'src/app/services/constants';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MasterService } from '../../../master/master.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Utils } from 'src/app/services/utils';
import { OrderService } from '../order.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { DeliveryModel } from '../../delivery/delivery-model';
import { ORDER_STATUS, PAGE_SIZE_10, STATUS } from 'src/app/app.constant';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-order-data-table',
  templateUrl: './order-data-table.component.html',
  styleUrls: ['./order-data-table.component.scss'],
})
export class OrderDataTableComponent implements OnInit, OnDestroy, OnChanges {
  customerList: any[] = [];
  itemList: any[] = [];
  storageLocationList: any[] = [];
  // Display-mapped search criteria for UI only

  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public newOrderData: any = {};
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updatedOrder: EventEmitter<any> = new EventEmitter<any>();
  filteredChannels!: Observable<any[]>;
  public allResData = [];
  selectedColumnFilter: string;
  approvalStatusList: any;
  orderStatusList: any;
  advanceSearchRequest: any[] = [];
  channelList : any= [];
  createdByList: any = [];
  selectedChannelNames: string = '';
  sideFiltersForm;
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0,
    },
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  public dataSource: MatTableDataSource<OrderModel>;
  public filterObjectId: any = null;
  public orders: OrderModel[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public orderStatus = {
    color: '',
    label: '',
  };
  private router: Router;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'order_date', title: 'Order Date', show: true },
    { def: 'date', title: 'Created Date', show: true },
    { def: 'code', title: 'Order Number', show: true },
    { def: 'branch_plant_code', title: 'Branch Plant', show: true },
    { def: 'customer_code', title: 'Customer Code', show: true },
    { def: 'customer_lpo', title: 'Customer LPO', show: true },
    { def: 'name', title: 'Customer Name', show: true },
    { def: 'channel_name', title: 'Service Channel', show: true },

    // { def: 'salesman_code', title: 'Salesman Code', show: true },
    // { def: 'salesman_name', title: 'Salesman Name', show: true },
    { def: 'delivery_date', title: 'Delivery Date', show: true },
    // { def: 'due', title: 'Due Date', show: true },
    { def: 'invoice', title: 'Invoice', show: true },
    { def: 'amount', title: 'Amount', show: true },
    { def: 'approval', title: 'Approval', show: true },
    { def: 'created', title: 'Created By', show: true },
    { def: 'status', title: 'Status', show: true, showInfo: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'expand', title: 'Detail', show: true },
  ];
  requestOriginal: any;
  filterForm: FormGroup;
  isShowReasonModel = false;
  isColumnFilter = false;

  constructor(
    private orderService: OrderService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public fb: FormBuilder,
    private eventService: EventBusService,
    private routerParam: ActivatedRoute,
    private spinner: NgxSpinnerService,
    fds: FormDrawerService,
    deleteDialog: MatDialog,
    router: Router
  ) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog, router });
    this.dataSource = new MatTableDataSource<OrderModel>();
    this.approvalStatusList = STATUS;
    this.orderStatusList = ORDER_STATUS;
    // this.channelList = Channel;
  }

  public ngOnInit(): void {
    this.getChannelList();
    this.getCreatedByList();
    
    this.filterForm = this.fb.group({
      order_number: [''],
      branch_plant_code: [''],
      customer_code: [''],
      customer_lpo: [''],
      date: [''],
      order_date: [''],
      due_date: [''],
      delivery_date: [''],
      current_stage: [''],
      customer_name: [''],
      channel_name: [[]],
      created_id: [[]],
      name: [''],
      route_code: [''],
      route_name: [''],
      salesman_code: [''],
      salesman: [''],
      page: [this.page],
      page_size: [this.pageSize],
      approval_status: [''],
      invoice_number: ['']
    });
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...[...this.allColumns].splice(2)];
    this.getAllOrdersList();

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.GET_NEW_DATA) {
          this.filterObjectId = value.data?.id;
          this.getAllOrdersList();
          if (this.isDetailVisible) {
            let data = this.dataSource.data.find((element: any) => element.id == value.data.id)
            this.openDetailView(data);
          }
        }
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
          this.getAllOrdersList();
          this.selections = new SelectionModel(true, []);
        }
        if (value.uuid) {
          const clone = JSON.parse(JSON.stringify(this.orders));
          const index = clone.findIndex((x) => x.uuid === value.uuid);
          if (index > -1) {
            clone.splice(index, 1);
            this.orders = clone;
            this.dataSource.data = clone;
          }
        }
      })
    );

    // this.subscriptions.push(
    //   this.eventService.on(Events.SEARCH_ORDER, ({ request, correctRequest, requestOriginal, response }) => {
    //     this.advanceSearchRequest = [];
    //     this.requestOriginal = requestOriginal;
    //     if (request) {
    //       Object.keys(request).forEach(item => {
    //         Object.keys(correctRequest).forEach(correctItem => {
    //           if (request[item] == correctRequest[correctItem]) {
    //             this.advanceSearchRequest.push({ param: item, value: request[item], key: correctItem })
    //           }
    //         });
    //       });
    //     }
    //     this.apiResponse = response;
    //     this.allResData = response.data;
    //     this.updateDataSource(response.data);
    //   })
    // );
   this.subscriptions.push(
    
  this.eventService.on(
    Events.SEARCH_ORDER,
    ({ request, correctRequest, requestOriginal, response, criteria }) => {
      this.advanceSearchRequest = [];
      
      this.requestOriginal = requestOriginal;

      // show instantly if criteria was passed
      if (criteria) {
        this.advanceSearchRequest = criteria;
        // Patch the filter form with criteria values to pre-fill the form
        this.patchFilterFormWithCriteria(criteria);
      } else if (request) {
        // fallback if no criteria provided
        Object.keys(request).forEach(item => {
          // Only include fields that have meaningful values
          const value = request[item];
          if (value !== null && value !== undefined && value !== '' && 
              !(Array.isArray(value) && value.length === 0)) {
            Object.keys(correctRequest).forEach(correctItem => {
              if (request[item] == correctRequest[correctItem]) {
                this.advanceSearchRequest.push({
                  param: item,
                  value: request[item],
                  key: correctItem,
                });
              }
            });
          }
        });
      }
      this.advanceSearchRequest = this.advanceSearchRequest.filter(
        (item, index, self) =>
          index === self.findIndex(
            t => t.param === item.param && t.value === item.value
          )
      );
       
    
      // backend response comes later
      if (response) {
        this.apiResponse = response;
        this.allResData = response.data;
        this.updateDataSource(response.data);
      }
    }
  )
);


    this.checkOrderParamUuid();

    
  }
  advanceSearch() {
    this.apiService.onSearch(this.requestOriginal).subscribe((response) => {
      this.requestOriginal = this.requestOriginal;
      this.apiResponse = response;
      this.allResData = response.data;
      this.updateDataSource(response.data);
    });
  }
  checkOrderParamUuid() {
    this.routerParam.queryParams.subscribe(res => {
      this.isDetailVisible = false;
      let uuid = res["uuid"];
      if (uuid) {
        this.detailsClosed.emit();
        this.closeDetailView();
        this.orderService.getOrderById(uuid).subscribe((res) => {
          const dataObj = res.data;
          this.openDetailView(dataObj);
        });
      }
    });
  }
  getChannelList(){
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
  }

  getCreatedByList(name: string = '') {
    
    this.apiService.getAllCreatedByUserList(name).subscribe((res: any) => {
      this.createdByList = res.data;
    });
  }
  
  // onCloseCriteria() {
  //   this.advanceSearchRequest = [];
  //   // this.router.navigate(['transaction/order']);
  //   this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { reset: true, module: Events.SEARCH_ORDER, route: '/transaction/order' }));
  // }
  onCloseCriteria() {

  // Optional: clean up any state before redirect
  this.advanceSearchRequest = [];

  // Redirect with full page reload to /transaction/order
  window.location.href = '/transaction/order';


}

  onChangeCriteria() {
    // Map keys from advanceSearchRequest to filterForm control names
    const keyMap = {
      orderNo: 'order_number',
      order_number: 'order_number',
      branchPlantCode: 'branch_plant_code',
      branch_plant_code: 'branch_plant_code',
      customerCode: 'customer_code',
      customer_code: 'customer_code',
      customerLpo: 'customer_lpo',
      customer_lpo: 'customer_lpo',
      orderDate: 'date',
      date: 'date',
      dueDate: 'due_date',
      due_date: 'due_date',
      deliveryDate: 'delivery_date',
      delivery_date: 'delivery_date',
      currentStage: 'current_stage',
      current_stage: 'current_stage',
      customerName: 'customer_name',
      customer_name: 'customer_name',
      channelName: 'channel_name',
      channel_name: 'channel_name',
      createdId: 'created_id',
      created_id: 'created_id',
      name: 'name',
      routeCode: 'route_code',
      route_code: 'route_code',
      routeName: 'route_name',
      route_name: 'route_name',
      salesmanCode: 'salesman_code',
      salesman_code: 'salesman_code',
      salesman: 'salesman',
      page: 'page',
      page_size: 'page_size',
      approvalStatus: 'approval_status',
      approval_status: 'approval_status',
      invoiceNumber: 'invoice_number',
      invoice_number: 'invoice_number'
    };

    const formValues = {};
    this.advanceSearchRequest.forEach(item => {
      const formKey = keyMap[item.key] || item.key;
      let value = item.value;

      // Convert date strings to Date objects for date fields
      if (['date', 'due_date', 'delivery_date'].includes(formKey) && typeof value === 'string') {
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate.getTime())) {
          value = parsedDate;
        }
      }

      if (this.filterForm.contains(formKey)) {
        formValues[formKey] = value;
      }
    });

    this.filterForm.patchValue(formValues);

    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, {
      route: '/transaction/order',
      currentSearchCriteria: this.advanceSearchRequest,
      requestOriginal: this.requestOriginal
    }));
  }

  openAdvanceSearchDialog() {
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, {
      route: '/transaction/order',
      currentSearchCriteria: this.advanceSearchRequest,
      requestOriginal: this.requestOriginal
    }));
  }
  exportData(){
    const exportRequest = { ...this.requestOriginal, export: 1 };
   this.apiService.onSearch(exportRequest).subscribe((response) => {
      
            this.apiService.downloadFile(response.data.file_url, 'csv');
            // this.dataEditor.sendMessage({ export: '' });
        
    });
    // this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { reset: true, module: Events.SEARCH_ORDER, route: '/transaction/order' }));
  }
  getAllOrdersList() {
    const payload = {
  ...this.filterForm.value,
  created_id: this.filterForm.value.created_id?.length
    ? this.filterForm.value.created_id.map(i => i.id)
    : [],
};
    if (this.advanceSearchRequest.length > 0) {
      this.advanceSearch();
    } else {
      this.advanceSearchRequest.forEach(element => {
        if (this.filterForm.value.hasOwnProperty(element.key)) {
          this.filterForm.value[element.key] = element.value;
        }
      });
      if (sessionStorage.getItem('columnfilter')) {
        const data = JSON.parse(sessionStorage.getItem('columnfilter'));
        this.filterForm.patchValue(data);
      }
      // if (this.advanceSearchRequest.length > 0) {
      //   let requestOriginal = this.requestOriginal;
      //   requestOriginal['page'] = this.page;
      //   requestOriginal['page_size'] = this.pageSize;
      //   this.subscriptions.push(
      //     this.apiService.onSearch(requestOriginal).subscribe((res) => {
      //       this.apiResponse = res;
      //       this.allResData = res.data;
      //       this.dataSource = new MatTableDataSource<any>(res.data);
      //       this.spinner.hide();
      //       if (this.filterObjectId != null) {
      //         let filterData = res.data.find(x => x.id === this.filterObjectId);
      //         this.openDetailView(filterData)
      //         this.filterObjectId = null;
      //       };
      //     })
      //   );
      //   return false;
      // }
      
      this.subscriptions.push(
        
        this.orderService
          .orderList(payload)
          .subscribe((result) => {
            this.orders = result.data;
            const statusCheck = ['Created', 'Updated'];
            let currentRole = localStorage.getItem('roleName');
            this.orders.forEach(element => {
              if (currentRole == 'Storekeeper') {
                if (element.current_stage == 'Pending') {
                  element['isCheckEnable'] = true;
                } else {
                  element['isCheckEnable'] = false;
                }
              } else {
                if (statusCheck.includes(element.approval_status)) {
                  element['isCheckEnable'] = true;
                } else {
                  element['isCheckEnable'] = false;
                }
              }
            });
            this.apiResponse = result;
            this.allResData = result.data;
            this.dataSource = new MatTableDataSource<OrderModel>(this.orders);
            this.updatedOrder.emit({ data: this.orders });
            this.spinner.hide();
            // this.dataSource.paginator = this.paginator;
          })
      );
    }
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    const newObject = Object.assign({}, this.requestOriginal);
    newObject.page = this.page;
    newObject.page_size = this.pageSize;
    this.requestOriginal = newObject;
    if (!this.isColumnFilter) {
      sessionStorage.clear();
    } else {
      sessionStorage.setItem('columnfilter', JSON.stringify(this.filterForm.value));
    }
    this.getAllOrdersList();

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
    this.getAllOrdersList();
  }
  ngOnChanges(changes: SimpleChanges) {

    if (changes) {
      if (
        changes.newOrderData &&
        Object.keys(changes.newOrderData.currentValue).length > 0
      ) {
        let currentValue = changes.newOrderData.currentValue;
        this.newOrderData = currentValue;
        this.updateAllData(this.newOrderData);
      }
    }
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  updateAllData(data) {
    this.getAllOrdersList();
    this.selections = new SelectionModel(true, []);
    if (data.delete !== undefined && data.delete == true) {
      this.closeDetailView();
    }
    return false;
  }

  updateDataSource(data) {
    const statusCheck = ['Created', 'Updated'];
    let currentRole = localStorage.getItem('roleName');
    data.forEach(element => {
      if (currentRole == 'Storekeeper') {
        if (element.current_stage == 'Pending') {
          element['isCheckEnable'] = true;
        } else {
          element['isCheckEnable'] = false;
        }
      } else {
        if (statusCheck.includes(element.approval_status)) {
          element['isCheckEnable'] = true;
        } else {
          element['isCheckEnable'] = false;
        }
      }
    });
    this.dataSource = new MatTableDataSource<OrderModel>(data);
    // this.dataSource.paginator = this.paginator;
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    // sessionStorage.clear();
  }
  public checkReason(): void {
    this.isShowReasonModel = false;

  }
  public openDetailView(data: OrderModel): void {
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.updateCollapsedColumns();
  }

  public getDisplayedColumns(): string[] {
    return this.displayedColumns
      .filter((column) => column.show)
      .map((column) => column.def);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }

  public toggleSelection(): void {
    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));
  }

  public checkboxLabel(row?: OrderModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible
      ? this.collapsedColumns
      : this.allColumns;
  }

  getOrderStatus(status: any) {
    let ordStatus = {
      color: OrderUpdateProcessColor.Pending,
      label: status,
    };
    switch (status) {
      case OrderUpdateProcess.Pending:
        ordStatus = {
          color: OrderUpdateProcessColor.Pending,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.PartialDeliver:
        ordStatus = {
          color: OrderUpdateProcessColor.PartialDeliver,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.InProcess:
        ordStatus = {
          color: OrderUpdateProcessColor.InProcess,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.Accept:
        ordStatus = {
          color: OrderUpdateProcessColor.Accept,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.Delivered:
        ordStatus = {
          color: OrderUpdateProcessColor.Delivered,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.Completed:
        ordStatus = {
          color: OrderUpdateProcessColor.Completed,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.Approved:
        ordStatus = {
          color: OrderUpdateProcessColor.Approved,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.Cancelled:
        ordStatus = {
          color: OrderUpdateProcessColor.Cancelled,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.Rejected:
        ordStatus = {
          color: OrderUpdateProcessColor.Rejected,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
    }
  }

  getOrderStatusValue(status: any) {
    this.getOrderStatus(status);
    return this.orderStatus.label;
  }

  orderStatusColor(status: any) {
    this.getOrderStatus(status);
    return this.orderStatus.color;
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
setAdvanceSearchRequest(request: any) {
  // request is the mapped object from filterObjectValues
  this.advanceSearchRequest = Object.entries(request)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => ({ key, value }));
}

private patchFilterFormWithCriteria(criteria: any[]) {
  if (!criteria || !Array.isArray(criteria)) return;

  const formValues: any = {};

  criteria.forEach(c => {
    const key = c.key;
    let value = c.value;

    // Handle date fields - convert string dates to Date objects
    if (['date', 'due_date', 'delivery_date'].includes(key) && typeof value === 'string') {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        value = parsedDate;
      }
    }

    // Handle array fields (dropdowns)
    if (['channel_name', 'created_id'].includes(key)) {
      if (!Array.isArray(value)) {
        value = value ? [value] : [];
      }
    }

    // Map criteria keys to form control names
    const keyMap: { [key: string]: string } = {
      orderNo: 'order_number',
      order_number: 'order_number',
      branchPlantCode: 'branch_plant_code',
      branch_plant_code: 'branch_plant_code',
      customerCode: 'customer_code',
      customer_code: 'customer_code',
      customerLpo: 'customer_lpo',
      customer_lpo: 'customer_lpo',
      orderDate: 'date',
      date: 'date',
      dueDate: 'due_date',
      due_date: 'due_date',
      deliveryDate: 'delivery_date',
      delivery_date: 'delivery_date',
      currentStage: 'current_stage',
      current_stage: 'current_stage',
      customerName: 'customer_name',
      customer_name: 'customer_name',
      channelName: 'channel_name',
      channel_name: 'channel_name',
      createdId: 'created_id',
      created_id: 'created_id',
      name: 'name',
      routeCode: 'route_code',
      route_code: 'route_code',
      routeName: 'route_name',
      route_name: 'route_name',
      salesmanCode: 'salesman_code',
      salesman_code: 'salesman_code',
      salesman: 'salesman',
      approvalStatus: 'approval_status',
      approval_status: 'approval_status',
      invoiceNumber: 'invoice_number',
      invoice_number: 'invoice_number'
    };

    const formKey = keyMap[key] || key;

    if (this.filterForm.contains(formKey)) {
      formValues[formKey] = value;
    }
  });

  this.filterForm.patchValue(formValues);
}

}
