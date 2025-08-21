import { Component, OnInit, ViewChild, EventEmitter, Output, Input, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { SelectionModel } from '@angular/cdk/collections';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from '../../shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { ORDER_STATUS, PAGE_SIZE_10, STATUS } from 'src/app/app.constant';
@Component({
  selector: 'app-users-dt',
  templateUrl: './users-dt.component.html',
  styleUrls: ['./users-dt.component.scss']
})
export class UsersDtComponent implements OnInit, OnDestroy {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
selectedColumnFilter: string;

requestOriginal: any;
isColumnFilter = false;
filterForm: FormGroup;
 page = 1;
  pageSize = PAGE_SIZE_10;
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0,
    },
  };
  public allResData = [];
  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
advanceSearchRequest: any[] = [];
  private apiService: ApiService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];

  private allColumns: ColumnConfig[] = [
    { def: 'user_details', title: 'Details', show: true },
    { def: 'role', title: 'Role', show: true },
    { def: 'actions', title: 'Actions', show: true },

  ]
  private collapsedColumns: ColumnConfig[] = [
    { def: 'user_details', title: 'Details', show: true }
  ];


  constructor(
      public fb: FormBuilder,
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    deleteDialog: MatDialog) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Users>();
  }
  public ngOnInit(): void {
         this.filterForm = this.fb.group({
       page: [this.page],
      page_size: [this.pageSize],
      role_name: [''],
      user_name: [''],
      email: ['']
    });
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
 const filters = {
    name: this.filterForm.get('user_name')?.value || this.filterForm.get('email')?.value || '',
    role: this.filterForm.get('role_name')?.value || '',
    // email: this.filterForm.get('email')?.value || '',
  };
    this.fds.formType.subscribe(x => {
      if (x == 'user') {
        this.subscriptions.push(this.apiService.getAllInviteUser(filters).subscribe((users: any) => {
          this.dataSource = new MatTableDataSource<Users>(users.data);
          this.dataSource.paginator = this.paginator;
          this.closeDetailView();
        }));
      }
    })

    this.subscriptions.push(this.apiService.getAllInviteUser(filters).subscribe((users: any) => {
      this.dataSource = new MatTableDataSource<Users>(users.data);
      this.dataSource.paginator = this.paginator;
    }));

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: Users): void {
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

  public checkboxLabel(row?: Users): string {
    if (!row) {

      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public editCountry(country: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: country });
    this.openAddCountry();
  }

  public openDeleteBox(country: any): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete this country ?` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteCountry(country);
      }
    });
  }

  private deleteCountry(country: any): void {
    this.apiService.deleteCountry(country.uuid).subscribe(result => {
      window.location.reload();
    });
  }

  private openAddCountry(): void {
    this.fds.setFormName('country');
    this.fds.open();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item;
  }

    onColumnFilter(status) {
      
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.isColumnFilter = status;
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
      sessionStorage.clear();
    } else {
      this.isColumnFilter = status;
      this.filterForm.patchValue({
        page: this.page,
        page_size: this.pageSize
      });
      sessionStorage.setItem('columnfilter', JSON.stringify(this.filterForm.value));
    }
     const filters = {
    name: this.filterForm.get('user_name')?.value || '',
    role: this.filterForm.get('role_name')?.value || '',
    // email: this.filterForm.get('email')?.value || '',
  };
    // this.getDisplayedColumns();
     this.subscriptions.push(this.apiService.getAllInviteUser(filters).subscribe((users: any) => {
      this.dataSource = new MatTableDataSource<Users>(users.data);
      this.dataSource.paginator = this.paginator;
    }));
  }
  
  getUserData(){
     const filters = {
    name: this.filterForm.get('user_name')?.value || '',
    role: this.filterForm.get('role_name')?.value || '',
    // email: this.filterForm.get('email')?.value || '',
  };
      if (this.advanceSearchRequest.length > 0) {
      this.advanceSearch();
    } else {
      this.advanceSearchRequest.forEach(element => {
        if (this.filterForm.value.hasOwnProperty(element.key)) {
          this.filterForm.value[element.key] = element.value;
        }
      });
      if (sessionStorage.getItem('columnfilter')) {
        const data = JSON.parse(sessionStorage.getItem('columnfilter'));
        this.filterForm.patchValue(data);
      }
      
      this.subscriptions.push(this.apiService.getAllInviteUser(filters).subscribe((users: any) => {
        this.dataSource = new MatTableDataSource<Users>(users.data);
        this.dataSource.paginator = this.paginator;
        this.page = users.pagination.current_page;
        this.pageSize = users.pagination.page_size;
      }))
  }
}
 advanceSearch() {
    this.apiService.onSearch(this.requestOriginal).subscribe((response) => {
      this.requestOriginal = this.requestOriginal;
      this.apiResponse = response;
      this.allResData = response.data;
      // this.updateDataSource(response.data);
    });
  }
}

export interface Users {
  role_name: string;
  user_name: string;
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  uuid: string;
  mobile: string;
  role: {
    id: string;
    name: string;
  };
  status: string;
}