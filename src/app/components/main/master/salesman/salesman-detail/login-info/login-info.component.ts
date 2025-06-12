import { Component, OnInit, OnChanges, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MasterService } from '../../../master.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
@Component({
  selector: 'app-login-info',
  templateUrl: './login-info.component.html',
  styleUrls: ['./login-info.component.scss']
})
export class LoginInfoComponent implements OnInit {
  @Input() public loginData;
  @Input() public merchandiser_id;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public dateFilterControl;
  public displayedColumns = ['date', 'version', 'deviceName', 'deviceImei'];
  filterForm: FormGroup;
  constructor(public fb: FormBuilder, private apiService: ApiService) {

    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    let today = new Date();
    let month = '' + (today.getMonth() + 1);
    let date = '' + (today.getDate());
    if ((today.getMonth() + 1) < 10) {
      month = '0' + (today.getMonth() + 1);
    }
    if ((today.getDate()) < 10) {
      date = '0' + (today.getDate());
    }
    let newdate = today.getFullYear() + '-' + month + '-' + date;
    this.dateFilterControl = new FormControl(newdate);
    this.filterForm = this.fb.group({
      merchandiser_id: [this.merchandiser_id],
      date: [''],
      today: [newdate],
      all: false
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.loginData) {
        let currentValue = changes.loginData.currentValue;
        this.loginData = currentValue;
        this.itemSource = new MatTableDataSource<any>(this.loginData);
        this.itemSource.paginator = this.paginator;
      }
    }
  }
  getLoginList(filter, value) {

    if (filter == "date") {
      value = this.dateFilterControl.value;
      this.filterForm.get('all').setValue(false);
    }
    if (value == "") return false;
    this.filterForm.get(filter).setValue(value);
    this.filterForm.get('merchandiser_id').setValue(this.merchandiser_id);
    this.filterData();
  }

  filterData() {
    this.subscriptions.push(
      this.apiService.getSalesmanLoginInfo(this.filterForm.value).subscribe((res) => {
        this.itemSource = new MatTableDataSource<any>(res.data);
        this.itemSource.paginator = this.paginator;
      })
    )
  }

}
