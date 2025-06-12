import {
  Component,
  OnInit,
  ViewChild,
  Output,
  Input,
  EventEmitter,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TargetService } from '../../target.service';
import { SelectionModel } from '@angular/cdk/collections';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { CompDataServiceType } from 'src/app/services/constants';
import { EventBusService } from 'src/app/services/event-bus.service';
import { Events } from 'src/app/models/events.model';
import { LoadRequest } from '../load-request-interface';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-load-request-dt',
  templateUrl: './load-request-dt.component.html',
  styleUrls: ['./load-request-dt.component.scss']
})
export class LoadRequestDtComponent implements OnInit {

  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Output() public closeDetailViewVisible: EventEmitter<any> = new EventEmitter<any>();

  @Input() public isDetailVisible: boolean;
  @Input() public newLoadRequestData: any = {};
  selectedColumnFilter: string;

  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  filterForm: FormGroup;
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'created_at', title: 'Date', show: true },
    { def: 'trip', title: 'Trip', show: true },
    { def: 'salesman', title: 'Salesman', show: true },
    { def: 'salesman_code', title: 'Salesman Code', show: true },
    { def: 'load_number', title: 'Load Req. No.', show: true },
    { def: 'load_type', title: 'Load Type', show: true },
    { def: 'route', title: 'Route', show: true },
    { def: 'route_code', title: 'Route Code', show: true },
    { def: 'current_stage', title: 'Approval', show: true },
    { def: 'status', title: 'Status', show: true },
    { def: 'Odoo_status', title: 'Odoo Status', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'salesman', title: 'Salesman', show: true },
    { def: 'load_number', title: 'Load Req. No.', show: true },
  ];
  dateFilterControl: FormControl;
  @ViewChild("dialogRef") dialogRef: TemplateRef<any>;
  isOdooMessageOpen: boolean = false;
  constructor(
    public tService: TargetService,
    public apiService: ApiService,
    dataEditor: DataEditor,
    public fb: FormBuilder,
    private eventService: EventBusService,
    fds: FormDrawerService,
    private deleteDialog: MatDialog,
    private router: ActivatedRoute,
  ) {
    Object.assign(this, { tService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<LoadRequest>();
  }

  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      load_number: [''],
      load_type: [''],
      current_stage: [''],
      approval_status: [''],
      salesman_name: [''],
      salesman_code: [''],
      route: [''],
      route_code: [''],
      page: [this.page],
      page_size: [this.pageSize],
      trip: ['']
    });

    let today = new Date();
    let month = '' + (today.getMonth() + 1);
    let date = '' + today.getDate();
    if (today.getMonth() + 1 < 10) {
      month = '0' + (today.getMonth() + 1);
    }
    if (today.getDate() < 10) {
      date = '0' + today.getDate();
    }
    let newdate = today.getFullYear() + '-' + month + '-' + date;
    this.dateFilterControl = new FormControl(newdate);

    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getLoadRequestList();

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
      })
    );
    this.subscriptions.push(
      this.eventService.on(Events.SEARCH_COMPETITOR, (data) => {
        this.allResData = data;
        this.updateDataSource(data);
      })
    );
    this.checkLoadRequestUuid();
  }

  checkLoadRequestUuid() {
    this.router.queryParams.subscribe(res => {
      let uuid = res["uuid"];
      if (uuid) {
        this.closeDetailViewVisible.emit();
        this.closeDetailView();
        this.apiService.getLoadRequestData(uuid).subscribe((res) => {
          var dataObj = res.data;
          this.openDetailView(dataObj);
        })
      }
    });

  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {
    if (!item) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    } else {
      this.filterForm.patchValue({
        page: 1,
        page_size: this.pageSize
      });
    }
    this.getLoadRequestList();
  }


  public getLoadRequestList() {
    this.subscriptions.push(
      this.apiService.getAllLoadReq(this.filterForm.value).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
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
    this.getLoadRequestList();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newLoadRequestData && Object.keys(changes.newLoadRequestData.currentValue).length > 0) {
        let currentValue = changes.newLoadRequestData.currentValue;
        this.newLoadRequestData = currentValue;
        this.updateAllData(this.newLoadRequestData);
      }
    }
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.apiService.getAllLoadReq(this.filterForm.value).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
        this.selections = new SelectionModel(true, []);
        let tableData = res.data;
        if (data.delete !== undefined && data.delete == true) {
          this.closeDetailView();
        } else {
          if (data.edit !== undefined && data.edit == true) {
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
    this.dataSource = new MatTableDataSource<LoadRequest>(data);
    // this.dataSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: LoadRequest): void {
    if (this.isOdooMessageOpen) {
      return;
    }
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.getLoadRequestList();
    this.updateCollapsedColumns();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible
      ? this.collapsedColumns
      : this.allColumns;
  }

  public getDisplayedColumns(): string[] {
    return this.displayedColumns
      .filter((column) => column.show)
      .map((column) => column.def);
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }

  public toggleSelection(): void {
    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));
  }

  public checkboxLabel(row?: LoadRequest): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  getPaginatorValue(len: number) {
    return len < 10 ? true : false;
  }

  filterOdooMessageData(data: any) {

    try {
      this.isOdooMessageOpen = false;
      if (data) {
        var obj: any = JSON.parse(data);
        if (obj.data)
          this.deleteDialog.open(this.dialogRef, { data: obj.data.message });

        if (obj.response) {
          var text = "";
          obj.response.forEach(element => {
            element.products.forEach(product => {
              text = `${text} ${product},`
            });
          });
          this.deleteDialog.open(this.dialogRef, { data: text });

        }
      }

    } catch (e) {
      data = data.replace(/\\/g, "");
      var obj: any = JSON.parse(data);
      if (obj.response) {
        var text = "";
        obj.response.forEach(element => {
          element.products.forEach(product => {
            text = `${text} ${product},`
          });
        });
        this.deleteDialog.open(this.dialogRef, { data: text });

      }
    }
  }

  postOdoo(loadRequest) {
    this.apiService.postLoadReuestOdooData(loadRequest.id).subscribe(res => {
      this.getLoadRequestList();

    });
  }
}
