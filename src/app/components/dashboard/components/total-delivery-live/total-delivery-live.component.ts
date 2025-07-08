import { AfterViewInit, Component, Inject, NgZone, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import moonrisekingdom from '@amcharts/amcharts4/themes/animated';
// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { CalendarView } from 'angular-calendar';
import { ApiService } from 'src/app/services/api.service';
import { DashboardService } from '../../dashboard.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
// import { FormControl } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
@Component({
  selector: 'app-total-delivery-live',
  templateUrl: './total-delivery-live.component.html',
  styleUrls: ['./total-delivery-live.component.scss']
})
export class TotalDeliveryLive implements OnInit, AfterViewInit {
  private chart: am4charts.XYChart;
  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  activeDayIsOpen: boolean = true;
  dashboardData;
  sideFiltersForm;
  trendData = [];
  comparisonData = [];
  contributionData = [];
  trendChart: any;
  comparisonChart: any;
  contriutionChart: any;
  selectedData: any;
  dataSource2: any;
  selected = 'coverage';
  selectedChart = "";
  openDetailType = "";

  detailsTable: any[]
  filterForm;
  filtersList = [
    "NSM",
    "ASM",
    "Channel",
    "Region",
    "Supervisor",
    "Regional Manager",
    "Area Manager",
    "Merchandiser",
    'Salesman'
  ];
  allChannelList: any = [];
  channelList = [];
  nsmList = [];
  asmList = [];
  regionList = [];
  merchandiserList = [];
  supervisorList = [];
  salesmanList = [];
  private subscriptions: Subscription[] = [];
  dialogRef: any;
  isOpened = false;
  zoneList = [];

  @ViewChild('formDrawer') fromDrawer: MatDrawer;

  series: am4charts.Series[];
  axisX: am4charts.Axis;
  axisY: am4charts.Axis;
  single: any[];
  multi: any[];


  monthName: string;
  year: number;
  dashboard1Data: any;
  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'Population';

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  constructor(
    private service: DashboardService,
    private apiService: ApiService,
    private zone: NgZone,
    private fds: FormDrawerService,
    public fb: FormBuilder,
    public _matDialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId
  ) {
    // Object.assign(this, { this.single })
  }
  itemSource = new MatTableDataSource();
  // private subscriptions: Subscription[] = [];
  public displayedColumns = ['driver_code', 'driver_name', 'branch_plant', 'total_order', 'delivered_order', 'cancel_order', 'pending_order'];
  dateFilterControl: FormControl;
  selectedColumnFilter: string;


data:any
warehouseList:any = []

onColumnFilterOpen(item) {
  this.selectedColumnFilter = item
}
onColumnFilter(item) {

}
warehouses:any = []
salesmen:any = []
settings2 = {
  enableSearchFilter: true,
  singleSelection: true,
  classes: 'myclass custom-class',
  disabled: false,
  badgeShowLimit: 2,
  isSingle:false,
  maxHeight: 141,
  autoPosition: false,
  position: 'bottom',
}
  public ngOnInit(): void {
    this.getChannelList();
    this.filterForm = this.fb.group({
      startdate: [''],
      enddate: [''],
      type: ['Salesman'],
      channel: [[]],
      nsm: [[]],
      asm: [[]],
      region: [[]],
      supervisor: [[]],
      regionalManager: [[]],
      areaManager: [[]],
      salesman: [[]],
      zone_id: [[]],
      channel_code:[[]],
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
      this.service.getMasterList().subscribe((res) => {
        this.nsmList = res.masterData.data.nsm;
        this.asmList = res.masterData.data.asm;
        this.filtersList = res.masterData.data.role;
        this.channelList = res.masterData.data.channel;
        this.regionList = res.masterData.data.region;
        this.supervisorList = res.masterData.data.salesman_supervisor;
        this.salesmanList = res.masterData.data.salesmans;
        this.merchandiserList = res.masterData.data.merchandiser.map(item => {
          if (item.user !== null) {
            item['user']['lastname'] = [item.user?.lastname, item.salesman_code].join(" - ")
            return item;
          }
          return item;
        });
      })
    )
    this.apiService.getWarehouse(1).subscribe(x => {
      this.warehouseList = x.data;
      this.warehouseList.forEach(element => {
        element.name = element.code + '-' + element.name;
      })
      })

    this.apiService.getAllZoneList().subscribe(zone => {
      this.zoneList = zone.data;
    });

    this.apiService.getSalesMan().subscribe((result) => {
      let data:any = []
      result.data.map(((dta:any)=>{
           data.push({
            itemName:`${dta?.salesman_code}-${dta?.user?.firstname}`,
            id:dta?.user?.id,
            code:dta?.salesman_code
           })
      }))
      this.salesmen = data;
    })

  }



  changeFilterType(type) {
  }
  // saveData()
  // {
  //    console.log(this.filterForm.value)
  // }
  ngAfterViewInit() {

    // this.initChart1();
    // this.initChart2();
    // this.initChart3();
    // this.initChart4();
  }
  chartData:any = []

//  showDelivery() {
//     let value = this.sideFiltersForm.value;
//     let body = {
//       warehouse_code: value.warehouse_code?.length > 0 ? value?.warehouse_code[0]?.id : 0,
//       // channel_id: [[value.channel_code?.length > 0 ? value?.channel_code[0]?.id:0]],
//       channel_id: value.channel_code.length > 0 ? value.channel_code.map(i => i.id) : [],
//       uom_code: value.uom_code,
//       item_code: value.item_code?.length > 0 ? value?.item_code[0]?.id : 0,
//       page: value.page,
//       page_size: value.page_size
//       // customer_name: this.customerFormControl.value?.name,
//       // customer_code: this.customerFormControl.value?.customer_code
//     };
//     this.apiService.getPricingByItem(body).subscribe(res => {
//       // this.apiResponse = res;
//       // this.dataSource = new MatTableDataSource<any>(res.data);
//       // this.dataSource.paginator = this.paginator;
//     });
//   }

  applyFilter() { }
  applyFilterOnClick() {
    let form = this.filterForm.value;
    console.log(form,"jkl")
    console.log(form)
    let codes = []
    form?.region.map(i => {

       codes.push(i.itemName.split(" ")[0])
    })
    let filterObj = {
      start_date: form.startdate,
      end_date: form.enddate,
      branch_plant_code:codes,
      salesman_id:form?.salesman.map((ids:any)=>ids.id),
      channel_id: form.channel_code.length > 0 ? form.channel_code.map(i => i.id) : [],
    };
    // let salesman = [];

    this.getData(filterObj);

  }
  getData(filterObj) {
   console.log(filterObj)
   this.apiService.getLiveTracking(filterObj).subscribe((value:any)=>{
    //  console.log(data,"filter")
    //  this.chartData = data

    this.data = value.data.table_date;
    this.itemSource = new MatTableDataSource<any>(this.data);
    // this.itemSource.paginator = this.paginator;




   })
  }

   getChannelList(){
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.allChannelList = res.data;
    });
  }
}
