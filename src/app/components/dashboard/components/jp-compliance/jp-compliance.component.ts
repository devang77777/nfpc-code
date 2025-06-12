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
  selector: 'app-jp-compliance',
  templateUrl: './jp-compliance.component.html',
  styleUrls: ['./jp-compliance.component.scss']
})
export class JpComplianceComponent implements OnInit, AfterViewInit {
  private chart: am4charts.XYChart;
  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  activeDayIsOpen: boolean = true;
  dashboardData: any = {
    "coverage": [],
    "activeOutlets": [],
    "routeCompliance": [],
    "visitFrequency": [],
    "sos": [],
    "outofstock": []
  };
  trendData = [];
  comparisonData = [];
  contributionData = [];
  trendChart: any;
  comparisonChart: any;
  contriutionChart: any;
  selectedData: any;
  dataSource2: any;
  brandList = [];
  categoryList = [];
  itemList = [];
  selected = 'routeCompliance';
  selectedChart = "";
  openDetailType = "";
  filterControl: FormControl;
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
    "Merchandiser"
  ];
  dataTypes = [
    "coverage",
    "activeOutlets",
    "routeCompliance",
    "visitFrequency",
    "sos",
    "outofstock"
  ]
  nsmList = [];
  asmList = [];
  channelList = [];
  regionList = [];
  merchandiserList = [];
  supervisorList = [];
  private subscriptions: Subscription[] = [];
  dialogRef: any;
  isOpened = false;
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  constructor(
    private service: DashboardService,
    private apiService: ApiService,
    private zone: NgZone,
    private fds: FormDrawerService,
    public fb: FormBuilder,
    public _matDialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId
  ) { }

  public ngOnInit(): void {
    this.filterControl = new FormControl('routeCompliance');
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
      salesman: [[]],
      category: [[]],
      item: [[]],
      brand: [[]],
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
      "end_date": "",
      "type": "",
      "main_type": ""
    };
    // this.dataTypes.forEach((item, index) =>{
    body.type = 'routeCompliance';
    body.main_type = 'list';
    this.subscriptions.push(
      this.service.getDashboard4FiltersData(body).subscribe((dahsboard) => {

        this.dashboardData['routeCompliance'] = dahsboard.dashboardData.data;
        this.sortRouteComplianceData();
        this.dashboardData['routeCompliance'].details.reverse();
        this.getChartsData('routeCompliance');
      })
    )
    // })
    this.subscriptions.push(
      this.service.getMasterList().subscribe((res) => {
        this.brandList = res.masterData.data.brand_list;
        this.itemList = res.masterData.data.items;
        this.categoryList = res.masterData.data.item_major_category;
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
      })
    )
    var data = [];
    var visits = 10;
    var i = 0;


    // for (i = 0; i <= 30; i++) {
    //   visits -= Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
    //   data.push({ date: new Date().setSeconds(i - 30), value: visits });
    // }

    this.trendData = data;
    this.comparisonData = [];
    this.contributionData = [];

  }

  changeFilterType(type) {
  }

  public categoryProvider(): Observable<any[]> {
    return this.apiService
      .getAllMajorCategorires()
      .pipe(map((result) => result.data));
  }
  public categorySelected(data: any): void {
    this.filterForm.controls['category'].setValue(data.id);
    this.applyFilter();
  }

  patchFilters(dashFilter) {
    this.filterForm.patchValue({
      startdate: dashFilter?.startdate,
      enddate: dashFilter?.enddate,
      type: dashFilter?.type,
      nsm: dashFilter?.nsm,
      asm: dashFilter?.asm,
      channel: dashFilter?.channel,
      region: dashFilter?.region,
      regionalManager: dashFilter?.regionalManager,
      areaManager: dashFilter?.areaManager,
      salesman: dashFilter?.salesman,
      supervisor: dashFilter?.supervisor,
    })
    // this.applyFilter();
  }

  applyFilter() {
    let form = this.filterForm.value;
    let filterObj = {
      start_date: form.startdate,
      end_date: form.enddate,
      category: form.category
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
    let brand = [];
    form.brand.forEach(element => {
      brand.push(element.id);
    });
    filterObj['brand'] = brand[0];

    let item = [];
    form.item.forEach(element => {
      item.push(element.id);
    });
    filterObj['item'] = item[0];
    filterObj['type'] = 'routeCompliance';
    // if (this.filterControl.value == 'sos' || this.filterControl.value == 'outofstock') {
    //   this.getDataFromDashboard2(filterObj);
    // } else {
    //   this.getData(filterObj);
    // }
    this.getData(filterObj);

  }
  getData(filterObj) {
    // this.dataTypes.forEach((item, index) => {
    filterObj.type = 'routeCompliance';
    filterObj.main_type = "list";
    this.service.getDashboard4DataByFilter(filterObj).subscribe((res) => {
      this.dashboardData['routeCompliance'] = res.data;
      this.sortRouteComplianceData();
      this.dashboardData['routeCompliance'].details.reverse();
      this.getChartsData(this.selected);
    })
    // })
  }

  sortRouteComplianceData() {
    this.dashboardData['routeCompliance'].details = this.dashboardData['routeCompliance'].details.sort((a, b) => {
      return Number(a.EXECUTION) - Number(b.EXECUTION);
    });
  }

  // getDataFromDashboard2(filterObj) {
  //   this.service.getDashboard2DataByFilter(filterObj).subscribe((res) => {
  //     this.dashboardData[this.filterControl.value] = res.data;
  //     this.getChartsData(this.selected);
  //   })
  // }

  // openDetail(item) {
  //   console.log(item);
  //   this.isOpened = !this.isOpened;
  //   this.selected = item;
  //   this.getChartsData(item);
  // }

  getChartsData(label) {
    if (!this.isOpened) {
      this.selected = label;
    }
    const selected = this.dashboardData[label];
    // if(selected == 'sos' || selected == 'outofstock'){
    this.filterControl.setValue(label);
    // }
    if (selected) {
      this.selectedData = JSON.parse(JSON.stringify(selected));
      let trends = [];
      selected?.trends?.forEach(element => {
        // trends.push({ date: (new Date(element.date).getTime()), value: element.value });
        trends.push({ date: (element.date ? element.date.split(' ')[0] : ''), value: element?.value });
      });
      this.trendChart.data = trends;
      this.comparisonChart.data = selected.comparison;
      this.contriutionChart.data = selected.contribution;
      this.detailsTable = selected.details;
    }
  }
  toggle(item) {
    this.selected = item;
    this.getChartsData(item);
  }

  openChartDetail(label) {
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
      this.initChart1();
      this.initChart2();
      this.initChart3();
    });
  }

  initChart1() {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create('chartdiv11444', am4charts.XYChart);
    chart.hiddenState.properties.opacity = 0;

    chart.padding(0, 0, 0, 0);

    chart.zoomOutButton.disabled = false;

    chart.data = this.trendData;
    chart.logo.height = -150000000;
    chart.logo.disabled = true;
    chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.tooltip.disabled = true;
    dateAxis.renderer.grid.template.location = 0;
    // dateAxis.renderer.minGridDistance = 30;
    dateAxis.dateFormatter = new am4core.DateFormatter();
    dateAxis.dateFormatter.dateFormat = "MMM-dd";
    dateAxis.dateFormats.setKey('day', 'MMM-dd');
    // dateAxis.dateFormats.setKey('second', 'ss');
    // dateAxis.periodChangeDateFormats.setKey('second', '[bold]h:mm a');
    // dateAxis.periodChangeDateFormats.setKey('minute', '[bold]h:mm a');
    // dateAxis.periodChangeDateFormats.setKey('hour', '[bold]h:mm a');
    dateAxis.renderer.inside = true;
    dateAxis.renderer.axisFills.template.disabled = true;
    dateAxis.renderer.ticks.template.disabled = true;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;
    valueAxis.interpolationDuration = 500;
    valueAxis.rangeChangeDuration = 500;
    valueAxis.renderer.inside = true;
    valueAxis.renderer.minLabelPosition = 0.05;
    valueAxis.renderer.maxLabelPosition = 0.95;
    valueAxis.renderer.axisFills.template.disabled = true;
    valueAxis.renderer.ticks.template.disabled = true;

    var series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = 'date';
    series.dataFields.valueY = 'value';
    series.interpolationDuration = 500;
    series.defaultState.transitionDuration = 0;
    series.tensionX = 0.8;
    series.strokeWidth = 1;

    //series.stroke = am4core.color("#f0");
    series.fill = series.stroke;
    series.fillOpacity = .75;
    series.tooltipText = "Date: [bold]{dateX}[/]\n value: [bold]{valueY}[/]";
    series.tooltip.getFillFromObject = false;
    series.tooltip.background.fill = am4core.color("#67b7db");
    series.tooltip.dy = -6;
    chart.cursor = new am4charts.XYCursor();
    chart.events.on('datavalidated', function () {
      dateAxis.zoom({ start: 1 / 15, end: 1.2 }, false, true);
    });

    dateAxis.interpolationDuration = 500;
    dateAxis.rangeChangeDuration = 500;

    // all the below is optional, makes some fancy effects
    // gradient fill of the series
    series.fillOpacity = 1;
    var gradient = new am4core.LinearGradient();
    gradient.addColor(chart.colors.getIndex(0), 0.2);
    gradient.addColor(chart.colors.getIndex(0), 0);
    series.fill = gradient;

    // this makes date axis labels to fade out
    dateAxis.renderer.labels.template.adapter.add('fillOpacity', function (
      fillOpacity,
      target
    ) {
      var dataItem = target.dataItem;
      return dataItem.position;
    });

    // need to set this, otherwise fillOpacity is not changed and not set
    dateAxis.events.on('validated', function () {
      am4core.iter.each(dateAxis.renderer.labels.iterator(), function (label) {
        label.fillOpacity = label.fillOpacity;
      });
    });

    // this makes date axis labels which are at equal minutes to be rotated
    dateAxis.renderer.labels.template.adapter.add('rotation', function (
      rotation,
      target
    ) {
      var dataItem = target.dataItem;
      if (
        dataItem['date'] &&
        dataItem['date'].getTime() ==
        am4core.time
          .round(new Date(dataItem['date'].getTime()), 'minute', 0)
          .getTime()
      ) {
        target.verticalCenter = 'middle';
        target.horizontalCenter = 'left';
        return -90;
      } else {
        target.verticalCenter = 'bottom';
        target.horizontalCenter = 'middle';
        return 0;
      }
    });

    // bullet at the front of the line
    // var bullet = series.createChild(am4charts.CircleBullet);
    var bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.circle.radius = 5;
    bullet.fillOpacity = 1;
    bullet.fill = chart.colors.getIndex(0);
    bullet.isMeasured = false;

    series.events.on('validated', function () {
      bullet.moveTo(series.dataItems?.last?.point);
      bullet.validatePosition();
    });
    this.trendChart = chart;
  }
  initChart2() {
    // Themes begin
    am4core.useTheme(moonrisekingdom);
    am4core.useTheme(am4themes_animated);
    // Themes end

    /**
     * Chart design taken from Samsung health app
     */

    var chart = am4core.create('chartdiv22444', am4charts.XYChart);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
    chart.logo.height = -150000000;
    chart.logo.disabled = true;
    chart.paddingBottom = 30;

    chart.data = this.comparisonData;

    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'name';
    categoryAxis.renderer.grid.template.strokeOpacity = 0;
    categoryAxis.renderer.minGridDistance = 10;
    categoryAxis.renderer.labels.template.dy = 35;
    categoryAxis.renderer.tooltip.dy = 35;
    //categoryAxis.renderer.labels.template.rotation = 340;

    let label = categoryAxis.renderer.labels.template;
    label.wrap = true;
    label.truncate = true;
    label.maxWidth = 40;


    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.inside = true;
    valueAxis.renderer.labels.template.fillOpacity = 0.3;
    valueAxis.renderer.grid.template.strokeOpacity = 0;
    valueAxis.min = 0;
    valueAxis.cursorTooltipEnabled = false;
    valueAxis.renderer.baseGrid.strokeOpacity = 0;

    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = 'steps';
    series.dataFields.categoryX = 'name';
    series.tooltipText = '{valueY.value}';
    series.tooltip.pointerOrientation = 'vertical';
    series.tooltip.dy = -6;
    series.columnsContainer.zIndex = 100;

    var columnTemplate = series.columns.template;
    columnTemplate.width = am4core.percent(20);
    columnTemplate.maxWidth = 66;
    columnTemplate.column.cornerRadius(30, 30, 10, 10);
    columnTemplate.strokeOpacity = 0;

    series.heatRules.push({
      target: columnTemplate,
      property: 'fill',
      dataField: 'valueY',
      min: am4core.color('#e5dc36'),
      max: am4core.color('#5faa46'),
    });
    series.mainContainer.mask = undefined;

    var cursor = new am4charts.XYCursor();
    chart.cursor = cursor;
    cursor.lineX.disabled = true;
    cursor.lineY.disabled = true;
    cursor.behavior = 'none';

    var previousBullet;
    chart.cursor.events.on('cursorpositionchanged', function (event) {
      var dataItem = series.tooltipDataItem;

      if (dataItem['column']) {
        var bullet = dataItem['column'].children.getIndex(1);

        if (previousBullet && previousBullet != bullet) {
          previousBullet.isHover = false;
        }

        if (previousBullet != bullet) {
          var hs = bullet.states.getKey('hover');
          hs.properties.dy = -bullet.parent.pixelHeight + 30;
          bullet.isHover = true;

          previousBullet = bullet;
        }
      }
    });
    this.comparisonChart = chart;
  }
  initChart3() {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create('chartdiv33444', am4charts.RadarChart);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
    chart.innerRadius = am4core.percent(50);
    chart.startAngle = -80;
    chart.endAngle = 260;
    chart.logo.height = -150000000;
    chart.logo.disabled = true;
    chart.data = this.contributionData;

    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis() as any);
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields['category'] = 'name';
    categoryAxis.renderer.labels.template.location = 0.5;
    categoryAxis.renderer.grid.template.strokeOpacity = 0.08;
    categoryAxis.renderer.tooltipLocation = 0.5;
    categoryAxis.tooltip.disabled = true;
    let label = categoryAxis.renderer.labels.template;
    label.wrap = true;
    label.truncate = true;
    label.maxWidth = 30;
    label.bent = true;
    label.padding(0, 0, 0, 0);
    label.radius = 7;



    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis() as any);
    valueAxis.min = 0;
    valueAxis.max = 24000;
    valueAxis.strictMinMax = true;
    valueAxis.renderer.minGridDistance = 30;
    valueAxis.renderer.grid.template.strokeOpacity = 0.08;
    valueAxis.tooltip.disabled = true;

    // axis break
    var axisBreak = valueAxis.axisBreaks.create();
    axisBreak.startValue = 2100;
    axisBreak.endValue = 22900;
    axisBreak.breakSize = 0.02;

    // make break expand on hover
    var hoverState = axisBreak.states.create('hover');
    hoverState.properties.breakSize = 1;
    hoverState.properties.opacity = 0.1;
    hoverState.transitionDuration = 1500;

    axisBreak.defaultState.transitionDuration = 1000;

    var series = chart.series.push(new am4charts.RadarColumnSeries());
    series.dataFields.categoryX = 'name';
    series.dataFields.valueY = 'steps';
    series.columns.template.tooltipText = 'Name: [bold]{categoryX}[/]\n value: [bold]{valueY.value}[/]';
    series.columns.template.tooltipY = 0;
    series.columns.template.strokeOpacity = 0;

    chart.seriesContainer.zIndex = -1;

    // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
    series.columns.template.adapter.add('fill', function (fill, target) {
      return chart.colors.getIndex(target.dataItem.index);
    });

    let cursor = new am4charts.RadarCursor();
    cursor.innerRadius = am4core.percent(50);
    cursor.lineY.disabled = true;

    cursor.xAxis = categoryAxis;
    chart.cursor = cursor;
    this.contriutionChart = chart;
  }

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

  dataShowOrNot(){
    if(this.dashboardData['routeCompliance'].length > 0 || Object.keys(this.dashboardData['routeCompliance']).length > 0){
      return true;
    }
    else{
      return false;
    }
  }
}
