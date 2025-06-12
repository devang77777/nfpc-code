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
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { VanToVanModel, VanToVanData } from '../van-to-van.model';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import {
  APP_CURRENCY_CODE,
  CompDataServiceType,
} from 'src/app/services/constants';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Utils } from 'src/app/services/utils';
import { PAGE_SIZE_10 } from 'src/app/app.constant';

@Component({
  selector: 'app-van-to-van-dt',
  templateUrl: './van-to-van-dt.component.html',
  styleUrls: ['./van-to-van-dt.component.scss'],
})
export class VanToVanDtComponent implements OnInit {
  @Input() public isDetailVisible: boolean;
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public newVantovanData: any;
  selectedColumnFilter: string;

  public dataSource: MatTableDataSource<VanToVanModel>;
  public vanToVanNotes: VanToVanModel[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0,
    },
  };
  page = 1;
  pageSize = PAGE_SIZE_10;

  private router: Router;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'date', title: 'Date', show: true },
    { def: 'code', title: 'Code', show: true },
    { def: 'sourceroute', title: 'From Van', show: true },
    { def: 'destinationroute', title: 'To Van', show: true },
    { def: 'status', title: 'Status', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'code', title: 'Code', show: true },
  ];

  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    private route: ActivatedRoute,
    deleteDialog: MatDialog,
    router: Router
  ) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog, router });
    this.dataSource = new MatTableDataSource<VanToVanModel>();
  }

  public ngOnInit(): void {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...[...this.allColumns].splice(2)];

    this.vanToVanNotes = VanToVanData;
    // this.dataSource = new MatTableDataSource<VanToVanModel>(this.vanToVanNotes);
    // this.dataSource.paginator = this.paginator;

    this.apiResponse = this.route.snapshot.data['resolved'].vantovan;
    this.allResData = this.route.snapshot.data['resolved'].vantovan.data;
    this.updateDataSource(this.route.snapshot.data['resolved'].vantovan.data);
    // this.dataSource.paginator = this.paginator
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
      })
    );
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: VanToVanModel): void {
    this.router.navigate(['supervisor/van-to-van-transfer/detail', data.uuid]);
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

  public checkboxLabel(row?: VanToVanModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible
      ? this.collapsedColumns
      : this.allColumns;
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }


  getPaginator(len: number) {
    return len <= 10 ? true : false;
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getVantovanList();
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (
        changes.newVantovanData &&
        Object.keys(changes.newVantovanData.currentValue).length > 0
      ) {
        let currentValue = changes.newVantovanData.currentValue;
        this.newVantovanData = currentValue;
        this.updateAllData(this.newVantovanData);
      }
    }
  }

  getVantovanList() {
    this.apiService
      .getVantovanList(this.page, this.pageSize)
      .subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
      });
  }

  updateAllData(data) {
    //console.log(data);
    this.subscriptions.push(
      this.apiService
        .getVantovanList(this.page, this.pageSize)
        .subscribe((res) => {
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
              let dataObj = tableData.filter(
                (rec) => rec.uuid.indexOf(data.uuid) !== -1
              )[0];
              this.openDetailView(dataObj);
            }
          }
        })
    );
    return false;
    let tableData = this.allResData;
    if (data.delete !== undefined && data.delete == true) {
      let indexp = tableData.filter(
        (rec) => rec.uuid.indexOf(data.uuid) !== -1
      )[0];
      let index = tableData.indexOf(indexp);
      tableData.splice(index, 1);
      this.closeDetailView();
    } else {
      if (data.edit !== undefined && data.edit == true) {
        let indexp = tableData.filter(
          (rec) => rec.uuid.indexOf(data.uuid) !== -1
        )[0];
        let index = tableData.indexOf(indexp);
        tableData[index] = data;
        this.openDetailView(data);
      } else {
        tableData.push(data);
      }
    }
    this.allResData = tableData;
    this.updateDataSource(tableData);
  }

  updateDataSource(data) {
    this.dataSource = new MatTableDataSource<any>(data);
    // this.dataSource.paginator = this.paginator;
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
