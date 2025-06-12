import { Component, OnInit, ViewChild, Output, Input, EventEmitter } from '@angular/core';
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
import { Events } from 'src/app/models/events.model';
import { Promotional } from '../promotional-interface';
import { SimpleChanges } from '@angular/core';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
@Component({
  selector: 'app-promo-dt',
  templateUrl: './promo-dt.component.html',
  styleUrls: ['./promo-dt.component.scss']
})
export class PromoDtComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public newPromosData: any = {};

  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  selectedColumnFilter: string;

  page = 1;
  pageSize = PAGE_SIZE_10;
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'created_at', title: 'Date', show: true },
    { def: 'amount', title: 'Amount', show: true },
    { def: 'start_date', title: 'Valid From', show: true },
    { def: 'end_date', title: 'Valid To', show: true },
  ]
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'created_at', title: 'Date', show: true },
    { def: 'amount', title: 'Amount', show: true },
  ];
  constructor(public merService: MerchandisingService, dataEditor: DataEditor, private eventService: EventBusService,
    fds: FormDrawerService, deleteDialog: MatDialog) {
    Object.assign(this, { merService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Promotional>();
  }

  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.getPromotionalList();

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
    this.subscriptions.push(this.eventService.on(Events.SEARCH_PROMOTIONAL, (data) => {
      this.updateDataSource(data);
    }))
  }
  getPromotionalList() {
    this.subscriptions.push(this.merService.getPromotionalList(this.page, this.pageSize).subscribe((res: any) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    }));
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getPromotionalList();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newPromosData && Object.keys(changes.newPromosData.currentValue).length > 0) {
        let currentValue = changes.newPromosData.currentValue;
        this.newPromosData = currentValue;
        this.updateAllData(this.newPromosData);
      }
    }
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.merService.getPromotionalList(this.page, this.pageSize).subscribe((res) => {
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
    this.dataSource = new MatTableDataSource<Promotional>(data);
    // this.dataSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: Promotional): void {
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.updateCollapsedColumns();
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

  public checkboxLabel(row?: Promotional): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  getPaginatorValue(len: number) {
    return len < 10 ? true : false;
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }

}
