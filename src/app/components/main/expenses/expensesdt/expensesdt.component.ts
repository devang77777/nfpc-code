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
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { EventBusService } from 'src/app/services/event-bus.service';
import { Events } from 'src/app/models/events.model';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
@Component({
  selector: 'app-expensesdt',
  templateUrl: './expensesdt.component.html',
  styleUrls: ['./expensesdt.component.scss'],
})
export class ExpensesdtComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;

  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  private apiService: ApiService;
  private fds: FormDrawerService;
  selectedColumnFilter: string;

  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  @Input() public newExpenseData: any = {};
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
    { def: 'expense_date', title: 'Daate', show: true },
    { def: 'amount', title: 'Expenses Amount', show: true },
    { def: 'reference', title: 'Reference', show: true },
    { def: 'customer', title: 'Customer Name', show: true },
    { def: 'customerCode', title: 'Customer Code', show: true },
    { def: 'expense_category', title: 'ExpenseCategory', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'expand', title: 'Detail', show: true },
  ];

  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    private eventService: EventBusService,
    fds: FormDrawerService,
    deleteDialog: MatDialog
  ) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Expenses>();
  }
  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.subscriptions.push(
      this.apiService.getExpensess().subscribe((res: any) => {
        //console.log('Customer : ', res.data);
        this.dataSource = new MatTableDataSource<Expenses>(res.data);
        this.dataSource.paginator = this.paginator;
      })
    );

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
      this.eventService.on(Events.SEARCH_EXPENSE, (data) => {
        this.updateDataSource(data);
        this.dataSource.paginator = this.paginator;
      })
    );
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getExpensess();
  }

  getExpensess() {
    this.subscriptions.push(
      this.apiService
        .getExpensess(this.page, this.pageSize)
        .subscribe((res: any) => {
          this.apiResponse = res;
          this.allResData = res.data;
          this.updateDataSource(res.data);
        })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (
        changes.newExpenseData &&
        Object.keys(changes.newExpenseData.currentValue).length > 0
      ) {
        let currentValue = changes.newExpenseData.currentValue;
        this.newExpenseData = currentValue;
        this.updateAllData(this.newExpenseData);
      }
    }
  }

  updateAllData(data) {
    //console.log(data);
    this.subscriptions.push(
      this.apiService
        .getExpensess(this.page, this.pageSize)
        .subscribe((res) => {
          this.apiResponse = res;
          this.allResData = res.data;
          this.updateDataSource(res.data);
          this.selections = new SelectionModel(true, []);
          let tableData = res.data;
          if (data.delete !== undefined && data.delete == true) {
            this.closeDetailView();
          } else {
            if (data.edit !== undefined && data.edit == true) {
              //console.log('in edit');
              let dataObj = tableData.filter(
                (rec) => rec.uuid.indexOf(data.uuid) !== -1
              )[0];
              this.openDetailView(dataObj);
            }
          }
        })
    );
    return false;
    let tableData = this.allResData;
    if (data.delete !== undefined && data.delete == true) {
      let indexp = tableData.filter(
        (rec) => rec.uuid.indexOf(data.uuid) !== -1
      )[0];
      let index = tableData.indexOf(indexp);
      tableData.splice(index, 1);
      this.closeDetailView();
    } else {
      if (data.edit !== undefined && data.edit == true) {
        let indexp = tableData.filter(
          (rec) => rec.uuid.indexOf(data.uuid) !== -1
        )[0];
        let index = tableData.indexOf(indexp);
        tableData[index] = data;
        this.openDetailView(data);
      } else {
        tableData.push(data);
      }
    }
    this.allResData = tableData;
    this.updateDataSource(tableData);
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
  onColumnFilter(item) {

  }

  public openDetailView(data: Expenses): void {
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

  public checkboxLabel(row?: Expenses): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  getPaginatorValue(len: number) {
    return len < 10 ? true : false;
  }
  private openAddBank(): void {
    this.fds.setFormName('add-expense');
    this.fds.setFormType('Add');
    this.fds.open();
  }
  public editBrand(brandData: any): void {
    this.dataEditor.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: brandData,
    });
    this.openAddBank();
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
  // public openDetailView(data: Expenses): void {
  //   this.isDetailVisible = true;
  //   this.itemClicked.emit(data);
  //   this.updateCollapsedColumns();
  // }
  // public editCustomer(customer: any): void {
  //   this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: customer });
  //   this.openAddCustomer();
  // }

  // public openDeleteBox(customer: any): void {
  //   this.deleteDialog.open(DeleteConfirmModalComponent, {
  //     width: '500px',
  //     data: { title: `Are you sure want to delete this customer ?` }
  //   }).afterClosed().subscribe(data => {
  //     if (data.hasConfirmed) {
  //       this.deleteCustomer(customer);
  //     }
  //   });
  // }

  // private deleteCustomer(customer: any): void {
  //   this.apiService.deleteCustomer(customer.uuid).subscribe(result => {
  //     window.location.reload();
  //   });
  // }

  // private openAddCustomer(): void {
  //   this.fds.setFormName('customer');
  //   this.fds.open();
  // }
}
export interface Expenses {
  id: number;
  status: number;
  expense_date: string;
  expense_category: { id: number; name: string };
  amount: number;
  customer_info: {
    id: number;
    user: {
      id: number;
      firstname: string;
    };
  };
  reference: string;
}
