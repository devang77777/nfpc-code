import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ColumnConfig } from '../../../../../interfaces/interfaces';
import { DataEditor } from '../../../../../services/data-editor.service';
import { Subscription } from 'rxjs';
import { MerchandisingService } from '../../merchandising.service';
import { EventBusService } from '../../../../../services/event-bus.service';
import { FormDrawerService } from '../../../../../services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { Campaign } from '../campaign-interface';
import { CompDataServiceType } from 'src/app/services/constants';
import { EmitEvent, Events } from '../../../../../models/events.model';
import { Utils } from '../../../../../services/utils';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-campaign-dt',
  templateUrl: './campaign-dt.component.html',
  styleUrls: ['./campaign-dt.component.scss'],
})
export class CampaignDtComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;

  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  @Input() public newCompaignData: any = {};
  selectedColumnFilter: string;
  requestOriginal;
  public allResData = [];
  advanceSearchRequest: any[] = [];
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
    { def: 'created_at', title: 'Date', show: true },
    { def: 'salesman', title: 'Salesman', show: true },
    { def: 'campaign_id', title: 'Campaign Id', show: true },
    { def: 'customerCode', title: 'Customer Code', show: true },
    { def: 'customer', title: 'Customer', show: true },

  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'created_at', title: 'Date', show: true },
  ];
  dateFilterControl: FormControl;
  constructor(
    public merService: MerchandisingService,
    dataEditor: DataEditor,
    private eventService: EventBusService,
    fds: FormDrawerService,
    public apiService: ApiService,
    public fb: FormBuilder,
    deleteDialog: MatDialog
  ) {
    Object.assign(this, { merService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Campaign>();
  }

  public ngOnInit(): void {
    let today = new Date();
    let month = '' + (today.getMonth() + 1);
    let date = '' + today.getDate();
    if (today.getMonth() + 1 < 10) {
      month = '0' + (today.getMonth() + 1);
    }
    if (today.getDate() < 10) {
      date = '0' + today.getDate();
    }
    let newdate = today.getFullYear() + '-' + month + '-' + date;
    this.dateFilterControl = new FormControl(newdate);

    this.filterForm = this.fb.group({
      date: [''],
      campaign_id: [''],
      salesman_name: [''],
      customer_name: [''],
      customer_code: [''],
      page: [this.page],
      page_size: [this.pageSize]
    })

    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getCampaignList();

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
      })
    );
    this.subscriptions.push(
      this.eventService.on(Events.SEARCH_CAMPAIGN, ({ request, requestOriginal, response }) => {
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
      })
    );
  }

  onCloseCriteria() {
    this.advanceSearchRequest = []
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { reset: true, module: Events.SEARCH_CAMPAIGN, route: '/merchandising/campaigns' }));
  }
  onChangeCriteria() {
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { route: '/merchandising/campaigns' }));
  }


  public getCampaignList() {
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
    this.subscriptions.push(
      this.merService.getCampaignList(this.filterForm.value).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.updateDataSource(res.data);
      })
    );
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getCampaignList();
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.merService.getCampaignList(this.filterForm.value).subscribe((res) => {
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

  public openDetailView(data: Campaign): void {
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
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
    this.getCampaignList();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.updateCollapsedColumns();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible
      ? this.collapsedColumns
      : this.allColumns;
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

  public checkboxLabel(row?: Campaign): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  getPaginatorValue(len: number) {
    return len < 10 ? true : false;
  }
}
