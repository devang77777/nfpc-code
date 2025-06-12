import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import {
  CompDataServiceType,
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { Router, ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { GrnModel } from '../grn-models';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Utils } from 'src/app/services/utils';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TemplateRef } from '@angular/core';

@Component({
  selector: 'app-grn-data-table',
  templateUrl: './grn-data-table.component.html',
  styleUrls: ['./grn-data-table.component.scss'],
})
export class GrnDataTableComponent implements OnInit, OnDestroy {
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public newGRNData: any;
  @Input() public isDetailVisible: boolean;
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();

  public dataSource: MatTableDataSource<GrnModel>;
  public grNotes: GrnModel[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public allResData = [];
  channelList : any = [];
  filterForm: FormGroup;
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0,
    },
  };
  page = 1;
  selectedColumnFilter: string;

  pageSize = PAGE_SIZE_10;
  private router: Router;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'grn_date', title: 'Date', show: true },
    { def: 'grn_number', title: 'GRN Number', show: true },
    { def: 'branch_plant_code', title: 'Branchplant code', show: true },
    { def: 'customer_reference_number', title: 'Customer GRV No', show: true },
    { def: 'customer', title: 'Customer', show: true },
    { def: 'channel_name', title: 'Service Channel', show: true },
    { def: 'customer_code', title: 'Customer Code', show: true },
    { def: 'salesman', title: 'Salesman', show: true },
    { def: 'salesman_code', title: 'Salesman Code', show: true },
    { def: 'route', title: 'Route', show: true },
    { def: 'route_code', title: 'Route Code', show: true },
    { def: 'approval_status', title: 'Approval Status', show: true },
    // { def: 'ERP_status', title: 'ERP Status', show: true },
    // { def: 'grn_remark', title: 'Status', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'misc', title: 'Orders', show: true },
  ];
  @ViewChild("dialogRef") dialogRef: TemplateRef<any>;
  isOdooMessageOpen: boolean = false;

  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    public fb: FormBuilder,
    private deleteDialog: MatDialog,
    private route: ActivatedRoute,
    router: Router
  ) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog, router });
    this.dataSource = new MatTableDataSource<GrnModel>();
    // this.channelList = Channel;
  }

  public ngOnInit(): void {
    this.getChannelList();
    this.filterForm = this.fb.group({
      date: [''],
      code: [''],
      customer_reference_number: [''],
      approvalStatus: [''],
      channel_name:[[]],
      // sourceWarehouse: [''],
      // destinationWarehouse: [''],
      salesman_name: [''],
      salesman_code: [''],
      customer_name: [''],
      customer_code: [''],
      route: [''],
      rout_code: [''],
      page: [this.page],
      page_size: [this.pageSize],
      branch_plant_code: ['']
    });
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...[...this.allColumns].splice(2)];

    this.dataEditor.newData.subscribe((value) => {
      if (value.type === CompDataServiceType.GET_NEW_DATA) {
        this.getGRNs();
      }
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    });
    // this.subscriptions.push(this.apiService.getGRNs()
    //   .pipe(map(result => result.data),
    //     map((items: ApiGrnModel[]) => {
    //       return items.map(item => {
    //         return apiGrnMapper(item);
    //       });
    //     })).subscribe(result => {
    //     this.grNotes = result;
    //     this.dataSource = new MatTableDataSource<GrnModel>(this.grNotes);
    //     this.dataSource.paginator = this.paginator;
    //   }));

    // this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
    //   if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
    //     this.closeDetailView();
    //   }
    // // }));
    // this.dataSource = new MatTableDataSource<GrnModel>(this.route.snapshot.data['resolved'].grn.data);
    // this.dataSource.paginator = this.paginator


    var body = {
      customerRef: '',
      date: '',
      code: '',
      sourceWarehouse: '',
      destinationWarehouse: '',
      page: this.page,
      page_size: this.pageSize,
      branch_plant_code: ''
    };
    this.apiService.getGRNs(this.filterForm.value).subscribe(grn => {
      this.apiResponse = grn;
      this.allResData = grn.data;
      grn.data.forEach(element => {
        if (element.current_stage == 'Pending') {
          element['isCheckEnable'] = true;
        } else {
          element['isCheckEnable'] = false;
        }
      });
      this.updateDataSource(grn.data);
    })

  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: GrnModel): void {
    if (this.isOdooMessageOpen) {
      return;
    }
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    //this.updateCollapsedColumns();
  }
  getChannelList(){
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.channelList = res.data;
    });
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

  public checkboxLabel(row?: GrnModel): string {
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

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getGRNs();
  }

  getGRNs() {
    this.apiService.getGRNs(this.filterForm.value).subscribe((res) => {
      this.apiResponse = res;
      this.allResData = res.data;
      res.data.forEach(element => {
        if (element.current_stage == 'Pending') {
          element['isCheckEnable'] = true;
        } else {
          element['isCheckEnable'] = false;
        }
      });
      this.updateDataSource(res.data);
    });
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {
    if (!item) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    } else {
      this.filterForm.patchValue({
        page: 1,
        page_size: this.pageSize
      });
    }
    this.getGRNs();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (
        changes.newGRNData &&
        Object.keys(changes.newGRNData.currentValue).length > 0
      ) {
        let currentValue = changes.newGRNData.currentValue;
        this.newGRNData = currentValue;
        this.updateAllData(this.newGRNData);
      }
    }
  }

  updateAllData(data) {
    this.getGRNs();
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

  postOdoo(grnData) {
    this.apiService.postGoodReceiptNoteOdooData(grnData.uuid).subscribe(res => {
      this.getGRNs();

    });
  }
}
