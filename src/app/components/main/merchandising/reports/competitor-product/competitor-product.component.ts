import { DataEditor } from 'src/app/services/data-editor.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MerchandisingService } from '../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CompDataServiceType } from 'src/app/services/constants';
@Component({
  selector: 'app-competitor-product',
  templateUrl: './competitor-product.component.html',
  styleUrls: ['./competitor-product.component.scss']
})
export class CompetitorProductComponent implements OnInit {
  selectedColumnFilter: string;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['created_at', 'salesman', 'company', 'brand', 'item', 'price'];
  dateFilterControl: FormControl;
  data = [];
  public filterForm: FormGroup;
  constructor(public fb: FormBuilder, private merService: MerchandisingService,
    public dataEditor: DataEditor) {
    this.itemSource = new MatTableDataSource<any>();
  }

  requset;
  ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      salesman_name: [''],
      company: [''],
      brand: [''],
      item: [''],
    });
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.REPORT_DATA) {
          //console.log(value);
          this.data = value.data;
          this.requset = value.request;
          this.updateTableData(value.data);
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
    }else {
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

}
