import { Router, ActivatedRoute } from '@angular/router';
import {
  Component,
  OnInit,
  ViewChild,
  Output,
  Input,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
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
import {
  APP_CURRENCY_CODE,
  CompDataServiceType,
} from 'src/app/services/constants';
import { EventBusService } from 'src/app/services/event-bus.service';
import { Events } from 'src/app/models/events.model';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
@Component({
  selector: 'app-estimatedt',
  templateUrl: './estimatedt.component.html',
  styleUrls: ['./estimatedt.component.scss'],
})
export class EstimatedtComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public newEstimateData: any;
  @Input() public isDetailVisible: boolean;

  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  selectedColumnFilter: string;

  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
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

  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'estimate_date', title: 'DATE', show: true },
    { def: 'estimate_code', title: 'Estimate Code', show: true },
    { def: 'reference', title: 'Reference', show: true },
    { def: 'customer_info', title: 'Customer Name', show: true },
    { def: 'customer_code', title: 'Customer Code', show: true },
    { def: 'net_total', title: 'Amount', show: true },
    { def: 'status', title: 'Status', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'expand', title: 'Detail', show: true },
  ];

  constructor(
    private apiService: ApiService,
    dataEditor: DataEditor,
    private eventService: EventBusService,
    private route: ActivatedRoute,
    fds: FormDrawerService,
    deleteDialog: MatDialog
  ) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Estimate>();
  }
  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    // this.dataSource = new MatTableDataSource<any>(
    //   this.route.snapshot.data['resolved'].estimation.data
    // );
    // this.dataSource.paginator = this.paginator;

    this.apiResponse = this.route.snapshot.data['resolved'].estimation;
    this.allResData = this.route.snapshot.data['resolved'].estimation.data;
    this.updateDataSource(this.route.snapshot.data['resolved'].estimation.data);

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
        if (value.uuid) {
          const clone = JSON.parse(JSON.stringify(this.dataSource.data));
          const index = clone.findIndex((x) => x.uuid === value.uuid);
          if (index > -1) {
            clone.splice(index, 1);
            this.dataSource.data = clone;
          }
        }
      })
    );
    this.subscriptions.push(
      this.eventService.on(Events.SEARCH_ESTIMATE, (data) => {
        this.dataSource = new MatTableDataSource<any>(data);
        this.dataSource.paginator = this.paginator;
      })
    );
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }

  public openDetailView(data: any): void {
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

  public toggleSelection(): void {
    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));
  }

  public checkboxLabel(row?: Estimate): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  getPaginatorValue(len: number) {
    return len < 10 ? true : false;
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getEstimate();
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (
        changes.newEstimateData &&
        Object.keys(changes.newEstimateData.currentValue).length > 0
      ) {
        let currentValue = changes.newEstimateData.currentValue;
        this.newEstimateData = currentValue;
        this.updateAllData(this.newEstimateData);
      }
    }
  }

  updateAllData(data) {
    this.getEstimate();
    this.selections = new SelectionModel(true, []);
    if (data.delete !== undefined && data.delete == true) {
      this.closeDetailView();
    }
    return false;
  }

  getEstimate() {
    this.apiService.getEstimate(this.page, this.pageSize).subscribe((res) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    });
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
export interface Estimate {
  id: number;
  uuid: string;
  estimate_date: string;
  estimate_code: number;
  reference: number;
  customer_info: {
    id: number;
    user: {
      id: number;
      firstname: string;
      lastname: string;
      display_name: string;
    };
    user_id: number;
  };
  salesperson: { id: number; name: string; email: string };
  net_total: number;
  status: number;
}
