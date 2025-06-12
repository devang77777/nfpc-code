import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { CompDataServiceType } from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-truck-utilization-report',
  templateUrl: './truck-utilization-report.component.html',
  styleUrls: ['./truck-utilization-report.component.scss']
})
export class TruckUtilizationReportComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  columns = [
    { title: 'Date', columnDef: 'transcation_date' },
    { title: 'Vehicles', columnDef: 'vehicle_code' },
    { title: 'Trip', columnDef: 'trip_number' },
    { title: 'Salesman Code', columnDef: 'salesman_code' },
    { title: 'Salesman Name', columnDef: 'salesman_name' },
    { title: 'Windows To Deliver', columnDef: 'windows_to_delivered' },
    { title: 'Windows <=10 Cases', columnDef: 'windoes_less_case' },
    { title: 'No Of Orders', columnDef: 'no_orders' },
    { title: 'Order QTY', columnDef: 'order_qty' },
    { title: 'Delivered QTY', columnDef: 'delivery_qty' },
    { title: 'Windows Delivered', columnDef: 'windows_delivered' },
    { title: 'Windows Delivered %', columnDef: 'windows_delivered_per' },
    { title: '% Windows "<= 10 Cases"', columnDef: 'windows_less_delivery' },
    // {title:'Overall Capacity',columnDef:'transcation_date'},
    { title: 'Capacity On This Day', columnDef: 'capacity_day' },
    { title: 'Utilisation', columnDef: 'trip' },
    { title: 'Avg Cases/Window', columnDef: 'avgcaswindow' },
    // { title: 'Trip / Trucks', columnDef: 'trip' },
  ];
  displayedColumns = [];

  dateFilterControl: FormControl;
  selectedColumnFilter: string;

  filterForm: FormGroup;
  constructor(public fb: FormBuilder, private merService: ReportService, public dataEditor: DataEditor) {
    this.displayedColumns = this.columns.map(c => c.columnDef);
    this.itemSource = new MatTableDataSource<any>();
  }

  data = [];
  requset;
  ngOnInit(): void {
    this.filterForm = this.fb.group({
      Item: [''],
    });
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.REPORT_DATA) {
          //console.log(value);
          // this.data = [
          //   {
          //     "SRNo": 1,
          //     "Item": "U5030",
          //     "Item_description": "LacES LL R.Apple 1L4X3",
          //     "qty": "100.00",
          //     "uom": "CT",
          //     "sec_qty": "",
          //     "sec_uom": "",
          //     "from_location": "",
          //     "to_location": "",
          //     "from_lot_serial": "",
          //     "to_lot_number": "",
          //     "to_lot_status_code": "",
          //     "load_date": "2022-06-21",
          //     "warehouse": "101834",
          //     "is_exported": "NO",
          //     "salesman": null
          //   },
          //   {
          //     "SRNo": 2,
          //     "Item": "U5032",
          //     "Item_description": "LacES LL C.bry 1L4X3",
          //     "qty": "100.00",
          //     "uom": "CT",
          //     "sec_qty": "",
          //     "sec_uom": "",
          //     "from_location": "",
          //     "to_location": "",
          //     "from_lot_serial": "",
          //     "to_lot_number": "",
          //     "to_lot_status_code": "",
          //     "load_date": "2022-06-21",
          //     "warehouse": "101834",
          //     "is_exported": "NO",
          //     "salesman": null
          //   },
          //   {
          //     "SRNo": 3,
          //     "Item": "U5030",
          //     "Item_description": "LacES LL R.Apple 1L4X3",
          //     "qty": "90.00",
          //     "uom": "CT",
          //     "sec_qty": "",
          //     "sec_uom": "",
          //     "from_location": "",
          //     "to_location": "",
          //     "from_lot_serial": "",
          //     "to_lot_number": "",
          //     "to_lot_status_code": "",
          //     "load_date": "2022-06-22",
          //     "warehouse": "101834",
          //     "is_exported": "NO",
          //     "salesman": null
          //   }
          // ];
          this.data = value.data;
          this.data.forEach(e => {
            if (e.Utilazation) {
              e.Utilazation = e.Utilazation + '%';
            }
            if (e.windows_delivered_per) {
              e.windows_delivered_per = e.windows_delivered_per + '%';
            }
            if (e.windows_less_delivery) {
              e.windows_less_delivery = e.windows_less_delivery + '%';
            }
          });
          this.requset = value.request;
          this.updateTableData(this.data);
        }
      })
    );
  }
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
        page: 1,
        page_size: 10
      });
    }
    this.filterData();
  }
  filterData() {
    let body = this.filterForm.value;
    Object.assign(body, this.requset);
    this.merService.getReportData(body).subscribe((res) => {
      if (res?.status == true) {
        this.dataEditor.sendData({
          type: CompDataServiceType.REPORT_DATA,
          request: this.requset,
          data: res.data,
        });
      }
    });
  }
  updateTableData(data = []) {
    let newData = data.length > 0 ? data : this.data;
    this.itemSource = new MatTableDataSource<any>(newData);
    this.itemSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }
}