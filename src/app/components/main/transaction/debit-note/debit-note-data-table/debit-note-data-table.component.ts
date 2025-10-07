import { ApiService } from 'src/app/services/api.service';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import {
  APP_CURRENCY_CODE,
  CompDataServiceType,
} from 'src/app/services/constants';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Utils } from 'src/app/services/utils';
import { DebitNoteService } from '../debit-note.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { Events, EmitEvent } from 'src/app/models/events.model';
import { OrderModel } from '../../orders/order-models';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-debit-note-data-table',
  templateUrl: './debit-note-data-table.component.html',
  styleUrls: ['./debit-note-data-table.component.scss'],
})
export class DebitNoteDataTableComponent implements OnInit, OnDestroy {
  @Input() public isDetailVisible: boolean;
  @ViewChild("dialogRef") dialogRef: TemplateRef<any>;
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public newDebitData: any;
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  public dataSource: MatTableDataSource<any>;
  public filterObjectId: any = null;
  public debitNoteData: any[] = [];
  isOdooMessageOpen: boolean = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  private router: Router;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'misc', title: 'Orders', show: false },
    { def: 'date', title: 'Credit Note Date', show: true },
    { def: 'code', title: 'Code', show: true },
    { def: 'customerCode', title: 'Customer Code', show: true },
    { def: 'name', title: 'Customer', show: true },
    // { def: 'route_code', title: 'Route Code', show: true },
    // { def: 'route_name', title: 'Route Name', show: true },
    { def: 'salesman_code', title: 'Salesman Code', show: true },
    { def: 'salesman_name', title: 'Salesman Name', show: true },
    { def: 'type', title: 'Type', show: true },
    { def: 'amount', title: 'Credit Amount', show: true },
    { def: 'approval', title: 'Approval', show: true },
    { def: 'status', title: 'Status', show: true },
    { def: 'ERP_status', title: 'ERP Status', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'expand', title: 'Detail', show: true },
  ];
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0,
    },
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  selectedColumnFilter: string;
  filterForm: FormGroup;
  advanceSearchRequest: any[] = [];

  constructor(
    private debitNoteService: DebitNoteService,
    public apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    public fb: FormBuilder,
    private deleteDialog: MatDialog,
    private eventService: EventBusService,
    router: Router,
    private routerParam: ActivatedRoute
  ) {
    Object.assign(this, { dataEditor, fds, deleteDialog, router });
    this.dataSource = new MatTableDataSource<any>();
  }

  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      debit_note_number: [''],
      current_stage: [''],
      customer_name: [''],
      customer_code: [''],
      salesman_name: [''],
      salesman_code: [''],
      route_name: [''],
      route_code: [''],
      page: [this.page],
      page_size: [this.pageSize],
      approval: ['']
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...[...this.allColumns].splice(2)];
    this.getDebitNoteList();

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.GET_NEW_DATA) {
          this.filterObjectId = value.data.id;
          this.getDebitNoteList();
        };
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
        if (value.uuid) {
          const clone = JSON.parse(JSON.stringify(this.debitNoteData));
          const index = clone.findIndex((x) => x.uuid === value.uuid);
          if (index > -1) {
            clone.splice(index, 1);
            this.debitNoteData = clone;
            this.dataSource.data = clone;
          }
        }
      })
    );
    this.subscriptions.push(
      this.eventService.on(Events.SEARCH_DEBITE_NOTE, (data) => {
        this.dataSource = new MatTableDataSource<OrderModel>(data);
        this.dataSource.paginator = this.paginator;
      })
    );
    this.checkDebitNoteParamUuid();
  }

  checkDebitNoteParamUuid() {
    this.routerParam.queryParams.subscribe(res => {
      this.isDetailVisible = false;
      let uuid = res["uuid"];
      if (uuid) {
        this.detailsClosed.emit();
        this.closeDetailView();
        this.debitNoteService.getDebitNoteListById(uuid).subscribe((res) => {
          var dataObj = res.data;
          this.openDetailView(dataObj);
        })
      }
    });
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
    this.getDebitNoteList();
  }

  onChangeCriteria() {
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { route: '/transaction/debit-note', currentSearchCriteria: this.advanceSearchRequest }));
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  getDebitNoteList() {
    this.subscriptions.push(
      this.debitNoteService
        .getDebitNoteList(this.filterForm.value)
        .pipe(map((result) => result))
        .subscribe((result) => {
          this.debitNoteData = result.data;
          this.apiResponse = result;
          this.allResData = result.data;
          this.dataSource = new MatTableDataSource<any>(this.debitNoteData);
          if (this.filterObjectId != null) {
            let filterData = result.data.find(x => x.id === this.filterObjectId);
            this.openDetailView(filterData)
            this.filterObjectId = null;
          };
          // this.dataSource.paginator = this.paginator;
        })
    );
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getDebitNoteList();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (
        changes.newDebitData &&
        Object.keys(changes.newDebitData.currentValue).length > 0
      ) {
        let currentValue = changes.newDebitData.currentValue;
        this.newDebitData = currentValue;
        this.updateAllData(this.newDebitData);
      }
    }
  }

  updateAllData(data) {
    this.getDebitNoteList();
    this.selections = new SelectionModel(true, []);
    if (data.delete !== undefined && data.delete == true) {
      this.closeDetailView();
    }
    return false;
  }

  updateDataSource(data) {
    this.dataSource = new MatTableDataSource<any>(data);
    // this.dataSource.paginator = this.paginator;
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

  public getDisplayedColumns(): string[] {
    return this.displayedColumns
      .filter((column) => column.show)
      .map((column) => column.def);
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }

  public toggleSelection(): void {
    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));
  }

  public checkboxLabel(row?: any): string {
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

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
  filterOdooMessageData(data: any) {
    try {
      this.isOdooMessageOpen = false;
      if (data) {
        // var obj: any = JSON.parse(data);
        this.deleteDialog.open(this.dialogRef, { data: data });

        // if (obj.response) {
        //   var text = "";
        //   obj.response.forEach(element => {
        //     element.products.forEach(product => {
        //       text = `${text} ${product},`
        //     });
        //   });
        //   this.deleteDialog.open(this.dialogRef, { data: text });

        // }
      }

    } catch (e) {
      data = data.replace(/\\/g, "");
      var obj: any = JSON.parse(data);
      if (obj.response) {
        var text = "";
        obj.response.forEach(element => {
          element.products.forEach(product => {
            text = `${text} ${product},`
          });
        });
        this.deleteDialog.open(this.dialogRef, { data: text });

      }
    }
  }

  postOdoo(invoiceData) {
    this.apiService.postDebitNoteOdooData(invoiceData.id).subscribe(res => {
      this.getDebitNoteList();

    });
  }
}
