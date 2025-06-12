import { ApiService } from 'src/app/services/api.service';
import { getCurrency, getCurrencyDecimalFormat } from './../../../../../services/constants';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DeliveryModel } from '../delivery-model';
import {
  OrderUpdateProcessColor,
  OrderUpdateProcess,
} from 'src/app/components/main/transaction/orders/order-models';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import {
  APP_CURRENCY_CODE,
  APP_CURRENCY_DECIMAL_FORMAT,
  CompDataServiceType,
} from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Utils } from 'src/app/services/utils';
import { DeliveryService } from '../delivery.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { ORDER_STATUS, PAGE_SIZE_10, STATUS } from 'src/app/app.constant';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-delivery-data-table',
  templateUrl: './delivery-data-table.component.html',
  styleUrls: ['./delivery-data-table.component.scss'],
})
export class DeliveryDataTableComponent implements OnInit, OnDestroy {
  @Input() public isDetailVisible: boolean;
  @Input() public newDeliveryData: any;
  @Input() public isOpenAllReason: any;
  @Input() public selections: any;


  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  public dataSource: MatTableDataSource<DeliveryModel>;
  public filterObjectId: any = null;
  public deliveryData: DeliveryModel[] = [];
  public customerData: any[] = [];
  advanceSearchRequest: any[] = [];
  public allResData = [];
  public tripAllChanges:any;
  channelList: any =[];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0,
    },
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  // public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public orderStatus = {
    color: '',
    label: '',
  };
  requestOriginal;
  closeReason()
  {
    document.getElementById("isShow").style.display = "none"

  }
  selectedColumnFilter: string;
  filterForm: FormGroup;
  private router: Router;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'misc', title: 'Deliveries', show: false },
    { def: 'date', title: 'Date', show: true },
    { def: 'code', title: 'Delivery Number', show: true },
    { def: 'orderCode', title: 'Order Number', show: true },
    { def: 'branch_plant_code', title: 'Branch Plant', show: true },
    { def: 'customer_code', title: 'Customer Code', show: true },
    { def: 'customer_lpo', title: 'Customer LPO', show: true },
    { def: 'name', title: 'Customer Name', show: true },
    { def: 'channel_name', title: 'Service Channel', show: true },

    // { def: 'route_code', title: 'Route Code', show: true },
    // { def: 'route_name', title: 'Route Name', show: true },
    { def: 'salesman_code', title: 'Salesman Code', show: true },
    { def: 'salesman_name', title: 'Salesman Name', show: true },
    { def: 'due', title: 'Delivery Date', show: true },
    { def: 'amount', title: 'Amount', show: true },
    { def: 'approval', title: 'Approval', show: true },
    { def: 'status', title: 'Status', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'expand', title: 'Expand', show: true },
  ];
  approvalStatusList: any;
  orderStatusList: any;
  constructor(
    private deliveryService: DeliveryService,
    public apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    deleteDialog: MatDialog,
    private eventService: EventBusService,
    router: Router,
    public fb: FormBuilder,
    private routerParam: ActivatedRoute
  ) {
    Object.assign(this, { dataEditor, fds, deleteDialog, router });
    this.dataSource = new MatTableDataSource<DeliveryModel>();
    this.approvalStatusList = STATUS;
    this.orderStatusList = ORDER_STATUS;
    // this.channelList = Channel;
  }

  public ngOnInit(): void {
    this.getChannelList();
    this.filterForm = this.fb.group({
      date: [''],
      customer_name: [''],
      customer_code: [''],
      customer_lpo: [''],
      code: [''],
      channel_name: [[]],
      branch_plant_code: [''],
      order_code: [''],
      route_code: [''],
      route_name: [''],
      salesman_code: [''],
      salesman_name: [''],
      delivery_date: [''],
      status: [''],
      page: [this.page],
      page_size: [this.pageSize],
      approval_status: [''],
      current_stage: [''],
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...[...this.allColumns].splice(2)];
    this.getDeliveryList();

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.GET_NEW_DATA) {
          this.filterObjectId = value.data.id;
          this.getDeliveryList();
        }
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
        if (value.uuid) {
          const clone = JSON.parse(JSON.stringify(this.deliveryData));
          const index = clone.findIndex((x) => x.uuid === value.uuid);
          if (index > -1) {
            clone.splice(index, 1);
            this.deliveryData = clone;
            this.dataSource.data = clone;
          }
        }
      })
    );

    this.subscriptions.push(
      this.eventService.on(Events.SEARCH_DELIVERY, (data) => {
        this.dataSource = new MatTableDataSource<DeliveryModel>(data);
        // this.dataSource.paginator = this.paginator;
      })
    );
    this.subscriptions.push(
      this.eventService.on(Events.SEARCH_DELIVERY, ({ request, requestOriginal, response }) => {
        this.advanceSearchRequest = [];
        this.requestOriginal = requestOriginal;
        if (request) {
          Object.keys(request).forEach(item => {
            this.advanceSearchRequest.push({ param: item, value: request[item] })
          })
        }
        this.apiResponse = response;
        this.allResData = response.data;
        this.updateDataSource(response.data);
      })
    );

    this.checkDeliveryeParamUuid();
  }
  onCloseCriteria() {
    this.advanceSearchRequest = []
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { reset: true, module: Events.SEARCH_DELIVERY, route: '/transaction/delivery' }));
  }
  onChangeCriteria() {
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { route: '/transaction/delivery' }));
  }
  changAllTrips()
  {

   let delivery_id:any = []

   this.selections.selected.map((slc:any)=>{
    delivery_id.push(slc.id)
   })
    let data:any =   {
      "trip_id": this.tripAllChanges,
    "delivery_id": delivery_id
    }
    console.log(data,"hii")
    this.apiService.bulkTripSave(data).subscribe((res:any)=>{
      this.closeReason()

      window.location.reload()
    })
  }
  getChannelList(){
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
  }
  checkDeliveryeParamUuid() {
    this.routerParam.queryParams.subscribe(res => {
      this.isDetailVisible = false;
      let uuid = res["uuid"];
      if (uuid) {
        this.detailsClosed.emit();
        this.closeDetailView();
        this.deliveryService.getDeliveryListById(uuid).subscribe((res) => {
          var dataObj = res.data;
          this.openDetailView(dataObj);
        })
      }
    });
  }

  getDeliveryList() {
    if (this.advanceSearchRequest.length > 0) {
      let requestOriginal = this.requestOriginal;
      requestOriginal['page'] = this.page;
      requestOriginal['page_size'] = this.pageSize;
      this.subscriptions.push(
        this.apiService.onSearch(requestOriginal).subscribe((res) => {
          this.apiResponse = res;
          this.allResData = res.data;
          this.dataSource = new MatTableDataSource<any>(res.data);
          if (this.filterObjectId != null) {
            let filterData = res.data.find(x => x.id === this.filterObjectId);
            this.openDetailView(filterData)
            this.filterObjectId = null;
          };
        })
      );
      return false;
    }
    this.subscriptions.push(
      this.deliveryService
        .getDeliveryList(this.filterForm.value)
        .subscribe((result) => {
          this.deliveryData = result.data;

          this.apiResponse = result;
          this.allResData = result.data;
          this.dataSource = new MatTableDataSource<DeliveryModel>(
            this.deliveryData
          );
          const statusCheck = ['Truck Allocated'];

          this.deliveryData.forEach(element => {
            if (statusCheck.includes(element.approval_status)) {
              element['isCheckEnable'] = true;
            } else {
              element['isCheckEnable'] = false;
            }
          });
          if (this.filterObjectId != null) {
            let filterData = result.data.find(x => x.id === this.filterObjectId);
            if (filterData) {
              this.openDetailView(filterData);
            }
            this.filterObjectId = null;
          };
          // this.dataSource.paginator = this.paginator;
        })
    );
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getDeliveryList();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (
        changes.newDeliveryData &&
        Object.keys(changes.newDeliveryData.currentValue).length > 0
      ) {
        let currentValue = changes.newDeliveryData.currentValue;
        this.isDetailVisible = true;
        this.newDeliveryData = currentValue;
        this.updateAllData(this.newDeliveryData);
      }
    }
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  updateAllData(data) {
    this.getDeliveryList();
    this.selections = new SelectionModel(true, []);
    if (data.delete !== undefined && data.delete == true) {
      this.closeDetailView();
    }
    return false;
  }

  updateDataSource(data) {
    this.dataSource = new MatTableDataSource<any>(data);
    // this.dataSource.paginator = this.paginator;
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: DeliveryModel): void {
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.updateCollapsedColumns();
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    } else {
      this.filterForm.patchValue({
        page: 1,
        page_size: this.pageSize
      });
    }
    this.getDeliveryList();
  }
  public getDisplayedColumns(): string[] {
    return this.displayedColumns
      .filter((column) => column.show)
      .map((column) => column.def);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }
  selectedS()
  {
    console.log(this.selections?.selected,"selections")

  }
  public toggleSelection(): void {

    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));


  }

  public checkboxLabel(row?: DeliveryModel): string {
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
      case OrderUpdateProcess.Approved:
        ordStatus = {
          color: OrderUpdateProcessColor.Approved,
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
      case OrderUpdateProcess.PartialInvoice:
        ordStatus = {
          color: OrderUpdateProcessColor.PartialInvoice,
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
      case OrderUpdateProcess.Invoiced:
        ordStatus = {
          color: OrderUpdateProcessColor.Invoiced,
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
      case OrderUpdateProcess.Cancel:
        ordStatus = {
          color: OrderUpdateProcessColor.Cancel,
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
}
