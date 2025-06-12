import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { ApiService } from 'src/app/services/api.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { Utils } from 'src/app/services/utils';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormBuilder, FormGroup } from '@angular/forms';
import { de } from 'date-fns/locale';
// import { ApiService } from '../../../services/api.service';
// import { Utils } from '../../../services/utils';
// import { FormDrawerService } from '../../../services/form-drawer.service';
// import { DataEditor } from '../../../services/data-editor.service';
// import { MatDialog } from '@angular/material/dialog';
// import { DeleteConfirmModalComponent } from '../../shared/delete-confirmation-modal/delete-confirmation-modal.component';
// import { ColumnConfig } from '../../../interfaces/interfaces';
// import {SelectionModel} from '@angular/cdk/collections';
// import {CompDataServiceType} from '../../../services/constants';

@Component({
  selector: 'app-route-master-dt',
  templateUrl: './route-master-dt.component.html',
  styleUrls: ['./route-master-dt.component.scss']
})
export class RouteMasterDtComponent implements OnInit, OnDestroy {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;

  public dataSource: MatTableDataSource<RouteMaster>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];

  private httpAgent: ApiService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'routeCode', title: 'Code', show: true },
    { def: 'routeName', title: 'Name', show: true },
    { def: 'area', title: 'Area', show: true },
    { def: 'depot', title: 'Depot', show: true },
    { def: 'vehicle', title: 'vehicle', show: true },
    { def: 'status', title: 'Status', show: true }
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'routeName', title: 'Name', show: true }
  ];
  @Input() public newRouteData: any;
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  selectedColumnFilter: any;
  filterForm: FormGroup;

  constructor(
    httpAgent: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    public fb: FormBuilder,
    deleteDialog: MatDialog) {
    Object.assign(this, { httpAgent, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<RouteMaster>();
  }



  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));

    this.filterForm = this.fb.group({
      route_code: [''],
      route_name: [''],
      area_name: [''],
      depot_name: [''],
      vehicle: [''],
      status: [''],
      page: [this.page],
      page_size: [this.pageSize],
    });
    this.getAllRoute();

  }

  getAllRoute() {
    this.subscriptions.push(this.httpAgent.getAllRouteDt(this.page, this.pageSize).subscribe((res: any) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    }));
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getAllRoute();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newRouteData && Object.keys(changes.newRouteData.currentValue).length > 0) {
        let currentValue = changes.newRouteData.currentValue;
        this.newRouteData = currentValue;
        this.updateAllData(this.newRouteData);
      }
    }
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.httpAgent.getAllRouteDt(this.page, this.pageSize).subscribe((res) => {
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

  public openDetailView(data: RouteMaster): void {
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

  public checkboxLabel(row?: RouteMaster): string {
    if (!row) {

      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public editRoute(route: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: route });
    this.openAddRoute();
  }

  public openDeleteBox(route: any): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Route ${route.route_code}?` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteRoute(route);
      }
    });
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item;
  }
  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue("");
      // return;
    } else {
      this.filterForm.patchValue({
        page: 1,
        page_size: this.pageSize
      });
    }
    //Filter only if he click on yes button
    //add the validation here if selected control has the value 
    this.getAllRoute();
  }
  public deleteRoute(route: any): void {
    this.httpAgent.deleteRoute(route.uuid).subscribe(result => {
      window.location.reload();
    });
  }

  private openAddRoute(): void {
    this.fds.setFormName('add-route');
    this.fds.open();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }
}
export interface RouteMaster {
  "id": string;
  "uuid": string;
  "organisation_id": string;
  "area_id": string;
  "route_name": string;
  "route_code": string;
  "depot_name": string
  "description": string;
  "van_code": string;
  "status": string;
  "created_at": string;
  "updated_at": string;
  "deleted_at": string;
  "areas": {
    area_name: string;
    id: string;
    uuid: string;
  };
}