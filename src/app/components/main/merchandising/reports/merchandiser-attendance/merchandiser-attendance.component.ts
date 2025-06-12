import { DataEditor } from 'src/app/services/data-editor.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MerchandisingService } from '../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CompDataServiceType } from 'src/app/services/constants';
import { MatSort } from '@angular/material/sort';
@Component({
  selector: 'app-merchandiser-attendance',
  templateUrl: './merchandiser-attendance.component.html',
  styleUrls: ['./merchandiser-attendance.component.scss']
})
export class MerchandiserAttendanceComponent implements OnInit {

  selectedColumnFilter: string;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['date', 'merchandiser_code', 'merchandiser_name', 'jp', 'checkin', 'checkout'];
  dateFilterControl: FormControl;
  filterForm: FormGroup;
  constructor(
    private merService: MerchandisingService,
    public dataEditor: DataEditor,
    public fb: FormBuilder,

  ) {
    this.itemSource = new MatTableDataSource<any>();
  }
  requset: any;
  data = [];

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      salesman_name: [''],
      salesman_code: [''],
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
      this.filterForm.get(this.selectedColumnFilter).setValue("");
    } else {
      this.filterForm.patchValue({
        page: 1,
        page_size: 10
      });
    }
    this.filterData();
  }
  filterData() {
    let form = this.filterForm.value;
    let filterIn = this.data;
    let data = [];
    data = filterIn.filter((x) => { return ((x.date.includes(form.date)) && (x.merchandiser_code.toLowerCase().includes(form.salesman_code.toLowerCase())) && (x.merchandiser_name.toLowerCase().includes(form.salesman_name.toLowerCase()))) });
    this.updateTableData(data);
    // debugger
    // Object.assign(body, this.requset);
    // this.merService.getReportData(body).subscribe((res) => {
    //   if (res?.status == true) {
    //     this.dataEditor.sendData({
    //       type: CompDataServiceType.REPORT_DATA,
    //       request: this.requset,
    //       data: res.data,
    //     });
    //   }
    // });
  }

  updateTableData(data = []) {
    let newData = data ? data : this.data;
    this.itemSource = new MatTableDataSource<any>(newData);
    this.itemSource.paginator = this.paginator;

  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  onSortData(sort) {
    if (!sort.active || sort.direction === '') {
      // this.updateTableData(this.data)
      return;
    }
    let data = this.itemSource.data.slice().sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'date': return this.compare(a.date, b.date, isAsc);
        case 'merchandiser_code': return this.compare(a.merchandiser_code, b.merchandiser_code, isAsc);
        case 'merchandiser_name': return this.compare(a.merchandiser_name, b.merchandiser_name, isAsc);
        case 'jp': return this.compare(a.jp, b.jp, isAsc);
        case 'checkin': return this.compare(a.checkin, b.checkin, isAsc);
        case 'checkout': return this.compare(a.checkout, b.checkout, isAsc);
        default: return 0;
      }
    });
    this.updateTableData(data);
    //console.log(sort);
  }
  private compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}
