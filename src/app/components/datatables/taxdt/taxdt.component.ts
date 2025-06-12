
import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
// import { ItemGroup } from '../itemgroup-dt/itemgroup-dt.component';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { ApiService } from 'src/app/services/api.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from '../../shared/delete-confirmation-modal/delete-confirmation-modal.component';


@Component({
  selector: 'app-taxdt',
  templateUrl: './taxdt.component.html',
  styleUrls: ['./taxdt.component.scss']
})
export class TaxdtComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;

  //public dataSource: MatTableDataSource<vatgroup>;
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
    { def: '', title: 'VAT NUMBER', show: true },
    { def: '', title: 'VAT DATE', show: true },

  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: '', title: 'VAT NUMBER', show: true },

  ];

  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    deleteDialog: MatDialog) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    // this.dataSource = new MatTableDataSource<vatgroup>();
  }

  public ngOnInit(): void {
    // this.displayedColumns = this.allColumns;
    // this.filterColumns = [ ...this.allColumns ].splice(1);

    // this.subscriptions.push(this.apiService.getAllvat().subscribe((vatdata: any) => {
    //   this.dataSource = new MatTableDataSource<vatgroup>(vatdata.data);
    //   this.dataSource.paginator = this.paginator;
    // }));

    // this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
    //   if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
    //     this.closeDetailView();
    //   }
    // }));
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  // public openDetailView(data: any): void {
  //   this.isDetailVisible = true;
  //   this.itemClicked.emit(data);
  //  this.updateCollapsedColumns();
  // }

  // public closeDetailView(): void {
  //   this.isDetailVisible = false;
  //   this.updateCollapsedColumns();
  // }

  public getDisplayedColumns(): string[] {
    return this.displayedColumns.filter(column => column.show).map(column => column.def);
  }

  // public isAllSelected(): boolean {
  //   return this.selections.selected.length === this.dataSource.data.length;
  // }

  // public toggleSelection(): void {
  //   this.isAllSelected() ? this.selections.clear() : this.dataSource.data.forEach(row => this.selections.select(row));
  // }

  // public checkboxLabel(row?: ItemGroup): string {
  //   if (!row) {
  //     return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
  //   }
  //   return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  // }

  public editBrand(brandData: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: brandData });
    this.openAddBrand();
  }

  // public openDeleteBox(branddelete: any): void {
  //   this.deleteDialog.open(DeleteConfirmModalComponent, {
  //     width: '500px',
  //     data: { title: `Are you sure want to delete Brand ${branddelete.uuid}?` }
  //   }).afterClosed().subscribe(data => {
  //     if (data.hasConfirmed) {
  //       this.deletebrand(branddelete);
  //     }
  //   });
  // }

  // private deletetax(branddel: any): void {
  //   this.apiService.deleteBrandItem(branddel.uuid).subscribe(result => {
  //     window.location.reload();
  //   });
  // }

  private openAddBrand(): void {
    this.fds.setFormName('TAX-SETTINGS');
    this.fds.setFormType("Add");
    this.fds.open();
  }

  // private updateCollapsedColumns(): void {
  //   this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  // }

}
