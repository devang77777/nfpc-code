import { Component, EventEmitter, OnInit, ViewChild, Input, Output, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Subscription } from 'rxjs';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { CompDataServiceType } from 'src/app/services/constants';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { PAGE_SIZE_10 } from 'src/app/app.constant';

@Component({
  selector: 'app-zone-master-dt',
  templateUrl: './zone-master-dt.component.html',
  styleUrls: ['./zone-master-dt.component.scss']
})
export class ZoneMasterDtComponent implements OnInit, OnChanges, OnDestroy {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
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
  @Input() public newZoneData: any;
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;

  private allColumns: ColumnConfig[] = [
    // { def: 'zone_code', title: 'Zone Code', show: true },
    { def: 'zone_name', title: 'Zone Name', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'zone_name', title: 'Zone Name', show: true }
  ];

  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    deleteDialog: MatDialog) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<ZoneMaster>();
  }
  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getAllZone();

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
  }

  getAllZone() {
    this.subscriptions.push(this.apiService.getAllZoneList().subscribe((res: any) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    }));
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getAllZone();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newZoneData && Object.keys(changes.newZoneData.currentValue).length > 0) {
        const currentValue = changes.newZoneData.currentValue;
        this.newZoneData = currentValue;
        this.updateAllData(this.newZoneData);
      }
    }
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.apiService.getAllZoneList().subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
        this.selections = new SelectionModel(true, []);
        let tableData = res.data;
        if (data.delete !== undefined && data.delete == true) {
          this.closeDetailView();
        } else {
          if (data.edit !== undefined && data.edit == true) {
            const dataObj = tableData.filter(rec => rec.uuid.indexOf(data.uuid) !== -1)[0];
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

  public openDetailView(data: ZoneMaster): void {
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

  public checkboxLabel(row?: ZoneMaster): string {
    if (!row) {

      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public editZone(zone: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: zone });
    this.openAddZone();
  }

  public openDeleteBox(zone: any): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete this zone ?` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteZone(zone);
      }
    });
  }

  private deleteZone(zone: any): void {
    this.apiService.deleteZone(zone.uuid).subscribe(result => {
      window.location.reload();
    });
  }

  private openAddZone(): void {
    this.fds.setFormName('zone');
    this.fds.open();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }
}
export interface ZoneMaster {
  id: string;
  uuid: string;
  // zone_code: string;
  name: string;
  status: string;
}

