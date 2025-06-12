import { Component, OnInit, ViewChild } from '@angular/core';
import { MerchandisingService } from '../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSort } from '@angular/material/sort';
@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class TimesheetsComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['visitDate', 'driver_code', 'driver_name', 'day_start_time', 'day_end_time', 'total_time', 'trip_start_time', 'trip_end_time'];
  expandedElement: any | null;
  selectedColumnFilter: string;

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
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    }
    this.filterData();
  }
  filterData() {
    let form = this.filterForm.value;
    let filterIn = this.data;
    let data = [];
    data = filterIn.filter((x) => { return ((x.tripStartDate.includes(form.date)) && (x.merchandiserCode.toLowerCase().includes(form.salesman_code.toLowerCase())) && (x.merchandiserName.toLowerCase().includes(form.salesman_name.toLowerCase()))) });
    this.updateTableData(data);
    // let body = this.filterForm.value;
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
    let newData = data.length > 0 ? data : this.data;
    this.itemSource = new MatTableDataSource<any>(newData);
    this.itemSource.paginator = this.paginator;
  }

  expandList(data) {
    this.expandedElement = this.expandedElement === data ? null : data;
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
        case 'visitDate': return this.compare(a.tripStartDate, b.tripStartDate, isAsc);
        case 'merchandiser_code': return this.compare(a.merchandiserCode, b.merchandiserCode, isAsc);
        case 'merchandiser_name': return this.compare(a.merchandiserName, b.merchandiserName, isAsc);
        default: return 0;
      }
    });
    this.updateTableData(data);
    //console.log(sort);
  }
  private compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

}
