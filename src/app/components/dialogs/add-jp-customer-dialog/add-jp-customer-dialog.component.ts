import { MasterService } from 'src/app/components/main/master/master.service';
import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { MerchandisingService } from '../../main/merchandising/merchandising.service';
import { SelectionModel } from '@angular/cdk/collections';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormGroup, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-add-jp-customer-dialog',
  templateUrl: './add-jp-customer-dialog.component.html',
  styleUrls: ['./add-jp-customer-dialog.component.scss']
})
export class AddJpCustomerDialogComponent implements OnInit {
  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns = ['select', 'customer_code', 'customer_name']
  public filterColumns: ColumnConfig[] = [];
  selectedColumnFilter: string;
  private apiService: ApiService;
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
  constructor(
    public fb: FormBuilder,
    apiService: ApiService,
    public merService: MasterService,
    private cd: ChangeDetectorRef,
    private cts: CommonToasterService,
    @Inject(MAT_DIALOG_DATA) public customersData: any,
    private dialog: MatDialogRef<AddJpCustomerDialogComponent>
  ) {
    Object.assign(this, { apiService });
    this.dataSource = new MatTableDataSource<any>();
  }
  filterForm: FormGroup;

  ngOnInit(): void {
    //console.log(this.customersData);
    this.apiResponse = this.customersData;
    this.allResData = this.customersData.data;
    this.updateDataSource(this.customersData.data);
    this.filterForm = this.fb.group({
      customer_code: [''],
      name: [''],
      email: [''],
      customer_phone: [''],
      page: [this.page],
      page_size: [this.pageSize],
      all : true
    })
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    }
    this.filterForm.patchValue({
      page: 1,
      page_size: 10
    });
    this.getCustomersData();

  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getCustomersData();
  }

  getCustomersData() {
    this.merService.customerDetailListTable(this.filterForm.value).subscribe((res) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    })

  }

  updateDataSource(data) {
    this.dataSource = new MatTableDataSource<any>(data);
    // this.dataSource.paginator = this.paginator;
  }

  saveJpCustomers() {
    this.dialog.close(this.selections.selected);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;

  }

  public toggleSelection(): void {
    this.isAllSelected() ? this.selections.clear() : this.dataSource.data.forEach(row => this.selections.select(row));
  }

  public checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }


  getPaginatorValue(len: number) {
    return len < 3 ? true : false;
  }

  close(closeType?: any) {
    this.dialog.close();
  }

}
