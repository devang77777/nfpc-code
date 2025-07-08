import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CompDataServiceType } from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { ReportService } from '../report.service';
import { ORDER_STATUS, PAGE_SIZE_10, STATUS } from 'src/app/app.constant';
@Component({
  selector: 'app-pallet-report',
  templateUrl: './pallet-report.component.html',
  styleUrls: ['./pallet-report.component.scss']
})
export class PalletReportComponent implements OnInit {
 @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('palletReportPaginator') palletReportPaginator: MatPaginator;
  public apiResponse = {
     pagination: {
       total_records: 0,
       total_pages: 0,
     },
   };
   page = 1;
   pageSize = PAGE_SIZE_10;
  itemSource = new MatTableDataSource();
  // totalItems: number = 0; // <-- total items from API
  // pageSize: number = 10; // <-- default page size
  // currentPage: number = 0;

  private subscriptions: Subscription[] = [];
  // public displayedColumns = ['prod_code', 'prod_desc', 'prv_rt_ctn', 'prv_rt_pcs', 'dmd_ctn', 'dmd_pcs', 'net_lss_ctn', 'net_lss_pcs'];
  public displayedColumns = [
    'salesman_code',
    'salesman',
    'total_pallet_allocated',
    'total_return',
    'pending',
  ];

  public displayedColumns2 = [
    'order_number',
    'order_type',
    'customer_code',
    'customer_name',
    'load_qty_sum',
    'invoiced',
    'unload_qty_sum',
    'driver_code',



  ]
  public displayedColumns3 = [
    'driver_code',
    'driver_name',
    'load_qty_sum',
    'invoiced',
    'unload_qty_sum',
    'variance_qty',
    'difference',

  ]
  dateFilterControl: FormControl;
  selectedColumnFilter: string;

  filterForm: FormGroup;
  constructor(
    public fb: FormBuilder,
    private merService: ReportService,
    public dataEditor: DataEditor
  ) {
    this.itemSource = new MatTableDataSource<any>();
    this.itemSource.paginator = this.palletReportPaginator;
  }

  data = [];
  requset;
  ngOnInit(): void {
    this.filterForm = this.fb.group({
      Item: [''],
       page: [this.page],
      page_size: [this.pageSize],
    });
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.REPORT_DATA) {
          this.data = value.data;
          this.apiResponse = value.data;
          this.requset = value.request;
          this.updateTableData(this.data);
        }
      })
    );

    // this.loadData(this.currentPage, this.pageSize); 
  }

  //  loadData(pageIndex: number, pageSize: number) {
  //   const body = {
  //     ...this.filterForm.value,
  //     ...this.requset,
  //     page: pageIndex + 1,        // APIs usually use 1-based pages
  //     page_size: pageSize
  //   };

  //   this.merService.getReportData(body).subscribe((res) => {
  //     if (res?.status === true) {
  //       this.data = res.data;                // your data
  //       this.totalItems = res.total_count;   // total from backend
  //       this.updateTableData(this.data);
  //     }
  //   });
  // }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item;
  }
  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    } else {
      this.filterForm.patchValue({
        page: this.page,
      page_size: this.pageSize
      });
    }
    this.filterData();
  }
  filterData() {
    // let body = this.filterForm.value;
    // Object.assign(body, this.requset);
    const body = {
      ...this.filterForm.value,
      ...this.requset,
      page: this.page,        // APIs usually use 1-based pages
      page_size: this.pageSize
    };
    this.merService.getReportData(body).subscribe((res) => {
      if (res?.status == true) {
        this.apiResponse = res.data,
        this.dataEditor.sendData({
          type: CompDataServiceType.REPORT_DATA,
          request: this.requset,
          data: res.data,
          // this.apiResponse: res.data,
        });
      }
    });
  }
  checkIsTrue = true
  updateTableData(data = []) {
    let newData = data.length > 0 ? data : this.data;
    this.displayedColumns = this.displayedColumns
    this.itemSource = new MatTableDataSource<any>(newData);
    this.itemSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

  // onPaginateChange(event) {
  //   this.currentPage = event.pageIndex;
  //   this.pageSize = event.pageSize;
  //   this.loadData(this.currentPage, this.pageSize);
  // }

    onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
  }
}
