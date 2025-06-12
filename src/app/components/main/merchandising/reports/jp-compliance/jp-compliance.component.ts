import { DataEditor } from 'src/app/services/data-editor.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MerchandisingService } from '../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CompDataServiceType } from 'src/app/services/constants';
import { MatSort } from '@angular/material/sort';
import { ReportService } from '../report.service';
@Component({
  selector: 'app-jp-compliance',
  templateUrl: './jp-compliance.component.html',
  styleUrls: ['./jp-compliance.component.scss']
})
export class JpComplianceComponent implements OnInit {

  selectedColumnFilter: string;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  // public displayedColumns = ['date', 'merchandiserCode', 'merchandiserName', 'journeyPlan', 'planedJourney', 'totalJourney', 'journeyPlanPercent', 'unPlanedJourney', 'unPlanedJourneyPercent'];
  public domain = window.location.host;

  columns = [

  ]
  displayedColumns = [];

  dateFilterControl: FormControl;

  filterForm: FormGroup;
  constructor(public fb: FormBuilder, private merService: ReportService, public dataEditor: DataEditor) {
    if (this.domain.split('.')[0] == 'presales-prodmobiato') {
      this.columns.push(
        { title: 'Date', columnDef: 'date', isFilter: true },
        { title: 'Salesman Code', columnDef: 'merchandiser_code', isFilter: true },
        { title: 'Salesman Name', columnDef: 'merchandiser_name', isFilter: true },
        { title: 'Total Actual Visits', columnDef: 'actual_visite', isFilter: false },
        { title: 'JP Compliance% (Planned)', columnDef: 'percentage', isFilter: false },
        { title: 'Planed Visits', columnDef: 'planned_count', isFilter: false });
    } else {
      this.columns.push(
        { title: 'Date', columnDef: 'date', isFilter: true },
        { title: 'Merchandiser Code', columnDef: 'merchandiserCode', isFilter: true },
        { title: 'Merchandiser Name', columnDef: 'merchandiserName', isFilter: true },
        { title: 'Journey Plan', columnDef: 'journeyPlan', isFilter: false },
        { title: 'JP Compliance% (Planned)', columnDef: 'journeyPlanPercent', isFilter: false },
        { title: 'Planed Visits', columnDef: 'planedJourney', isFilter: false },
        { title: 'Total Actual Visits', columnDef: 'totalJourney', isFilter: false },
        { title: 'Unplaned Visits', columnDef: 'unPlanedJourney', isFilter: false },
        { title: 'JP Compliance% (Unplanned)', columnDef: 'unPlanedJourneyPercent', isFilter: false });
    }
    this.displayedColumns = this.columns.map(c => c.columnDef);
    this.itemSource = new MatTableDataSource<any>();
  }

  data = [];
  requset;
  ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      salesman_name: [''],
      salesman_code: [''],
    });
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.REPORT_DATA) {

          this.data = value.data;

          this.requset = value.request;
          this.updateTableData(this.data);
        }
      })
    );
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    } else {
      this.filterForm.patchValue({
        page: 1,
        page_size: 10
      });
    }
    this.filterData();
  }
  filterData() {
    let body = this.filterForm.value;
    Object.assign(body, this.requset);
    this.merService.getReportData(body).subscribe((res) => {
      if (res?.status == true) {
        this.dataEditor.sendData({
          type: CompDataServiceType.REPORT_DATA,
          request: this.requset,
          data: res.data,
        });
      }
    });
  }
  updateTableData(data = []) {
    let newData = data.length > 0 ? data : this.data;
    this.itemSource = new MatTableDataSource<any>(newData);
    this.itemSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

}
