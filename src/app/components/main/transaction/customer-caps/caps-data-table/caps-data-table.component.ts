import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { ApiService } from 'src/app/services/api.service';
@Component({
  selector: 'app-caps-data-table',
  templateUrl: './caps-data-table.component.html',
  styleUrls: ['./caps-data-table.component.scss']
})
export class CapsDataTableComponent implements OnInit {
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

  years: number[] = [];
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  private allColumns: ColumnConfig[] = [
    { def: 'year', title: 'Year', show: true },
    { def: 'month', title: 'Month', show: true },
    { def: 'customer_code', title: 'Customer Code', show: true },
    { def: 'customer_name', title: 'Customer Name', show: true },
    { def: 'item_code', title: 'Item Code', show: true },
    { def: 'item_name', title: 'Item Name', show: true },
    { def: 'uom', title: 'UOM', show: true },
    { def: 'pending_qty', title: 'Pending Qty', show: true },
    { def: 'total_qty', title: 'Total Qty', show: true },
  ];
  constructor(
    private apiService: ApiService,
    public fb: FormBuilder,
  ) {
    this.dataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      year: [''],
      month: [''],
      customer_code: [''],
      item_code: [''],
      // customer_name: [''],
      page: [this.apiResponse.pagination.page],
      page_size: [this.apiResponse.pagination.pageSize],
    });
    // Populate years from 2015 to current year
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 2015; y--) {
      this.years.push(y);
    }
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getAllregion();
  }
  getAllregion() {
    this.filterForm.value.page = this.apiResponse.pagination.page;
    this.filterForm.value.page_size = this.apiResponse.pagination.pageSize;


    this.apiService.capsList(this.filterForm.value).subscribe(res => {
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
