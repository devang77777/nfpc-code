import { Component, OnInit, ViewChild, Output, Input, EventEmitter, OnDestroy } from '@angular/core';
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
import { DeleteConfirmModalComponent } from '../../shared/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-org-role-dt',
  templateUrl: './org-role-dt.component.html',
  styleUrls: ['./org-role-dt.component.scss']
})
export class OrgRoleDtComponent implements OnInit, OnDestroy {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
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
  public user_id = localStorage.getItem('id');

  private allColumns: ColumnConfig[] = [
    { def: 'role_name', title: 'Role Name', show: true },
    { def: 'desc', title: 'Description', show: true },
    { def: 'actions', title: 'Actions', show: true }
  ]
  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    deleteDialog: MatDialog) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Role>();
  }
  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.fds.formName.subscribe(() => {
      this.subscriptions.push(this.apiService.getAllOrganisationRoles().subscribe((roles: any) => {
        this.dataSource = new MatTableDataSource<Role>(roles.data);
        this.dataSource.paginator = this.paginator;
      }));
    })


  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
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

  public checkboxLabel(row?: Role): string {
    if (!row) {

      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public openEditRole(role: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: role });
    this.fds.setFormName('role');
    this.fds.setFormType('Edit');
    this.fds.open();
  }
  public openCloneRole(role: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: role })
    this.fds.setFormName('role');
    this.fds.setFormType("Clone");
    this.fds.open();
  }

  public openDeleteBox(role: any): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete this role ?` }
    }).afterClosed().subscribe(data => {
      if (data?.hasConfirmed) {
        this.deleteRole(role);
      }
    });
  }

  private deleteRole(role: any): void {
    this.apiService.deleteOrganisationRole(role.uuid).subscribe(result => {
      this.subscriptions.push(this.apiService.getAllOrganisationRoles().subscribe((roles: any) => {
        this.dataSource = new MatTableDataSource<Role>(roles.data);
        this.dataSource.paginator = this.paginator;
      }));
    });
  }

  public openAddRole(): void {
    this.fds.setFormName('role');
    this.fds.open();
  }
}
export interface Role {
  id: string;
  name: string;
  uuid: string;
}