import { Component, OnInit, Output, EventEmitter, Input, ViewChild, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { ApiService } from 'src/app/services/api.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-route-groupdt',
  templateUrl: './route-groupdt.component.html',
  styleUrls: ['./route-groupdt.component.scss']
})
export class RouteGroupdtComponent implements OnInit {

  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;

  public dataSource: MatTableDataSource<RouteItemGrouping>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  selectedColumnFilter: string;

  private apiService: ApiService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  @Input() newRouteItemGroupData: any;
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  filterForm: FormGroup;
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'code', title: 'Code', show: true },
    { def: 'name', title: 'Name', show: true }
  ];

  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'name', title: 'Name', show: true }
  ];

  constructor(public fb: FormBuilder, apiService: ApiService, dataEditor: DataEditor, fds: FormDrawerService, deleteDialog: MatDialog) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<RouteItemGrouping>();
  }

  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      name: [''],
      code: [''],
      page: [this.page],
      page_size: [this.pageSize]
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getRouteItemGroupList();

    this.subscriptions.push(
      this.dataEditor.newData.subscribe(value => {
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
      })
    );
  }

  getRouteItemGroupList() {
    this.subscriptions.push(this.apiService.getRouteItemGroup(this.filterForm.value).subscribe((routeItemGroupData: any) => {
      this.apiResponse = routeItemGroupData;
      this.allResData = routeItemGroupData.data;
      this.updateDataSource(routeItemGroupData.data);
    }));
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getRouteItemGroupList();
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    } else {
      this.filterForm.patchValue({
        page: 1,
        page_size: this.pageSize
      });
    }
    this.getRouteItemGroupList();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newRouteItemGroupData && Object.keys(changes.newRouteItemGroupData.currentValue).length > 0) {
        let currentValue = changes.newRouteItemGroupData.currentValue;
        this.newRouteItemGroupData = currentValue;
        this.updateAllData(this.newRouteItemGroupData);
      }
    }
  }

  updateAllData(data) {
    //console.log(data);
    this.subscriptions.push(
      this.apiService.getRouteItemGroup(this.filterForm.value).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
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

  public openDetailView(routeItemGroupData: RouteItemGrouping): void {
    this.isDetailVisible = true;
    this.itemClicked.emit(routeItemGroupData);
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

  public checkboxLabel(row?: RouteItemGrouping): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }

  public hidePaginator(len: any): boolean {
    return len < 10 ? true : false;
  }
}


export interface RouteItemGrouping {
  code: string,
  id: number,
  name: string,
  organisation_id: number,
  route: Route[],
  route_id: number,
  route_item_grouping_details: RouteItemGroupingDetails[],
  uuid: string
};

interface Item {
  id: number,
  item_major_category_id: number,
  item_sub_category_id: number,
  item_group_id: number,
  brand_id: number,
  sub_brand_id: number,
  item_code: string,
  item_name: string,
  item_description: string,
  item_barcode: string,
  item_weight: string,
  item_shelf_life: string,
  lower_unit_item_upc: number,
  lower_unit_uom_id: number,
  lower_unit_item_price: string,
  is_tax_apply: number,
  item_vat_percentage: string,
  status: number
};

interface Route {
  area_id: number,
  id: number,
  route_code: string,
  route_name: string,
  status: number
};

interface RouteItemGroupingDetails {
  id: number,
  item: Item,
  item_id: number,
  route_item_grouping_id: number,
}
