import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { ApiService } from 'src/app/services/api.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { Utils } from 'src/app/services/utils';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
// import {ColumnConfig} from '../../../interfaces/interfaces';
// import {ApiService} from '../../../services/api.service';
// import {FormDrawerService} from '../../../services/form-drawer.service';
// import {DataEditor} from '../../../services/data-editor.service';
// import {CompDataServiceType} from '../../../services/constants';
// import {Utils} from '../../../services/utils';
// import {DeleteConfirmModalComponent} from '../../shared/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-outlet-product-data-table',
  templateUrl: './outlet-product-data-table.component.html',
  styleUrls: ['./outlet-product-data-table.component.scss']
})
export class OutletProductDataTableComponent implements OnInit, OnDestroy {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;

  public dataSource: MatTableDataSource<OutletProductModel>;
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
    { def: 'opCode', title: 'Code', show: true },
    { def: 'opName', title: 'Name', show: true },
    { def: 'status', title: 'Status', show: true }
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'opName', title: 'Name', show: true }
  ];
  @Input() public newOpdData: any;
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
    this.dataSource = new MatTableDataSource<OutletProductModel>();
  }

  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.getAllOutletProductCode();

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
  }

  getAllOutletProductCode() {
    this.subscriptions.push(
      this.apiService.getAllOutletProductCodeDt(this.page, this.pageSize).subscribe((res: any) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
      })
    );
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getAllOutletProductCode();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newOpdData && Object.keys(changes.newOpdData.currentValue).length > 0) {
        let currentValue = changes.newOpdData.currentValue;
        this.newOpdData = currentValue;
        this.updateAllData(this.newOpdData);
      }
    }
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.apiService.getAllOutletProductCodeDt(this.page, this.pageSize).subscribe((res) => {
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

  public openDetailView(data: OutletProductModel): void {
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.updateCollapsedColumns();
  }

  public getDisplayedColumns(): string[] {
    return this.displayedColumns.filter(column => column.show).map(column => column.def);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }
  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }
  public toggleSelection(): void {
    this.isAllSelected() ? this.selections.clear() : this.dataSource.data.forEach(row => this.selections.select(row));
  }

  public checkboxLabel(row?: OutletProductModel): string {
    if (!row) {

      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public openDeleteBox(outletProdData: OutletProductModel): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete ${outletProdData.name}?` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteOutletProduct(outletProdData);
      }
    });
  }

  private deleteOutletProduct(data: OutletProductModel): void {
    this.apiService.deleteOutletProductCode(data.uuid).subscribe(result => {
      window.location.reload();
    });
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }
}

export interface OutletProductModel {
  "id": number;
  "uuid": string;
  "status": number;
  "organisation_id": number;
  "name": string;
  "code": string;
  "created_at": string;
  "updated_at": string;
  "outlet_product_code_customers": {
    "id": number;
    "uuid": string;
    "outlet_product_code_id": number;
    "customer_id": number;
    "customer": {
      "id": number;
      "firstname": string;
      "lastname": string;
    }
  }[];
  "outlet_product_code_items": {
    "id": number;
    "uuid": string;
    "outlet_product_code_id": number;
    "item_id": number;
    "outlet_product_code": string;
    "item": {
      "id": number;
      "item_code": string;
      "item_name": string;
    }
  }[];
}
