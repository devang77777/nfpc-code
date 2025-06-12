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
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { PurchaseOrderModel } from '../purchase-order-model';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import {
  APP_CURRENCY_CODE,
  CompDataServiceType,
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';

import { ApiService } from 'src/app/services/api.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Utils } from 'src/app/services/utils';
import { EventBusService } from 'src/app/services/event-bus.service';
import { Events } from 'src/app/models/events.model';
import { DataEditor } from 'src/app/services/data-editor.service';
import { PAGE_SIZE_10 } from 'src/app/app.constant';

@Component({
  selector: 'app-purchase-order-data-table',
  templateUrl: './purchase-order-data-table.component.html',
  styleUrls: ['./purchase-order-data-table.component.scss'],
})
export class PurchaseOrderDataTableComponent implements OnInit, OnDestroy {
  @Input() public isDetailVisible: boolean;
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public newPOrderData: any;
  public dataSource: MatTableDataSource<PurchaseOrderModel>;
  public purchaseOrders: PurchaseOrderModel[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  selectedColumnFilter: string;

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
    { def: 'misc', title: 'Purchase Orders', show: false },
    { def: 'expected_delivery_date', title: 'Date', show: true },
    { def: 'purchase_order', title: 'Purchase Order#', show: true },
    { def: 'vendor', title: 'Vendor Name', show: true },
    { def: 'net_total', title: 'Amount', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'expand', title: 'Detail', show: true },
  ];
  private dataEditor: DataEditor;
  constructor(
    private apiService: ApiService,
    dataEditor: DataEditor,
    private eventService: EventBusService,

    fds: FormDrawerService,
    deleteDialog: MatDialog,
    private route: ActivatedRoute,
    router: Router
  ) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog, router });
    this.dataSource = new MatTableDataSource<PurchaseOrderModel>();
  }

  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...[...this.allColumns].splice(2)];

    this.apiResponse = this.route.snapshot.data['resolved'].purchase;
    this.allResData = this.route.snapshot.data['resolved'].purchase.data;
    this.updateDataSource(this.route.snapshot.data['resolved'].purchase.data);

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
      this.eventService.on(Events.SEARCH_DELIVERY, (data) => {
        this.dataSource = new MatTableDataSource<any>(data);
        this.dataSource.paginator = this.paginator;
      })
    );
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
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

  public checkboxLabel(row?: PurchaseOrderModel): string {
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
    this.getPurchaseOrders();
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (
        changes.newPOrderData &&
        Object.keys(changes.newPOrderData.currentValue).length > 0
      ) {
        let currentValue = changes.newPOrderData.currentValue;
        this.newPOrderData = currentValue;
        this.updateAllData(this.newPOrderData);
      }
    }
  }

  updateAllData(data) {
    this.getPurchaseOrders();
    this.selections = new SelectionModel(true, []);
    if (data.delete !== undefined && data.delete == true) {
      this.closeDetailView();
    }
    return false;
  }

  getPurchaseOrders() {
    this.apiService
      .getPurchaseOrders(this.page, this.pageSize)
      .subscribe((res) => {
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
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
