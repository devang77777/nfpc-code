import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { JourneyFormsCustomerModel, JourneyFormsDayPlanModel, JourneyPlanCustomerModel, JourneyPlanDayModel, JourneyPlanModel } from '../journey-plan-model';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { DAYS_CONFIG } from 'src/app/features/shared/shared-interfaces';
import { MasterService } from '../../master.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-journey-plan-data-table',
  templateUrl: './journey-plan-data-table.component.html',
  styleUrls: ['./journey-plan-data-table.component.scss']
})
export class JourneyPlanDataTableComponent implements OnInit, OnDestroy {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public newJourneyPlanData: any = {};
  domain = window.location.host;
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
  filterForm;
  public dataSource: MatTableDataSource<JourneyPlanModel>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];

  private apiService: MasterService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'jpName', title: 'Name', show: true },
    { def: 'salesman_code', title: 'salesman Code', show: true },
    { def: 'jpStartDate', title: 'Start Date', show: true },
    { def: 'jpEndDate', title: 'End Date', show: true }
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'jpName', title: 'Name', show: true }
  ];
  advanceSearchRequest: any[] = [];
  requestOriginal;

  constructor(
    apiService: MasterService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    public apisService: ApiService,
    public eventService: EventBusService,
    public fb: FormBuilder,
    deleteDialog: MatDialog) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<JourneyPlanModel>();
  }

  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      name: [''],
      merchanidser_code: [''],
      start_date: [''],
      end_date: [''],
      page: [this.page],
      page_size: [this.pageSize]
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getAllJourneyPlans();

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));

    this.subscriptions.push(this.eventService.on(Events.SEARCH_JOURNEYPLAN, ({ request, requestOriginal, response }) => {
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
    }));
  }

  onCloseCriteria() {
    this.advanceSearchRequest = []
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { reset: true, module: Events.SEARCH_JOURNEYPLAN, route: '/masters/journey-plan' }));
  }
  onChangeCriteria() {
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { route: '/masters/journey-plan' }));
  }

  getAllJourneyPlans() {
    if (this.advanceSearchRequest.length > 0) {
      let requestOriginal = this.requestOriginal;
      requestOriginal['page'] = this.page;
      requestOriginal['page_size'] = this.pageSize;
      this.subscriptions.push(
        this.apisService.onSearch(requestOriginal).subscribe((res) => {
          this.apiResponse = res;
          this.allResData = res.data;
          this.updateDataSource(res.data);
        })
      );
      return false;
    }
    this.subscriptions.push(this.apiService.getAllJourneyPlans(this.filterForm.value).subscribe((journey: any) => {
      this.setupStartDayName(journey.data);
      this.setupCustomersData(journey.data);
      this.apiResponse = journey;
      this.allResData = journey.data;
      this.updateDataSource(journey.data);
    }));
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: JourneyPlanModel): void {
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

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }

  public toggleSelection(): void {
    this.isAllSelected() ? this.selections.clear() : this.dataSource.data.forEach(row => this.selections.select(row));
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
    this.getAllJourneyPlans();

  }
  public checkboxLabel(row?: JourneyPlanModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }

  private setupStartDayName(journeys: JourneyPlanModel[]): void {
    return journeys.forEach((journey: JourneyPlanModel) => {
      [...DAYS_CONFIG].forEach((item, index) => {
        if (journey.start_day_of_the_week === (index + 1)) {
          journey.start_day_name = item.label;
        }
      });
    });
  }

  private setupCustomersData(journeys: JourneyPlanModel[]): void {
    journeys.forEach((journey: JourneyPlanModel) => {
      const isWeekly = journey.plan_type === "2" || journey.plan_type === 2;

      if (!isWeekly) {
        const customers: JourneyFormsDayPlanModel = {};

        const journeyPlanDays = journey.journey_plan_days ? journey.journey_plan_days : [];
        journeyPlanDays.forEach((item: JourneyPlanDayModel) => {
          const formCustomers: JourneyFormsCustomerModel[] = [];

          item.journey_plan_customers.forEach((cust: JourneyPlanCustomerModel) => {
            const newCust: JourneyFormsCustomerModel = {
              customer_id: cust.customer_id,
              customer_code: cust.customer_info?.customer_code,
              name: cust.user ? `${cust.user.firstname} ${cust.user.lastname}` : '',
              day_start_time: cust.day_start_time,
              day_end_time: cust.day_end_time,
              day_customer_sequence: cust.day_customer_sequence
            };

            formCustomers.push(newCust);
          });

          customers[`day${item.day_number}`] = {
            day_number: item.day_number,
            day_name: item.day_name,
            customers: formCustomers
          };
        });

        journey.dailyCustomers = customers;
      }
    });
  }
  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getAllJourneyPlans();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newJourneyPlanData && Object.keys(changes.newJourneyPlanData.currentValue).length > 0) {
        let currentValue = changes.newJourneyPlanData.currentValue;
        this.newJourneyPlanData = currentValue;
        this.updateAllData(this.newJourneyPlanData);
      }
    }
  }

  updateAllData(data) {
    this.getAllJourneyPlans();
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
}
