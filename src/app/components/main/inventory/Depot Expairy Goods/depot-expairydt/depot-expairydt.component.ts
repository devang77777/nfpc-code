import {
  Component,
  OnInit,
  Input,
  ViewChild,
  EventEmitter,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
@Component({
  selector: 'app-depot-expairydt',
  templateUrl: './depot-expairydt.component.html',
  styleUrls: ['./depot-expairydt.component.scss'],
})
export class DepotExpairydtComponent implements OnInit {
  @Input() public isDetailVisible: boolean;
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public newDepotExpData: any;

  public dataSource: MatTableDataSource<DepotExpairy>;
  public DepotExpairy: DepotExpairy[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  private router: Router;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0,
    },
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'date', title: 'Date', show: true },
    { def: 'reference_code', title: 'Reference#', show: true },
    { def: 'depot', title: 'Depot', show: true },
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
    this.dataSource = new MatTableDataSource<DepotExpairy>();
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
    // this.dataSource = new MatTableDataSource<DepotExpairy>(this.route.snapshot.data['resolved'].depotExpairy.data);
    // this.dataSource.paginator = this.paginator

    this.apiResponse = this.route.snapshot.data['resolved'].depotExpairy;
    this.allResData = this.route.snapshot.data['resolved'].depotExpairy.data;
    this.updateDataSource(
      this.route.snapshot.data['resolved'].depotExpairy.data
    );
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: any): void {
    this.router.navigate(['inventory/depot-expairy/detail', data.uuid]);
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

  public checkboxLabel(row?: DepotExpairy): string {
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
    this.getDepotExpairyGoods();
  }

  getDepotExpairyGoods() {
    this.apiService
      .getDepotExpairyGoods(this.page, this.pageSize)
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
        changes.newDepotExpData &&
        Object.keys(changes.newDepotExpData.currentValue).length > 0
      ) {
        let currentValue = changes.newDepotExpData.currentValue;
        this.newDepotExpData = currentValue;
        this.updateAllData(this.newDepotExpData);
      }
    }
  }

  updateAllData(data) {
    this.getDepotExpairyGoods();
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
export interface DepotExpairy {
  id: number;
  uuid: string;
  date: string;
  depot: {
    depot_name: string;
    id: number;
  };
  reference_code: string;
}
