
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
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChannelComponent } from 'src/app/components/dialog-forms/add-channel/channel.component';


@Component({
  selector: 'app-distribution-dashboard',
  templateUrl: './distribution-dashboard.component.html',
  styleUrls: ['./distribution-dashboard.component.scss']
})
export class DistributionDashboardComponent implements OnInit {
  showExportButton: boolean = false;
  showChart: boolean = false;
  private chart: am4charts.XYChart | any;
  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  activeDayIsOpen: boolean = true;
  dashboardData: any;
  SupervisorList: any = [];
  public getAllChannels: any[] = [];
  channels: any = [];
  allChannelList: any = [];
  warehouseList: any = [];
  newChartWholeData: any;
  trendData: any[] = [];
  routeList: any = [];
  flatChannelData: any[] = [];
  RouteList: any = [];
  comparisonData = [];
  contributionData = [];
  trendChart: any;
  comparisonChart: any;
  contriutionChart: any;
  selectedData: any;
  dataSource2: any;
  selected = 'Call Completion';
  selectedChart: any = "";
  openDetailType = "";

  detailsTable: any[] = []
  filterForm: any;
  filtersList = [
    "RSM",
    "HOS",
    "COO",
    "Supervisor",
  ];
  channelList = [];
  nsmList = [];
  rsmList = [];
  hosList = [];
  cooList = [];
  asmList = [];
  regionList = [];
  merchandiserList = [];
  supervisorList = [];
  private subscriptions: Subscription[] = [];
  dialogRef: any;
  isOpened = false;
  @ViewChild('formDrawer') fromDrawer: MatDrawer | any;
  salesmanList: any[] = [];
  colorScheme = {
    domain: [
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

    @Inject(PLATFORM_ID) private platformId: any
  ) { }

  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      startdate: [''],
      enddate: [''],
      type: ['COO'],
      rsm: [[]],
      hos: [[]],
      coo: [[]],
      supervisor: [[]],
      route: [[]],
      region: [[]],
      channel: [[]],
      channel_code: [[]],
      warehouse_id: [[]],
    });
    // if (localStorage.getItem('isLoggedIn') === 'true') {
    //   this.apiService.getOrganizaion().subscribe((result) => {
    //     const orgData = result.data;
    //     localStorage.setItem('organization', JSON.stringify(orgData));
    //     //localStorage.setItem('avatar_img', JSON.stringify(orgData.org_logo));
    //   });
    // }

    // let body = {
    //   supervisor_id: this.filterForm.value.supervisor.map((item: any) => item.id) ,
    //   coo_id : this.filterForm.value.coo.map((item: any) => item.id),
    //   rsm_id : this.filterForm.value.rsm.map((item: any) => item.id),
    //   hos_id : this.filterForm.value.hos.map((item: any) => item.id),
    //   route:this.filterForm.value.route.map((item: any) => item.id),
    //   "start_date": "",
    //   "end_date": ""
    // };
    // this.subscriptions.push(
    //   this.service.getEfficiencyDashboardMainData(body).subscribe((dashboard) => {

    //     this.dashboardData = dashboard.data;
    //     this.getChartsData('Call Completion');

    //   })
    // )

    const payload = {
      coo_id: this.filterForm.value.coo,
      rsm_id: this.filterForm.value.rsm,
      hos_id: this.filterForm.value.hos,
    }
    // this.service.getSupervisorFilteredList(payload).subscribe((res:any)=>{
    //   this.SupervisorList = res.data
    // })
    this.service.getMasterList().subscribe((res) => {
      this.RouteList = res.masterData.data.route;
      this.SupervisorList = res.masterData.data.salesman_supervisor;
      this.regionList = res.masterData.data.region;
      this.merchandiserList = res.masterData.data.merchandiser.map((item: { [x: string]: { [x: string]: string; }; user: { lastname: any; }; salesman_code: any; }) => {
        if (item.user !== null) {
          item['user']['lastname'] = [item.user?.lastname, item.salesman_code].join(" - ")
          return item;
        }
        return item;
      });
    })

    var data: any[] = [];
    var visits = 10;
    var i = 0;

    // for (i = 0; i <= 30; i++) {
    //   visits -= Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
    //   data.push({ date: new Date().setSeconds(i - 30), value: visits });
    // }

    this.trendData = data;
    this.comparisonData = [];
    this.contributionData = [];

    this.apiService.getAllCustomerCategory().subscribe((res: any) => {
      this.allChannelList = res.data;
    });

    this.apiService.getWarehouse(1).subscribe(x => {
      const targetCodes = ['100334', '101134', '101834', '101234', '101434', '100934'];
      this.warehouseList = (x.data || []).filter((w: any) => targetCodes.includes(String(w.code)));
      this.warehouseList.forEach(element => {
        element.name = element.code + '-' + element.name;
      });

      // Handle potential race condition if chartData is already loaded
      if (this.chartData?.warehouse && this.chartData.warehouse.length > 0) {
        this.chartData.warehouse = this.chartData.warehouse.map((item: any) => {
          const matchingWh = this.warehouseList.find((w: any) => {
            return w.name && item.warehouseName && w.name.includes(item.warehouseName);
          });
          return {
            ...item,
            warehouseCode: matchingWh ? matchingWh.code : item.warehouseName
          };
        });
        this.initWarehouseOrdersChart(this.chartData?.warehouse);
        this.initWarehouseOtifChart(this.chartData?.warehouse);
        this.initWarehouseOrdersLtrChart(this.chartData?.warehouse);
        this.initWarehouseLoadUtilizationChart(this.chartData?.warehouse);
      }

      if (this.showChart && (!this.filterForm.value.warehouse_id || this.filterForm.value.warehouse_id.length === 0)) {
        this.applyFilterOnClick();
      }
    });

    this.subscriptions.push(
      this.apiService.getAllChannels().subscribe((result: any) => {
        this.channels = result.data;
        this.flatChannelData = [];
        this.channels.forEach((data: any) => {
          this.flatChannelArray(data);
        });
      })
    );
  }

  changeFilterType(type: any) {
  }

  patchFilters(dashFilter: any) {
    this.filterForm.patchValue({
      startdate: dashFilter?.startdate,
      enddate: dashFilter?.enddate,
      rsm: dashFilter?.nsm,
      hos: dashFilter?.asm,
      coo: dashFilter?.channel,
      supervisor: dashFilter?.supervisor,
    })
    this.applyFilterOnClick();
  }
  applyFilter() {
    const payload = {
      coo_id: this.filterForm.value.coo.map((item: any) => item.id),
      rsm_id: this.filterForm.value.rsm.map((item: any) => item.id),
      hos_id: this.filterForm.value.hos.map((item: any) => item.id),
    }
    // this.service.getSupervisorFilteredList(payload).subscribe((res:any)=>{
    //   this.SupervisorList = res.data
    // })
  }
  applyFilterOnClick() {
    let salesman: any[] = [];
    let form = this.filterForm.value;

    const selectedWarehouses = form?.warehouse_id || [];
    const warehouseIds = (selectedWarehouses && selectedWarehouses.length > 0)
      ? selectedWarehouses.map((w: any) => w.id || w)
      : (this.warehouseList || []).map((w: any) => w.id);

    const selectedChannels = form?.channel_code || [];
    const channelIds = (selectedChannels && selectedChannels.length > 0)
      ? selectedChannels.map((c: any) => c.id || c)
      : (this.allChannelList || []).map((c: any) => c.id || c);

    let filterObj: any = {
      start_date: form.startdate,
      end_date: form.enddate,
      channel_id: channelIds,
      // channel_id: form.channel_code.length > 0 ? form.channel_code.map(i => i.id) : [],
      warehouse_id: warehouseIds
    };

    this.getData(filterObj);
    this.showExportButton = true;
    this.showChart = true;

  }

  getData(filterObj: any) {
    this.apiService.distributionDashboard(filterObj).subscribe((res: any) => {
      this.dashboardData = res.data;
      this.newChartWholeData = res.data;
      this.chartData = JSON.parse(JSON.stringify(res.data));

      if (this.chartData?.warehouse && this.chartData.warehouse.length > 0) {
        this.chartData.warehouse = this.chartData.warehouse.map((item: any) => {
          const matchingWh = (this.warehouseList || []).find((w: any) => {
            return w.name && item.warehouseName && w.name.includes(item.warehouseName);
          });
          return {
            ...item,
            warehouseCode: matchingWh ? matchingWh.code : item.warehouseName
          };
        });
      }

      this.initWarehouseOrdersChart(this.chartData?.warehouse);
      this.initWarehouseOtifChart(this.chartData?.warehouse);
      this.initWarehouseOrdersLtrChart(this.chartData?.warehouse);
      this.initWarehouseLoadUtilizationChart(this.chartData?.warehouse);
      this.initChannelOrdersChart(this.chartData?.channel);
      this.initChannelOtifChart(this.chartData?.channel);
    });
  }
  openDetail(item: string) {
    this.isOpened = !this.isOpened;
    this.selected = item;
    // this.getChartsData(item);
  }

  toggle(item: string) {
    this.selected = item;
    // this.getChartsData(item);
  }

  openChartDetail(label: string) {
    this.openDetailType = "chart";
    this.selectedChart = this.selectedChart == label ? null : label;

  }

  closeChartDetail() {
    this.openDetailType = "";
    this.selectedChart = "";
  }

  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }



  ngAfterViewInit() {
    this.fds.setDrawer(this.fromDrawer);
    // Chart code goes in here
    this.browserOnly(() => {
      // this.initChart1(dta);
      // this.initChart2();
      // this.initChart3();
    });
  }


  initChart1(dta: any) {
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create('chartdiv1', am4charts.XYChart);

    const colors = this.colorScheme.domain;

    // ✅ Reshape data: single record with each region’s OTIF
    chart.data = [{
      category: "Region",
      ...Object.fromEntries(dta.map((region: any) => [region.region, region.otif]))
    }];

    // ✅ X-axis: single "OTIF" category
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.grid.template.location = 0;

    //   categoryAxis.renderer.cellStartLocation = 0.2;
    // categoryAxis.renderer.cellEndLocation = 0.8;

    // ✅ Y-axis: fixed min/max
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = 110;
    valueAxis.strictMinMax = true; // ensure exactly 0–100
    valueAxis.title.text = "OTIF (%)";

    // ✅ One ColumnSeries per region
    dta.forEach((region: any, index: number) => {
      const series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = region.region; // field name
      series.dataFields.categoryX = "category";
      series.name = region.region;
      series.tooltipText = "{name}: [bold]{valueY}%[/]";
      series.columns.template.fill = am4core.color(colors[index % colors.length]);
      series.columns.template.stroke = am4core.color(colors[index % colors.length]);
      series.clustered = true;

      const columnWidth = dta.length === 1 ? 20 : 70;
      series.columns.template.width = am4core.percent(columnWidth);
      // ✅ Add label on each bar
      const labelBullet = series.bullets.push(new am4charts.LabelBullet());
      labelBullet.label.text = "{valueY}%";
      labelBullet.label.dy = -10; // move label up a bit
      labelBullet.label.fill = am4core.color("#000"); // label color
    });

    chart.legend = new am4charts.Legend();
    chart.cursor = new am4charts.XYCursor();

    this.chart = chart;
  }



  initChart2(dta: any) {
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create('chartdiv2', am4charts.XYChart);

    const colors = this.colorScheme.domain;

    // ✅ Reshape data: single record with each region’s OTIF
    chart.data = [{
      category: "Region",
      ...Object.fromEntries(dta.map((region: any) => [region.region, region.cfr]))
    }];

    // ✅ X-axis: single "OTIF" category
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.grid.template.location = 0;

    // ✅ Y-axis: fixed min/max
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = 110;
    valueAxis.strictMinMax = true; // ensure exactly 0–100
    valueAxis.title.text = "CFR (%)";

    // ✅ One ColumnSeries per region
    dta.forEach((region: any, index: number) => {
      const series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = region.region; // field name
      series.dataFields.categoryX = "category";
      series.name = region.region;
      series.tooltipText = "{name}: [bold]{valueY}%[/]";
      series.columns.template.fill = am4core.color(colors[index % colors.length]);
      series.columns.template.stroke = am4core.color(colors[index % colors.length]);
      series.clustered = true;

      const columnWidth = dta.length === 1 ? 20 : 70;
      series.columns.template.width = am4core.percent(columnWidth);
      // ✅ Add label on each bar
      const labelBullet = series.bullets.push(new am4charts.LabelBullet());
      labelBullet.label.text = "{valueY}%";
      labelBullet.label.dy = -10; // move label up a bit
      labelBullet.label.fill = am4core.color("#000"); // label color
    });

    chart.legend = new am4charts.Legend();
    chart.cursor = new am4charts.XYCursor();
    this.chart = chart;
  }

  initChart3(dta: any) {
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create('chartdiv3', am4charts.XYChart);

    const colors = this.colorScheme.domain;

    // ✅ Reshape data: single record with each region’s OTIF
    chart.data = [{
      category: "Channel",
      ...Object.fromEntries(dta.map((region: any) => [region.channel, region.otif]))
    }];

    // ✅ X-axis: single "OTIF" category
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.grid.template.location = 0;

    // ✅ Y-axis: fixed min/max
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = 110;
    valueAxis.strictMinMax = true; // ensure exactly 0–100
    valueAxis.title.text = "OTIF (%)";

    // ✅ One ColumnSeries per region
    dta.forEach((region: any, index: number) => {
      const series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = region.channel; // field name
      series.dataFields.categoryX = "category";
      series.name = region.channel;
      series.tooltipText = "{name}: [bold]{valueY}%[/]";
      series.columns.template.fill = am4core.color(colors[index % colors.length]);
      series.columns.template.stroke = am4core.color(colors[index % colors.length]);
      series.clustered = true;

      const columnWidth = dta.length === 1 ? 20 : 70;
      series.columns.template.width = am4core.percent(columnWidth);
      // ✅ Add label on each bar
      const labelBullet = series.bullets.push(new am4charts.LabelBullet());
      labelBullet.label.text = "{valueY}%";
      labelBullet.label.dy = -10; // move label up a bit
      labelBullet.label.fill = am4core.color("#000"); // label color
    });

    chart.legend = new am4charts.Legend();
    chart.cursor = new am4charts.XYCursor();
    this.chart = chart;
  }
  //   initChart3(dta: any) {
  //   am4core.useTheme(am4themes_animated);
  //   const chart = am4core.create('chartdiv3', am4charts.XYChart);
  //   const colors = this.colorScheme.domain;

  //   // ✅ Reshape data
  //   chart.data = [{
  //     category: "OTIF",
  //     ...Object.fromEntries(dta.map((ch: any) => [ch.channel, ch.otif]))
  //   }];

  //   // ✅ X-axis
  //   let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  //   categoryAxis.dataFields.category = "category";
  //   categoryAxis.renderer.grid.template.location = 0;

  //   // ✅ Y-axis
  //   let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  //   valueAxis.min = 0;
  //   valueAxis.max = 100;
  //   valueAxis.strictMinMax = true;
  //   valueAxis.title.text = "OTIF (%)";

  //   // ✅ Create one series per channel
  //   dta.forEach((ch: any, index: number) => {
  //     const series = chart.series.push(new am4charts.ColumnSeries());
  //     series.dataFields.valueY = ch.channel;   // 👈 this matches keys in chart.data
  //     series.dataFields.categoryX = "category";
  //     series.name = ch.channel;
  //     series.tooltipText = "{name}: [bold]{valueY}%[/]";
  //     series.columns.template.fill = am4core.color(colors[index % colors.length]);
  //     series.columns.template.stroke = am4core.color(colors[index % colors.length]);
  //     series.clustered = true;

  //     const columnWidth = dta.length === 1 ? 20 : 40;
  //     series.columns.template.width = am4core.percent(columnWidth);

  //     const labelBullet = series.bullets.push(new am4charts.LabelBullet());
  //     labelBullet.label.text = "{valueY}%";
  //     labelBullet.label.dy = -10;
  //     labelBullet.label.fill = am4core.color("#000");
  //   });

  //   chart.legend = new am4charts.Legend();
  //   chart.cursor = new am4charts.XYCursor();
  //   this.chart = chart;
  // }


  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
  generateChartData() {
    var chartData = [];
    // current date
    var firstDate = new Date();
    // now set 500 minutes back
    firstDate.setMinutes(firstDate.getDate() - 500);

    // and generate 500 data items
    var visits = 500;
    for (var i = 0; i < 500; i++) {
      var newDate = new Date(firstDate);
      // each time we add one minute
      newDate.setMinutes(newDate.getMinutes() + i);
      // some random number
      visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
      // add data item to the array
      chartData.push({
        date: newDate,
        visits: visits,
      });
    }
    return chartData;
  }
  ngOnDestroy() {
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  applyFilter1() {
    const payload = {
      supervisor: this.filterForm.value.supervisor.map((item: any) => item.id),
    }
    // this.service.getRouteFilteredList(payload).subscribe((res:any)=>{
    //   this.RouteList = res.data;
    // })
  }

  public channelProvider(): Observable<any[]> {
    return this.apiService.getAllChannels().pipe(map((result) => result.data));
  }
  public flatChannelArray(item: { children: string | any[]; }) {
    this.flatChannelData.push(item);
    if (item.children.length) {
      for (const child of item.children) {
        this.flatChannelArray(child);
      }
    } else {
      return;
    }
  }

  //  getChannels(){
  //      this.apiService
  //           .getAllChannels()
  //           .pipe(map((apiResult) => apiResult.data))
  //           .subscribe((channels) => {
  //           this.getAllChannels = channels;
  //           this.main_channel_id = channels.id
  //           // Call onChannelSelected with the first channel's id if available
  //           // if (channels && channels.length > 0) {
  //           //   this.onChannelSelected(channels[1].id);
  //           // }
  //           });
  //           // // console.log("680 main channel  is:",this.getAllChannels)
  //           // // console.log("680 main channel id is:",this.main_channel_id)
  //   }

  public openChannel(): void {
    this._matDialog
      .open(ChannelComponent, {
        width: '650px',
        position: {
          top: '0px',
        },
      })
      .afterClosed()
      .subscribe((result: any) => {
        this.apiService
          .getAllChannels()
          .pipe(map((apiResult) => apiResult.data))
          .subscribe((channels) => {
            this.getAllChannels = channels;
          });
        if (!result) {
          return;
        }
        // let customerInfo = this.getLobCustomerInfo;
        // customerInfo.at(index).get('channel')?.setValue(result.id);
      });
  }
  chartData: any = []

  initChart7(dta: any) {
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create('chartdiv1', am4charts.XYChart);

    // chart.paddingRight = 20;

    // chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
    // // console.log(chart.data,"mlk")

    chart.data = dta

    // const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    // categoryAxis.dataFields.category = "month";
    // categoryAxis.title.text = "";
    // categoryAxis.renderer.grid.template.location = 0;
    // categoryAxis.renderer.minGridDistance = 20;
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "month";
    categoryAxis.renderer.minGridDistance = 60;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    this.filterForm.value.zone_id.map((ids: any, index: any) => {


      const series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = `load_utilization_${ids.id}`;
      series.dataFields.categoryX = "month";
      series.columns.template.fill = am4core.color(this.colorScheme.domain[index]);
      series.name = ids.itemName;
      series.tooltipText = "{name}: [bold]{valueY}[/]";
    })
    // This has no effect
    // series.stacked = true;

    // const series2 = chart.series.push(new am4charts.ColumnSeries());
    // series2.dataFields.valueY = "SE";
    // series2.dataFields.categoryX = "country";
    // series2.columns.template.fill = am4core.color("#ED7D31");
    // series2.name = "Trip per day SE";
    // series2.tooltipText = "{name}: [bold]{valueY}[/]";
    // Do not try to stack on top of previous series
    // series2.stacked = true;

    // Add cursor
    chart.cursor = new am4charts.XYCursor();

    // Add legend
    chart.legend = new am4charts.Legend();
    this.chart = chart;
  }

  initChart6(dta: any) {
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create('chartdiv2', am4charts.XYChart);

    // chart.paddingRight = 20;

    // chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

    chart.data = dta

    // const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    // categoryAxis.dataFields.category = "month";
    // categoryAxis.title.text = "";
    // categoryAxis.renderer.grid.template.location = 0;
    // categoryAxis.renderer.minGridDistance = 20;
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "month";
    categoryAxis.renderer.minGridDistance = 60;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    this.filterForm.value.zone_id.map((ids: any, index: any) => {


      const series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = `trips_per_day_${ids.id}`;
      series.dataFields.categoryX = "month";
      series.columns.template.fill = am4core.color(this.colorScheme.domain[index]);
      series.name = ids.itemName;
      series.tooltipText = "{name}: [bold]{valueY}[/]";
    })
    // This has no effect
    // series.stacked = true;

    // const series2 = chart.series.push(new am4charts.ColumnSeries());
    // series2.dataFields.valueY = "SE";
    // series2.dataFields.categoryX = "country";
    // series2.columns.template.fill = am4core.color("#ED7D31");
    // series2.name = "Trip per day SE";
    // series2.tooltipText = "{name}: [bold]{valueY}[/]";
    // Do not try to stack on top of previous series
    // series2.stacked = true;

    // Add cursor
    chart.cursor = new am4charts.XYCursor();

    // Add legend
    chart.legend = new am4charts.Legend();
    this.chart = chart;
  }

  initChart5() {
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
  initChart4(dta: any) {
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create('chartdiv4', am4charts.XYChart);

    chart.paddingRight = 20;

    chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

    chart.data = dta;

    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "month";
    categoryAxis.title.text = "";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;


    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "";
    this.filterForm.value.zone_id.map((ids: any, index: any) => {


      // Create series
      // const series = chart.series.push(new am4charts.LineSeries());
      // series.dataFields.valueY = `cases_delivered_${ids.id}`;
      // series.dataFields.categoryX = "month";
      // series.stroke = am4core.color(this.colorScheme.domain[index]);
      // series.name = "cases_delivered";
      // series.tooltipText = "{name}: [bold]{valueY}[/]";

      const series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = `cases_delivered_${ids.id}`;
      series.dataFields.categoryX = "month";
      series.stroke = am4core.color(this.colorScheme.domain[index]);
      series.name = ids.itemName;
      series.tooltipText = "{name}: [bold]{valueY}[/]";


      const circel = series.bullets.push(new am4charts.CircleBullet());
      circel.circle.radius = 4;
      series.strokeWidth = 5;
      series.legendSettings.valueText = "{valueY}";
      series.visible = false;
      if (series.tooltip) {
        series.tooltip.fontSize = 10;
      }
    })
    // This has no effect
    // series.stacked = true;

    // const series2 = chart.series.push(new am4charts.LineSeries());
    // series2.dataFields.valueY = "SE";
    // series2.dataFields.categoryX = "country";
    // series2.stroke = am4core.color("#ED7D31");
    // series2.name = "SE";
    // series2.tooltipText = "{name}: [bold]{valueY}[/]";
    // const circe2 = series2.bullets.push(new am4charts.CircleBullet());
    // circe2.circle.radius = 4;
    // series2.strokeWidth = 5;
    // series2.tooltipText = "{name}: [bold]{valueY}[/]";
    // series2.legendSettings.valueText = "{valueY}";
    // series2.visible = false;
    // series2.tooltip.fontSize = 10;
    // Do not try to stack on top of previous series
    // series2.stacked = true;

    // Add cursor
    chart.cursor = new am4charts.XYCursor();

    // Add legend
    chart.legend = new am4charts.Legend();
    this.chart = chart;
  }

  initWarehouseOrdersChart(dta: any[]) {
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create('chartdiv_wh_orders', am4charts.XYChart);
    chart.data = dta || [];

    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'warehouseCode';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.rotation = -45;
    categoryAxis.renderer.labels.template.horizontalCenter = 'right';
    categoryAxis.renderer.labels.template.fontSize = 11;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = 'Orders Quantity';

    const configureSeriesTooltip = (series: am4charts.ColumnSeries) => {
      series.columns.template.tooltipText = series.tooltipText;
      series.tooltip.pointerOrientation = "vertical";
      series.tooltip.background.cornerRadius = 6;
      series.tooltip.background.strokeOpacity = 0.5;
      series.tooltip.background.fillOpacity = 0.95;
      series.tooltip.label.fontSize = 12;
      series.tooltip.label.padding(6, 10, 6, 10);
    };

    const series1 = chart.series.push(new am4charts.ColumnSeries());
    series1.dataFields.valueY = 'totalOrder';
    series1.dataFields.categoryX = 'warehouseCode';
    series1.name = 'Total Order';
    series1.tooltipText = '[bold]{warehouseName}[/]\n{name}: [bold]{valueY}[/]';
    series1.columns.template.fill = am4core.color('#1f78b4');
    series1.columns.template.stroke = am4core.color('#1f78b4');
    configureSeriesTooltip(series1);

    const series2 = chart.series.push(new am4charts.ColumnSeries());
    series2.dataFields.valueY = 'completedOrder';
    series2.dataFields.categoryX = 'warehouseCode';
    series2.name = 'Completed Order';
    series2.tooltipText = '[bold]{warehouseName}[/]\n{name}: [bold]{valueY}[/]';
    series2.columns.template.fill = am4core.color('#33a02c');
    series2.columns.template.stroke = am4core.color('#33a02c');
    configureSeriesTooltip(series2);

    const series3 = chart.series.push(new am4charts.ColumnSeries());
    series3.dataFields.valueY = 'invoiceOrder';
    series3.dataFields.categoryX = 'warehouseCode';
    series3.name = 'Invoice Order';
    series3.tooltipText = '[bold]{warehouseName}[/]\n{name}: [bold]{valueY}[/]';
    series3.columns.template.fill = am4core.color('#6a3d9a');
    series3.columns.template.stroke = am4core.color('#6a3d9a');
    configureSeriesTooltip(series3);

    const series4 = chart.series.push(new am4charts.ColumnSeries());
    series4.dataFields.valueY = 'cancelOrder';
    series4.dataFields.categoryX = 'warehouseCode';
    series4.name = 'Cancel Order';
    series4.tooltipText = '[bold]{warehouseName}[/]\n{name}: [bold]{valueY}[/]';
    series4.columns.template.fill = am4core.color('#e31a1c');
    series4.columns.template.stroke = am4core.color('#e31a1c');
    configureSeriesTooltip(series4);

    chart.legend = new am4charts.Legend();
    const cursor = new am4charts.XYCursor();
    cursor.maxTooltipDistance = 0;
    chart.cursor = cursor;
    this.chart = chart;
  }

  initWarehouseOtifChart(dta: any[]) {
    if (dta && dta.length > 0) {
      const maxVal = Math.max(...dta.map(x => Number(x.otif) || 0));
      dta = dta.map(item => {
        let otifVal = item.otif;
        if (otifVal === undefined || otifVal === null) {
          otifVal = item.totalOrder ? (item.completedOrder / item.totalOrder) * 100 : 0;
        } else if (maxVal <= 1) {
          otifVal = otifVal * 100;
        }
        return {
          ...item,
          otif: Number(Number(otifVal).toFixed(2))
        };
      });
    }
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create('chartdiv_wh_otif', am4charts.XYChart);
    chart.data = dta || [];

    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'warehouseCode';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.rotation = -45;
    categoryAxis.renderer.labels.template.horizontalCenter = 'right';
    categoryAxis.renderer.labels.template.fontSize = 11;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = 'OTIF (%)';
    valueAxis.min = 0;
    valueAxis.max = 110;

    const series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = 'otif';
    series.dataFields.categoryX = 'warehouseCode';
    series.name = 'OTIF (%)';
    series.tooltipText = '[bold]{warehouseName}[/]\nOTIF: [bold]{valueY}%[/]';
    series.columns.template.tooltipText = '[bold]{warehouseName}[/]\nOTIF: [bold]{valueY}%[/]';
    series.columns.template.fill = am4core.color('#ff7f00');
    series.columns.template.stroke = am4core.color('#ff7f00');
    series.tooltip.pointerOrientation = "vertical";
    series.tooltip.background.cornerRadius = 6;
    series.tooltip.background.strokeOpacity = 0.5;
    series.tooltip.background.fillOpacity = 0.95;
    series.tooltip.label.fontSize = 12;
    series.tooltip.label.padding(6, 10, 6, 10);

    const labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = '{valueY}%';
    labelBullet.label.dy = -10;
    labelBullet.label.fill = am4core.color('#000');
    labelBullet.label.fontSize = 10;

    chart.legend = new am4charts.Legend();
    const cursor = new am4charts.XYCursor();
    cursor.maxTooltipDistance = 0;
    chart.cursor = cursor;
    this.chart = chart;
  }

  initWarehouseOrdersLtrChart(dta: any[]) {
    if (dta && dta.length > 0) {
      dta = dta.map(item => ({
        ...item,
        cancelQTYLTR_total: (Number(item.cancelQTYLTR) || 0) + (Number(item.spotQTYLTR) || 0)
      }));
    }
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create('chartdiv_wh_orders_ltr', am4charts.XYChart);
    chart.data = dta || [];

    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'warehouseCode';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.rotation = -45;
    categoryAxis.renderer.labels.template.horizontalCenter = 'right';
    categoryAxis.renderer.labels.template.fontSize = 11;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = 'Orders Quantity (Ltr)';

    const configureSeriesTooltip = (series: am4charts.ColumnSeries) => {
      series.columns.template.tooltipText = series.tooltipText;
      series.tooltip.pointerOrientation = "vertical";
      series.tooltip.background.cornerRadius = 6;
      series.tooltip.background.strokeOpacity = 0.5;
      series.tooltip.background.fillOpacity = 0.95;
      series.tooltip.label.fontSize = 12;
      series.tooltip.label.padding(6, 10, 6, 10);
    };

    const series1 = chart.series.push(new am4charts.ColumnSeries());
    series1.dataFields.valueY = 'planQTYLTR';
    series1.dataFields.categoryX = 'warehouseCode';
    series1.name = 'Total Order';
    series1.tooltipText = '[bold]{warehouseName}[/]\n{name}: [bold]{valueY}[/]';
    series1.columns.template.fill = am4core.color('#1f78b4');
    series1.columns.template.stroke = am4core.color('#1f78b4');
    configureSeriesTooltip(series1);

    const series2 = chart.series.push(new am4charts.ColumnSeries());
    series2.dataFields.valueY = 'loadQTYLTR';
    series2.dataFields.categoryX = 'warehouseCode';
    series2.name = 'Completed Order';
    series2.tooltipText = '[bold]{warehouseName}[/]\n{name}: [bold]{valueY}[/]';
    series2.columns.template.fill = am4core.color('#33a02c');
    series2.columns.template.stroke = am4core.color('#33a02c');
    configureSeriesTooltip(series2);

    const series3 = chart.series.push(new am4charts.ColumnSeries());
    series3.dataFields.valueY = 'invoiceQTYLTR';
    series3.dataFields.categoryX = 'warehouseCode';
    series3.name = 'Invoice Order';
    series3.tooltipText = '[bold]{warehouseName}[/]\n{name}: [bold]{valueY}[/]';
    series3.columns.template.fill = am4core.color('#6a3d9a');
    series3.columns.template.stroke = am4core.color('#6a3d9a');
    configureSeriesTooltip(series3);

    const series4 = chart.series.push(new am4charts.ColumnSeries());
    series4.dataFields.valueY = 'cancelQTYLTR_total';
    series4.dataFields.categoryX = 'warehouseCode';
    series4.name = 'Cancel Order';
    series4.tooltipText = '[bold]{warehouseName}[/]\n{name}: [bold]{valueY}[/]';
    series4.columns.template.fill = am4core.color('#e31a1c');
    series4.columns.template.stroke = am4core.color('#e31a1c');
    configureSeriesTooltip(series4);

    chart.legend = new am4charts.Legend();
    const cursor = new am4charts.XYCursor();
    cursor.maxTooltipDistance = 0;
    chart.cursor = cursor;
    this.chart = chart;
  }

  initWarehouseLoadUtilizationChart(dta: any[]) {
    if (dta && dta.length > 0) {
      dta = dta.map(item => ({
        ...item,
        load_utilization: Number(Number(item.load_utilization || 0).toFixed(2))
      }));
    }
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create('chartdiv_wh_load_utilization', am4charts.XYChart);
    chart.data = dta || [];

    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'warehouseCode';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.rotation = -45;
    categoryAxis.renderer.labels.template.horizontalCenter = 'right';
    categoryAxis.renderer.labels.template.fontSize = 11;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = 'Load Utilization (%)';
    valueAxis.min = 0;
    valueAxis.extraMax = 0.15;

    const series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = 'load_utilization';
    series.dataFields.categoryX = 'warehouseCode';
    series.name = 'Load Utilization (%)';
    series.tooltipText = '[bold]{warehouseName}[/]\nLoad Utilization: [bold]{valueY}%[/]';
    series.columns.template.tooltipText = '[bold]{warehouseName}[/]\nLoad Utilization: [bold]{valueY}%[/]';
    series.columns.template.fill = am4core.color('#008080');
    series.columns.template.stroke = am4core.color('#008080');
    series.tooltip.pointerOrientation = "vertical";
    series.tooltip.background.cornerRadius = 6;
    series.tooltip.background.strokeOpacity = 0.5;
    series.tooltip.background.fillOpacity = 0.95;
    series.tooltip.label.fontSize = 12;
    series.tooltip.label.padding(6, 10, 6, 10);

    const labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = '{valueY}%';
    labelBullet.label.dy = -10;
    labelBullet.label.fill = am4core.color('#000');
    labelBullet.label.fontSize = 10;

    chart.legend = new am4charts.Legend();
    const cursor = new am4charts.XYCursor();
    cursor.maxTooltipDistance = 0;
    chart.cursor = cursor;
    this.chart = chart;
  }

  initChannelOrdersChart(dta: any[]) {
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create('chartdiv_channel_orders', am4charts.XYChart);
    chart.data = dta || [];

    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'channelName';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.fontSize = 11;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = 'Orders Quantity';

    const configureSeriesTooltip = (series: am4charts.ColumnSeries) => {
      series.columns.template.tooltipText = series.tooltipText;
      series.tooltip.pointerOrientation = "vertical";
      series.tooltip.background.cornerRadius = 6;
      series.tooltip.background.strokeOpacity = 0.5;
      series.tooltip.background.fillOpacity = 0.95;
      series.tooltip.label.fontSize = 12;
      series.tooltip.label.padding(6, 10, 6, 10);
    };

    const series1 = chart.series.push(new am4charts.ColumnSeries());
    series1.dataFields.valueY = 'totalOrder';
    series1.dataFields.categoryX = 'channelName';
    series1.name = 'Total Order';
    series1.tooltipText = '{name}: [bold]{valueY}[/]';
    series1.columns.template.fill = am4core.color('#1f78b4');
    series1.columns.template.stroke = am4core.color('#1f78b4');
    configureSeriesTooltip(series1);

    const series2 = chart.series.push(new am4charts.ColumnSeries());
    series2.dataFields.valueY = 'completedOrder';
    series2.dataFields.categoryX = 'channelName';
    series2.name = 'Completed Order';
    series2.tooltipText = '{name}: [bold]{valueY}[/]';
    series2.columns.template.fill = am4core.color('#33a02c');
    series2.columns.template.stroke = am4core.color('#33a02c');
    configureSeriesTooltip(series2);

    const series3 = chart.series.push(new am4charts.ColumnSeries());
    series3.dataFields.valueY = 'invoiceOrder';
    series3.dataFields.categoryX = 'channelName';
    series3.name = 'Invoice Order';
    series3.tooltipText = '{name}: [bold]{valueY}[/]';
    series3.columns.template.fill = am4core.color('#6a3d9a');
    series3.columns.template.stroke = am4core.color('#6a3d9a');
    configureSeriesTooltip(series3);

    const series4 = chart.series.push(new am4charts.ColumnSeries());
    series4.dataFields.valueY = 'cancelOrder';
    series4.dataFields.categoryX = 'channelName';
    series4.name = 'Cancel Order';
    series4.tooltipText = '{name}: [bold]{valueY}[/]';
    series4.columns.template.fill = am4core.color('#e31a1c');
    series4.columns.template.stroke = am4core.color('#e31a1c');
    configureSeriesTooltip(series4);

    chart.legend = new am4charts.Legend();
    const cursor = new am4charts.XYCursor();
    cursor.maxTooltipDistance = 0;
    chart.cursor = cursor;
    this.chart = chart;
  }

  initChannelOtifChart(dta: any[]) {
    if (dta && dta.length > 0) {
      const maxVal = Math.max(...dta.map(x => Number(x.otif) || 0));
      dta = dta.map(item => {
        let otifVal = item.otif;
        if (otifVal === undefined || otifVal === null) {
          otifVal = item.totalOrder ? (item.completedOrder / item.totalOrder) * 100 : 0;
        } else if (maxVal <= 1) {
          otifVal = otifVal * 100;
        }
        return {
          ...item,
          otif: Number(Number(otifVal).toFixed(2))
        };
      });
    }
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create('chartdiv_channel_otif', am4charts.XYChart);
    chart.data = dta || [];

    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'channelName';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.fontSize = 11;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = 'OTIF (%)';
    valueAxis.min = 0;
    valueAxis.max = 110;

    const series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = 'otif';
    series.dataFields.categoryX = 'channelName';
    series.name = 'OTIF (%)';
    series.tooltipText = 'OTIF: [bold]{valueY}%[/]';
    series.columns.template.tooltipText = 'OTIF: [bold]{valueY}%[/]';
    series.columns.template.fill = am4core.color('#ff7f00');
    series.columns.template.stroke = am4core.color('#ff7f00');
    series.tooltip.pointerOrientation = "vertical";
    series.tooltip.background.cornerRadius = 6;
    series.tooltip.background.strokeOpacity = 0.5;
    series.tooltip.background.fillOpacity = 0.95;
    series.tooltip.label.fontSize = 12;
    series.tooltip.label.padding(6, 10, 6, 10);

    const labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = '{valueY}%';
    labelBullet.label.dy = -10;
    labelBullet.label.fill = am4core.color('#000');
    labelBullet.label.fontSize = 10;

    chart.legend = new am4charts.Legend();
    const cursor = new am4charts.XYCursor();
    cursor.maxTooltipDistance = 0;
    chart.cursor = cursor;
    this.chart = chart;
  }

  public exportOtifData() {
    let form = this.filterForm.value;

    const selectedWarehouses = form?.warehouse_id || [];
    const warehouseIds = (selectedWarehouses && selectedWarehouses.length > 0)
      ? selectedWarehouses.map((w: any) => w.id || w)
      : (this.warehouseList || []).map((w: any) => w.id);

    const selectedChannels = form?.channel_code || [];
    const channelIds = (selectedChannels && selectedChannels.length > 0)
      ? selectedChannels.map((c: any) => c.id || c)
      : (this.allChannelList || []).map((c: any) => c.id || c);

    let body: any = {
      start_date: form.startdate,
      end_date: form.enddate,
      channel_id: channelIds,
      warehouse_id: warehouseIds
    };
    // pricing_status: this.sideFiltersForm.get('price_status').value
    // this.apiService.exportOtifDashboardData(body).subscribe(
    //     (result: any) => {
    //       if (result.status) {
    //         this.apiService.downloadFile(result.data.file_url,'csv');
    //       }
    //     }
    //   );

  }

  //  getData1() {
  //  // // console.log()
  //  this.apiService.getChartMontlyKpi({}).subscribe((data:any)=>{
  //    // // console.log(data,"kl472")
  //    this.chartData = JSON.parse(JSON.stringify(data))

  //   this.initChart1( this.chartData?.monthly);
  //   this.initChart2( this.chartData?.monthly);
  //   // this.initChart3();
  //   this.initChart4( this.chartData?.monthly);
  //  })
  // }
}

