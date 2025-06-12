import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DriverReplacementService } from '../driver-replacement.service';
import { forkJoin } from 'rxjs'
@Component({
  selector: 'app-driver-replacement-base',
  templateUrl: './driver-replacement-base.component.html',
  styleUrls: ['./driver-replacement-base.component.scss']
})
export class DriverReplacementBaseComponent implements OnInit {
  @ViewChild('formDrawer') formDrawer: MatDrawer;

  public isDetailVisible: boolean;
  public replaceList: any[];
  public salesmanList: any[];
  public vehiclesList: any[];
  public reasonsList: any[];
  public newBankData = {};
  page = 1;
  page_size = PAGE_SIZE_10;
  constructor(
    private fds: FormDrawerService,
    public cts: CommonToasterService,
    private service: DriverReplacementService,
    private apiService: ApiService
  ) {
  }

  ngOnInit(): void {
    this.getReplace();
  }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.formDrawer);
  }
  getReplace() {
    this.service.getReplace(this.page, this.page_size).subscribe((result: any) => {
      this.replaceList = result.data;
    });

    this.service.salesmanList().subscribe((result: any) => {
      this.salesmanList = result.data.map(item => {
        if (item.user !== null) {
          item['user']['lastname'] = [item.user?.lastname, item.salesman_code].join(" - ")
          return item;
        }
        return item;
      });

    });
    forkJoin([this.apiService.getAllVans(), this.apiService.getReturnAllReasonsType()])
      .subscribe((response) => {
        this.vehiclesList = response[0].data;
        this.reasonsList = response[1].data;

      });

  }
  addReplace() {
    this.fds.setFormName('add-driver-replacement');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public updateTableData({ data }) {
    let new_salesman: any;
    let old_salesman: any;
    let new_van: any;
    let old_van: any;
    this.service.getReplace(this.page, this.page_size).subscribe((result: any) => {
      this.replaceList = result.data;
    });
    // if (data.old_salesman_id) {
    //   new_salesman = this.salesmanList.find(x => x.user_id == data.new_salesman_id);
    //   old_salesman = this.salesmanList.find(x => x.user_id == data.old_salesman_id);
    //   this.replaceList = [...this.replaceList, { ...data, new_salesman: new_salesman.user, old_salesman: old_salesman.user }];
    // }
    // if (data.old_van_id) {
    //   new_van = this.vehiclesList.find(x => x.id == data.new_van_id);
    //   old_van = this.vehiclesList.find(x => x.id == data.old_van_id);
    //   this.replaceList = [...this.replaceList, { ...data, new_van: { id: new_van.id, plate_number: new_van.plate_number, van_code: new_van.van_code }, old_van: { id: old_van.id, plate_number: old_van.plate_number, van_code: old_van.van_code } }];
  }


}
