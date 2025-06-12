import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { CustomerService } from '../../customer/customer.service';
import { CustomerZoneBaseComponent } from '../customer-zone-base/customer-zone-base.component';

@Component({
  selector: 'app-customer-zone-dt',
  templateUrl: './customer-zone-dt.component.html',
  styleUrls: ['./customer-zone-dt.component.scss']
})
export class CustomerZoneDtComponent implements OnInit {
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  selectedColumnFilter: string;

  regionList: any = [];
  public dataSource: MatTableDataSource<any>;
  tempDataSource: any = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  filterForm: FormGroup;
  public apiResponse = {
    pagination: {
      total_records: 0,
      page: 1,
      pageSize: PAGE_SIZE_10,
      currentPage: 0
    }
  };

  private allColumns: ColumnConfig[] = [
    { def: 'customer_code', title: 'Customer Code', show: true },
    { def: 'customer_name', title: 'Customer Name', show: true },
    { def: 'zone', title: 'Zone', show: true }
  ];
  constructor(
    private customerService: CustomerService,
    public fb: FormBuilder,
  ) {
    this.dataSource = new MatTableDataSource<CustomerZoneBaseComponent>();
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      customer_code: [''],
      customer_name: [''],
      zone: [''],
      page: [this.apiResponse.pagination.page],
      page_size: [this.apiResponse.pagination.pageSize],
    });
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getAllregion();
  }
  getAllregion() {
    this.filterForm.value.page = this.apiResponse.pagination.page;
    this.filterForm.value.page_size = this.apiResponse.pagination.pageSize;


    this.customerService.getZoneList(this.filterForm.value).subscribe(res => {
      this.dataSource = res.data;
      this.dataSource.paginator = this.paginator;
      this.tempDataSource = res.data;
      this.apiResponse.pagination.total_records = res.pagination.total_records;
      this.apiResponse.pagination.currentPage = res.pagination.current_page;

    });
  }
  public getDisplayedColumns(): string[] {
    return this.displayedColumns.filter(column => column.show).map(column => column.def);
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {
    if (!item) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    } else {
      this.filterForm.patchValue({
        page: 1,
        page_size: this.apiResponse.pagination.pageSize
      });
    }
    this.getAllregion();
  }
  onPageFired(data) {
    this.apiResponse.pagination.page = data['pageIndex'] + 1
    this.apiResponse.pagination.pageSize = data['pageSize'];
    this.getAllregion();
  }
}
