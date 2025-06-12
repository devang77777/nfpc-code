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
  selector: 'app-sales-grv',
  templateUrl: './sales-grv.component.html',
  styleUrls: ['./sales-grv.component.scss']
})
export class SalesGrvComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  columns = [
    { title: 'KSM', columnDef: 'KSM_NAME', show: true },
    { title: 'MONTH', columnDef: 'MONTH', show: false },
    { title: 'Invoiced Qty', columnDef: 'invoice_qty', show: true },
    { title: 'Invoiced Amount', columnDef: 'invoice_amount', show: true },
    { title: 'GRVs Qty', columnDef: 'grv_qty', show: true },
    { title: 'GRVs Amount', columnDef: 'grv_amount', show: true },
    { title: 'Total GRVs (QTY%)', columnDef: 'grv_per', show: true },
    { title: 'Total GRVs (AED%)', columnDef: 'grv_amount_per', show: true },
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
          console.log();
          if (value.request.report_type == '2') {
            this.columns.forEach(e => {
              if (e.title == 'KSM') {
                e.show = false;
              }
              if (e.title == 'MONTH') {
                e.show = true;
              }
            });
          } else if (value.request.report_type == '1') {
            this.columns.forEach(e => {
              if (e.title == 'KSM') {
                e.show = true;
              }
              if (e.title == 'MONTH') {
                e.show = false;
              }
            });
          }
          this.data = value.data;
          this.data.forEach(e => {
            if (e.grv_per) {
              e.grv_per = e.grv_per + '%';
            }
            if (e.grv_amount_per) {
              e.grv_amount_per = e.grv_amount_per + '%';
            }
          });
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
