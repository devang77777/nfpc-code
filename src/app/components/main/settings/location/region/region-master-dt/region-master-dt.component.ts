import { Component, EventEmitter, OnInit, ViewChild, Input, Output, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { FormDataService } from 'src/app/services/form-data.service';
import { Subscription } from 'rxjs';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
// import { BulkUpdateFormComponent } from '../../dialog-forms/bulk-update-form/bulk-update-form.component';
import { Router } from '@angular/router';
import { DetailsService } from 'src/app/services/details.service';
import { CompDataServiceType } from 'src/app/services/constants';
// import { DeleteConfirmModalComponent } from '../../shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
@Component({
  selector: 'app-region-master-dt',
  templateUrl: './region-master-dt.component.html',
  styleUrls: ['./region-master-dt.component.scss']
})
export class RegionMasterDtComponent implements OnInit {
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
  @Input() public newRegionData: any;
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;

  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'region_code', title: 'Region Code', show: true },
    { def: 'region_name', title: 'Region Name', show: true },
    { def: 'country', title: 'Country', show: true }

  ]
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'region_name', title: 'Region Name', show: true }
  ];

  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    deleteDialog: MatDialog) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<RegionMaster>();
  }
  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getAllRegions();

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
  }

  getAllRegions() {
    this.subscriptions.push(this.apiService.getAllRegionsDt(this.page, this.pageSize).subscribe((res: any) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    }));
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getAllRegions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newRegionData && Object.keys(changes.newRegionData.currentValue).length > 0) {
        let currentValue = changes.newRegionData.currentValue;
        this.newRegionData = currentValue;
        this.updateAllData(this.newRegionData);
      }
    }
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.apiService.getAllRegionsDt(this.page, this.pageSize).subscribe((res) => {
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

  public openDetailView(data: RegionMaster): void {
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

  public checkboxLabel(row?: RegionMaster): string {
    if (!row) {

      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public editRegion(region: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: region });
    this.openAddRegion();
  }

  public openDeleteBox(region: any): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete this region ?` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteRegion(region);
      }
    });
  }

  private deleteRegion(region: any): void {
    this.apiService.deleteRegion(region.uuid).subscribe(result => {
      window.location.reload();
    });
  }

  private openAddRegion(): void {
    this.fds.setFormName('region');
    this.fds.open();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }
}
export interface RegionMaster {
  id: string;
  uuid: string;
  organization_id: string;
  country_id: string;
  region_code: string;
  region_name: string;
  region_status: string;
}
// public displayedColumns: string[] = ['select', 'region_code', 'region_name', 'country_id'];
//   public dataSource: MatTableDataSource<RegionMaster>;
//   selection = new SelectionModel(true, []);
//   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

//   private subscriptions: Subscription[] = [];
//   private apiService: ApiService;
//   private fds: FormDrawerService;
//   private dataEditor: DataEditor;

//   constructor(apiService: ApiService, dataEditor: DataEditor, fds: FormDrawerService,
//      public dialog: MatDialog,
//      public router: Router,
//      private detailsSevice: DetailsService
//      ) {
//     Object.assign(this, { apiService, dataEditor, fds });
//     this.dataSource = new MatTableDataSource();
//   }

//   public ngOnInit(): void {



//     this.subscriptions.push(this.apiService.getAllRegions().subscribe((regions: any) => {
//       //console.log(regions.data);

//       this.dataSource = new MatTableDataSource<RegionMaster>(regions.data);
//       this.dataSource.paginator = this.paginator;
//     }));
//   }
//   getDisplayedColumns(): string[] {
//     return this.displayedColumns
//       .filter(cd => cd.show)
//       .map(cd => cd.def);
//   }
//   openBulkUpdate() {
//     this.dialog.open(BulkUpdateFormComponent, {
//       width: '400px',
//       height: '400px',
//       position: {top:'0px'}
//     });
//   }
//   openDetailView(data){
//     this.isDetailVisible = true;
//     this.itemClicked.emit(data);
//     this.updateCollapsedColumns();

//   }
//   /** Whether the number of selected elements matches the total number of rows. */
//   isAllSelected() {
//     const numSelected = this.selection.selected.length;
//     const numRows = this.dataSource.data.length;
//     return numSelected === numRows;
//   }

//   /** Selects all rows if they are not all selected; otherwise clear selection. */
//   masterToggle() {
//     this.isAllSelected() ?
//       this.selection.clear() :
//       this.dataSource.data.forEach(row => this.selection.select(row));
//   }

//   /** The label for the checkbox on the passed row */
//   checkboxLabel(row?: RegionMaster): string {
//     if (!row) {
//       return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
//     }
//     return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
//   }

//   public ngOnDestroy(): void {
//     Utils.unsubscribeAll(this.subscriptions);
//   }

//  private updateCollapsedColumns(): void {
//     this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
//   }

// public editRegion(region: any): void {
//   this.dataEditor.sendData(region);
//   this.openAddRegion();
// }

// public deleteRegion(van: any): void {
//   this.apiService.deleteRegion(van.uuid).subscribe(result => {
//     window.location.reload();
//   });
// }

// private openAddRegion(): void {
//   this.fds.setFormName('region');
//   this.fds.open();
// }
// }
export interface RegionMaster {
  id: string,
  uuid: string,
  organisation_id: string,
  country_id: string,
  region_code: string,
  region_name: string,
  region_status: string,
  country: {
    id: string,
    name: string
  }
}

//   displayedColumns: string[] = ['region_code', 'region_name', 'country_id', 'actions'];
//   regions: any[];
//   dataSource;

//   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
//   constructor(
//     private apiService: ApiService,
//     private fds: FormDrawerService,
//     private ds: FormDataService
//   ) { }

//   ngOnInit(): void {
//     this.getRegions();
//   }
//   getRegions() {
//     this.apiService.getAllRegions().subscribe((res) => {
//       this.regions = res.data;
//       //console.log(res);
//       this.dataSource = new MatTableDataSource<any>(this.regions);
//       this.dataSource.paginator = this.paginator;
//     })
//   }
//   edit(element) {
//     //console.log(element.uuid);
//     this.ds.setData(element.uuid);
//     this.fds.setFormName("editRegion");
//     this.fds.open();
//   }

// }
