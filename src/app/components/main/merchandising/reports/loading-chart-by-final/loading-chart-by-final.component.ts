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
  selector: 'app-loading-chart-by-final',
  templateUrl: './loading-chart-by-final.component.html',
  styleUrls: ['./loading-chart-by-final.component.scss']
})
export class LoadingChartByFinalComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  columns = [
    { columnDef: 'item_code', title: 'Prod Code' },
    { columnDef: 'item_name', title: 'Prod Desc' },
    { columnDef: 'dmd_lower_upc', title: 'Converse' },
    { columnDef: 'p_ref_pack', title: 'P.Ret Packs' },
    { columnDef: 'p_ref_pc', title: 'P.Ret Pieces' },
    { columnDef: 'dmd_packs', title: 'Dmd Packs' },
    { columnDef: 'dmd_pcs', title: 'Dmd Pieces' },
    { columnDef: 'g_ret_pack', title: 'G.Ret Packs' },
    { columnDef: 'g_ret_pcs', title: 'G.Ret Pieces' },
    { columnDef: 'dmg_pcs', title: 'Dmg Pieces' },
    { columnDef: 'exp_pcs', title: 'Expy Pieces' },
    { columnDef: 'N_exp_pc', title: 'On Hold Packs' },
    { columnDef: 'N_sales_packs', title: 'N.Sales Packs' },
    { columnDef: 'N_sales_pc', title: 'N.Sales Pieces' },
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