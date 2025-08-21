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

@Component({
  selector: 'app-order-analysis-dashboard',
  templateUrl: './order-analysis-dashboard.component.html',
  styleUrls: ['./order-analysis-dashboard.component.scss']
})
export class OrderAnalysisDashboardComponent implements OnInit {
  showExportButton: boolean = false;
  warehouseList:any = []
 private chart: am4charts.XYChart;
  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  activeDayIsOpen: boolean = true;
  dashboardData;
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
  allChannelList: any = [];

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
    domain:  [
      '#1f78b4', // Blue
      '#33a02c', // Green
      '#e31a1c', // Red
      '#ff7f00', // Orange
      '#6a3d9a', // Purple
      '#a6cee3', // Light Blue
      '#b2df8a', // Light Green
      '#fb9a99', // Light Red
      '#fdbf6f'  // Light Orange
    ]
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
  selectedDataZone = []
  public ngOnInit(): void {
    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.allChannelList = res.data;
    });


    this.apiService.getOrderAnalysisData({}).subscribe((data:any)=>{
     console.log(data,"kl472")
     this.chartData = JSON.parse(JSON.stringify(data))
    this.dataSource2 = data;
    console.log("The api response is here:",this.dataSource2)
    this.initChart1( this.chartData?.dailyApprovedOrdersQty);
    this.initChart2( this.chartData?.full_fill_rate);
    // this.initChart3();
    this.initChart4( this.chartData?.trend);
   })
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
      warehouse_id: [[]],
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

    this.apiService.getAllZoneList().subscribe(zone => {
      this.zoneList = zone.data;
    });
    this.apiService.getWarehouse(1).subscribe(x => {
      this.warehouseList = x.data;
      this.warehouseList.forEach(element => {
        element.name = element.code + '-' + element.name;
      })
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

//   initChart1(dta:any) {
//     am4core.useTheme(am4themes_animated);
//     const chart = am4core.create('chartdiv1', am4charts.XYChart);

//     // chart.paddingRight = 20;

//     // chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
//     console.log(chart.data,"mlk")

//     chart.data = dta

//     // const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
//     // categoryAxis.dataFields.category = "month";
//     // categoryAxis.title.text = "";
//     // categoryAxis.renderer.grid.template.location = 0;
//     // categoryAxis.renderer.minGridDistance = 20;
//     let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
//     categoryAxis.renderer.grid.template.location = 0;
//     categoryAxis.dataFields.category = "month";
//     categoryAxis.renderer.minGridDistance = 60;

//     let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
// this.filterForm.value.zone_id.map((ids:any,index:any)=>{


//   const series = chart.series.push(new am4charts.ColumnSeries());
//   series.dataFields.valueY = `load_utilization_${ids.id}`;
//   series.dataFields.categoryX = "month";
//   series.columns.template.fill = am4core.color(this.colorScheme.domain[index]);
//   series.name = ids.itemName;
//   series.tooltipText = "{name}: [bold]{valueY}[/]";
// })
//     // This has no effect
//     // series.stacked = true;

//     // const series2 = chart.series.push(new am4charts.ColumnSeries());
//     // series2.dataFields.valueY = "SE";
//     // series2.dataFields.categoryX = "country";
//     // series2.columns.template.fill = am4core.color("#ED7D31");
//     // series2.name = "Trip per day SE";
//     // series2.tooltipText = "{name}: [bold]{valueY}[/]";
//     // Do not try to stack on top of previous series
//     // series2.stacked = true;

//     // Add cursor
//     chart.cursor = new am4charts.XYCursor();

//     // Add legend
//     chart.legend = new am4charts.Legend();
//     this.chart = chart;
//   }
initChart1(dta: any) {
  am4core.useTheme(am4themes_animated);
  const chart = am4core.create('chartdiv1', am4charts.XYChart);

  // Set the chart data
  chart.data = dta;

  // Create x-axis (category axis) for dates
  const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "order_day";
  categoryAxis.title.text = "Order Date";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.minGridDistance = 30;
  categoryAxis.renderer.labels.template.rotation = -45;
  categoryAxis.renderer.labels.template.horizontalCenter = "right";
  categoryAxis.renderer.labels.template.verticalCenter = "middle";

  // Create y-axis (value axis) for quantities
  const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.title.text = "Total Quantity";
  valueAxis.numberFormatter.numberFormat = "#,###.00";

  // Create column series for approved orders quantity
  const series = chart.series.push(new am4charts.ColumnSeries());
  series.dataFields.valueY = "total_qty";
  series.dataFields.categoryX = "order_day";
  series.columns.template.fill = am4core.color("#4472C4"); // Blue color
  series.columns.template.stroke = am4core.color("#fff");
  series.columns.template.strokeWidth = 1;
  series.name = "Approved Orders Quantity";
  series.tooltipText = "Date: {order_day}\nQuantity: [bold]{total_qty}[/]";

  // Add cursor for interactivity
  chart.cursor = new am4charts.XYCursor();

  // Add legend
  chart.legend = new am4charts.Legend();

  this.chart = chart;
}
// initChart2(dta: any) {
//   // Ensure the value exists
//   const gaugeValue = dta?.value || 50; // fallback to 0 if undefined

//   am4core.useTheme(am4themes_animated);

//   // Create chart
//   const chart = am4core.create('chartdiv2', am4charts.GaugeChart);
//   chart.innerRadius = -20;

//   // Create axis
//   // ...existing code...
// // Create axis
// const axis = chart.xAxes.push(new am4charts.ValueAxis() as any);
// axis.min = 0;
// axis.max = 100;
// axis.strictMinMax = true;
// axis.renderer = new am4charts.AxisRendererCircular();
// axis.renderer.startAngle = -180;
// axis.renderer.endAngle = 0;
// axis.renderer.labels.template.radius = 15;
// axis.renderer.labels.template.fontSize = 12;
// axis.renderer.axisFills.template.disabled = false;
// axis.renderer.axisFills.template.fill = am4core.color("#008000"); // green fill
// axis.renderer.axisFills.template.fillOpacity = 1;
// // ...existing code...

//   // Add hand
//   const hand = chart.hands.push(new am4charts.ClockHand());
//   hand.axis = axis;
//   hand.innerRadius = am4core.percent(20);
//   hand.startWidth = 10;
//   hand.pin.disabled = true;
//   hand.value = gaugeValue;

//   // Add central label
//   const label = chart.createChild(am4core.Label);
//   label.text = gaugeValue.toFixed(1);
//   label.fontSize = 40;
//   label.align = "center";
//   label.horizontalCenter = "middle";
//   label.verticalCenter = "middle";
//   label.dy = 10;

//   // Save reference if needed later
//   this.chart = chart;
// }

  initChart2(dta: any) {
  // Clear existing chart instance if needed
 

  const value = dta || 0 ; // default to 0

  am4core.useTheme(am4themes_animated);
  const chart = am4core.create('chartdiv2', am4charts.GaugeChart);
  chart.innerRadius = am4core.percent(80);

  // Axis configuration
  let axis = chart.xAxes.push(new am4charts.ValueAxis<am4charts.AxisRendererCircular>());
  axis.min = 0;
  axis.max = 100;
  axis.strictMinMax = true;
  axis.renderer.useChartAngles = true;
  axis.renderer.startAngle = -180;
  axis.renderer.endAngle = 0;
  axis.renderer.grid.template.disabled = false;
  axis.renderer.labels.template.fontSize = 14;
  axis.renderer.labels.template.radius = 10;

  // Green arc fill
  let range = axis.axisRanges.create();
  range.value = 0;
  range.endValue = value;
  range.axisFill.fill = am4core.color("#008000");
  range.axisFill.fillOpacity = 1;
  range.axisFill.zIndex = -1;

  // Background arc (gray for remaining part)
  let backgroundRange = axis.axisRanges.create();
  backgroundRange.value = value;
  backgroundRange.endValue = 100;
  backgroundRange.axisFill.fill = am4core.color("#e0e0e0");
  backgroundRange.axisFill.fillOpacity = 1;
  backgroundRange.axisFill.zIndex = -2;

  // Central value label
  let label = chart.radarContainer.createChild(am4core.Label);
  label.isMeasured = false;
  label.fontSize = 40;
  label.x = am4core.percent(50);
  label.y = am4core.percent(90);
  label.horizontalCenter = "middle";
  label.verticalCenter = "bottom";
  label.text = value.toFixed(1);

  this.chart = chart;
}

  initChart3() {
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create('chartdiv3', am4charts.XYChart);

    chart.paddingRight = 20;

    chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

    chart.data = this.chartData;

    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "month";
    categoryAxis.title.text = "";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "";

    // Create series
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "cases_delivered";
    series.dataFields.categoryX = "month";
    series.columns.template.fill = am4core.color("#4472C4");
    series.name = "NE";
    series.tooltipText = "{name}: [bold]{valueY}[/]";
    // This has no effect
    // series.stacked = true;

    // const series2 = chart.series.push(new am4charts.ColumnSeries());
    // series2.dataFields.valueY = "SE";
    // series2.dataFields.categoryX = "country";
    // series2.columns.template.fill = am4core.color("#ED7D31");
    // series2.name = "SE";
    // series2.tooltipText = "{name}: [bold]{valueY}[/]";
    // Do not try to stack on top of previous series
    // series2.stacked = true;

    // Add cursor
    chart.cursor = new am4charts.XYCursor();

    // Add legend
    chart.legend = new am4charts.Legend();
    this.chart = chart;
  }
  // initChart4(dta:any) {
  //   am4core.useTheme(am4themes_animated);
  //   const chart = am4core.create('chartdiv4', am4charts.XYChart);

  //   chart.paddingRight = 20;

  //   chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

  //   chart.data = dta;

  //   const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  //   categoryAxis.dataFields.category = "order_day";
  //   categoryAxis.title.text = "";
  //   categoryAxis.renderer.grid.template.location = 0;
  //   categoryAxis.renderer.minGridDistance = 20;


  //   const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  //   valueAxis.title.text = "";
  //   this.filterForm.value.zone_id.map((ids:any,index:any)=>{


  //   // Create series
  //   // const series = chart.series.push(new am4charts.LineSeries());
  //   // series.dataFields.valueY = `cases_delivered_${ids.id}`;
  //   // series.dataFields.categoryX = "month";
  //   // series.stroke = am4core.color(this.colorScheme.domain[index]);
  //   // series.name = "cases_delivered";
  //   // series.tooltipText = "{name}: [bold]{valueY}[/]";

  //   const series = chart.series.push(new am4charts.LineSeries());
  //   series.dataFields.valueY = `total_amount`;
  //   series.dataFields.categoryX = "order_day";
  //   series.stroke = am4core.color(this.colorScheme.domain[index]);
  //   series.name = ids.itemName;
  //   series.tooltipText = "{name}: [bold]{valueY}[/]";


  //   const circel = series.bullets.push(new am4charts.CircleBullet());
  //   circel.circle.radius = 4;
  //   series.strokeWidth = 5;
  //   series.legendSettings.valueText = "{valueY}";
  //   series.visible = false;
  //   series.tooltip.fontSize = 10;
  //   })
  //   // This has no effect
  //   // series.stacked = true;

  //   // const series2 = chart.series.push(new am4charts.LineSeries());
  //   // series2.dataFields.valueY = "SE";
  //   // series2.dataFields.categoryX = "country";
  //   // series2.stroke = am4core.color("#ED7D31");
  //   // series2.name = "SE";
  //   // series2.tooltipText = "{name}: [bold]{valueY}[/]";
  //   // const circe2 = series2.bullets.push(new am4charts.CircleBullet());
  //   // circe2.circle.radius = 4;
  //   // series2.strokeWidth = 5;
  //   // series2.tooltipText = "{name}: [bold]{valueY}[/]";
  //   // series2.legendSettings.valueText = "{valueY}";
  //   // series2.visible = false;
  //   // series2.tooltip.fontSize = 10;
  //   // Do not try to stack on top of previous series
  //   // series2.stacked = true;

  //   // Add cursor
  //   chart.cursor = new am4charts.XYCursor();

    
  //   this.chart = chart;
  // }
initChart4(dta: any) {
  am4core.useTheme(am4themes_animated);
  const chart = am4core.create('chartdiv4', am4charts.XYChart);

  chart.paddingRight = 20;
  chart.hiddenState.properties.opacity = 0;

  // Set the chart data
  chart.data = dta;

  // Create x-axis (category axis) for dates
  const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "order_day";
  categoryAxis.title.text = "Order Date";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.minGridDistance = 30;
  categoryAxis.renderer.labels.template.rotation = -45;
  categoryAxis.renderer.labels.template.horizontalCenter = "right";
  categoryAxis.renderer.labels.template.verticalCenter = "middle";

  // Create y-axis (value axis) for amounts
  const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.title.text = "Total Amount";
  valueAxis.numberFormatter.numberFormat = "#,###.00";

  // Create the main line series
  const series = chart.series.push(new am4charts.LineSeries());
  series.dataFields.valueY = "total_amount";
  series.dataFields.categoryX = "order_day";
  series.stroke = am4core.color("#4472C4"); // Blue color
  series.strokeWidth = 2;
  series.name = "Order Amount";
  series.tooltipText = "{order_day}: [bold]{total_amount}[/]";

  // Add bullet points
  const bullet = series.bullets.push(new am4charts.CircleBullet());
  bullet.circle.stroke = am4core.color("#fff");
  bullet.circle.strokeWidth = 2;
  bullet.circle.radius = 4;

  // Add cursor for interactivity
  chart.cursor = new am4charts.XYCursor();

  this.chart = chart;
}

  applyFilter() { }
  applyFilterOnClick() {
    let form = this.filterForm.value;
    console.log(this.selectedDataZone,"406")
    console.log(form)
    let filterObj:any = {
      start_date: form.startdate,
      end_date: form.enddate,
      channel_id: form.channel_code.length > 0 ? form.channel_code.map(i => i.id) : [],
      warehouse_id:form?.warehouse_id.map((ids:any)=>ids.id).length>0?form?.warehouse_id.map((ids:any)=>ids.id):this.warehouseList.map((ids:any)=>ids.id)
    };

    this.getData(filterObj);
    this.showExportButton = true;
  }
  getData(filterObj) {
   console.log(filterObj)
   this.apiService.getOrderAnalysisData(filterObj).subscribe((data:any)=>{
     console.log(data,"kl472")
     this.chartData = JSON.parse(JSON.stringify(data))
    this.dataSource2 = data;
    console.log("The api response is here:",this.dataSource2)
    this.initChart1( this.chartData?.dailyApprovedOrdersQty);
    this.initChart2( this.chartData?.full_fill_rate);
    // this.initChart3();
    this.initChart4( this.chartData?.trend);
   })
  }
}
