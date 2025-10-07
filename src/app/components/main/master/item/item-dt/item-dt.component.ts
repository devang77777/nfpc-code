import { Component, OnInit, ViewChild, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DetailsService } from 'src/app/services/details.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { CompDataServiceType } from 'src/app/services/constants';
import { MasterService } from '../../master.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { OrderModel } from '../../../transaction/orders/order-models';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-item-dt',
  templateUrl: './item-dt.component.html',
  styleUrls: ['./item-dt.component.scss']
})
export class ItemDtComponent implements OnInit {
  selectedRow: any = null;
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public newItemData: any = {};
  advanceSearchRequest: any[] = [];
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  selectedColumnFilter: string;

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

  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'item_code', title: 'Item Code', show: true },
    { def: 'item_name', title: 'Item Name', show: true },
    { def: 'item_description', title: 'Description', show: true },
    { def: 'brand', title: 'Brand', show: true },
    { def: 'category', title: 'Category', show: true },
    { def: 'status', title: 'Status', show: true },
    // { def: 'item_group_name', title: 'Item Group', show: true },
    // { def: 'item_lob', title: 'Item Lob', show: true },

  ]
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'item_code', title: 'Item Code', show: true },
    { def: 'item_name', title: 'Item Name', show: true },
  ];
  requestOriginal;
  filterForm: FormGroup;
  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    private masterService: MasterService,
    private route: ActivatedRoute,
    private eventService: EventBusService,
    public fb: FormBuilder,

    deleteDialog: MatDialog) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Item>();
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
    this.getCustomersData();

  }


  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.apiResponse = this.route.snapshot.data['item_resolve'].itemList;
    this.allResData = this.route.snapshot.data['item_resolve'].itemList.data;
    this.updateDataSource(this.route.snapshot.data['item_resolve'].itemList.data);

    this.subscriptions.push(this.eventService.on(Events.SEARCH_ITEM, ({ request, requestOriginal, response }) => {
      this.advanceSearchRequest = [];
      this.requestOriginal = requestOriginal;
      if (request) {
        Object.keys(request).forEach(item => {
          // Only include fields that have meaningful values (not null, undefined, empty string, or empty array)
          const value = request[item];
          if (value !== null && value !== undefined && value !== '' && 
              !(Array.isArray(value) && value.length === 0)) {
            this.advanceSearchRequest.push({ param: item, value: request[item] })
          }
        })
      }
      this.apiResponse = response;
      this.allResData = response.data;
      this.updateDataSource(response.data);
    }))
    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
    this.filterForm = this.fb.group({
      item_code: [''],
      item_name: [''],
      brand: [''],
      category: [''],
      status: [''],
      page: [this.page],
      page_size: [this.pageSize]
    })
  }

  onCloseCriteria() {
    this.advanceSearchRequest = []
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { reset: true, module: Events.SEARCH_ITEM, route: '/masters/item' }));
  }
  onChangeCriteria() {
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { route: '/masters/item' }));
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: Item): void {
    this.selectedRow = data;
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

  public checkboxLabel(row?: Item): string {
    if (!row) {

      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // public editItem(item: any): void {
  //   this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: item });
  //   this.openAddItem();
  // }

  // public openDeleteBox(item: any): void {
  //   this.deleteDialog.open(DeleteConfirmModalComponent, {
  //     width: '500px',
  //     data: { title: `Are you sure want to delete this item ?` }
  //   }).afterClosed().subscribe(data => {
  //     if (data.hasConfirmed) {
  //       this.deleteItem(item);
  //     }
  //   });
  // }

  // private deleteItem(item: any): void {
  //   this.apiService.deleteItem(item.uuid).subscribe(result => {
  //     window.location.reload();
  //   });
  // }

  private openAddItem(): void {
    this.fds.setFormName('item');
    this.fds.setFormType('Add')
    this.fds.open();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getCustomersData();
  }

  getCustomersData() {
    if (this.advanceSearchRequest.length > 0) {
      let requestOriginal = this.requestOriginal;
      requestOriginal['page'] = this.page;
      requestOriginal['page_size'] = this.pageSize;
      this.subscriptions.push(
        this.apiService.onSearch(requestOriginal).subscribe((res) => {
          this.apiResponse = res;
          this.allResData = res.data;
          this.updateDataSource(res.data);
        })
      );
      return false;
    }
    this.masterService.itemDetailListTable(this.filterForm.value).subscribe((res) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    })

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newItemData && Object.keys(changes.newItemData.currentValue).length > 0) {
        let currentValue = changes.newItemData.currentValue;
        this.newItemData = currentValue;
        this.updateAllData(this.newItemData);
      }
    }
  }

  updateAllData(data) {
    this.selections = new SelectionModel(true, []);
    this.subscriptions.push(
      this.masterService.itemDetailListTable(this.filterForm.value).subscribe((res) => {
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
}
export interface Item {
  id: string;
  uuid: string;
  organisation_id: string;
  item_major_category_id: string;
  item_sub_category_id: string;
  item_group_id: string;
  item_code: string;
  item_name: string;
  item_description: string;
  item_barcode: string;
  item_weight: string;
  item_shelf_life: string;
  lower_unit_uom_id: string;
  is_tax_apply: string;
  status: string;
  item_main_price: ItemMainPrice[];
  item_major_category: {
    id: string;
    code: string;
    name: string;
  };
  item_sub_category: {
    id: string;
    item_major_category_id: string;
    name: string;
    code: string;
    status: string;
  };
  item_group: {
    id: string;
    item_sub_category_id: string;
    name: string;
    code: string;
    status: string;
  };
  available_qty?: number;
  available_value?: number;
}
export interface ItemMainPrice {
  id: number;
  item_id: number;
  item_upc: string;
  item_uom_id: number;
  item_price: string;
  item_uom: string;
}
