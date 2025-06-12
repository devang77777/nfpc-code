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
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { Router, ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';

import {
  apiStockAdjustmentMapper,
  ApiStockAdjustModel,
  StockAdjustmentModel,
} from '../stock-adjustment-model';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Utils } from 'src/app/services/utils';
import { PAGE_SIZE_10 } from 'src/app/app.constant';

@Component({
  selector: 'app-sa-data-table',
  templateUrl: './sa-data-table.component.html',
  styleUrls: ['./sa-data-table.component.scss'],
})
export class SaDataTableComponent implements OnInit, OnDestroy {
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public newSAData: any;
  @Input() public isDetailVisible: boolean;
  selectedColumnFilter: string;

  public dataSource: MatTableDataSource<StockAdjustmentModel>;

  public stockAdjustmentData: StockAdjustmentModel[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0,
    },
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  private router: Router;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'stock_adjustment_date', title: 'Date', show: true },
    { def: 'reference_number', title: 'Reference#', show: true },
    { def: 'reason', title: 'Reason', show: true },
    { def: 'adjustment_mode', title: 'Type', show: true },
    { def: 'status', title: 'Status', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'misc', title: 'Orders', show: true },
  ];

  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    deleteDialog: MatDialog,
    public route: ActivatedRoute,
    router: Router
  ) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog, router });
    this.dataSource = new MatTableDataSource<StockAdjustmentModel>();
  }

  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...[...this.allColumns].splice(2)];

    // this.subscriptions.push(this.apiService.getStockAdjustments()
    //   .pipe(map(result => result.data),
    //     map((items: ApiStockAdjustModel[]) => {
    //       return items.map(item => {
    //         return apiStockAdjustmentMapper(item);
    //       });
    //     })).subscribe(result => {
    //     this.stockAdjustmentData = result;
    //     this.dataSource = new MatTableDataSource<StockAdjustmentModel>(this.stockAdjustmentData);
    //     this.dataSource.paginator = this.paginator;
    //   }));

    // this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
    //   if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
    //     this.closeDetailView();
    //   }
    // }));
    // this.dataSource = new MatTableDataSource<StockAdjustmentModel>(this.route.snapshot.data['resolved'].stockaAdjudtment.data);
    // this.dataSource.paginator = this.paginator

    this.apiResponse = this.route.snapshot.data['resolved'].stockaAdjudtment;
    this.allResData = this.route.snapshot.data[
      'resolved'
    ].stockaAdjudtment.data;
    this.updateDataSource(
      this.route.snapshot.data['resolved'].stockaAdjudtment.data
    );
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: any): void {
    this.router.navigate(['inventory/stock-adjustment/detail', data.uuid]);
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

  public checkboxLabel(row?: StockAdjustmentModel): string {
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

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getStockAdjustments();
  }

  getStockAdjustments() {
    this.apiService
      .getStockAdjustments(this.page, this.pageSize)
      .subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
      });
  }
  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (
        changes.newSAData &&
        Object.keys(changes.newSAData.currentValue).length > 0
      ) {
        let currentValue = changes.newSAData.currentValue;
        this.newSAData = currentValue;
        this.updateAllData(this.newSAData);
      }
    }
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }

  updateAllData(data) {
    this.getStockAdjustments();
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

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
