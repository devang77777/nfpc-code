import { Component, OnInit, ViewChild, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
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
import { Cashier, cashierData } from '../cashier-reciept-master-page/cashier-reciept-master-page.component';
import { CashierReceiptService } from '../cashier-receipt.service';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormGroup,FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-cashier-reciept-dt',
  templateUrl: './cashier-reciept-dt.component.html',
  styleUrls: ['./cashier-reciept-dt.component.scss']
})
export class CashierRecieptDtComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public newCRData: any;
  @Input() public isDetailVisible: boolean;
  filterForm: FormGroup | any;
  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  selectedColumnFilter: string;

  private apiService: CashierReceiptService;
  private fb: FormBuilder;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;

  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'cashier_reciept_number', title: 'Code', show: true },
    { def: 'date', title: 'Date Of Endorsment', show: true },

    { def: 'salesman', title: 'Salesman Name', show: true },
    { def: 'date_trip', title: 'Date Of Trip', show: true },

    { def: 'route_name', title: 'Route Name', show: true },
    { def: 'route_code', title: 'Route Code', show: true },
    { def: 'total_amount', title: 'Amount', show: true },
    { def: 'status', title: 'Status', show: true }


  ]
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'code', title: 'Code', show: true },
  ];

  constructor(apiService: CashierReceiptService, dataEditor: DataEditor, fds: FormDrawerService, deleteDialog: MatDialog,fb: FormBuilder) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog ,fb});
    this.dataSource = new MatTableDataSource<Cashier>();
  }
  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      code: [''],
      salesman_name: [''],
      date: [''],
      date_trip: [''],


      salesman_code: [''],
      route_name: [''],
      route_code: [''],
      status: [''],
      type: [1],
      page: [this.page],
      page_size: [this.pageSize]
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getCashierReceiptList();


    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getCashierReceiptList();
  }

  getCashierReceiptList() {
    this.subscriptions.push(this.apiService.getCashierReceiptList(this.page, this.pageSize).subscribe((res: any) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    }));
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newCRData && Object.keys(changes.newCRData.currentValue).length > 0) {
        let currentValue = changes.newCRData.currentValue;
        this.newCRData = currentValue;
        this.updateAllData(this.newCRData);
      }
    }
  }

  updateAllData(data) {
    this.getCashierReceiptList();
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

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: Cashier): void {
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

  public checkboxLabel(row?: Cashier): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }

  getPaginatorValue(len: number) {
    return len < 10 ? true : false;
  }

}
