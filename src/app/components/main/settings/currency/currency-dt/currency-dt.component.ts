import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CompDataServiceType } from 'src/app/services/constants';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { ApiService } from 'src/app/services/api.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { Currency } from '../currency-form/currency-form.component';
import { PAGE_SIZE_10 } from 'src/app/app.constant';

@Component({
  selector: 'app-currency-dt',
  templateUrl: './currency-dt.component.html',
  styleUrls: ['./currency-dt.component.scss']
})
export class CurrencyDtComponent implements OnInit {

  public dataSource: MatTableDataSource<any>;
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public newCurrencyData: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];

  private apiService: ApiService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];

  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'currency_name', title: 'Name', show: true },
    { def: 'currency_symbol', title: 'Symbol', show: true },
    { def: 'exchange_rate', title: 'Exchange Rate', show: true },
    { def: 'as_of_date', title: 'As of Date', show: true },
    { def: 'actions', title: 'Actions', show: true },
  ];

  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;


  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    deleteDialog: MatDialog) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Country>();
  }
  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getAllCurrencies();
    // this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
    //   if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
    //     this.closeDetailView();
    //   }
    // }));
  }

  getAllCurrencies() {
    this.subscriptions.push(this.apiService.getAllCurrencies(this.page, this.pageSize).subscribe((res: any) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);

    }));
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getAllCurrencies();
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newCurrencyData && Object.keys(changes.newCurrencyData.currentValue).length > 0) {
        let currentValue = changes.newCurrencyData.currentValue;
        this.newCurrencyData = currentValue;
        this.updateAllData(this.newCurrencyData);
      }
    }
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.apiService.getAllCurrencies(this.page, this.pageSize).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
        this.selections = new SelectionModel(true, []);
        let tableData = res.data;
        if (data.delete !== undefined && data.delete == true) {
        } else {
          if (data.edit !== undefined && data.edit == true) {
            let dataObj = tableData.filter(rec => rec.id.indexOf(data.id) !== -1)[0];
          }
        }
      })
    );
    return false;
    let tableData = this.allResData;
    if (data.delete !== undefined && data.delete == true) {
      let indexp = tableData.filter(rec => rec.id.indexOf(data.id) !== -1)[0];
      let index = tableData.indexOf(indexp);
      tableData.splice(index, 1);
    } else {
      if (data.edit !== undefined && data.edit == true) {
        let indexp = tableData.filter(rec => rec.id.indexOf(data.id) !== -1)[0];
        let index = tableData.indexOf(indexp);
        tableData[index] = data;
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


  public getDisplayedColumns(): string[] {
    return this.displayedColumns.filter(column => column.show).map(column => column.def);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }

  public toggleSelection(): void {
    this.isAllSelected() ? this.selections.clear() : this.dataSource.data.forEach(row => this.selections.select(row));
  }

  public checkboxLabel(row?: Country): string {
    if (!row) {

      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public editCurrency(currency: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: currency });
    this.openAddCurrency();
    //console.log(currency);

  }

  public openDeleteBox(currency: any): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete this currency ?` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteCurrency(currency);
      }
    });
  }

  private deleteCurrency(currency: any): void {
    let delObj = { id: currency.id, delete: true };
    this.apiService.deleteCurrency(currency.id).subscribe(result => {
      this.updateAllData(delObj);
    });
  }

  private openAddCurrency(): void {
    this.fds.setFormName('country');
    this.fds.setFormType("Edit");
    this.fds.open();
  }

}

export interface Country {
  id: string;
  name: string;
  country_code: string;
  dial_code: string;
  currency: string;
  currency_code: string;
  currency_symbol: string;
  uuid: string;
}