import { Component, OnInit, OnChanges, Input, ViewChild, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { MerchandisingService } from '../../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-survey-list',
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.scss']
})
export class SurveyListComponent implements OnInit {
  @Output() public surveyHandler: EventEmitter<any> = new EventEmitter<any>();
  @Input() public surveyData;
  @Input() public distribution_id;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public survey_id;
  public surveyView = 1;
  selectedColumnFilter: string;
  filterForm: FormGroup;
  public displayedColumns = ['created_at', 'name', 'start_date', 'end_date', 'actions'];
  dateFilterControl: FormControl;
  constructor(public fb: FormBuilder, private merService: MerchandisingService) {
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    let today = new Date();
    let month = '' + (today.getMonth() + 1);
    let date = '' + (today.getDate());
    if ((today.getMonth() + 1) < 10) {
      month = '0' + (today.getMonth() + 1);
    }
    if ((today.getDate()) < 10) {
      date = '0' + (today.getDate());
    }
    let newdate = today.getFullYear() + '-' + month + '-' + date;
    this.dateFilterControl = new FormControl(newdate);
    this.filterForm = this.fb.group({
      distribution_id: [this.distribution_id],
      date: [''],
      name: [''],
      start_date: [''],
      end_date: [''],
      today: [newdate],
      all: false
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.surveyData) {
        let currentValue = changes.surveyData.currentValue;
        this.surveyData = currentValue;
        this.itemSource = new MatTableDataSource<any>(this.surveyData);
        this.itemSource.paginator = this.paginator;
      }
    }
    this.surveyView = 1;
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    }
    this.filterData();
  }
  getSurveyList(filter, value) {
    if (filter == "date") {
      value = this.dateFilterControl.value;
      this.filterForm.get('all').setValue(false);
    }
    if (value == "") return false;
    this.filterForm.get(filter).setValue(value);
    this.filterForm.get('distribution_id').setValue(this.distribution_id);
    this.filterData();
  }
  filterData() {
    this.subscriptions.push(
      this.merService.getShelfDisplaySurveyList(this.filterForm.value).subscribe((res) => {
        this.itemSource = new MatTableDataSource<any>(res.data);
      })
    )
  }

  editSruvey(data) {
    data.actionType = 'edit';
    this.surveyHandler.emit(data);
  }

  ngAfterViewInit() {
    this.itemSource.paginator = this.paginator;
  }

  showSurveyPostList(data) {
    this.survey_id = data.id;
    data.actionType = 'post_list';
    this.surveyHandler.emit(data);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  openSurveyDetailView(data) {
    data.actionType = 'preview';
    this.surveyHandler.emit(data);
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

}
