import {
  Component,
  OnInit,
  ViewChild,
  Output,
  Input,
  EventEmitter,
  SimpleChanges
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ActivatedRoute } from '@angular/router';
import { MasterService } from '../../master.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { EventBusService } from 'src/app/services/event-bus.service';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { MatSort } from '@angular/material/sort';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-customer-dt',
  templateUrl: './customer-dt.component.html',
  styleUrls: ['./customer-dt.component.scss'],
})
export class CustomerDtComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public newCustomerData: any = {};
  selectedColumnFilter: string;
  requestOriginal;
  advanceSearchRequest: any[] = []
  public allResData = [];
  channelList : any;
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];

  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];

  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'code', title: 'Customer Code', show: true },
    { def: 'name', title: 'Name', show: true },
    // { def: 'email', title: 'Email', show: true },
    { def: 'mobile', title: 'Mobile', show: true },
    { def: 'grand_channel', title: 'Service Channel', show: true },
    { def: 'parent_channel', title: 'Parent Channel', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'code', title: 'Customer Code', show: true },
    { def: 'name', title: 'Name', show: true },
  ];
  filterForm: FormGroup;

  constructor(
    private masterService: MasterService,
    private route: ActivatedRoute,
    private eventService: EventBusService,
    dataEditor: DataEditor,
    private toast: CommonToasterService,
    fds: FormDrawerService,
    public apiService: ApiService,
    public fb: FormBuilder,
    deleteDialog: MatDialog
  ) {
    Object.assign(this, { dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Customer>();
  }
  public ngOnInit(): void {
    this.getChannelList();
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.apiResponse = this.route.snapshot.data['customer_resolve'].customerList;
    this.allResData = this.route.snapshot.data['customer_resolve'].customerList.data;
    this.updateDataSource(this.route.snapshot.data['customer_resolve'].customerList.data);
    // this.dataSource.paginator = this.paginator;

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
      })
    );
    this.subscriptions.push(
      this.eventService.on(Events.SEARCH_CUSTOMER, ({ request, requestOriginal, response }) => {
        this.advanceSearchRequest = [];
        this.requestOriginal = requestOriginal;
        if (request) {
          Object.keys(request).forEach(item => {
            // Only include fields that have meaningful values (not null, undefined, empty string, or empty array)
            const value = request[item];
            if (value !== null && value !== undefined && value !== '' && 
                !(Array.isArray(value) && value.length === 0)) {
              this.advanceSearchRequest.push({ param: item, value: request[item] })
            }
          })
        }
        this.apiResponse = response;
        this.allResData = response.data;
        this.updateDataSource(response.data);
      })
    );
    this.filterForm = this.fb.group({
      customer_code: [''],
      channel_name: [[]],
      name: [''],
      email: [''],
      customer_phone: [''],
      customer_category: [''],
      channel: [''],
      page: [this.page],
      page_size: [this.pageSize]
    })
  }
  onCloseCriteria() {
    this.advanceSearchRequest = []
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { reset: true, module: Events.SEARCH_CUSTOMER, route: '/masters/customer' }));
  }
  onChangeCriteria() {
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { route: '/masters/customer' }));
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: Customer): void {
    //console.log(data);
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
  }
  getChannelList(){
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    //console.log(this.isDetailVisible);
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
  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }
  public toggleSelection(): void {
    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));
  }

  public checkboxLabel(row?: Customer): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  public editCustomer(customer: any): void {
    this.dataEditor.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: customer,
    });
    this.openAddCustomer();
  }

  public openDeleteBox(customer: any): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: { title: `Are you sure want to delete this customer ?` },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteCustomer(customer);
        }
      });
  }

  private deleteCustomer(customer: any): void {
    this.masterService.deleteCustomer(customer.uuid).subscribe((result) => {
      this.toast.showInfo('Delete Sucessfull', 'Customer Sucessfully Deleted');
      this.updateAllData(customer);
    });
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
    this.getCustomersData();

  }

  private openAddCustomer(): void {
    this.fds.setFormName('customer');
    this.fds.open();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible
      ? this.collapsedColumns
      : this.allColumns;
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getCustomersData();
  }

  getCustomersData() {
    if (this.advanceSearchRequest.length > 0) {
      let requestOriginal = this.requestOriginal;
      requestOriginal['page'] = this.page;
      requestOriginal['page_size'] = this.pageSize;
      this.subscriptions.push(
        this.apiService.onSearch(requestOriginal).subscribe((res) => {
          this.apiResponse = res;
          this.allResData = res.data;
          this.updateDataSource(res.data);
        })
      );
      return false;
    }
    this.masterService.customerDetailListTable(this.filterForm.value).subscribe((res) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    })

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newCustomerData && Object.keys(changes.newCustomerData.currentValue).length > 0) {
        let currentValue = changes.newCustomerData.currentValue;
        this.newCustomerData = currentValue;
        this.updateAllData(this.newCustomerData);
      }
    }
  }

  updateAllData(data) {
    this.selections = new SelectionModel(true, []);
    this.subscriptions.push(
      this.masterService.customerDetailListTable(this.filterForm.value).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
        let tableData = res.data;
        if (data.delete !== undefined && data.delete == true) {
          this.closeDetailView();
        } else {

          if (data.edit !== undefined && data.edit == true) {
            //console.log('in edit');
            let dataObj = tableData.filter(rec => rec.uuid.indexOf(data.uuid) !== -1)[0];
            this.openDetailView(dataObj);
          }
        }
      })
    );
    return false;
    let tableData = this.allResData;
    if (data.delete !== undefined && data.delete == true) {
      let indexp = tableData.filter(rec => rec.uuid.indexOf(data.uuid) !== -1)[0];
      let index = tableData.indexOf(indexp);
      tableData.splice(index, 1);
      this.closeDetailView();
    } else {
      if (data.edit !== undefined && data.edit == true) {
        let indexp = tableData.filter(rec => rec.uuid.indexOf(data.uuid) !== -1)[0];
        let index = tableData.indexOf(indexp);
        tableData[index] = data;
        this.openDetailView(data);
      } else {
        tableData.push(data);
      }

    }
    this.allResData = tableData;
    this.updateDataSource(tableData)
  }

  updateDataSource(data) {
    this.dataSource = new MatTableDataSource<any>(data);
    // this.dataSource.paginator = this.paginator;
  }

  onSortData(sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    let data = this.allResData.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'code': return this.compare(a.code, b.code, isAsc);
        case 'name': return this.compare(a.name, b.name, isAsc);
        case 'email': return this.compare(a.email, b.email, isAsc);
        case 'mobile': return this.compare(a.mobile, b.mobile, isAsc);
        default: return 0;
      }
    });
    this.updateDataSource(data);
    //console.log(sort);
  }
  private compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
export interface Customer {
  id: number;
  uuid: string;
  name: string;
  organisation_id: number;
  user_id: number;
  region_id: number;
  route_id: number;
  channel_id: number;
  sub_channel_id: number;
  customer_group_id: number;
  sales_organisation_id: number;
  customer_code: string;
  customer_type_id: number;
  customer_address_1: string;
  customer_address_2: string;
  customer_city: string;
  customer_state: string;
  customer_zipcode: string;
  customer_phone: string;
  balance: string;
  credit_limit: string;
  credit_days: number;
  created_at: string | Date | null;
  updated_at: string | Date | null;
  deleted_at: string | Date | null;
  user: User | null;
  organisation: Organisation | null;
  region: string | null;
  customer_group: string | null;
  sales_organisation: string | null;
  ship_to_party: {
    id: number;
  };
  sold_to_party: {
    id: number;
  };
  payer: {
    id: number;
  };
  bill_to_payer: {
    id: number;
  };
  need_to_approve?: string;
  objectid?: string;
}

export interface User {
  id: number;
  organisation_id: number;
  usertype: number;
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
  role_id: number;
  country_id: number;
  status: number;
}
export interface Organisation {
  id: number;
  org_name: string;
}
