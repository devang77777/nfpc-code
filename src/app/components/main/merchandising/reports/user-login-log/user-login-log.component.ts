import { ApiService } from 'src/app/services/api.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MerchandisingService } from '../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { MatSort } from '@angular/material/sort';
@Component({
  selector: 'app-user-login-log',
  templateUrl: './user-login-log.component.html',
  styleUrls: ['./user-login-log.component.scss']
})
export class UserLoginLogComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['date', 'name', 'ipaddress', 'browser'];
  dateFilterControl: FormControl;
  data = [];
  requset;
  constructor(public fb: FormBuilder, private merService: MerchandisingService, public apiService: ApiService,
    public dataEditor: DataEditor) {
    this.itemSource = new MatTableDataSource<any>();
  }
  selectedColumnFilter: string;
  filterForm: FormGroup;
  ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      user_name: ['']
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
    data = filterIn.filter((x) => { return ((x.date.includes(form.date)) && (x.merchandiserCode.toLowerCase().includes(form.salesman_code.toLowerCase())) && (x.merchandiserName.toLowerCase().includes(form.salesman_name.toLowerCase()))) });
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
    let newData = data.length > 0 ? data : this.data;
    this.itemSource = new MatTableDataSource<any>(newData);
    this.itemSource.paginator = this.paginator;
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
        case 'name': return this.compare(a.user_name, b.user_name, isAsc);
        case 'ipaddress': return this.compare(a.ip, b.ip, isAsc);
        case 'browser': return this.compare(a.browser, b.browser, isAsc);
        default: return 0;
      }
    });
    this.updateTableData(data);
    //console.log(sort);
  }
  private compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
