import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, OnInit, ViewChild, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { CustomerService } from '../../customer/customer.service';
import { CustomerBranchPlantBaseComponent } from '../customer-branch-plant-base/customer-branch-plant-base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
@Component({
  selector: 'app-customer-branch-plant-dt',
  templateUrl: './customer-branch-plant-dt.component.html',
  styleUrls: ['./customer-branch-plant-dt.component.scss']
})
export class CustomerBranchPlantDtComponent implements OnInit {
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
   @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
    @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
    @Input() public isDetailVisible: boolean;
  public selectedTab = 0;
  
  // private deleteDialog: MatDialog;
  
  branchPlantsList: any = [];
  public dataSource: MatTableDataSource<any>;
  tempDataSource: any = [];
  uuid: string;
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
    { def: 'sales_org', title: 'Sales Org', show: true },
    { def: 'branch_plant', title: 'Branch Plant', show: true },
    { def: 'delete', title: ' ', show: true },
  ];
  filterForm: FormGroup;

  constructor(
    private customerService: CustomerService,
    private dialogRef: MatDialog,
    public fb: FormBuilder,
    private dataService: DataEditor,
  private apiService: ApiService,
  private commonToasterService: CommonToasterService,

  ) {
    this.dataSource = new MatTableDataSource<CustomerBranchPlantBaseComponent>();
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      customer_code: [''],
      customer_name: [''],
      sales_org: [''],
      branch_plant: [''],
      page: [this.apiResponse.pagination.page],
      page_size: [this.apiResponse.pagination.pageSize],
    });
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getAllBranchPlants();
    console.log(this.uuid)
  }
  getAllBranchPlants() {

    this.filterForm.value.page = this.apiResponse.pagination.page;
    this.filterForm.value.page_size = this.apiResponse.pagination.pageSize;

    this.customerService.getBranchPlantList(this.filterForm.value).subscribe(res => {
      this.dataSource = res.data;
      this.uuid = res.data?.uuid;
      this.dataSource.paginator = this.paginator;
      this.tempDataSource = res.data;
      this.apiResponse.pagination.total_records = res.pagination.total_records;
      this.apiResponse.pagination.currentPage = res.pagination.current_page;

    });
  }

  getBranchPlants(){
    this.customerService.getBranchPlantList(this.filterForm.value).subscribe(res =>{
      this.branchPlantsList = res.data;

    })
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
//   // public openDeleteBox(index: number): void {
//   //     this.dialogRef
//   //       .open(DeleteConfirmModalComponent, {
//   //         width: '500px',
//   //         data: {
//   //           title: `Are you sure want to delete this item?`,
//   //           isReason: null
//   //         },
//   //       })
//   //       .afterClosed()
//   //       .subscribe((data) => {
//   //         if (data.hasConfirmed) {
//   //           // this.deleteItemRow(index);
//   //         }
//   //       });
//   //   }
//   public openDeleteBox(uuid: string): void {
//   this.dialogRef
//     .open(DeleteConfirmModalComponent, {
//       width: '500px',
//       data: {
//         title: `Are you sure want to delete this item?`,
//         isReason: null
//       },
//     })
//     .afterClosed()
//     .subscribe((data) => {
//       if (data?.hasConfirmed) {
//         this.apiService.deleteBranchPlant(uuid).subscribe({
//           next: (res) => {
//             console.log('Deleted successfully:', res);
//             // this.refreshTable(); // Refresh your data table
//           },
//           error: (err) => {
//             console.error('Error deleting item:', err);
//             alert('Failed to delete item.');
//           }
//         });
//       }
//     });
// }

//     deleteRow(uuid: any) {
 
   
// }
 public openDeleteBox(uuid: string): void {
    this.dialogRef.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Branch Plant` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deletePlant(uuid);
      }
    });
  }

  public deletePlant(uuid: string): void {
    let delObj = { uuid, delete: true };
    this.apiService.deleteBranchPlant(uuid).subscribe(result => {
      this.commonToasterService.showInfo("Deleted", "Branch Plant deleted sucessfully");
      this.updateTableData.emit(delObj);
      this.getAllBranchPlants();
      this.closeDetailView();
    });
  }
   public closeDetailView(): void {
      this.selectedTab = 0;
      this.isDetailVisible = false;
      this.detailsClosed.emit();
      this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
    }
}
export interface BranchPlant {

  branch_plant: string;
  customer_code: string;
  customer_name: string;
  sales_org: string;
}