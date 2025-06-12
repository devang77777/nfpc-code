
import { Component, Inject, Input, NgZone, OnInit, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import moonrisekingdom from '@amcharts/amcharts4/themes/animated';
// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { CalendarView } from 'angular-calendar';
import { FormBuilder, FormControl } from '@angular/forms';
import { DashboardService } from '../../dashboard.service';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-merchandising-dashboard2',
  templateUrl: './merchandising-dashboard2.component.html',
  styleUrls: ['./merchandising-dashboard2.component.scss']
})
export class MerchandisingDashboard2Component implements OnInit {
  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  activeDayIsOpen: boolean = true;
  dashboardData;
  trendData = [];
  comparisonData = [];
  contributionData = [];
  private subscriptions: Subscription[] = [];
  channelList = [];
  regionList = [];
  nsmList = [];
  asmList = [];
  selectedData: any;
  merchandiserList = [];
  brandList = [];
  categoryList = [];
  itemList = [];
  supervisorList = [];
  trendChart: any;

  detailsTable: any[]
  comparisonChart: any;
  contributionChart: any;
  filterForm;
  selected = 'coverage';
  filterControl: FormControl;
  tableConfig = [];
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

  merchanidisingFiltersList = [
    {
      id: 'coverage', title: 'Coverage'
    },
    {
      id: 'active-outlet', title: 'Active Outlet'
    },
    // {
    //   id: 'mustStock', title: 'Must Stock'
    // },
    {
      id: 'oos', title: 'Out Of Stock'
    },
    {
      id: 'sos', title: 'Share Of Shelf'
    },
    {
      id: 'shelf-price', title: 'Shelf Price'
    },
    {
      id: 'soa', title: 'Assortment'
    },
    {
      id: 'planogram', title: 'Planogram Compliance'
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId, private apiService: ApiService, private service: DashboardService, public fb: FormBuilder, private zone: NgZone,) { }

  public ngOnInit(): void {
    this.filterControl = new FormControl('coverage');
    this.tableConfig.push({ header: 'Merchandiser', key: 'RES' }, { header: 'Visits', key: 'VISITS' }, { header: 'Total Outlets', key: 'TOTAL_OUTLETS' }, { header: 'Coverage', key: 'EXECUTION' })
    this.getListData();
    this.filterControl.valueChanges.subscribe(
      item => {
        this.tableConfig = [];
        this.filterForm.patchValue({ category: null, brand: [], item: [] })
        switch (item) {
          case 'coverage':
            this.tableConfig.push({ header: this.filterForm.controls['selectType'].value, key: 'RES' }, { header: 'Visits', key: 'VISITS' }, { header: 'Total Outlets', key: 'TOTAL_OUTLETS' }, { header: 'Coverage', key: 'EXECUTION' })
            break;
          case 'active-outlet':
            this.tableConfig.push({ header: this.filterForm.controls['selectType'].value, key: 'RES' }, { header: 'Actual Outlets', key: 'VISITS' }, { header: 'Total Outlets', key: 'TOTAL_OUTLETS' }, { header: 'Active Outlets', key: 'EXECUTION' })
            break;
          case 'mustStock':
            this.tableConfig.push({ header: this.filterForm.controls['selectType'].value, key: 'Salesman' }, { header: 'Planned MS', key: 'plannedMs' }, { header: 'Actual MS', key: 'actualMs' }, { header: 'Must Sock', key: 'mustStock' })
            break;
          case 'soa':
            this.tableConfig.push({ header: this.filterForm.controls['selectType'].value, key: 'Salesman' }, { header: 'Planned As', key: 'Planned' }, { header: 'Actual As', key: 'Actual' }, { header: 'Assortment', key: 'percentage' })
            break;
          case 'shelf-price':
            this.tableConfig.push({ header: this.filterForm.controls['selectType'].value, key: 'Salesman' }, { header: 'Planned', key: 'planned' }, { header: 'Actual', key: 'actual' }, { header: 'Shelf Price', key: 'shelfPrice' })
            break;
          case 'sos':
            this.tableConfig.push({ header: this.filterForm.controls['selectType'].value, key: 'Salesman' }, { header: 'Planned SOS', key: 'Planned' }, { header: 'Actual SOS', key: 'Actual' }, { header: 'Share Of Shelf ', key: 'percentage' })
            break;
          case 'planogram':
            this.tableConfig.push({ header: this.filterForm.controls['selectType'].value, key: 'Salesman' }, { header: 'Planned', key: 'palned' }, { header: 'Actual', key: 'Actual' }, { header: 'Planogram ', key: 'total_planogram' })
            break;
          case 'oos':
            this.tableConfig.push({ header: this.filterForm.controls['selectType'].value, key: 'Salesman' }, { header: 'Planned', key: 'planned' }, { header: 'Actual', key: 'actual' }, { header: 'Out of stock ', key: 'percentage' })
            break;

          default:
            break;
        }
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
          "type": item
        };
        // this.getData(body);
        this.applyFilter();
      }
    )
    this.filterForm = this.fb.group({
      startdate: [''],
      enddate: [''],
      selectType: ['Merchandiser'],
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
  getListData() {
    let body = {
      "channel_ids": [],
      "supervisor": [],
      "regional_manager": [],
      "area_manager": [],
      "region_ids": [],
      "salesman_ids": [],
      "start_date": "",
      "end_date": "",
      "type": "coverage"
    };
    this.subscriptions.push(
      this.service.getDashboard2FiltersData(body).subscribe((res) => {
        this.dashboardData = res.dashboardData.data;
        this.getChartsData();
        this.nsmList = res.masterData.data.nsm;
        this.asmList = res.masterData.data.asm;
        this.filtersList = res.masterData.data.role;
        this.channelList = res.masterData.data.channel;
        this.brandList = res.masterData.data.brand_list;
        this.itemList = res.masterData.data.items;

        this.categoryList = res.masterData.data.item_major_category;
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
  }

  applyFilter() {
    let form = this.filterForm.value;
    let filterObj = {
      start_date: form.startdate,
      end_date: form.enddate,
      category: form.category
    };

    switch (form.selectType) {
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
    filterObj['type'] = this.filterControl.value;

    this.getData(filterObj);

  }
  getData(filterObj) {
    this.service.getDashboard2DataByFilter(filterObj).subscribe((res) => {
      if (res) {
        this.dashboardData = res.data;
        this.getChartsData();
      } else {
        this.trendChart.data = [];
        this.comparisonChart.data = [];
        this.contributionChart.data = []
        this.detailsTable = []
      }

    })
  }
  getChartsData() {

    if (this.dashboardData) {
      let trends = [];
      this.dashboardData.trends.forEach(element => {
        // trends.push({ date: (new Date(element.date).getTime()), value: element.value });
        trends.push({ date: element.date.split(' ')[0], value: element.value });
      });
      this.trendChart.data = trends;
      this.comparisonChart.data = this.dashboardData.comparison;
      this.contributionChart.data = this.dashboardData.contribution;
      this.detailsTable = this.dashboardData.details;
    } else {
      this.trendChart.data = [];
      this.comparisonChart.data = [];
      this.contributionChart.data = []
      this.detailsTable = []
    }
  }
  ngAfterViewInit() {
    this.browserOnly(() => {
      this.initChart1();
      this.initChart2();
      this.initChart3();
    });
  }
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  initChart1() {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create('chartdivs21', am4charts.XYChart);
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
    valueAxis.renderer.inside = false;
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
        dataItem['date']
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
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create('chartdivs22', am4charts.RadarChart);
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
    categoryAxis.renderer.labels.template.bent = true;
    categoryAxis.renderer.labels.template.padding(0, 0, 0, 0);
    categoryAxis.renderer.labels.template.radius = 7;

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
    series.columns.template.tooltipText = '{valueY.value}';
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
    this.contributionChart = chart;
  }
  initChart3() {
    // Themes begin
    am4core.useTheme(moonrisekingdom);
    am4core.useTheme(am4themes_animated);
    // Themes end

    /**
     * Chart design taken from Samsung health app
     */

    var chart = am4core.create('chartdivs23', am4charts.XYChart);
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
}
