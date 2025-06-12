import {
  Component,
  Inject,
  Input,
  NgZone,
  OnInit,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as am4plugins_timeline from '@amcharts/amcharts4/plugins/timeline';
import { CalendarView } from 'angular-calendar';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-common-dashboard',
  templateUrl: './common-dashboard.component.html',
  styleUrls: ['./common-dashboard.component.scss'],
})
export class CommonDashboardComponent implements OnInit {
  private chart: am4charts.XYChart;
  viewDate: Date = new Date();
  @Input() dashboardIndex = 0;
  view: CalendarView = CalendarView.Month;
  activeDayIsOpen: boolean = true;
  dataSource2: any;
  constructor(
    private apiService: ApiService,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId
  ) { }

  public ngOnInit(): void {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      this.apiService.getOrganizaion().subscribe((result) => {
        const orgData = result.data;
        localStorage.setItem('organization', JSON.stringify(orgData));
        //localStorage.setItem('avatar_img', JSON.stringify(orgData.org_logo));
      });
    }
  }

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }
  ngAfterViewInit() {
    this.browserOnly(() => {
      this.initChart2();
      this.initChart3();
      this.initChart4();
      this.initChart5();
      this.initChart6();
      this.initChart7();
      this.initChart10();
    });
  }
  ngAfterViewChecked() {
    const rows = document.querySelectorAll('.cal-cell-row');
    const top = document.querySelectorAll('.cal-cell-top');
    const headers: any = document.querySelector('.cal-header')?.children;
    rows.forEach((item, key) => {
      if (key == 0) return;
      item['style'].height = '60px';
      Object.values(item.children).forEach((element) => {
        element['style'].minHeight = '60px';
      });
    });
    top.forEach((item, key) => {
      item['style'].minHeight = '60px';
    });
    if (headers) {
      Object.values(headers).forEach((item, key) => {
        const text =
          item['textContent'].length > 3
            ? item['textContent'].substring(1, 4)
            : item['textContent'];
        item['textContent'] = text;
      });
    }
  }

  initChart2() {
    am4core.useTheme(am4themes_animated);
    let chart = am4core.create('chartdiv2', am4charts.XYChart);

    chart.data = generateChartData();
    chart.logo.height = -150000000;
    chart.logo.disabled = true;
    // Create axes
    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

    // Create series
    let series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = 'visits';
    series.dataFields.dateX = 'date';
    series.strokeWidth = 1;
    series.minBulletDistance = 10;
    series.tooltipText = '{valueY}';
    series.fillOpacity = 0.1;
    series.tooltip.pointerOrientation = 'vertical';
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding(12, 12, 12, 12);

    let seriesRange = dateAxis.createSeriesRange(series);
    seriesRange.contents.strokeDasharray = '2,3';
    seriesRange.contents.stroke = chart.colors.getIndex(8);
    seriesRange.contents.strokeWidth = 1;

    let pattern = new am4core.LinePattern();
    pattern.rotation = -45;
    pattern.stroke = seriesRange.contents.stroke;
    pattern.width = 1000;
    pattern.height = 1000;
    pattern.gap = 6;
    seriesRange.contents.fill = pattern;
    seriesRange.contents.fillOpacity = 0.5;

    // Add scrollbar
    // chart.scrollbarX = new am4core.Scrollbar();

    function generateChartData() {
      let chartData = [];
      let firstDate = new Date();
      firstDate.setDate(firstDate.getDate() - 200);
      let visits = 1200;
      for (var i = 0; i < 200; i++) {
        // we create date objects here. In your data, you can have date strings
        // and then set format of your dates using chart.dataDateFormat property,
        // however when possible, use date objects, as this will speed up chart rendering.
        let newDate = new Date(firstDate);
        newDate.setDate(newDate.getDate() + i);

        visits += Math.round(
          (Math.random() < 0.5 ? 1 : -1) * Math.random() * 10
        );

        chartData.push({
          date: newDate,
          visits: visits,
        });
      }
      return chartData;
    }

    // add range
    let range = dateAxis.axisRanges.push(new am4charts.DateAxisDataItem());
    range.grid.stroke = chart.colors.getIndex(0);
    range.grid.strokeOpacity = 1;
    // range.bullet = new am4core.ResizeButton();
    // range.bullet['background'].fill = chart.colors.getIndex(0);
    // range.bullet['background'].states.copyFrom(
    //   chart.zoomOutButton.background.states
    // );
    // range.bullet.minX = 0;
    // range.bullet.adapter.add('minY', function (minY, target) {
    //   target.maxY = chart.plotContainer.maxHeight;
    //   target.maxX = chart.plotContainer.maxWidth;
    //   return chart.plotContainer.maxHeight;
    // });

    // range.bullet.events.on('dragged', function () {
    //   range.value = dateAxis.xToValue(range.bullet.pixelX);
    //   seriesRange.value = range.value;
    // });

    let firstTime = chart.data[0].date.getTime();
    let lastTime = chart.data[chart.data.length - 1].date.getTime();
    let date = new Date(firstTime + (lastTime - firstTime) / 2);

    range.date = date;

    seriesRange.date = date;
    seriesRange.endDate = chart.data[chart.data.length - 1].date;
  }
  initChart3() {
    /* Chart code */
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    let container = am4core.create('chartdiv3', am4core.Container);
    container.layout = 'grid';
    container.fixedWidthGrid = false;
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.logo.height = -150000000;
    container.logo.disabled = true;
    // Color set
    let colors = new am4core.ColorSet();

    // Functions that create various sparklines
    function createLine(title, data, color) {
      let chart = container.createChild(am4charts.XYChart);

      chart.width = am4core.percent(45);
      chart.height = 70;

      chart.data = data;

      chart.titles.template.fontSize = 10;
      // chart.titles.template['textAlign'] = 'left';
      chart.titles.template.isMeasured = false;
      chart.titles.create().text = title;

      chart.padding(20, 5, 2, 5);

      let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.disabled = true;
      dateAxis.renderer.labels.template.disabled = true;
      dateAxis.startLocation = 0.5;
      dateAxis.endLocation = 0.7;
      dateAxis.cursorTooltipEnabled = false;

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.renderer.grid.template.disabled = true;
      valueAxis.renderer.baseGrid.disabled = true;
      valueAxis.renderer.labels.template.disabled = true;
      valueAxis.cursorTooltipEnabled = false;

      chart.cursor = new am4charts.XYCursor();
      chart.cursor.lineY.disabled = true;
      chart.cursor.behavior = 'none';

      let series = chart.series.push(new am4charts.LineSeries());
      series.tooltipText = '{date}: [bold]{value}';
      series.dataFields.dateX = 'date';
      series.dataFields.valueY = 'value';
      series.tensionX = 0.8;
      series.strokeWidth = 2;
      series.stroke = color;

      // render data points as bullets
      let bullet = series.bullets.push(new am4charts.CircleBullet());
      bullet.circle.opacity = 0;
      bullet.circle.fill = color;
      bullet.circle.propertyFields.opacity = 'opacity';
      bullet.circle.radius = 3;

      return chart;
    }
    createLine(
      'AAPL (Price)',
      [
        { date: new Date(2018, 0, 1, 8, 0, 0), value: 10 },
        { date: new Date(2018, 0, 1, 9, 0, 0), value: 30 },
        { date: new Date(2018, 0, 1, 10, 0, 0), value: 80 },
        { date: new Date(2018, 0, 1, 11, 0, 0), value: 150 },
        { date: new Date(2018, 0, 1, 12, 0, 0), value: 200 },
        { date: new Date(2018, 0, 1, 13, 0, 0), value: 310 },
        { date: new Date(2018, 0, 1, 14, 0, 0), value: 420 },
        { date: new Date(2018, 0, 1, 15, 0, 0), value: 523 },
        { date: new Date(2018, 0, 1, 16, 0, 0), value: 650, opacity: 1 },
      ],
      colors.getIndex(0)
    );
    createLine(
      'MSFT (Price)',
      [
        { date: new Date(2018, 0, 1, 8, 0, 0), value: 22 },
        { date: new Date(2018, 0, 1, 9, 0, 0), value: 25 },
        { date: new Date(2018, 0, 1, 10, 0, 0), value: 40 },
        { date: new Date(2018, 0, 1, 11, 0, 0), value: 35 },
        { date: new Date(2018, 0, 1, 12, 0, 0), value: 29 },
        { date: new Date(2018, 0, 1, 13, 0, 0), value: 1 },
        { date: new Date(2018, 0, 1, 14, 0, 0), value: 15 },
        { date: new Date(2018, 0, 1, 15, 0, 0), value: 29 },
        { date: new Date(2018, 0, 1, 16, 0, 0), value: 33, opacity: 1 },
      ],
      colors.getIndex(1)
    );
  }
  initChart4() {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    var chart = am4core.create('chartdiv4', am4charts.RadarChart);

    // Add data
    chart.data = [
      {
        category: 'Research',
        value: 80,
        full: 100,
      },
      {
        category: 'Marketing',
        value: 35,
        full: 100,
      },
      {
        category: 'Distribution',
        value: 92,
        full: 100,
      },
    ];

    // Make chart not full circle
    chart.startAngle = -90;
    chart.endAngle = 180;
    chart.innerRadius = am4core.percent(10);

    // Set number format
    chart.numberFormatter.numberFormat = "#.#'%'";

    // Create axes
    var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis() as any);
    categoryAxis.dataFields['category'] = 'category';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.grid.template.strokeOpacity = 0;
    categoryAxis.renderer.labels.template.horizontalCenter = 'right';
    // categoryAxis.renderer.labels.template['fontWeight'] = 500;
    categoryAxis.renderer.labels.template.adapter.add('fill', function (
      fill,
      target
    ) {
      return target.dataItem.index >= 0
        ? chart.colors.getIndex(target.dataItem.index)
        : fill;
    });
    categoryAxis.renderer.minGridDistance = 2;

    var valueAxis = chart.xAxes.push(new am4charts.ValueAxis() as any);
    valueAxis.renderer.grid.template.strokeOpacity = 0;
    valueAxis['min'] = 0;
    valueAxis['max'] = 100;
    valueAxis['strictMinMax'] = true;

    // Create series
    var series1 = chart.series.push(new am4charts.RadarColumnSeries());
    series1.dataFields.valueX = 'full';
    series1.dataFields.categoryY = 'category';
    series1.clustered = false;
    series1.columns.template.fill = new am4core.InterfaceColorSet().getFor(
      'alternativeBackground'
    );
    series1.columns.template.fillOpacity = 0.08;
    series1.columns.template['cornerRadiusTopLeft'] = 10;
    series1.columns.template.strokeWidth = 0;
    series1.columns.template.radarColumn.cornerRadius = 10;

    var series2 = chart.series.push(new am4charts.RadarColumnSeries());
    series2.dataFields.valueX = 'value';
    series2.dataFields.categoryY = 'category';
    series2.clustered = false;
    series2.columns.template.strokeWidth = 0;
    series2.columns.template.tooltipText = '{category}: [bold]{value}[/]';
    series2.columns.template.radarColumn.cornerRadius = 10;

    series2.columns.template.adapter.add('fill', function (fill, target) {
      return chart.colors.getIndex(target.dataItem.index);
    });

    chart.logo.height = -150000000;
    chart.logo.disabled = true;
    // Add cursor
    chart.cursor = new am4charts.RadarCursor();
    this.chart = chart;
  }
  initChart5() {
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create('chartdiv5', am4charts.XYChart);

    chart.paddingRight = 20;

    chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

    chart.data = [
      {
        country: 'One',
        value: 3025,
      },
      {
        country: 'Two',
        value: 1882,
      },
      {
        country: 'Three',
        value: 1809,
      },
      {
        country: 'Four',
        value: 1322,
      },
      {
        country: 'Five',
        value: 1122,
      },
      {
        country: 'Six',
        value: 1114,
      },
      {
        country: 'Seven',
        value: 984,
      },
      {
        country: 'Eight',
        value: 711,
      },
      {
        country: 'Nine',
        value: 665,
      },
      {
        country: 'Ten',
        value: 580,
      },
      {
        country: 'Eleven',
        value: 443,
      },
      {
        country: 'Twelve',
        value: 441,
      },
    ];
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = 'country';
    categoryAxis.renderer.minGridDistance = 40;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

    var series = chart.series.push(new am4charts.CurvedColumnSeries());
    series.dataFields.categoryX = 'country';
    series.dataFields.valueY = 'value';
    series.tooltipText = '{valueY.value}';
    series.columns.template.strokeOpacity = 0;
    series.columns.template.tension = 1;

    series.columns.template.fillOpacity = 0.75;

    var hoverState = series.columns.template.states.create('hover');
    hoverState.properties.fillOpacity = 1;
    hoverState.properties.tension = 0.8;
    chart.logo.height = -150000000;
    chart.logo.disabled = true;
    chart.cursor = new am4charts.XYCursor();

    // Add distinctive colors for each column using adapter
    series.columns.template.adapter.add('fill', function (fill, target) {
      return chart.colors.getIndex(target.dataItem.index);
    });

    // chart.scrollbarX = new am4core.Scrollbar();
    // chart.scrollbarY = new am4core.Scrollbar();

    this.chart = chart;
  }
  initChart6() {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create('chartdiv6', am4charts.XYChart);
    chart.hiddenState.properties.opacity = 0;

    chart.padding(0, 0, 0, 0);

    chart.zoomOutButton.disabled = true;

    var data = [];
    var visits = 10;
    var i = 0;

    for (i = 0; i <= 30; i++) {
      visits -= Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
      data.push({ date: new Date().setSeconds(i - 30), value: visits });
    }

    chart.data = data;
    chart.logo.height = -150000000;
    chart.logo.disabled = true;
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.minGridDistance = 30;
    dateAxis.dateFormats.setKey('second', 'ss');
    dateAxis.periodChangeDateFormats.setKey('second', '[bold]h:mm a');
    dateAxis.periodChangeDateFormats.setKey('minute', '[bold]h:mm a');
    dateAxis.periodChangeDateFormats.setKey('hour', '[bold]h:mm a');
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
    var bullet = series.createChild(am4charts.CircleBullet);
    bullet.circle.radius = 5;
    bullet.fillOpacity = 1;
    bullet.fill = chart.colors.getIndex(0);
    bullet.isMeasured = false;

    series.events.on('validated', function () {
      bullet.moveTo(series.dataItems.last.point);
      bullet.validatePosition();
    });
  }
  initChart7() {
    /* Chart code */
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    let chart = am4core.create('chartdiv7', am4plugins_timeline.CurveChart);
    chart['curveContainer'].padding(0, 100, 0, 120);
    chart['maskBullets'] = false;

    chart['data'] = [
      {
        category: '',
        year: '1990',
        size: 13,
        text: 'Lorem ipsum',
      },
      {
        category: '',
        year: '1995',
        size: 5,
        text: 'Sit amet',
      },
      {
        category: '',
        year: '2000',
        size: 9,
        text: 'Lorem ipsum',
      },
      {
        category: '',
        year: '2005',
        size: 12,
        text: 'Lorem ipsum',
      },
      {
        category: '',
        year: '2010',
        size: 3,
        text: 'Lorem ipsum',
      },
      {
        category: '',
        year: '2015',
        size: 9,
        text: 'Lorem ipsum',
      },
    ];

    chart.dateFormatter.inputDateFormat = 'yyyy';

    chart['fontSize'] = 11;
    chart.tooltipContainer.fontSize = 11;

    let categoryAxis = chart['yAxes'].push(new am4charts.CategoryAxis() as any);
    categoryAxis.dataFields.category = 'category';
    categoryAxis.renderer.grid.template.disabled = true;

    let dateAxis = chart['xAxes'].push(new am4charts.DateAxis() as any);
    dateAxis.renderer.points = [
      { x: -400, y: 0 },
      { x: 0, y: 50 },
      { x: 400, y: 0 },
    ];
    dateAxis.renderer.polyspline.tensionX = 0.8;
    dateAxis.renderer.grid.template.disabled = true;
    dateAxis.renderer.line.strokeDasharray = '1,4';
    dateAxis['baseInterval'] = { period: 'day', count: 1 }; // otherwise initial animation will be not smooth

    dateAxis.renderer.labels.template.disabled = true;

    let series = chart['series'].push(
      new am4plugins_timeline.CurveLineSeries()
    );
    series.strokeOpacity = 0;
    series.dataFields.dateX = 'year';
    series.dataFields.categoryY = 'category';
    series.dataFields.value = 'size';
    series.baseAxis = categoryAxis;

    let interfaceColors = new am4core.InterfaceColorSet();

    series.tooltip.pointerOrientation = 'down';

    let distance = 100;
    let angle = 60;

    let bullet = series.bullets.push(new am4charts.Bullet());

    let line = bullet.createChild(am4core.Line);
    line.adapter.add('stroke', function (fill, target) {
      if (target.dataItem) {
        return chart['colors'].getIndex(target.dataItem.index);
      }
    });

    line.x1 = 0;
    line.y1 = 0;
    line.y2 = 0;
    line.x2 = distance - 10;
    line.strokeDasharray = '1,3';

    let circle = bullet.createChild(am4core.Circle);
    circle.radius = 30;
    circle.fillOpacity = 1;
    circle.strokeOpacity = 0;

    let circleHoverState = circle.states.create('hover');
    circleHoverState.properties.scale = 1.3;

    series.heatRules.push({
      target: circle,
      min: 20,
      max: 50,
      property: 'radius',
    });
    circle.adapter.add('fill', function (fill, target) {
      if (target.dataItem) {
        return chart['colors'].getIndex(target.dataItem.index);
      }
    });
    circle.tooltipText = '{text}: {value}';
    circle.adapter.add('tooltipY', function (tooltipY, target) {
      return -target.pixelRadius - 4;
    });

    let yearLabel = bullet.createChild(am4core.Label);
    yearLabel.text = '{year}';
    yearLabel.strokeOpacity = 0;
    yearLabel.fill = am4core.color('#fff');
    yearLabel.horizontalCenter = 'middle';
    yearLabel.verticalCenter = 'middle';
    yearLabel.interactionsEnabled = false;

    let label = bullet.createChild(am4core.Label);
    label.propertyFields.text = 'text';
    label.strokeOpacity = 0;
    label.horizontalCenter = 'right';
    label.verticalCenter = 'middle';

    label.adapter.add('opacity', function (opacity, target) {
      if (target.dataItem) {
        let index = target.dataItem.index;
        let line = target.parent.children.getIndex(0);

        if (index % 2 == 0) {
          target.y = -distance * am4core.math.sin(-angle);
          target.x = -distance * am4core.math.cos(-angle);
          line.rotation = -angle - 180;
          target.rotation = -angle;
        } else {
          target.y = -distance * am4core.math.sin(angle);
          target.x = -distance * am4core.math.cos(angle);
          line.rotation = angle - 180;
          target.rotation = angle;
        }
      }
      return 1;
    });

    let outerCircle = bullet.createChild(am4core.Circle);
    outerCircle.radius = 30;
    outerCircle.fillOpacity = 0;
    outerCircle.strokeOpacity = 0;
    outerCircle.strokeDasharray = '1,3';

    let hoverState = outerCircle.states.create('hover');
    hoverState.properties.strokeOpacity = 0.8;
    hoverState.properties.scale = 1.5;

    outerCircle.events.on('over', function (event) {
      let circle = event.target.parent.children.getIndex(1);
      circle.isHover = true;
      event.target.stroke = circle.fill;
      event.target.radius = circle['pixelRadius'];
      event.target.animate(
        { property: 'rotation', from: 0, to: 360 },
        4000,
        am4core.ease.sinInOut
      );
    });

    // outerCircle.events.on('out', function (event) {
    //   let circle = event.target.parent.children.getIndex(1);
    //   circle.isHover = false;
    // });

    // chart['scrollbarX'] = new am4core.Scrollbar();
    // chart['scrollbarX'].opacity = 0.5;
    // chart['scrollbarX'].width = am4core.percent(50);
    // chart['scrollbarX'].align = 'center';
    chart.logo.height = -150000000;
    chart.logo.disabled = true;
  }
  initChart10() {
    am4core.useTheme(am4themes_animated);
    var chart = am4core.create('chartdiv10', am4charts.XYChart);
    chart.paddingRight = 20;

    chart.data = this.generateChartData();

    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.baseInterval = {
      timeUnit: 'minute',
      count: 1,
    };
    dateAxis.tooltipDateFormat = 'HH:mm, d MMMM';

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;
    // valueAxis.title.text = 'Unique visitors';

    var series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = 'date';
    series.dataFields.valueY = 'visits';
    series.tooltipText = 'Visits: [bold]{valueY}[/]';
    series.fillOpacity = 0.3;

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineY.opacity = 0;
    // chart.scrollbarX = new am4charts.XYChartScrollbar();
    // chart.scrollbarX['series'].push(series);
    chart.logo.height = -150000000;
    chart.logo.disabled = true;
    dateAxis.start = 0.8;
    // dateAxis.keepSelection = true;
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
}
