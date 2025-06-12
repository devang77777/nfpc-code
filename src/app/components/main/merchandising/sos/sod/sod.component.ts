import { Component, OnInit, ViewChild } from '@angular/core';
import { MerchandisingService } from '../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
@Component({
  selector: 'app-sod',
  templateUrl: './sod.component.html',
  styleUrls: ['./sod.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class SodComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['date', 'merchandiser', 'customer_code', 'customer', 'gandola_store', 'stands_store'];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  ourBrands = [];
  advanceSearchRequest: any[] = [];
  competitorBrands = [];
  expandedElement: any | null;
  dateFilterControl: FormControl;
  searchFilters;
  constructor(private merService: MerchandisingService,
    public dataEditor: DataEditor, public fb: FormBuilder, private eventService: EventBusService) {
    this.itemSource = new MatTableDataSource<any>();
  }

  data = [];
  merchandisers = [];
  customers = [];
  brands = [];
  categories = [];
  items = [];
  selectedColumnFilter: string;

  filterForm: FormGroup;
  ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      salesman_name: [''],
      customer_code: [''],
      customer_name: [''],
      page: [this.page],
      page_size: [this.pageSize]
    });
    this.getSodList();
    this.subscriptions.push(this.eventService.on(Events.SOD, ({ request, response }) => {
      this.advanceSearchRequest = [];
      if (request) {
        Object.keys(request).forEach(item => {
          this.advanceSearchRequest.push({ param: item, value: request[item] })
        })
      }

      this.updateTableData(response);
    }))
  }

  onCloseCriteria() {
    this.advanceSearchRequest = []
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { reset: true, module: Events.SOD, route: '/merchandising/sos' }));
  }
  onChangeCriteria() {
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { route: '/merchandising/sos' }));
  }


  expandList(data) {
    this.expandedElement = this.expandedElement === data ? null : data;
  }

  getSodList() {
    this.subscriptions.push(
      this.merService.getSodMainList(this.filterForm.value).subscribe((res) => {
        this.apiResponse = res;
        this.updateTableData(res.data);
      })
    );
  }

  updateTableData(data = []) {
    let newData = data.length > 0 ? data : this.data;
    this.itemSource = new MatTableDataSource<any>(newData);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getSodList();
  }
  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    }
    this.getSodList();
  }

}
