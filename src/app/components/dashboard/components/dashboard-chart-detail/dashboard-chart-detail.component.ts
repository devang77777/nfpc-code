import { Component, EventEmitter, OnInit, Output, Input, Inject, OnChanges, PLATFORM_ID, NgZone, SimpleChanges } from '@angular/core';
import { Utils } from 'src/app/services/utils';
import { isPlatformBrowser } from '@angular/common';
import moonrisekingdom from '@amcharts/amcharts4/themes/animated';
// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { DashboardService } from '../../dashboard.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-dashboard-chart-detail',
  templateUrl: './dashboard-chart-detail.component.html',
  styleUrls: ['./dashboard-chart-detail.component.scss']
})
export class DashboardChartDetailComponent implements OnInit, OnChanges {
  @Output() public close: EventEmitter<any> = new EventEmitter<any>();
  @Input() public selectedData: any;
  @Input() public selectedChart: any;
  @Input() public selected: any;
  @Input() public labelBy: any;
  @Input() public openDetailType: any;
  trendData = [];
  dashboardData;
  comparisonData = [];
  contributionData = [];
  trendChart: any;
  comparisonChart: any;
  contriutionChart: any;
  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
    if (changes.openDetailType?.currentValue != changes.openDetailType?.previousValue) {
      setTimeout(() => {
        this.browserOnly(() => {
          if (this.selectedChart == 'line') {
            let trends = [];
            this.selectedData?.trends.forEach(element => {
              // trends.push({ date: (new Date(element.date).getTime()), value: element.value });
              trends.push({ date: element.date.split(' ')[0], value: element.value });
            });
            this.initChart1();
            this.trendChart.data = trends;
          } else if (this.selectedChart == 'bar') {
            this.initChart2();
            this.comparisonChart.data = this.selectedData?.comparison;
          } else if (this.selectedChart == 'pie') {
            this.initChart3();
            this.contriutionChart.data = this.selectedData?.contribution;
          }
        });
      }, 500);
    }

  }

  onClose() {
    this.openDetailType = null;
    this.selectedChart = null;
    this.close.emit(true);
  }

  checkChart(value) {
    return this.selectedChart == value ? true : false
  }

  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }
  // ngAfterViewInit() {
  //   // Chart code goes in here
  //   this.browserOnly(() => {
  //     this.initChart1();
  //     this.initChart2();
  //     this.initChart3();
  //   });
  // }

  initChart1() {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create('chartdivLine', am4charts.XYChart);
    chart.hiddenState.properties.opacity = 0;

    chart.padding(0, 0, 0, 0);

    chart.zoomOutButton.disabled = false;

    chart.data = this.trendData;
    chart.logo.height = -150000000;
    chart.logo.disabled = true;
    chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.tooltip.disabled = true;
    // dateAxis.renderer.grid.template.location = 0;
    dateAxis.dateFormatter = new am4core.DateFormatter();
    dateAxis.dateFormatter.dateFormat = "MMM-dd";
    dateAxis.dateFormats.setKey('day', 'MMM-dd');
    // dateAxis.renderer.minGridDistance = 30;
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

    var chart = am4core.create('chartdivBar', am4charts.XYChart);
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

    var chart = am4core.create('chartdivPie', am4charts.RadarChart);
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
    this.contriutionChart = chart;
  }

}
