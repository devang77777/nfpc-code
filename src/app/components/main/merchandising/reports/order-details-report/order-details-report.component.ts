import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CompDataServiceType } from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { ReportService } from '../report.service';
@Component({
  selector: 'app-order-details-report',
  templateUrl: './order-details-report.component.html',
  styleUrls: ['./order-details-report.component.scss']
})
export class OrderDetailsReportComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public columns: any[] = [
    { field: 'Order No', value: 'order_number' },
    { field: 'Order Co', value: 'order_code' },
    { field: 'Line No', value: 'line_number' },
    { field: 'Sold To', value: 'sold_to' },
    { field: 'Sold To Name', value: 'sold_to_name' },
    { field: 'Item Code', value: '2nd_item_number' },
    { field: 'Description 1', value: 'description1' },
    { field: 'Qty', value: 'quantity' },
    { field: 'UOM', value: 'uom' },
    { field: 'Revision No', value: 'revision_number' },
    { field: 'Revision Reason', value: 'revision_reason' },
    { field: 'Secondary Qty', value: 'secondary_quantity' },
    { field: 'Secondary UOM', value: 'secondary_uom' },
    { field: 'Requested Date', value: 'requested_date' },
    { field: 'Customer PO', value: 'customer_po' },
    { field: 'Ship To', value: 'ship_to' },
    { field: 'Ship To Description', value: 'ship_to_description' },
    { field: 'Original Order Type', value: 'original_order_type ' },
    { field: 'Original Line No', value: 'original_line_number' },
    { field: '3rd Item No', value: '3rd_item_number' },
    { field: 'Parent No', value: 'parent_number' },
    { field: 'Pick No ', value: 'pick_number' },
    { field: 'Unit Price', value: 'unit_price' },
    { field: 'Extended Amount', value: 'extended_amount' },
    { field: 'Pricing UOM', value: 'pricing_uom' },
    { field: 'Order Date', value: 'order_date' },
    { field: 'Document No', value: 'document_number' },
    { field: 'Doument Type', value: 'doument_type' },
    { field: 'Document Company', value: 'document_company' },
    { field: 'Scheduled Pick Date', value: 'scheduled_pick_date' },
    { field: 'Actual Ship Date', value: 'actual_ship_date' },
    { field: 'Invoice Date', value: 'invoice_date' },
    { field: 'Cancel Date', value: 'cancel_date' },
    { field: 'G/L Date', value: 'gl_date' },
    { field: 'Promised Delivery Date', value: 'promised_delivery_date' },
    { field: 'Business Unit', value: 'business_unit' },
    { field: 'Qty Ordered', value: 'quantity_ordered' },
    { field: 'Qty Shipped', value: 'quantity_shipped' },
    { field: 'Qty Backordered', value: 'quantity_backordered' },
    { field: 'Qty Canceled', value: 'quantity_canceled' },
    { field: 'Qty Invoice', value: 'quantity_invoice' },
    { field: 'Qty Invoice VS Shipped', value: 'quantity_invoice_vs_shipped' },
    { field: 'Price Effective Date', value: 'price_effective_date' },
    { field: 'Unit Cost', value: 'unit_cost' },
    { field: 'Reason Code', value: 'reason_code' },
    { field: 'Total Cancel AED', value: 'total_cancel_aed' },
  ];
  displayedColumns: string[] = [];
  dateFilterControl: FormControl;
  selectedColumnFilter: string;

  filterForm: FormGroup;
  constructor(public fb: FormBuilder, private merService: ReportService, public dataEditor: DataEditor) {
    this.itemSource = new MatTableDataSource<any>();
  }

  data = [];
  requset;
  ngOnInit(): void {
    this.setDisplayedColumns();
    this.filterForm = this.fb.group({
      Item: [''],
    });
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.REPORT_DATA) {

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
  setDisplayedColumns() {
    this.columns.forEach((column, index) => {
      column.index = index;
      this.displayedColumns[index] = column.field;
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
