import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../dashboard.service';
import { FormBuilder } from '@angular/forms';
import * as moment from 'moment'
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-merchanidising-dashboard3',
  templateUrl: './merchanidising-dashboard3.component.html',
  styleUrls: ['./merchanidising-dashboard3.component.scss']
})
export class MerchanidisingDashboard3Component implements OnInit {
  public customers: any[] = [];
  private subscriptions: Subscription[] = [];
  filterForm;
  merchandiserList = [];
  brandList = [];
  categoryList = [];
  itemList = [];
  supervisorList = [];
  dashboardData: any;
  channelList = [];
  nsmList = [];
  asmList = [];
  regionList = [];
  filtersList = [
    "NSM",
    "ASM",
    "Channel",
    "Region",
    "Supervisor",
    "Regional Manager",
    "Area Manager",
    "Merchandiser"
  ];

  constructor(public apiService: ApiService, private toaster: CommonToasterService, public fb: FormBuilder, private service: DashboardService,) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.customers = result.data.customers;
      })
    );
    this.filterForm = this.fb.group({
      startdate: [''],
      enddate: [''],
      type: ['Merchandiser'],
      channel: [[]],
      nsm: [[]],
      asm: [[]],
      region: [[]],
      supervisor: [[]],
      regionalManager: [[]],
      areaManager: [[]],
      salesman: [[]]
    });
    let body = {
      "channel_ids": [],
      "nsm": [],
      "asm": [],
      "supervisor": [],
      "regional_manager": [],
      "area_manager": [],
      "region_ids": [],
      "salesman_ids": [],
      "start_date": "",
      "end_date": ""
    };
    this.subscriptions.push(
      this.service.getDashboard3FiltersData(body).subscribe((res) => {
        // this.dashboardData = res.dashboardData.data;
        this.nsmList = res.masterData.data.nsm;
        this.asmList = res.masterData.data.asm;
        this.filtersList = res.masterData.data.role;
        this.channelList = res.masterData.data.channel;
        this.regionList = res.masterData.data.region;
        this.supervisorList = res.masterData.data.salesman_supervisor;
        this.merchandiserList = res.masterData.data.merchandiser.map(item => {
          if (item.user !== null) {
            item['user']['lastname'] = [item.user?.lastname, item.salesman_code].join(" - ")
            return item;
          }
          return item;
        });
        // this.mapData();
      })
    )
  }
  mapData() {
    let array = [];
    Object.keys(this.dashboardData).forEach(key => {
      Array.from(this.dashboardData[key]).forEach((item: any) => {
        const index = array.findIndex(x => x.customer_code === item.customer_code);
        if (index > -1) {
          array[index] = { ...array[index], ...item };
        } else {
          array.push({ ...item })
        }
      })
    })
    this.dashboardData = array;
  }
  getValue() {
    return Math.floor(Math.random() * 90 + 1);
  }

  getValueOne() {
    return Math.floor(Math.random() * 9 + 1);
  }
  applyFilter() {
    let form = this.filterForm.value;
    if (form.startdate || form.enddate) {
      const from = moment(form.startdate);
      const end = moment(form.enddate);
      const now = moment(new Date);
      const diff1 = end.diff(from, 'days');
      const diff2 = now.diff(from, 'days');
      if (form.startdate && form.enddate && diff1 > 30) {
        this.toaster.showWarning('Warning', `We do not support more than 1 month data at the moment.`);
        return;
      } else if (form.startdate && !form.enddate && diff2 > 30) {
        this.toaster.showWarning('Warning', `Please select the end date.`);
        return;
      }
    }
    if (form.salesman && form.salesman.length > 10) {
      this.toaster.showWarning('Warning', `Maximum 10 salesman are allowed to select.`);
      return;
    }
    let filterObj = {
      start_date: form.startdate,
      end_date: form.enddate
    };
    switch (form.type) {
      case 'Channel':
        let channel = [];
        form.channel.forEach(element => {
          channel.push(element.id);
        });
        filterObj['channel_ids'] = channel;
        break;
      case 'NSM':
        let nsm = [];
        form.nsm.forEach(element => {
          nsm.push(element.id);
        });
        filterObj['nsm'] = nsm;
        break;
      case 'ASM':
        let asm = [];
        form.asm.forEach(element => {
          asm.push(element.id);
        });
        filterObj['asm'] = asm;
        break;
      case 'Region':
        let region = [];
        form.region.forEach(element => {
          region.push(element.id);
        });
        filterObj['region_ids'] = region;
        break;
      case 'Merchandiser':
        let salesman = [];
        form.salesman.forEach(element => {
          salesman.push(element.id);
        });
        filterObj['salesman_ids'] = salesman;
        break;
      case 'Supervisor':
        let supervisor = [];
        form.supervisor.forEach(element => {
          supervisor.push(element.id);
        });
        filterObj['supervisor'] = supervisor;
        break;
      default:
        break;
    }
    this.getData(filterObj);

  }
  getData(filterObj) {
    this.service.getDashboard3DataByFilter(filterObj).subscribe((res) => {
      this.dashboardData = res.data;
      this.mapData();
    })
  }
}
