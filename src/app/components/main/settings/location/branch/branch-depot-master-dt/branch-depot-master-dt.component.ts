import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { PAGE_SIZE_10 } from 'src/app/app.constant';


@Component({
  selector: 'app-branch-depot-master-dt',
  templateUrl: './branch-depot-master-dt.component.html',
  styleUrls: ['./branch-depot-master-dt.component.scss']
})
export class BranchDepotMasterDtComponent implements OnInit, OnDestroy {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;

  public dataSource: MatTableDataSource<BranchDepotMaster>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];

  @Input() public newDepotData: any;
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;

  // public filterColumns: ColumnConfig[] = [ ...this.displayedColumns ].splice(1);

  private apiService: ApiService;
  private dataEditor: DataEditor;
  private fds: FormDrawerService;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'bdCode', title: 'Code', show: true },
    { def: 'bdName', title: 'Name', show: true },
    { def: 'bdManager', title: 'Manager', show: true },
    { def: 'bdRegion', title: 'Region', show: true }
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'bdName', title: 'Name', show: true }
  ];

  constructor(
    apiService: ApiService,
    fds: FormDrawerService,
    dataEditor: DataEditor,
    deleteDialog: MatDialog) {
    Object.assign(this, { apiService, fds, dataEditor, deleteDialog });
    this.dataSource = new MatTableDataSource<BranchDepotMaster>();
  }

  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.getAllBranchDepot();

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
  }

  getAllBranchDepot() {
    this.subscriptions.push(this.apiService.getAllBranchDepotDt(this.page, this.pageSize).subscribe((res: any) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    }));
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getAllBranchDepot();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newDepotData && Object.keys(changes.newDepotData.currentValue).length > 0) {
        let currentValue = changes.newDepotData.currentValue;
        this.newDepotData = currentValue;
        this.updateAllData(this.newDepotData);
      }
    }
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.apiService.getAllBranchDepotDt(this.page, this.pageSize).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
        this.selections = new SelectionModel(true, []);
        let tableData = res.data;
        if (data.delete !== undefined && data.delete == true) {
          this.closeDetailView();
        } else {
          if (data.edit !== undefined && data.edit == true) {
            let dataObj = tableData.filter(rec => rec.uuid.indexOf(data.uuid) !== -1)[0];
            this.openDetailView(dataObj);
          }
        }
      })
    );
    return false;
    let tableData = this.allResData;
    if (data.delete !== undefined && data.delete == true) {
      let indexp = tableData.filter(rec => rec.uuid.indexOf(data.uuid) !== -1)[0];
      let index = tableData.indexOf(indexp);
      tableData.splice(index, 1);
      this.closeDetailView();
    } else {
      if (data.edit !== undefined && data.edit == true) {
        let indexp = tableData.filter(rec => rec.uuid.indexOf(data.uuid) !== -1)[0];
        let index = tableData.indexOf(indexp);
        tableData[index] = data;
        this.openDetailView(data);
      } else {
        tableData.unshift(data);
      }

    }
    this.allResData = tableData;
    this.updateDataSource(tableData)
  }

  updateDataSource(data) {
    this.dataSource = new MatTableDataSource<any>(data);
    // this.dataSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: BranchDepotMaster): void {
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
  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }
  public toggleSelection(): void {
    this.isAllSelected() ? this.selections.clear() : this.dataSource.data.forEach(row => this.selections.select(row));
  }

  public checkboxLabel(row?: BranchDepotMaster): string {
    if (!row) {

      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public editBranchDepot(depotData: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: depotData });
    this.openAddBranchDepot();
  }

  public openDeleteBox(depot: any): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Branch/Depot ${depot.depot_code}?` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteBranchDepot(depot);
      }
    });
  }

  private deleteBranchDepot(depot: any): void {
    this.apiService.deleteBranchDepot(depot.uuid).subscribe(result => {
      window.location.reload();
    });
  }

  private openAddBranchDepot(): void {
    this.fds.setFormName('add-branch-depot');
    this.fds.open();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }
}
export interface BranchDepotMaster {
  id: string;
  depot_code: string;
  depot_manager: string;
  depot_manager_contact: string;
  depot_name: string;
  organisation_id: string;
  region: {
    id: string;
    region_name: string;
  };
  region_id: string;
  status: string;
  user_id: string;
  uuid: string;
}
