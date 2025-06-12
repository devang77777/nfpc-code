import { Component, OnInit, ViewChild, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
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
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { MasterService } from '../../master.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { string } from '@amcharts/amcharts4/core';
@Component({
  selector: 'app-salesman-dt',
  templateUrl: './salesman-dt.component.html',
  styleUrls: ['./salesman-dt.component.scss']
})
export class SalesmanDtComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public newSalesmanData: any = {};
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  domain = window.location.host.split('.')[0];
  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  requestOriginal;
  private apiService: ApiService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  advanceSearchRequest: any[] = [];
  selectedColumnFilter: string;

  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'salesman_info.salesman_code', title: 'Salesman Code', show: true },
    { def: 'name', title: 'Salesman Name', show: true },
    { def: 'supervisor_name', title: 'Supervisor', show: true },
    { def: 'region', title: 'Region', show: true },

    { def: 'salesman_info.salesman_type', title: 'Salesman Type', show: true },

    { def: 'salesman_category', title: 'Salesman Category', show: true },
    { def: 'role', title: 'Role', show: true },
    { def: 'route', title: 'Route', show: true },
    { def: 'route_code', title: 'Route Code', show: true },
    { def: 'approval', title: 'Approval', show: true },
    { def: 'status', title: 'Status', show: true }

  ]
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'name', title: 'Salesman Name', show: true },
  ];
  filterForm: FormGroup;
  constructor(
    private masterService: MasterService,
    apiService: ApiService,
    dataEditor: DataEditor,
    private route: ActivatedRoute,
    fds: FormDrawerService,
    private eventService: EventBusService,
    public fb: FormBuilder,

    deleteDialog: MatDialog) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<SalesMan>();
  }
  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.apiResponse = this.route.snapshot.data['salesman_resolve'].salesmanList;
    this.allResData = this.route.snapshot.data['salesman_resolve'].salesmanList.data;
    this.updateDataSource(this.route.snapshot.data['salesman_resolve'].salesmanList.data);

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
    this.subscriptions.push(this.eventService.on(Events.SEARCH_SALEMAN, ({ request, requestOriginal, response }) => {
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
    }))
    this.filterForm = this.fb.group({
      salesman_code: [''],
      name: [''],
      type: [''],
      role: [''],
      region:[''],
      supervisor: [''],
      category: [''],
      route: [''],
      route_code: [''],
      approval: [''],
      status: [''],
      page: [this.page],
      page_size: [this.pageSize]
    })
  }

  onCloseCriteria() {
    this.advanceSearchRequest = []
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { reset: true, module: Events.SEARCH_SALEMAN, route: '/masters/merchandiser' }));
  }
  onChangeCriteria() {
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { route: '/masters/merchandiser' }));
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: SalesMan): void {
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.updateCollapsedColumns();
  }

  public getDisplayedColumns(): string[] {
    return this.displayedColumns.filter(column => column.show).map(column => column.def);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }
  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }
  public toggleSelection(): void {
    this.isAllSelected() ? this.selections.clear() : this.dataSource.data
      .forEach(row => this.selections.select(row));
  }

  public checkboxLabel(row?: SalesMan): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public editSalesman(salesman: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: salesman });
    this.openAddSalesman();
  }

  public openDeleteBox(salesman: any): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete this Salesman ?` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteSalesman(salesman);
      }
    });
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  private deleteSalesman(salesman: any): void {
    this.apiService.deleteCustomer(salesman.uuid).subscribe(result => {
      window.location.reload();
    });
  }

  private openAddSalesman(): void {
    this.fds.setFormName('salesMan');
    this.fds.open();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });

    this.getSalesmanData();
  }

  getSalesmanData() {
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
    this.subscriptions.push(
      this.masterService.salesmanList(this.filterForm.value).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
      })
    );

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newSalesmanData && Object.keys(changes.newSalesmanData.currentValue).length > 0) {
        let currentValue = changes.newSalesmanData.currentValue;
        this.newSalesmanData = currentValue;
        this.updateAllData(this.newSalesmanData);
      }
    }
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
    this.getSalesmanData();
  }
  updateAllData(data) {
    this.selections = new SelectionModel(true, []);
    this.subscriptions.push(
      this.masterService.salesmanList(this.filterForm.value).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
        let tableData = res.data;
        if (data.delete !== undefined && data.delete == true) {
          this.closeDetailView();
        } else {
          if (data.edit !== undefined && data.edit == true) {
            let dataObj = tableData.filter(rec => rec.user.uuid.indexOf(data.uuid) !== -1)[0];
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
        let indexp = tableData.filter(rec => rec.user.uuid.indexOf(data.uuid) !== -1)[0];
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

  }
}
export interface SalesMan {
  lob: any;
  lob_id: any;
  salesman_lob(salesman_lob: any);
  id: string;
  uuid: string;
  organisation_id: number;
  salesmanlob: any;
  usertype: number;
  category_id: any;
  region_id: any;
  parent_id: string;
  profile_image: string;
  firstname: string;
  lastname: string;
  password: string;
  api_token: string;
  country_id: string;
  is_approved_by_admin: number;
  status: string;
  role_id: number;
  salesman_code: string;
  salesman_supervisor: string;
  supervisor_user: any;
  created_at: string | Date | null;
  updated_at: string | Date | null;
  deleted_at: string | Date | null;
  salesman_info: SalesManInfo | null;
  salesman_type_id: number;
  salesman_role_id: number;
  is_lob: number,
  salesman_range: any;
  user: {
    id: number;
    uuid: string;
    firstname: string;
    lastname: string;
    email: string;
    mobile: string;
  };
  route: {
    id: number;
    route_code: string;
    route_name: string;
    status: number
  };
  salesman_role:
  {
    id: number;
    name: string;
    code: string;
    status: number;
  };
  salesman_type:
  {
    id: number,
    name: string,
    code: string,
    status: number
  };

  saleasmanlob:
  {
    id: number,
    lob_id: number,
    salesman_info_id: number,
    organisation_id: number,
    lob:
    {
      id: number,
      name: string,
    },
  },

}

export interface SalesManInfo {
  id: number;
  uuid: string;
  user_id: number;
  route_id: number;
  salesman_type: number;
  saleasmanlob: number;
  salesman_role: number;
  created_at: string | Date | null;
  updated_at: string | Date | null;
  deleted_at: string | Date | null;
}

export interface temp {
  lob_id: number;
}
