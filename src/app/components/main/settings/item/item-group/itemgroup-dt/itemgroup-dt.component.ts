import { Component, OnInit, ViewChild, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Subscription } from 'rxjs';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
// import { BulkUpdateFormComponent } from '../../dialog-forms/bulk-update-form/bulk-update-form.component';
import { Router } from '@angular/router';
import { DetailsService } from 'src/app/services/details.service';

import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
// import { DeleteConfirmModalComponent } from '../../shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
@Component({
  selector: 'app-itemgroup-dt',
  templateUrl: './itemgroup-dt.component.html',
  styleUrls: ['./itemgroup-dt.component.scss']
})
export class ItemgroupDtComponent implements OnInit {

  // inDetails = false;

  // displayedColumns = [
  //   { def: 'customize', title: '', show: true },
  //   { def: 'select', title: 'Select', show: true },
  //   { def: 'code', title: 'Item Group Code', show: true },
  //   { def: 'name', title: 'Item Group Name', show: true },
  //   { def: 'item_sub_category_id', title: 'Sub Category Id', show: true }
  // ];

  // public dataSource: MatTableDataSource<ItemGroup>;
  // selection = new SelectionModel(true, []);
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  // private subscriptions: Subscription[] = [];
  // private apiService: ApiService;
  // private fds: FormDrawerService;
  // private dataEditor: DataEditor;

  // constructor(apiService: ApiService, dataEditor: DataEditor, fds: FormDrawerService,
  //    public dialog: MatDialog,
  //    public router: Router,
  //    private detailsSevice: DetailsService
  //    ) {
  //   Object.assign(this, { apiService, dataEditor, fds });
  //   this.dataSource = new MatTableDataSource();
  // }

  // public ngOnInit(): void {
  //   if(this.router.url.toString().includes("/details")){
  //     this.inDetails = true;
  //     this.displayedColumns = [
  //       { def: 'customize', title: '', show: false },
  //       { def: 'select', title: 'Select', show: true },
  //       { def: 'code', title: 'Item Group Code', show: false },
  //       { def: 'name', title: 'Item Group Name', show: true },
  //       { def: 'item_sub_category_id', title: 'Sub Category Id', show: false }
  //     ];
  //   };
  //   this.subscriptions.push(this.apiService.getItemGroup().subscribe((item: any) => {
  //     //console.log(item.data);
  //     this.dataSource = new MatTableDataSource<ItemGroup>(item.data);
  //     this.dataSource.paginator = this.paginator;
  //   }));
  // }

  // getDisplayedColumns(): string[] {
  //   return this.displayedColumns
  //     .filter(cd => cd.show)
  //     .map(cd => cd.def);
  // }

  // openBulkAction() {
  //   this.dialog.open(BulkUpdateFormComponent, {
  //     width: '400px',
  //     height: '400px',
  //     position: {top:'0px'}
  //   });
  // }

  // openDetails(ItemGroup){
  //   //console.log(ItemGroup);
  //   this.router.navigate(['settings/item-group/details']);
  //   this.detailsSevice.setDetails(ItemGroup);

  // }

  // /** Whether the number of selected elements matches the total number of rows. */
  // isAllSelected() {
  //   const numSelected = this.selection.selected.length;
  //   const numRows = this.dataSource.data.length;
  //   return numSelected === numRows;
  // }

  // /** Selects all rows if they are not all selected; otherwise clear selection. */
  // masterToggle() {
  //   this.isAllSelected() ?
  //     this.selection.clear() :
  //     this.dataSource.data.forEach(row => this.selection.select(row));
  // }

  // /** The label for the checkbox on the passed row */
  // checkboxLabel(row?: ItemGroup): string {
  //   if (!row) {
  //     return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
  //   }
  // }

  // public ngOnDestroy(): void {
  //   Utils.unsubscribeAll(this.subscriptions);
  // }

  // public showSelection() {}



  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;

  public dataSource: MatTableDataSource<ItemGroup>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];

  private apiService: ApiService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [


    { def: 'select', title: 'Select', show: true },
    { def: 'code', title: 'Item Group Code', show: true },
    { def: 'name', title: 'Item Group Name', show: true },
    // { def: 'item_sub_category.name', title: 'Sub Category Id', show: true }
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'name', title: 'Item Group Name', show: true },

  ];
  @Input() public newIGData: any;
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;

  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    deleteDialog: MatDialog) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<ItemGroup>();
  }

  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.getItemGroup();

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
  }

  getItemGroup() {
    this.subscriptions.push(
      this.apiService.getItemGroupDt(this.page, this.pageSize).subscribe((res: any) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
      })
    );
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getItemGroup();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newIGData && Object.keys(changes.newIGData.currentValue).length > 0) {
        let currentValue = changes.newIGData.currentValue;
        this.newIGData = currentValue;
        this.updateAllData(this.newIGData);
      }
    }
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.apiService.getItemGroupDt(this.page, this.pageSize).subscribe((res) => {
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

  public openDetailView(data: ItemGroup): void {
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
  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }
  public checkboxLabel(row?: ItemGroup): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public editMajor(itemData: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: itemData });
    this.openAddMajor();
  }

  public openDeleteBox(itemDelete: any): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Item Group ${itemDelete.uuid}?` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteItemMajor(itemDelete);
      }
    });
  }

  private deleteItemMajor(itemdel: any): void {
    this.apiService.deleteItemGroup(itemdel.uuid).subscribe(result => {
      window.location.reload();
    });
  }

  private openAddMajor(): void {
    this.fds.setFormName('itemGroup');
    this.fds.setFormType("Add");
    this.fds.open();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }


}
export interface ItemGroup {
  code: string;
  id: number;
  item_sub_category_id: number;
  name: string;
  organisation_id: number;
  status: number;
  uuid: string;
  item_sub_category: [{
    id: number,
    name: string
  }
  ]
}
