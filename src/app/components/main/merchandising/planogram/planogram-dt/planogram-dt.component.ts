import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
  ViewChild,
  SimpleChanges,
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
import { CompDataServiceType } from 'src/app/services/constants';
import { EmitEvent, Events } from '../../../../../models/events.model';
import { Utils } from '../../../../../services/utils';
import { Planogram } from '../planogram-interface';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-planogram-dt',
  templateUrl: './planogram-dt.component.html',
  styleUrls: ['./planogram-dt.component.scss'],
})
export class PlanogramDtComponent implements OnInit {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public newPlanogramData: any = {};
  selectedColumnFilter: string;
  filterForm: FormGroup;
  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  advanceSearchRequest: any[] = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
    },
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'name', title: 'Name', show: true },
    { def: 'start_date', title: 'Valid From', show: true },
    { def: 'end_date', title: 'Valid To', show: true },
    // { def: 'customer', title: 'Customer', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'name', title: 'Name', show: true },
  ];
  dateFilterControl: FormControl;
  allResData = [];
  requestOriginal;
  constructor(
    public merService: MerchandisingService,
    dataEditor: DataEditor,
    public apiService: ApiService,
    private eventService: EventBusService,
    public fb: FormBuilder,
    fds: FormDrawerService,
    deleteDialog: MatDialog
  ) {
    Object.assign(this, { merService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<any>();
  }

  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      name: [''],
      start_date: [''],
      end_date: [''],
      page: [this.page],
      page_size: [this.pageSize]
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.getPlanogramList();

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
      })
    );
    this.subscriptions.push(
      this.eventService.on(Events.SEARCH_PLANOGRAM, ({ request, requestOriginal, response }) => {
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
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { reset: true, module: Events.SEARCH_PLANOGRAM, route: '/merchandising/planograms' }));
  }
  onChangeCriteria() {
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { route: '/merchandising/planograms' }));
  }


  getPlanogramList() {
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
      this.merService
        .getPlanogramList(this.filterForm.value)
        .subscribe((res) => {
          this.allResData = res.data;
          this.apiResponse = res;
          this.updateDataSource(res.data);
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
    this.getPlanogramList();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (
        changes.newPlanogramData !== undefined &&
        Object.keys(changes.newPlanogramData.currentValue).length > 0
      ) {
        let currentValue = changes.newPlanogramData.currentValue;
        this.newPlanogramData = currentValue;
        this.updateAllData(this.newPlanogramData);
      }
    }
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  updateAllData(data) {
    this.subscriptions.push(
      this.merService
        .getPlanogramList(this.filterForm.value)
        .subscribe((res) => {
          this.allResData = res.data;
          this.apiResponse = res;
          this.updateDataSource(res.data);
          this.selections = new SelectionModel(true, []);
          let tableData = res.data;
          if (data.delete !== undefined && data.delete == true) {
            this.closeDetailView();
          } else {
            if (data.edit !== undefined && data.edit == true) {
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
    //console.log(data);
    this.dataSource = new MatTableDataSource<any>(data);
    // this.dataSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: Planogram): void {
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
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
    this.getPlanogramList();
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }

  public toggleSelection(): void {
    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));
  }

  public checkboxLabel(row?: Planogram): string {
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
