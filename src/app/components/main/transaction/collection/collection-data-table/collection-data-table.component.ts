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
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionModel } from '../collection-models';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import {
  APP_CURRENCY_CODE,
  CompDataServiceType,
} from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from 'src/app/services/utils';
import { CollectionService } from '../collection.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { Events } from 'src/app/models/events.model';
import { DeliveryModel } from '../../delivery/delivery-model';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MasterService } from '../../../master/master.service';
import { TemplateRef } from '@angular/core';

@Component({
  selector: 'app-collection-data-table',
  templateUrl: './collection-data-table.component.html',
  styleUrls: ['./collection-data-table.component.scss'],
})
export class CollectionDataTableComponent implements OnInit, OnDestroy {
  @Input() public isDetailVisible: boolean;
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public newCollectionData: any;
  public dataSource: MatTableDataSource<CollectionModel>;
  public collections: CollectionModel[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  advanceSearchRequest: any[] = [];
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();

  public filterObjectId: any = null;

  private router: Router;
  private collectionService: CollectionService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  filterForm: FormGroup;
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'date', title: 'Date', show: true },
    { def: 'code', title: 'Refrence Number', show: true },
    { def: 'customerCode', title: 'Customer Code', show: true },
    { def: 'name', title: 'Customer Name', show: true },
    { def: 'route_code', title: 'Route Code', show: true },
    { def: 'route_name', title: 'Route Name', show: true },
    { def: 'salesman_code', title: 'Salesman Code', show: true },
    { def: 'salesman_name', title: 'Salesman Name', show: true },
    { def: 'mode', title: 'Payment Mode', show: true },
    { def: 'amount', title: 'Amount', show: true },
    { def: 'current_stage', title: 'Approval', show: true },
    { def: 'approval_status', title: 'Status', show: true },
    { def: 'ERP_status', title: 'Odoo Status', show: true }
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'expand', title: 'Detail', show: true },
  ];
  selectedColumnFilter: string;

  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0,
    },
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  requestOriginal: any;
  isOdooMessageOpen: boolean = false;
  @ViewChild("dialogRef") dialogRef: TemplateRef<any>;

  constructor(
    public apiService: ApiService,
    collectionService: CollectionService,
    private masterService: MasterService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    public fb: FormBuilder,
    private deleteDialog: MatDialog,
    private eventService: EventBusService,
    router: Router,
    private routerParam: ActivatedRoute
  ) {
    Object.assign(this, {
      collectionService,
      dataEditor,
      fds,
      deleteDialog,
      router,
    });
    this.dataSource = new MatTableDataSource<CollectionModel>();
  }

  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      collection_code: [''],
      customer_code: [''],
      customer_name: [''],
      route_code: [''],
      route_name: [''],
      salesman_code: [''],
      salesman: [''],
      payemnt_type: [''],
      current_stage: [''],
      erp_status: [''],
      approval_status: [''],
      page: [this.page],
      page_size: [this.pageSize],
    })

    this.displayedColumns = this.allColumns;
    this.filterColumns = [...[...this.allColumns].splice(1)];
    this.getCollections();

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {

        if (value.type === CompDataServiceType.GET_NEW_DATA) {
          this.filterObjectId = value.data.id;
          this.getCollections();
        };
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
      })
    );
    this.subscriptions.push(
      this.eventService.on(Events.SEARCH_COLLECTIONS, (data) => {
        this.dataSource = new MatTableDataSource<CollectionModel>(data);
        this.dataSource.paginator = this.paginator;
      })
    );

    // this.filterForm = new FormGroup({
    //   date: new FormControl(''),
    //   collection_code: new FormControl(''),
    //   customer_code: new FormControl(''),
    //   customer_name: new FormControl(''),
    //   payemnt_type: new FormControl(''),
    //   amount: new FormControl(''),
    //   approval: new FormControl('')
    // })
    this.checkCollectionParamUuid();
  }

  checkCollectionParamUuid() {
    this.routerParam.queryParams.subscribe(res => {
      this.isDetailVisible = false;
      let uuid = res["uuid"];
      if (uuid) {
        this.detailsClosed.emit();
        this.closeDetailView();
        this.collectionService.getCollectionByKey(uuid).subscribe((res) => {
          var dataObj = res.data;
          this.openDetailView(dataObj);
        })
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
    this.getCollections();
  }
  filterData() {
    let form = this.filterForm.value;
    const pipe = new DatePipe('en-US');
    if (form.date == "" && form.collection_number == "" && form.customer_code == "" && form.customer_name == ""
      && form.payment_mode == "" && form.amount == "" && form.approval == "") {
      this.dataSource = new MatTableDataSource<CollectionModel>(
        this.collections
      );
      return false;
    }
    let collection = [];
    let column = [];
    Object.keys(form).forEach((keys) => {
      //console.log(keys);
      if (form[keys] !== "") {
        console.log(keys);
        column.push(keys);
      }
    })
    if (column.length > 1) {
      collection = this.collections.filter((x) => {
        return (x.collection_number.toLocaleLowerCase().includes(form.collection_number)) &&
          (x?.customer['customer_info']['customer_code'].toLocaleLowerCase().includes(form.customer_code)) &&
          (pipe.transform(x['created_at'], 'dd-MM-y') == pipe.transform(form.date, 'dd-MM-y')) &&
          (x?.customer?.firstname.toLocaleLowerCase().includes(form.customer_name) || x?.customer?.lastname.toLocaleLowerCase().includes(form.customer_name)) &&
          (x.payemnt_type == form.payment_mode) &&
          (x['current_stage'].toLowerCase().includes(form.approval))
      })
    } else {
      if (form.collection_number !== "") {
        collection = this.collections.filter((x) => { return x.collection_number.toLocaleLowerCase().includes(form.collection_number) });
      } else if (form.customer_code !== "") {
        collection = this.collections.filter((x) => { return x?.customer['customer_info']['customer_code'].toLocaleLowerCase().includes(form.customer_code) });
      } else if (form.date !== "") {
        collection = this.collections.filter((x) => { return pipe.transform(x['created_at'], 'dd-MM-y') == pipe.transform(form.date, 'dd-MM-y') })
      } else if (form.customer_name !== "") {
        collection = this.collections.filter((x) => { return x?.customer?.firstname.toLocaleLowerCase().includes(form.customer_name) || x?.customer?.lastname.toLocaleLowerCase().includes(form.customer_name) });
      } else if (form.payment_mode !== "") {
        collection = this.collections.filter((x) => { return x.payemnt_type == form.payment_mode });
      } else if (form.approval !== "") {
        collection = this.collections.filter((x) => { return x['current_stage'].toLowerCase().includes(form.approval) });
      } else if (form.amount !== "") {
        collection = this.collections.filter((x) => { return x['invoice_amount'].toLowerCase().includes(form.amount) });
      }
    }
    this.dataSource = new MatTableDataSource<CollectionModel>(collection);
  }
  getCollections() {
    this.subscriptions.push(
      this.masterService.collectionList(this.filterForm.value)
        .subscribe((result) => {
          this.collections = result.data;
          this.apiResponse = result;
          this.allResData = result.data;
          this.dataSource = new MatTableDataSource<any>(result.data);
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
    this.getCollections();
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (
        changes.newCollectionData &&
        Object.keys(changes.newCollectionData.currentValue).length > 0
      ) {
        let currentValue = changes.newCollectionData.currentValue;
        this.newCollectionData = currentValue;
        this.updateAllData(this.newCollectionData);
      }
    }
  }

  updateAllData(data) {
    this.getCollections();
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

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: CollectionModel): void {
    if (this.isOdooMessageOpen) {
      return;
    }
    this.isDetailVisible = true;
    this.updateCollapsedColumns();
    this.itemClicked.emit(data);
  }
  getPaymentType(type) {
    switch (type) {
      case '1':
        return 'Cash';
      case '2':
        return 'Check';
      case '3':
        return 'Advance Payment';
      default:
        return 'Unknown';
    }
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

  public checkboxLabel(row?: CollectionModel): string {
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

    this.getCollections();
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
        var obj: any = JSON.parse(data);
        if (obj.data)
          this.deleteDialog.open(this.dialogRef, { data: obj.data.message });

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

  postOdoo(collectionData) {
    this.apiService.postCollectionOdooData(collectionData.uuid).subscribe(res => {
      console.log(res);
      this.getCollections();

    });
  }
}
