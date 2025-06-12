import { Component, EventEmitter, OnInit, Output, Input, ViewChild } from '@angular/core';
import { DataEditor } from 'src/app/services/data-editor.service';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { PAGE_SIZE_10 } from 'src/app/app.constant';

@Component({
  selector: 'app-salesman-activity-detail',
  templateUrl: './salesman-activity-detail.component.html',
  styleUrls: ['./salesman-activity-detail.component.scss']
})
export class SalesmanActivityDetailComponent implements OnInit {
  @Output() public mapDetailsClosed: EventEmitter<any> = new EventEmitter<any>();

  domain = window.location.host.split('.')[0];
  private dataService: DataEditor;
  private apiService: ApiService;
  salesmanFilterControl: FormControl;
  salesmanControl: FormControl;
  startDateFilterControl: FormControl;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  pageSize = PAGE_SIZE_10;
  public listData = [];
  public displayedColumns = ['created_at', 'customer', 'start_time', 'end_time', 'longitude', 'latitude', 'is_sequnece', 'shop_status', 'reason', 'comment'];

  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  filterType: any;
  salesmen: any;
  constructor(apiService: ApiService, dataService: DataEditor) {
    Object.assign(this, { apiService, dataService });
    this.itemSource = new MatTableDataSource<any>();
  }

  latlng = [
    {
      latitude: 23.0285312,
      longitude: 72.5262336
    },
    {
      latitude: 19.0760,
      longitude: 72.8777
    },
    {
      latitude: 25.2048,
      longitude: 55.2708
    }
  ];

  ngOnInit(): void {
    this.startDateFilterControl = new FormControl('');
    this.salesmanFilterControl = new FormControl('');
    this.salesmanControl = new FormControl('');
  }
  selectionchangedSalesman() {
    let salesman = this.salesmanControl.value;
    this.salesmanFilterControl.setValue(salesman[0].id)
  }

  ngAfterViewInit() {
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
    this.salesmanFilterControl = new FormControl('');
    this.subscriptions.push(
      this.apiService.getSalesMan().subscribe(res => {
        this.salesmen = res.data.map(item => {
          if (item.user !== null) {
            item['user']['lastname'] = [item.user?.lastname, item.salesman_code].join(" - ")
            return item;
          }
          return item;
        });
      })
    );
  }

  public closeDetailView(): void {
    this.mapDetailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  getSalesmanActivityDetails(type = '', page = 1, pageSize = this.pageSize) {
    if (this.salesmanFilterControl.value == "") {
      return false;
    }
    let obj = {
      "page": page,
      "page_size": pageSize,
      "salesman_id": this.salesmanFilterControl.value
    };
    this.filterType = type;
    if (type == 'date') {
      obj["date"] = this.startDateFilterControl.value;
    } else if (type == 'all') {
      obj["all"] = true;
    }

    this.subscriptions.push(
      this.apiService.getSalesmanActivityDetails(obj).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.listData = res.data;
        this.itemSource = new MatTableDataSource<any>(res.data);

      })
    )
  }

  onPageFired(data) {
    let page = data['pageIndex'] + 1;
    let pageSize = data['pageSize'];
    this.getSalesmanActivityDetails(this.filterType, page, pageSize);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
