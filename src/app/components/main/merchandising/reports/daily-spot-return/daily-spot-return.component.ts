import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CompDataServiceType } from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { ReportService } from '../report.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-daily-spot-return',
  templateUrl: './daily-spot-return.component.html',
  styleUrls: ['./daily-spot-return.component.scss']
})
export class DailySpotReturnComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  columns = [
    { title: 'KSM', columnDef: 'ksmname' },
    { title: 'Reason', columnDef: 'reason' },
    { title: 'Qty', columnDef: 'qty' },
    { title: 'Amount', columnDef: 'amount' }
  ]
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

          this.requset = value.request;
          this.updateTableData(this.data);
        }
      })
    );
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
        page_size: 10
      });
    }
    this.filterData();
  }
  filterData() {
    let body = this.filterForm.value;
    Object.assign(body, this.requset);
    this.merService.spotReturnReportsData(body).subscribe((res) => {
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
    // let a = [
    //   {
    //     amount: "52.40",
    //     id: 2,
    //     kmsid: 1608,
    //     ksmname: "Sundar",
    //     qty: 10,
    //     rdate: "2022-09-07",
    //     reason: "Expiry Return"
    //   },
    //   {
    //     amount: "42.21",
    //     id: 8,
    //     kmsid: 64199,
    //     ksmname: "64199",
    //     qty: 10,
    //     rdate: "2022-10-10",
    //     reason: "Expiry Return"
    //   },
    //   {
    //     amount: "42.21",
    //     id: 5,
    //     kmsid: 64200,
    //     ksmname: "64200",
    //     qty: 10,
    //     rdate: "2022-10-09",
    //     reason: "Expiry Return"
    //   },
    //   {
    //     amount: "42.21",
    //     id: 3,
    //     kmsid: 65523,
    //     ksmname: "65523",
    //     qty: 10,
    //     rdate: "2022-10-09",
    //     reason: "Expiry Return"
    //   }
    // ];
    // a.push({
    //   amount: "50",
    //   id: 3,
    //   kmsid: 65523,
    //   ksmname: "65523",
    //   qty: 10,
    //   rdate: "2022-10-09",
    //   reason: "Expiry"
    // })
    // a.push({
    //   amount: "50",
    //   id: 3,
    //   kmsid: 65523,
    //   ksmname: "65523",
    //   qty: 10,
    //   rdate: "2022-10-09",
    //   reason: "Expiry"
    // })
    // a.push({
    //   amount: "50",
    //   id: 3,
    //   kmsid: 65523,
    //   ksmname: "65523",
    //   qty: 10,
    //   rdate: "2022-10-09",
    //   reason: "Expiry Return"
    // })
    // a.push({
    //   amount: "42.21",
    //   id: 5,
    //   kmsid: 64200,
    //   ksmname: "64200",
    //   qty: 10,
    //   rdate: "2022-10-09",
    //   reason: "Expiry Return"
    // });
    let result = this.groupBy(newData, (item) => {
      return [item.kmsid, item.reason];
    });
    let grv = result;
    let grvData = [];
    Object.keys(grv).forEach(i => {
      if (grv[i].length > 1) {
        let amount = 0;
        let qty: any = 0;
        for (let index = 0; index < grv[i].length; index++) {
          const element = grv[i][index];
          amount = +amount + Number(element.amount);
          qty = qty + Number(element.qty);
        }
        grv[i][0].amount = amount;
        grv[i][0].qty = qty;
      }
      grvData.push(grv[i][0])
    });
    this.itemSource = new MatTableDataSource<any>(grvData);
    this.itemSource.paginator = this.paginator;
  }
  groupBy(array, f) {
    var groups = {};
    array.forEach(function (o) {
      var group = JSON.stringify(f(o));
      groups[group] = groups[group] || [];
      groups[group].push(o);
    });
    return Object.keys(groups).map(function (group) {
      return groups[group];
    })
  }


  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }
}
