import { Component, OnInit, OnChanges, Input, ViewChild, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { MasterService } from '../../../master.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
@Component({
  selector: 'app-customer-activity-list',
  templateUrl: './customer-activity-list.component.html',
  styleUrls: ['./customer-activity-list.component.scss']
})
export class CustomerActivityListComponent implements OnInit {
  @Input() public listData;
  @Input() public visitId;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  pageSize = PAGE_SIZE_10;
  public displayedColumns = ['created_at', 'activity_name', 'activity_action', 'start_time', 'end_time'];

  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  filterType: any;
  startDateFilterControl: FormControl;
  constructor(private mService: MasterService) {
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    this.startDateFilterControl = new FormControl();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.listData) {
        let currentValue = changes.listData.currentValue;
        if (currentValue !== undefined) {
          this.listData = currentValue;
          this.apiResponse = this.listData;
          this.allResData = this.listData.data;
          this.itemSource = new MatTableDataSource<any>(this.listData.data);
        }
      }
    }
  }

  onPageFired(data) {
    let page = data['pageIndex'] + 1;
    let pageSize = data['pageSize'];
    this.getCustomerActivityList(this.filterType, page, pageSize);
  }

  getCustomerActivityList(filter, page = 1, pageSize = this.pageSize) {
    let value = true;
    if (filter == 'date') {
      value = this.startDateFilterControl.value;
    }
    this.subscriptions.push(
      this.mService.getCustomerActivityList(this.visitId, page, pageSize, filter, value).subscribe((res) => {
        this.apiResponse = res;
        this.allResData = res.data;
        this.listData = res.data;
        this.itemSource = new MatTableDataSource<any>(res.data);
      })
    )
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
