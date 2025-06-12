import { Component, OnInit, OnChanges, Input, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { MerchandisingService } from '../../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-survey-post-list',
  templateUrl: './survey-post-list.component.html',
  styleUrls: ['./survey-post-list.component.scss']
})
export class SurveyPostListComponent implements OnInit {

  @Output() public surveyHandler: EventEmitter<any> = new EventEmitter<any>();
  @Input() public survey_id;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  @Input() public surveyPostData;
  public displayedColumns = ['created_at', 'salesman', 'customerCode', 'customer', 'actions'];
  dateFilterControl: FormControl;
  public surveyQAs;
  selectedColumnFilter: string;

  constructor(private merService: MerchandisingService) {
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
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.surveyPostData) {
        let currentValue = changes.surveyPostData.currentValue;
        this.surveyPostData = currentValue;
        this.itemSource = new MatTableDataSource<any>(this.surveyPostData);
        this.itemSource.paginator = this.paginator;
      }
    }
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }
  getSurveyPostList(filter, value) {
    if (filter == "date") {
      value = this.dateFilterControl.value;
    }
    if (value == "") return false;
    this.subscriptions.push(
      this.merService.getSurveyPostList(this.survey_id, filter, value).subscribe((res) => {
        this.itemSource = new MatTableDataSource<any>(res.data);
        this.itemSource.paginator = this.paginator;
      })
    )
  }

  showQAList(data) {
    data.actionType = 'qa-preview';
    this.surveyHandler.emit(data);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }
}
