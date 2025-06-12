import { Component, OnInit, ViewChild } from '@angular/core';
import { MerchandisingService } from '../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CompDataServiceType } from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-visit-summary',
  templateUrl: './visit-summary.component.html',
  styleUrls: ['./visit-summary.component.scss'],
})
export class VisitSummaryComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = [
    'salesman_name',
    'salesman_email',
    'customer_name',
    'address',
    'merchandiser_latitude',
    'merchandiser_longitude',
    'role',
    'created_at',
    'visit_date',
  ];
  selectedColumnFilter: string;

  data = [];
  dateFilterControl: FormControl;
  filterForm: FormGroup;
  constructor(public fb: FormBuilder, private merService: MerchandisingService,
    public dataEditor: DataEditor) {
    this.itemSource = new MatTableDataSource<any>();
  }

  requset;
  ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      email: [''],
      address: [''],
      customer_name: [''],
      salesman_name: [''],
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
    data = filterIn.filter((x) => { return ((x.address.toLowerCase().includes(form.address.toLowerCase())) && (x.salesmanEmail.toLowerCase().includes(form.email.toLowerCase())) && (x.customerName.toLowerCase().includes(form.customer_name.toLowerCase())) && (x.salesmanName.toLowerCase().includes(form.salesman_name.toLowerCase()))) });
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

  onSortData(sort) {
    if (!sort.active || sort.direction === '') {
      // this.updateTableData(this.data)
      return;
    }
    let data = this.itemSource.data.slice().sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'salesman_name': return this.compare(a.salesmanName, b.salesmanName, isAsc);
        case 'salesman_email': return this.compare(a.salesmanEmail, b.salesmanEmail, isAsc);
        case 'customer_name': return this.compare(a.customerName, b.customerName, isAsc);
        case 'address': return this.compare(a.address, b.address, isAsc);
        case 'created_at': return this.compare(a.createdAt, b.createdAt, isAsc);
        case 'visit_date': return this.compare(a.visitDate, b.visitDate, isAsc);
        case 'role': return this.compare(a.role, b.role, isAsc);
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
