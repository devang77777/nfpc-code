import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { CompDataServiceType } from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-monthly-kpi',
  templateUrl: './monthly-kpi.component.html',
  styleUrls: ['./monthly-kpi.component.scss']
})
export class MonthlyKpiComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  columns = [
    { title: 'Zone', columnDef: 'region_name', id: '1' },
    { title: 'Ordered (Cases)', columnDef: 'total_volume_orderd', id: '2' },
    { title: 'Loaded (Cases)', columnDef: 'total_volume_delivered', id: '3' },
    { title: 'No of Vehicles', columnDef: 'no_of_vehical', id: '4' },
    { title: 'No of trips', columnDef: 'no_of_trips', id: '5' },
    { title: 'Day Utilization', columnDef: 'Utilazation', id: '6' },
    { title: 'Trip 1 Utillization', columnDef: 'trip_1_utilization', id: '7' },
    { title: 'Trip 2 Utillization', columnDef: 'trip_2_utilization', id: '8' },
    { title: 'Trip 3 Utillization', columnDef: 'trip_3_utilization', id: '9' },
    { title: 'Average Vehicles Trips per day', columnDef: 'trip', id: '10' },
    { title: 'No of Windows', columnDef: 'no_of_windows', id: '11' },
    { title: 'Average Number of Windows/Trip', columnDef: 'avg_windows_delivered', id: '12' },
    { title: 'Average Window Size (Cases)', columnDef: 'avgcaswindow', id: '13' },
    // {title:'Overall Capacity',columnDef:'transcation_date'},
    { title: 'Total Kilometer', columnDef: 'total_km', id: '14' },
    { title: 'Avg Distance per Unit Vol (Km/Cases)', columnDef: 'avg_distance', id: '15' },
    { title: 'Fuel Efficiency', columnDef: 'fuel', id: '16' },
    { title: 'Diesel Consumption (Ltrs)', columnDef: 'disel', id: '17' },
  ];
  secondRows = [
    { title: 'Measure', columnDef: '21' },
    { title: '', columnDef: '22' },
    { title: 'Cases', columnDef: '23' },
    { title: 'Vehicles', columnDef: '24' },
    { title: 'Trips/Day', columnDef: '25' },
    { title: '%', columnDef: '26' },
    { title: '%', columnDef: '27' },
    { title: '%', columnDef: '28' },
    { title: '%', columnDef: '29' },
    { title: 'Trips/Day', columnDef: '30' },
    { title: 'Windows', columnDef: '31' },
    { title: 'Drops/Trip', columnDef: '32' },
    { title: 'Cases', columnDef: '33' },
    // {title:'Overall Capacity',columnDef:'transcation_date'},
    { title: 'Km', columnDef: '34' },
    { title: 'Km/Cases', columnDef: '35' },
    { title: 'Km/Ltr', columnDef: '36' },
    { title: 'Litres', columnDef: '37' },
  ];
  displayedColumns = [];
  displayedSecondColumns = [];
  dateFilterControl: FormControl;
  selectedColumnFilter: string;

  filterForm: FormGroup;
  constructor(public fb: FormBuilder, private merService: ReportService, public dataEditor: DataEditor) {
    this.displayedColumns = this.columns.map(c => c.id);
    this.displayedSecondColumns = this.secondRows.map(c => c.columnDef);
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
          // console.log(value);
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
            if (e.trip_1_utilization) {
              e.trip_1_utilization = e.trip_1_utilization + '%';
            }
            if (e.trip_2_utilization) {
              e.trip_2_utilization = e.trip_2_utilization + '%';
            }
            if (e.trip_3_utilization) {
              e.trip_3_utilization = e.trip_3_utilization + '%';
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
    const body = this.filterForm.value;
    Object.assign(body, this.requset);
    this.merService.getReportData(body).subscribe((res) => {
      // tslint:disable-next-line:triple-equals
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
    const newData = data.length > 0 ? data : this.data;
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
