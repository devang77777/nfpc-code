import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, OnInit, ViewChild, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { CustomerService } from '../../customer/customer.service';
import { MatDialog } from '@angular/material/dialog';
import { CustomerSupervisorBaseComponent } from '../customer-supervisor-base/customer-supervisor-base.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { startWith, map } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-customer-supervisor-dt',
  templateUrl: './customer-supervisor-dt.component.html',
  styleUrls: ['./customer-supervisor-dt.component.scss']
})
export class CustomerSupervisorDtComponent implements OnInit {
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
   @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
    @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
   public selectedTab = 0;
    @Input() public isDetailVisible: boolean;
searchSubject = new Subject<string>();
  channelList : any= [];
  branchPlantsList: any = [];
  filteredSupervisorList: any[] = [];
  supervisor: any = [];
  supervisorSearchText: string = '';
  supervisorList: any = [];
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
    { def: 'channel_name', title: 'Service Channel', show: true },
    { def: 'supervisor_id', title: 'Supervisor Name', show: true },
    { def: 'delete', title: ' ', show: true },
  ];
  filterForm: FormGroup;
  filteredSupervisors: string[] = [];
  constructor(
 private dialogRef: MatDialog,
private apiService: ApiService,
private commonToasterService: CommonToasterService,

    private customerService: CustomerService,
    private dataService: DataEditor,
    public fb: FormBuilder,
  ) {
    this.dataSource = new MatTableDataSource<CustomerSupervisorBaseComponent>();
  }

  ngOnInit(): void {
    this.getChannelList();
    this.getAllSupervisorList();
    // this.getSupervisorData()
    this.filterForm = this.fb.group({
      customer_code: [''],
      customer_name: [''],
      channel_name: [''],
      supervisor_id: [[]],
      page: [this.apiResponse.pagination.page],
      page_size: [this.apiResponse.pagination.pageSize],
    });
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getAllBranchPlants();
    // this.filterForm.get('supervisor_id')!.valueChanges.pipe(startWith(''),map(value => this._filterSupervisor(value || []))
    //   )
    //   .subscribe(filtered => {
    //     this.filteredSupervisors = filtered;
    //   });
     this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
    this.filterSupervisorList();
  });

  // after loading supervisors
  this.filteredSupervisorList = [...this.supervisorList];
  }
  getAllBranchPlants() {

    this.filterForm.value.page = this.apiResponse.pagination.page;
    this.filterForm.value.page_size = this.apiResponse.pagination.pageSize;
    const body = {
      customer_code: this.filterForm.value.customer_code,
      customer_name: this.filterForm.value.customer_name,
      channel_id: this.filterForm.value.channel_name,
      supervisor_id: this.filterForm.value.supervisor_id ? this.filterForm.value.supervisor_id.map(i => i.id) : [],
      page: this.apiResponse.pagination.page,
      page_size: this.apiResponse.pagination.pageSize
    }
    this.customerService.getSupervisorList(body).subscribe(res => {
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
  public openDeleteBox(uuid: string): void {
      this.dialogRef.open(DeleteConfirmModalComponent, {
        width: '500px',
        data: { title: `Are you sure want to delete Customer Supervisor` }
      }).afterClosed().subscribe(data => {
        if (data.hasConfirmed) {
          this.supervisorDelete(uuid);
        }
      });
    }
  
    public supervisorDelete(uuid: string): void {
      let delObj = { uuid, delete: true };
      this.apiService.deleteCustomerSupervisor(uuid).subscribe(result => {
        this.commonToasterService.showInfo("Deleted", "Customer Supervisor deleted sucessfully");
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

  public getAllSupervisorList(){
    this.apiService.getAllCustomerSupervisor('').subscribe((res: any) => {
        this.supervisorList = res.data;
        this.filteredSupervisorList = [...this.supervisorList];
    });
  }
 private _filterSupervisor(value: string): any[] {
  const filterValue = value.toLowerCase();
  return this.supervisorList.filter(supervisor =>
    (`${supervisor.firstname} ${supervisor.lastname}`.toLowerCase().includes(filterValue))
  );
}

filterSupervisors(event: KeyboardEvent) {
  const input = (event.target as HTMLInputElement).value.toLowerCase().trim();

  if (!input) {
    this.filteredSupervisorList = [...this.supervisorList];
    return;
  }

  this.filteredSupervisorList = this.supervisorList.filter(item => {
    const fullName = `${item?.firstname || ''} ${item?.lastname || ''}`.toLowerCase();
    return fullName.includes(input);
  });
}


filterSupervisorList(): void {
  const searchText = this.supervisorSearchText.toLowerCase().trim();
  if (!searchText) {
    this.filteredSupervisorList = [...this.supervisorList];
    return;
  }

  this.filteredSupervisorList = this.supervisorList.filter(sup => {
    const fullName = `${sup.firstname} ${sup.lastname}`.toLowerCase();
    return fullName.includes(searchText);
  });
}

onSearchInputChange(event: any) {
  this.searchSubject.next(event.target.value);
}
getChannelList(){
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
  }
}
export interface BranchPlant {

  // branch_plant: string;
  customer_code: string;
  customer_name: string;
  channel_name: string;
  supervisor_name: string;
}