import { Component, OnInit, OnChanges, Input, ViewChild, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { MasterService } from '../../../master.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl } from '@angular/forms';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
@Component({
  selector: 'app-customer-visit-list',
  templateUrl: './customer-visit-list.component.html',
  styleUrls: ['./customer-visit-list.component.scss']
})
export class CustomerVisitListComponent implements OnInit {
  @Output() public jpListHandler: EventEmitter<any> = new EventEmitter<any>();
  @Input() public listData;
  @Input() public journeyId;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  pageSize = PAGE_SIZE_10;
  selectedColumnFilter: string;
  request: any;
  public displayedColumns = ['created_at', 'customerCode', 'customer', 'start_time', 'end_time', 'longitude', 'latitude', 'is_sequnece', 'shop_status', 'reason', 'comment'];
  filterForm;
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  filterType: any;
  startDateFilterControl: FormControl;
  endDateFilterControl: FormControl;
  constructor(private mService: MasterService, public fb: FormBuilder, private apiService: ApiService) {
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    let today = new Date();
    let month = '' + (today.getMonth() + 1);
    let date = '' + (today.getDate());
    if ((today.getMonth() + 1) < 10) {
      month = '0' + (today.getMonth() + 1);
    }
    if ((today.getDate()) < 10) {
      date = '0' + (today.getDate());
    }
    let newdate = today.getFullYear() + '-' + month + '-' + date;
    this.startDateFilterControl = new FormControl(newdate);
    this.endDateFilterControl = new FormControl(newdate);
    this.filterForm = this.fb.group({
      date: [''],
      today: false,
      "journey_plan_id": this.journeyId,
      customer_name: [''],
      customer_code: [''],
    })
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(status) {
    if (!status) {
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    }
    this.filterData();
  }
  filterData() {
    let body = this.filterForm.value;
    this.request = { page: 1, page_size: PAGE_SIZE_10, journey_plan_id: this.journeyId }
    Object.assign(body, this.request);
    this.mService.getCustomerVisitList(body).subscribe((res) => {
      if (res?.status == true) {
        this.itemSource = new MatTableDataSource<any>(res.data);
      }
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.listData) {
        let currentValue = changes.listData.currentValue;
        this.listData = currentValue;
        this.apiResponse = this.listData;
        this.allResData = this.listData.data;
        this.itemSource = new MatTableDataSource<any>(this.listData.data);
      }
    }
  }

  onPageFired(data) {
    let page = data['pageIndex'] + 1;
    let pageSize = data['pageSize'];
    this.getCustomerVisitList(this.filterType, page, pageSize);
  }

  getCustomerVisitList(type, page = 1, pageSize = this.pageSize) {
    let obj = {
      "journey_plan_id": this.journeyId,
      "page": page,
      "page_size": pageSize,
      ...this.filterForm.value
    };
    this.filterType = type;
    if (type == 'date') {
      obj["start_date"] = this.startDateFilterControl.value;
      obj["end_date"] = this.endDateFilterControl.value;
    } else {
      obj["all"] = true;
    }
    this.request = obj;
    this.subscriptions.push(
      this.mService.getCustomerVisitList(obj).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.listData = res.data;
        this.itemSource = new MatTableDataSource<any>(res.data);
      })
    )
  }

  openCustomerActivityList(data) {
    data.actionType = "activity-list";
    this.jpListHandler.emit(data);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
  ngAfterViewInit() {
    this.itemSource.paginator = this.paginator;
  }

  downloadCustomerVisitList() {
    let obj = {
      "journey_plan_id": this.journeyId,
      "type": 0,
    };
    obj["start_date"] = this.startDateFilterControl.value;
    obj["end_date"] = this.endDateFilterControl.value;

    this.mService.downloadCustomerVisitList(obj).subscribe((res) => {
      if (res?.status == true) {
        var type = '';
        if (res.data.file_url.indexOf('csv') > -1) {
          type = 'file.csv';
        } else {
          type = 'file.xls';
        }
        this.apiService.downloadFile(res.data.file_url, type);

      }
    });
  }
}
