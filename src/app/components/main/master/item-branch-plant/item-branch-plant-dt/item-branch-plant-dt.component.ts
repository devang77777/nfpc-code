import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, OnInit, ViewChild, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { MasterService } from '../../master.service';
import { ItemBranchPlantBaseComponent } from '../item-branch-plant-base/item-branch-plant-base.component';
@Component({
  selector: 'app-item-branch-plant-dt',
  templateUrl: './item-branch-plant-dt.component.html',
  styleUrls: ['./item-branch-plant-dt.component.scss']
})
export class ItemBranchPlantDtComponent implements OnInit {

  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  selectedColumnFilter: string;
  filterForm: FormGroup;

  branchPlantsList: any = [];
  public dataSource: MatTableDataSource<any>;
  tempDataSource: any = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      page: 1,
      pageSize: PAGE_SIZE_10,
      currentPage: 0
    }
  };

  private allColumns: ColumnConfig[] = [

    { def: 'sales_org', title: 'Sales Org', show: true },
    { def: 'branch_plant', title: 'Branch Plant', show: true },
    { def: 'item_code', title: 'Item Code', show: true },
    { def: 'item_name', title: 'Item Name', show: true },
    { def: 'status', title: 'Status', show: true },

  ]
  constructor(
    private masterService: MasterService,
    public fb: FormBuilder,
  ) {
    this.dataSource = new MatTableDataSource<ItemBranchPlantBaseComponent>();
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      sales_org: [''],
      branch_plant: [''],
      item_code: [''],
      item_name: [''],
      status: [''],
      page: [this.apiResponse.pagination.page],
      page_size: [this.apiResponse.pagination.pageSize],
    });
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getAllBranchPlants();
  }
  getAllBranchPlants() {
    this.filterForm.value.page = this.apiResponse.pagination.page;
    this.filterForm.value.page_size = this.apiResponse.pagination.pageSize;


    this.masterService.getItemBranchPlantList(this.filterForm.value).subscribe(res => {
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
    this.getAllBranchPlants();
  }
  onPageFired(data) {
    this.apiResponse.pagination.page = data['pageIndex'] + 1
    this.apiResponse.pagination.pageSize = data['pageSize'];
    this.getAllBranchPlants();
  }
}
export interface BranchPlant {

  branch_plant: string;
  customer_code: string;
  customer_name: string;
  sales_org: string;
}


