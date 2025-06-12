// import { Component, OnInit } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MerchandisingService } from '../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';


@Component({
  selector: 'app-delivery-report',
  templateUrl: './delivery-report.component.html',
  styleUrls: ['./delivery-report.component.scss']
})
export class DeliveryReport implements OnInit  {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['date', 'delivery_number', 'order_number', 'customer_code', 'customer_name', 'order_date', 'delivery_date', 'total_qty', 'status'];
  dateFilterControl: FormControl;
  selectedColumnFilter: string;

  constructor(private merService: MerchandisingService, public dataEditor: DataEditor) {
    this.itemSource = new MatTableDataSource<any>();
  }
data:any
requset:any


  // data = [
  //   { created_at: '2020-09-25T14:47:07.000000Z', 'product_code': '', 'product_desc': '', 'product_price': '', 'product_qty': '' },
  //   { created_at: '2020-09-25T14:47:07.000000Z', 'product_code': '', 'product_desc': '', 'product_price': '', 'product_qty': '' },
  //   { created_at: '2020-09-25T14:47:07.000000Z', 'product_code': '', 'product_desc': '', 'product_price': '', 'product_qty': '' },
  //   { created_at: '2020-09-25T14:47:07.000000Z', 'product_code': '', 'product_desc': '', 'product_price': '', 'product_qty': '' },
  //   { created_at: '2020-09-25T14:47:07.000000Z', 'product_code': '', 'product_desc': '', 'product_price': '', 'product_qty': '' },
  // ]
  // displayedColumns:any = []

  ngOnInit(): void {
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        console.log(value,"delivery")
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
          this.itemSource = new MatTableDataSource<any>(this.data);
          this.itemSource.paginator = this.paginator;
          this.requset = value.request;
          // this.updateTableData(this.data);
        }
      })
    );

  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }
}
