import { Component, OnInit, ViewChild, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MerchandisingService } from '../../merchandising.service';
import { SelectionModel } from '@angular/cdk/collections';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { CompDataServiceType } from 'src/app/services/constants';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
import { Lightbox } from 'ngx-lightbox';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-market-promo-dt',
  templateUrl: './market-promo-dt.component.html',
  styleUrls: ['./market-promo-dt.component.scss']
})
export class MarketPromoDtComponent implements OnInit {

  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public newMarketPromoData: any = {};
  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  advanceSearchRequest: any[] = [];
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  selectedColumnFilter: string;
  filterForm: FormGroup;
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'created_at', title: 'Date', show: true },
    { def: 'salesman', title: 'Merchandiser Name', show: true },
    { def: 'customer_code', title: 'Customer Code', show: true },
    { def: 'customer', title: 'Customer Name', show: true },
    { def: 'item_code', title: 'Item Code', show: true },
    { def: 'item', title: 'Item', show: true },
    { def: 'type', title: 'Type', show: true },
    { def: 'qty', title: 'Qty', show: true },
    { def: 'start_date', title: 'Start Date', show: true },
    { def: 'end_date', title: 'End Date', show: true },
    { def: 'description', title: 'Description', show: true },
    { def: 'image', title: 'Image', show: true },
  ]
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'created_at', title: 'Date', show: true },
  ];
  requestOriginal;
  constructor(public fb: FormBuilder, public apiService: ApiService, public merService: MerchandisingService, dataEditor: DataEditor, private eventService: EventBusService,
    fds: FormDrawerService, deleteDialog: MatDialog,
    private _lightbox: Lightbox) {

    Object.assign(this, { merService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<any>();
  }

  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      salesman_name: [''],
      item: [''],
      item_code: [''],
      customer_name: [''],
      customer_code: [''],
      start_date: [''],
      end_date: [''],
      page: [this.page],
      page_size: [this.pageSize]
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getMarketPromotionList();
    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
    this.subscriptions.push(this.eventService.on(Events.SEARCH_COMPLAINT, ({ request, requestOriginal, response }) => {
      this.advanceSearchRequest = [];
      this.requestOriginal = requestOriginal;
      if (request) {
        Object.keys(request).forEach(item => {
          this.advanceSearchRequest.push({ param: item, value: request[item] })
        })
      }
      this.apiResponse = response;
      this.allResData = response.data;
      this.updateDataSource(response.data);
    }))
  }

  onCloseCriteria() {
    this.advanceSearchRequest = []
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { reset: true, module: Events.SEARCH_COMPLAINT, route: '/merchandising/market-promotion' }));
  }
  onChangeCriteria() {
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { route: '/merchandising/market-promotion' }));
  }

  getMarketPromotionList() {
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
    this.subscriptions.push(this.merService.getMarketPromotionList(this.filterForm.value).subscribe((res: any) => {
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
    this.getMarketPromotionList();
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newMarketPromoData && Object.keys(changes.newMarketPromoData.currentValue).length > 0) {
        let currentValue = changes.newMarketPromoData.currentValue;
        this.newMarketPromoData = currentValue;
        this.updateAllData(this.newMarketPromoData);
      }
    }
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.merService.getMarketPromotionList(this.filterForm.value).subscribe((res) => {
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

  public openDetailView(data: any): void {
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.updateCollapsedColumns();
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
    this.getMarketPromotionList();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
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

  public checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  getPaginatorValue(len: number) {
    return len < 10 ? true : false;
  }

  open(image, index: number): void {
    let imagesArr = [];
    if (image !== undefined && image.length > 0) {
      imagesArr.push({
        src: image,
        caption: '',
        thumb: image
      });
    }
    this._lightbox.open(imagesArr, index);
  }

  close(): void {
    this._lightbox.close();
  }

}
