import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges,ViewChild } from '@angular/core';
import { CompDataServiceType } from 'src/app/services/constants';
import { Users } from '../../datatables/users-dt/users-dt.component';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { DeleteConfirmModalComponent } from '../../shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { last } from '@amcharts/amcharts4/.internal/core/utils/Array';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  private subscriptions: Subscription[] = [];
  public dataSource: MatTableDataSource<any>;
  public displayedColumns: ColumnConfig[] = [];
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public user: Users | any;
  @Input() public isDetailVisible: boolean;
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  userList: any = [];
  public loginData = [];
  public selectedTab = 0;
  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;

  
  private allColumns: ColumnConfig[] = [
    { def: 'date', title: 'Date', show: true },
    { def: 'user', title: 'User', show: true },
    { def: 'status', title: 'Status', show: true }
  ]

  constructor(apiService: ApiService, deleteDialog: MatDialog, dataService: DataEditor, formDrawer: FormDrawerService,public cts: CommonToasterService) {
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer ,cts});
    this.dataSource = new MatTableDataSource<Users>();
  }

  ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    let body = {
      user_id: this.user?.user_id
    };
    this.getHistory();
    
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.selectedTabChange(this.selectedTab);
    }
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditUser(): void {
    this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.user });
    this.formDrawer.setFormName('user');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }
  // public toggleStatus(): void {
  //   this.customer.customer = this.customer.status === 0 ? 1 : 0;
  // }

  // public toggleStatus(): void {
  //   this.user.user_status = this.user.user_status === 0 ? 1 : 0;
  // }
  public toggleStatus(): void {
    this.user.user_status = this.user.status === 1 ? 0 : 1;
    let action = this.user.user_status === 1 ? 'active' : 'inactive';
    let ids = [];
    ids.push(this.user.uuid);
    let body = {
      firstname: this.user.user.firstname,
      lastname: this.user.user.lastname,
      mobile: this.user.user.mobile,
      role_id: this.user.role_id,
      parent_id: this.user.user.parent_id,
      uuid: this.user.uuid,
      status: this.user.user_status,
    };
    this.apiService.userStatus(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.cts.showSuccess('Success', 'Action Successfull');
          body['edit'] = true;
          this.user.status = this.user.status === 0 ? 1 : 0 || this.user.status === 1 ? 0 : 1;
         
        } else {
          this.cts.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.cts.showError('Error', 'Action Un-successfull');
      }
    )
  }
  selectedTabChange(index) {
    switch (index) {
      case 2:
        this.getHistory();
        break;
    }
    switch (index) {
      case 3:
        this.getUseroginInfo();
        break;
    }
    
  }

  getUseroginInfo() {
    this.apiService.getUseroginInfo({ user_id: this.user?.id }).subscribe((res) => {
      this.loginData = res.data;
    })
  }


  public openDeleteBox(): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete customer ${this.user.firstname}` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteCustomer();
      }
    });
  }

  public deleteCustomer(): void {
    this.apiService.deleteCustomer(this.user.uuid).subscribe(result => {
      window.location.reload();
    });
  }

   public getDisplayedColumns(): string[] {
    return this.displayedColumns.filter(column => column.show).map(column => column.def);
  }

  getHistory(){
    this.apiService.getUserHistory({ user_id: this.user?.user_id 
}).subscribe((res) => {
      this.dataSource = new MatTableDataSource<Users>(res.data);
      this.dataSource.paginator = this.paginator;
    })
  }
}
// user_id: this.user?.user_id 