import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, OnInit, ViewChild, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { CustomerService } from '../../customer/customer.service';
import { CusomerKsmBaseComponent } from '../cusomer-ksm-base/cusomer-ksm-base.component';
@Component({
  selector: 'app-cusomer-ksm-dt',
  templateUrl: './cusomer-ksm-dt.component.html',
  styleUrls: ['./cusomer-ksm-dt.component.scss']
})
export class CusomerKsmDtComponent implements OnInit {
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();

  branchPlantsList: any = [];
  public dataSource: MatTableDataSource<any>;
  tempDataSource: any = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  selectedColumnFilter: string;
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
    { def: 'ksm', title: 'KSM', show: true },
    { def: 'kam', title: 'KAM', show: true }
  ];
  filterForm: FormGroup;

  constructor(
    private customerService: CustomerService,
    public fb: FormBuilder,
  ) {
    this.dataSource = new MatTableDataSource<CusomerKsmBaseComponent>();
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      customer_code: [''],
      customer_name: [''],
      kam: [''],
      kas: [''],
      page: [this.apiResponse.pagination.page],
      page_size: [this.apiResponse.pagination.pageSize],
    });
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getAllCustomerKSMMapping();
  }
  getAllCustomerKSMMapping() {
  
    this.filterForm.value.page=this.apiResponse.pagination.page;
    this.filterForm.value.page_size=this.apiResponse.pagination.pageSize;

    this.customerService.getKSMMappingList(this.filterForm.value).subscribe(res => {
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
    }else {
      this.filterForm.patchValue({
        page: 1,
        page_size: this.apiResponse.pagination.pageSize
      });
    }
    this.getAllCustomerKSMMapping();
  }
  onPageFired(data) {
    this.apiResponse.pagination.page = data['pageIndex'] + 1
    this.apiResponse.pagination.pageSize = data['pageSize'];
    this.getAllCustomerKSMMapping();
  }
}
export interface BranchPlant {

  kas: string;
  customer_code: string;
  customer_name: string;
  kam: string;
}