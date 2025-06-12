
import { AfterViewInit, Component, ElementRef, Inject, NgZone, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { CalendarView } from 'angular-calendar';
import { ApiService } from 'src/app/services/api.service';
import { DashboardService } from '../../dashboard.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { parse } from 'path';
import { MatTableDataSource } from '@angular/material/table';
import { ThemePalette } from '@angular/material/core';
import { Chart } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';
import moonrisekingdom from '@amcharts/amcharts4/themes/animated';
// amCharts imports
import * as am4plugins_wordCloud from "@amcharts/amcharts4/plugins/wordCloud";
import am4themes_dataviz from "@amcharts/amcharts4/themes/dataviz";
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

@Component({
  selector: 'app-logistic1',
  templateUrl: './logistic1.component.html',
  styleUrls: ['./logistic1.component.scss']
})
export class Logistic1Component implements OnInit, AfterViewInit {
  @ViewChild('salesChart') salesChart!: ElementRef;
  @ViewChild('salesChart2') salesChart2!: ElementRef;
  salesman:any
  chart: any;
  chartSecond: any;
  filterForm: FormGroup | any;
  filtersList = [
    "NSM",
    "ASM",
    "Channel",
    "Region",
    "Supervisor",
    "Regional Manager",
    "Area Manager",
    "Merchandiser",
    "Salesman",
  ];
  channelList = [];
  nsmList = [];
  asmList = [];
  regionList = [];
  routeList: any = [];
  merchandiserList = [];
  supervisorList = [];
  warehouseList = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private service: DashboardService,
    private apiService: ApiService,
    private zone: NgZone,
    private fds: FormDrawerService,
    public fb: FormBuilder,
    public _matDialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: any
  ) { }
  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }
  public ngOnInit(): void {

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
      salesman_id: [[]],
      zone_id: [[]]
    });
    this.subscriptions.push(
      this.service.getMasterList().subscribe((res) => {
        this.nsmList = res.masterData.data.nsm;
        this.asmList = res.masterData.data.asm;
        this.filtersList = res.masterData.data.role;
        this.channelList = res.masterData.data.channel;
        this.regionList = res.masterData.data.region;
        this.routeList = res.masterData.data.route;
        this.supervisorList = res.masterData.data.salesman_supervisor;
        this.merchandiserList = res.masterData.data.merchandiser.map((item: { [x: string]: { [x: string]: string; }; user: { lastname: any; }; salesman_code: any; }) => {
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
    this.apiService.getSalesMan().subscribe((result) => {
      let data:any = []
      result.data.map(((dta:any)=>{
           data.push({
            itemName:`${dta?.salesman_code}-${dta?.user?.firstname}`,
            id:dta?.user?.id,
            code:dta?.salesman_code
           })
      }))
      this.salesman = data;
    })
  }
  table:boolean=false;
  tableData:any;
  chart2:any;
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
  applyFilterOnClick() {
    this.table=false;
    let form = this.filterForm.value;
    let codes = []
    console.log(form,"kl")
    form?.region.map(i => {

       codes.push(i.itemName.split(" ")[0])
    })
    let filterObj: any =
    {
      start_date: form.startdate,
      end_date: form.enddate,
      branch_plant_code:codes,
      salesman_id:form?.salesman_id.map((ids:any)=>ids.id)
    }
    console.log(filterObj,"kl")
    this.apiService.newDashboardLogistic(filterObj).subscribe((res:any)=>{
      console.log('logistic',res);
      this.table=true;
      this.tableData=res.data.table_date;
      this.chart2= res.data.pai_chart
      this. initializeChart();
      this. initializeChart2();
    })




  }

  initializeChart(): void {

    const ctx = this.salesChart.nativeElement.getContext('2d');

    const salesmanLabels = this.tableData.map((data: {  driver_name:any;driver_code: any; region_code: any; }) => ` ${data.driver_code} - ${data.driver_name}`);
    const salesmanCode = this.tableData.map((data: { driver_code: any; }) => data.driver_code);
    const salesmanname = this.tableData.map((data: { driver_name: any; }) => data.driver_name);
    const combinedQtyData = this.tableData.map((data: { delivered_order: string; cancel_order: string; pending_order: string; }) => parseFloat(data.delivered_order) + parseFloat(data.cancel_order) + parseFloat(data.pending_order));

    const deliveredQtyData = this.tableData.map((data: { delivered_order: string; }) => parseFloat(data.delivered_order));
    const cancelQtyData = this.tableData.map((data: { cancel_order: string; }) => parseFloat(data.cancel_order));
    const pendingQtyData = this.tableData.map((data: { pending_order: string; }) => parseFloat(data.pending_order));

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: salesmanLabels,
        datasets: [
          {
            label: 'Delivered',
            data: deliveredQtyData,
            backgroundColor:'#008000',
            borderColor: '#008000',
            minBarLength:0,
            stack: 'Stack 0',
            barThickness: 40,
          },
          {
            label: 'Cancel',
            data: cancelQtyData,
            backgroundColor: '	#ff0000',
            borderColor: '	#ff0000',
            stack: 'Stack 0',
            barThickness: 40,
          },
          {
            label: 'Pending',
            data: pendingQtyData,
            backgroundColor:'	#ED7D31',
            borderColor: '	#ED7D31',
            stack: 'Stack 0',
            barThickness: 40,
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Region Level Volume Loaded Vs Delivered'
          },
        },   responsive: true,

        scales: {
          x: {
            stacked: true,

          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }


//   initializeChart2(): void {
//     const ctx = this.salesChart2.nativeElement.getContext('2d');

// console.log(this.chart2.ALN.volume_loaded_qty);

// const ALN =[this.chart2.ALN?this.chart2.ALN.volume_loaded_qty:0 ,this.chart2.ALN?this.chart2.ALN.delivered_qty:0,this.chart2.ALN?this.chart2.ALN.cancel_qty:0,this.chart2.ALN?this.chart2.ALN.pending_qty:0];
// const AUH = [this.chart2.AUH?this.chart2.AUH.volume_loaded_qty:0 ,this.chart2.AUH?this.chart2.AUH.delivered_qty:0,this.chart2.AUH?this.chart2.AUH.cancel_qty:0,this.chart2.AUH?this.chart2.AUH.pending_qty:0];
// const SHJ = [this.chart2.SHJ ?this.chart2.SHJ.volume_loaded_qty:0,this.chart2.SHJ?this.chart2.SHJ.delivered_qty:0,this.chart2.SHJ?this.chart2.SHJ.cancel_qty:0,this.chart2.SHJ?this.chart2.SHJ.pending_qty:0];
// console.log(ALN,AUH,SHJ);

//     this.chartSecond = new Chart(ctx, {
//       type: 'bar',
//       data: {
//         labels: ['Volume Loaded','Delivered','Cancel','Pending'],
//         datasets: [
//           {
//             label: 'ALN',
//             data:ALN,
//             backgroundColor: '#4472C4',
//             borderColor: '#4472C4',
//             minBarLength:0,
//             stack: 'Stack 0',
//             barThickness: 40,
//           },
//           {
//             label: 'AUH',
//             data: AUH,
//             backgroundColor: '#ED7D31',
//             borderColor: '#ED7D31',
//             stack: 'Stack 0',
//             barThickness: 40,
//           },
//           {
//             label: 'SHJ',
//             data: SHJ,
//             backgroundColor: '	#4C9900',
//             borderColor: '	#4C9900',
//             stack: 'Stack 0',
//             barThickness: 40,
//           },

//         ],

//       },

//       options: {
//         plugins: {
//           title: {
//             display: true,
//             text: 'UAE Volume Loaded Vs Delivered'
//           },
//         },   responsive: true,

//         scales: {
//           x: {
//             stacked: true,

//           },
//           y: {
//             beginAtZero: true
//           }
//         }
//       }
//     });
//   }

chartData:any
initializeChart2(): void {
  const ctx = this.salesChart2.nativeElement.getContext('2d');

  const regions = ['Delivered', 'Cancel', 'Pending'];
  const regionss = Object.values(this.chart2);
  console.log(regionss,'chart aa')
  const regionData = regionss.map(region => {
    const data = this.chart2;
    return data?.delivered_per + data?.cancel_per + data?.pending_per;
  });
  console.log(regionData,'rea');

let pendingQtyData=this.chart2?.pending_per
let deliveredQtyData=this.chart2?.delivered_per
let cancelQtyData=this.chart2?.cancel_per
console.log("daaaa",pendingQtyData,deliveredQtyData,cancelQtyData)
  const backgroundColors = ['#008000','#ff0000',  '#ED7D31', '#FF0000', '#00FFFF']; // Adjust colors as needed


  // const regions = ["delivered_per","cancel_per","pending_per"];
  // const regionData = regions.map(region => {
  //   const data = this.chart2[region];
  //   return data.delivered_order + data.cancel_order + data.pending_order;
  // });

  // const backgroundColors = ['#008000', '#ff0000', '#ED7D31', '#FF0000', '#00FFFF']; // Adjust colors as needed

  this.chartData = {
    labels: regions,
    datasets: [{
      data: regionss,
      backgroundColor: backgroundColors,
    }]
  };

  this.chartSecond = new Chart(ctx, {
    type: 'pie',
    data: this.chartData,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Count Distribution by Region'
        }
      }
    }
  });
}

}
