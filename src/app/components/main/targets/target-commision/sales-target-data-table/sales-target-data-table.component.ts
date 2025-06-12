import { TargetService } from './../../target.service';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SalesTargetModel } from '../sales-target-model';
import { Router } from '@angular/router';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
@Component({
  selector: 'app-sales-target-data-table',
  templateUrl: './sales-target-data-table.component.html',
  styleUrls: ['./sales-target-data-table.component.scss'],
})
export class SalesTargetDataTableComponent implements OnInit, OnDestroy {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;

  public dataSource: MatTableDataSource<SalesTargetModel>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  selectedColumnFilter: string;

  private targetService: TargetService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private router: Router;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'TargetName', title: 'Name', show: true },
    { def: 'StartDate', title: 'Start Date', show: true },
    { def: 'EndDate', title: 'End Date', show: true },
    { def: 'status', title: 'Status', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'TargetName', title: 'Name', show: true },
  ];
  @Input() public newSalesTargetData: any = {};
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;

  constructor(
    targetService: TargetService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    router: Router,
    deleteDialog: MatDialog
  ) {
    Object.assign(this, { targetService, dataEditor, fds, router, deleteDialog });
    this.dataSource = new MatTableDataSource<SalesTargetModel>();
  }

  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.getSalesTargets();

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
      })
    );
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getSalesTargets();
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  getSalesTargets() {
    this.subscriptions.push(
      this.targetService.getSalesTargets(this.page, this.pageSize).subscribe((res: any) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newSalesTargetData && Object.keys(changes.newSalesTargetData.currentValue).length > 0) {
        let currentValue = changes.newSalesTargetData.currentValue;
        this.newSalesTargetData = currentValue;
        this.updateAllData(this.newSalesTargetData);
      }
    }
  }

  updateAllData(data) {
    //console.log(data);
    this.subscriptions.push(
      this.targetService.getSalesTargets(this.page, this.pageSize).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
        this.selections = new SelectionModel(true, []);
        let tableData = res.data;
        if (data.delete !== undefined && data.delete == true) {
          this.closeDetailView();
        } else {

          if (data.edit !== undefined && data.edit == true) {
            //console.log('in edit');
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
        tableData.push(data);
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

  public openDetailView(data: SalesTargetModel): void {
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.updateCollapsedColumns();
  }

  public getDisplayedColumns(): string[] {
    return this.displayedColumns
      .filter((column) => column.show)
      .map((column) => column.def);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }

  public toggleSelection(): void {
    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }

  public checkboxLabel(row?: SalesTargetModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  public editVan(van: SalesTargetModel): void {
    this.dataEditor.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: van,
    });
  }

  public openDeleteBox(van: SalesTargetModel): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${van.sales_target_name}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          // this.deleteVan(van);
        }
      });
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible
      ? this.collapsedColumns
      : this.allColumns;
  }
}
