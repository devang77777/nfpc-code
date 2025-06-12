import {
  Component,
  OnInit,
  ViewChild,
  Output,
  Input,
  EventEmitter,
  TemplateRef,
  OnChanges,
  SimpleChanges,
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
import { SalesmanUnload } from '../salesman-unload-interface';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-salesman-unload-dt',
  templateUrl: './salesman-unload-dt.component.html',
  styleUrls: ['./salesman-unload-dt.component.scss']
})
export class SalesmanUnloadDtComponent implements OnInit, OnChanges {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  selectedColumnFilter: string;
  filterForm: FormGroup;
  @ViewChild("dialogRef") dialogRef: TemplateRef<any>;

  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  pageSize = PAGE_SIZE_10;
  page = 1;
  private allColumns: ColumnConfig[] = [
    // { def: 'select', title: 'Select', show: true },
    { def: 'created_at', title: 'Date', show: true },
    { def: 'trip', title: 'Trip', show: true },
    { def: 'branch_plant_code', title: 'Branch Plant', show: true },
    { def: 'salesman', title: 'Salesman', show: true },
    { def: 'salesman_code', title: 'Salesman Code', show: true },
    { def: 'route', title: 'Route', show: true },
    { def: 'route_code', title: 'Route Code', show: true },
    { def: 'unload_number', title: 'Unload No.', show: true },
    { def: 'unload_type', title: 'Unload Type', show: true },
    { def: 'status', title: 'Status', show: true },
    // { def: 'ERP_status', title: 'ERP Status', show: true }
  ];
  private collapsedColumns: ColumnConfig[] = [
    // { def: 'select', title: 'Select', show: true },
    { def: 'salesman', title: 'Salesman', show: true },
    { def: 'unload_number', title: 'Unload No.', show: true },
  ];
  dateFilterControl: FormControl;
  isOdooMessageOpen: boolean = false;
  constructor(
    public tService: TargetService,
    dataEditor: DataEditor,
    public fb: FormBuilder,
    private eventService: EventBusService,
    fds: FormDrawerService,
    private deleteDialog: MatDialog,
    private apiService: ApiService
  ) {
    Object.assign(this, { tService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<SalesmanUnload>();
  }

  public start_date;
  public end_date;
  isColumnFilter = false;

  public ngOnInit(): void {
    this.loadData();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.loadData();
  }
  loadData() {
    let today = new Date();
    let month = '' + (today.getMonth() + 1);
    let date = '' + today.getDate();
    if (today.getMonth() + 1 < 10) {
      month = '0' + (today.getMonth() + 1);
    }
    if (today.getDate() < 10) {
      date = '0' + today.getDate();
    }
    this.end_date = today.getFullYear() + '-' + month + '-' + date;
    let diffToMonday = today.getDate() - today.getDay();
    let start_date = new Date(today.setDate(diffToMonday - 6));
    let s_month = '' + (today.getMonth() + 1);
    let s_date = '' + today.getDate();
    if (start_date.getMonth() + 1 < 10) {
      s_month = '0' + (start_date.getMonth() + 1);
    }
    if (start_date.getDate() < 10) {
      s_date = '0' + start_date.getDate();
    }
    this.start_date = start_date.getFullYear() + '-' + s_month + '-' + s_date;

    this.dateFilterControl = new FormControl(this.end_date);
    this.filterForm = this.fb.group({
      filter: 'date',
      start_date: this.start_date,
      end_date: this.end_date,
      unload_type: 1,
      date: [''],
      code: [''],
      load_type: [''],
      salesman_name: [''],
      salesman_code: [''],
      route: [''],
      rout_code: [''],
      page: [this.page],
      page_size: [this.pageSize],
      trip: [''],
      branch_plant_code: [''],
      current_stage: ['']
    });
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getsalesmanUnloadList();

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
      })
    );
    this.subscriptions.push(
      this.eventService.on(Events.SEARCH_COMPETITOR, (data) => {
        this.dataSource = new MatTableDataSource<SalesmanUnload>(data);
        this.dataSource.paginator = this.paginator;
      })
    );
  }

  public getsalesmanUnloadList() {
    let body = {
      filter: 'date',
      start_date: this.start_date,
      end_date: this.end_date,
      unload_type: 1,
      page: this.page,
      page_size: this.pageSize
    }
    if (sessionStorage.getItem('columnfilter')) {
      const data = JSON.parse(sessionStorage.getItem('columnfilter'));
      this.filterForm.patchValue(data);
    }
    this.subscriptions.push(
      this.tService.getSalesmanUnloadList(this.filterForm.value).subscribe((res) => {
        this.apiResponse = res;
        this.dataSource = new MatTableDataSource<SalesmanUnload>(res.data);
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
    const newObject = Object.assign({}, this.filterForm.value);
    newObject.page = this.page;
    newObject.page_size = this.pageSize;
    this.filterForm.patchValue(newObject);
    if (!this.isColumnFilter) {
      sessionStorage.clear();
    } else {
      sessionStorage.setItem('columnfilter', JSON.stringify(this.filterForm.value));
    }
    this.getsalesmanUnloadList();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: SalesmanUnload): void {
    if (this.isOdooMessageOpen) {
      return;
    }
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
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

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {
    if (!item) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.isColumnFilter = item;
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
      sessionStorage.clear();
    } else {
      this.isColumnFilter = item;
      this.filterForm.patchValue({
        page: 1,
        page_size: this.pageSize
      });
      sessionStorage.setItem('columnfilter', JSON.stringify(this.filterForm.value));
    }
    this.getsalesmanUnloadList();
  }

  public toggleSelection(): void {
    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));
  }

  public checkboxLabel(row?: SalesmanUnload): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  getPaginatorValue(len: number) {
    return len < 10 ? true : false;
  }

  getUnloadTypeValue(element) {
    var val = '';
    if (element.unload_type) {
      if (element.unload_type == 4) {
        val = 'End Inventory';
      } else if (element.unload_type == 5) {
        val = 'Variance';
      } else if (element.unload_type == 1) {
        val = 'Fresh Unload';
      } else {
        val = '';
      }
    }
    return val;
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

  postOdoo(element) {
    this.apiService.postSalesmanUnloadOdooData(element.uuid).subscribe(res => {
      this.getsalesmanUnloadList();

    });
  }

}
