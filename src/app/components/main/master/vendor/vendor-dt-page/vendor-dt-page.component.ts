import { MasterService } from 'src/app/components/main/master/master.service';
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
import { ActivatedRoute } from '@angular/router';
import { EventBusService } from 'src/app/services/event-bus.service';
import { Events } from 'src/app/models/events.model';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-vendor-dt-page',
  templateUrl: './vendor-dt-page.component.html',
  styleUrls: ['./vendor-dt-page.component.scss'],
})
export class VendorDtPageComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;

  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];

  private apiService: ApiService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  @Input() public newVendorData: any = {};
  selectedColumnFilter: string;

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
    { def: 'vender_code', title: 'Vendor Code', show: true },
    { def: 'firstname', title: 'Name', show: true },
    { def: 'company_name', title: 'Company Name', show: true },
    { def: 'mobile', title: 'Mobile', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'vender_code', title: 'Vendor Code', show: true },
  ];

  constructor(
    public masterService: MasterService,
    apiService: ApiService,
    private eventService: EventBusService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    deleteDialog: MatDialog,
    private route: ActivatedRoute,
    private toast: CommonToasterService,
  ) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<VendorData>();
  }
  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.apiResponse = this.route.snapshot.data['vendor_resolve'].itemList;
    this.allResData = this.route.snapshot.data['vendor_resolve'].itemList.data;
    this.updateDataSource(this.route.snapshot.data['vendor_resolve'].itemList.data);

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
      })
    );

    this.subscriptions.push(
      this.eventService.on(Events.SEARCH_DELIVERY, (data) => {
        this.dataSource = new MatTableDataSource<VendorData>(data);
        this.dataSource.paginator = this.paginator;
      })
    );
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: VendorData): void {
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

  public checkboxLabel(row?: VendorData): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  getPaginatorValue(len: number) {
    return len < 10 ? true : false;
  }

  public editCustomer(customer: any): void {
    this.dataEditor.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: customer,
    });
    this.openAddCustomer();
  }

  public openDeleteBox(vendor: any): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete this Vendor ${vendor.vender_code} ?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteCustomer(vendor);
        }
      });
  }

  private deleteCustomer(customer: any): void {
    this.apiService.deleteCustomer(customer.uuid).subscribe((result) => {
      this.toast.showInfo('Delete Sucessfull', 'Vendors Sucessfully Deleted');
      this.updateAllData(customer);
    });
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }



  private openAddCustomer(): void {
    this.fds.setFormName('vendor');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getVendorsData();
  }

  getVendorsData() {
    this.masterService.vendordetailList(this.page, this.pageSize).subscribe((res) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    })

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newVendorData && Object.keys(changes.newVendorData.currentValue).length > 0) {
        let currentValue = changes.newVendorData.currentValue;
        this.newVendorData = currentValue;
        this.updateAllData(this.newVendorData);
      }
    }
  }

  updateAllData(data) {
    ////console.log(data);
    this.subscriptions.push(
      this.masterService.vendordetailList(this.page, this.pageSize).subscribe((res) => {
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
        tableData.push(data);
      }

    }
    this.allResData = tableData;
    this.updateDataSource(tableData)
  }

  updateDataSource(data) {
    this.dataSource = new MatTableDataSource<any>(data);
    // this.dataSource.paginator = this.paginator;
  }

}
export interface VendorData {
  id: number;
  uuid: String;
  organisation_id: number;
  vender_code: string;
  firstname: string;
  lastname: string;
  email: string;
  company_name: string;
  mobile: string;
  website: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}
