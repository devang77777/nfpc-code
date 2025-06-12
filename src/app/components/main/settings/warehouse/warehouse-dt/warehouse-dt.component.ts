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
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
@Component({
  selector: 'app-warehouse-dt',
  templateUrl: './warehouse-dt.component.html',
  styleUrls: ['./warehouse-dt.component.scss'],
})
export class WarehouseDtComponent implements OnInit {


  getPaginatorValue(len: number) {
    return len < 10 ? true : false;
  }
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  // tslint:disable-next-line: member-ordering
  @Input() public isDetailVisible: boolean;
  @Input() public newWarehouseData: any;

  public dataSource: MatTableDataSource<Warehouse>;
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
    { def: 'code', title: 'Code', show: true },
    { def: 'name', title: 'name', show: true },
    { def: 'manager', title: 'Manager', show: true },
    { def: 'depot.depot_name', title: 'Depot', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'name', title: 'Name', show: true },
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
    this.dataSource = new MatTableDataSource<Warehouse>();
  }

  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getwarehouseList();


    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getwarehouseList();
  }

  getwarehouseList() {
    this.subscriptions.push(this.apiService.getwarehouseList(this.page, this.pageSize).subscribe((res: any) => {
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
      if (changes.newWarehouseData && Object.keys(changes.newWarehouseData.currentValue).length > 0) {
        let currentValue = changes.newWarehouseData.currentValue;
        this.newWarehouseData = currentValue;
        this.updateAllData(this.newWarehouseData);
      }
    }
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.apiService.getwarehouseList(this.page, this.pageSize).subscribe((res) => {
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

  public openDetailView(data: Warehouse): void {
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

  public toggleSelection(): void {
    this.isAllSelected() ? this.selections.clear() : this.dataSource.data.forEach(row => this.selections.select(row));
  }

  public checkboxLabel(row?: Warehouse): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;

      return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
    }
  }
  public editBrand(brandData: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: brandData });
    this.openAddWarehouse();
  }

  public openDeleteBox(bankdelete: any): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Bank ${bankdelete.uuid}?` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deletebank(bankdelete);
      }
    });
  }

  private deletebank(branddel: any): void {
    this.apiService.deleteBankItem(branddel.uuid).subscribe(result => {
      window.location.reload();
    });
  }

  private openAddWarehouse(): void {
    this.fds.setFormName('add-warehouse');
    this.fds.setFormType("Add");
    this.fds.open();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }

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
export interface Warehouse {
  id: number;
  uuid: string,
  organisation_id: number;
  code: string,
  name: string;
  address: string;
  manager: string;
  depot_id: number;
  route_id: number;
  parent_warehouse_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  stock: Stock
  depot: {
    depot_code: string;
    depot_name: string;
    id: number;
  }
  route: {
    id: number;
    route_code: string;
    route_name: string;
  },

  parent_warehouses: string;
  organisation: {
    id: number,
    uuid: string;
    org_name: string;
    org_company_id: string,
    org_tax_id: string;
    org_street1: string;
    org_street2: string;
    org_city: string;
    org_state: string;
    org_country_id: number;
    org_postal: string;
    org_phone: string;
    org_contact_person: string;
    org_contact_person_number: string;
    org_currency: string;
    org_fasical_year: string;
    is_batch_enabled: string;
    is_credit_limit_enabled: number;
    org_logo: string;
    gstin_number: string;
    gst_reg_date: string;
    is_auto_approval_set: number;
    org_status: 1,
    created_at: string,
    updated_at: string,
    deleted_at: string
  }


}
export interface Stock {
  batch: string;
  created_at: string;
  deleted_at: string;
  id: number
  item_id: number;
  item_uom_id: number
  qty: string;
  Warehouse_id: number
  item: {
    id: number
    item_code: string;
    item_name: string;
  };
  item_uom: {
    id: number
    code: number
    name: number
  };

}
