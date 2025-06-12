import { Component, OnInit, ViewChild, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MerchandisingService } from '../../merchandising.service';
import { ApiService } from 'src/app/services/api.service';
import { SelectionModel } from '@angular/cdk/collections';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { CompDataServiceType } from 'src/app/services/constants';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { Stockinstore } from '../stockinstore-interface';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-stockinstoredt',
  templateUrl: './stockinstoredt.component.html',
  styleUrls: ['./stockinstoredt.component.scss']
})
export class StockinstoredtComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  selectedColumnFilter: string;

  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  advanceSearchRequest: any[] = [];
  private apiService: ApiService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  @Input() public newStockInStoreData: any = {};
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'activity_name', title: 'Activity Name', show: true },
    { def: 'valid_from', title: 'Date From', show: true },
    { def: 'valid_to', title: 'Date To', show: true },
  ];
  requestOriginal;
  filterForm: FormGroup;
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'activity_name', title: 'Activity Name', show: true },
  ];

  constructor(public fb: FormBuilder, public merService: MerchandisingService, dataEditor: DataEditor, private eventService: EventBusService,
    fds: FormDrawerService, deleteDialog: MatDialog) {
    Object.assign(this, { merService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Stockinstore>();
  }
  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      name: [''],
      start_date: [''],
      end_date: [''],
      page: [this.page],
      page_size: [this.pageSize]
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.getStockinStore();


    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
    this.subscriptions.push(this.eventService.on(Events.SEARCH_STOCKINSTORE, ({ request, requestOriginal, response }) => {
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
  }

  onCloseCriteria() {
    this.advanceSearchRequest = []
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { reset: true, module: Events.SEARCH_STOCKINSTORE, route: '/merchandising/stockinstore' }));
  }
  onChangeCriteria() {
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { route: '/merchandising/stockinstore' }));
  }

  getStockinStore() {
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
    this.subscriptions.push(this.merService.getStockinStore(this.filterForm.value).subscribe((res: any) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    }));
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getStockinStore();
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newStockInStoreData && Object.keys(changes.newStockInStoreData.currentValue).length > 0) {
        let currentValue = changes.newStockInStoreData.currentValue;
        this.newStockInStoreData = currentValue;
        this.updateAllData(this.newStockInStoreData);
      }
    }
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.merService.getStockinStore(this.filterForm.value).subscribe((res) => {
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
        tableData.unshift(data);
      }

    }
    this.allResData = tableData;
    this.updateDataSource(tableData)
  }

  updateDataSource(data) {
    this.dataSource = new MatTableDataSource<any>(data);
    // this.dataSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
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
    this.getStockinStore();
  }

  public openDetailView(data: Stockinstore): void {
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.updateCollapsedColumns();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }

  public getDisplayedColumns(): string[] {
    return this.displayedColumns.filter(column => column.show).map(column => column.def);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }

  public toggleSelection(): void {
    this.isAllSelected() ? this.selections.clear() : this.dataSource.data.forEach(row => this.selections.select(row));
  }

  public checkboxLabel(row?: Stockinstore): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  getPaginatorValue(len: number) {
    return len < 10 ? true : false;
  }
  private openAddBank(): void {
    this.fds.setFormName('add-expense');
    this.fds.setFormType("Add");
    this.fds.open();
  }
  public editBrand(brandData: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: brandData });
    this.openAddBank();
  }
}


