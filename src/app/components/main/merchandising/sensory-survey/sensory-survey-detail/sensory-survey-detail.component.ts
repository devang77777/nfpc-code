import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { MerchandisingService } from '../../merchandising.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { Survey } from '../survey-interface';
import { BaseComponent } from 'src/app/features/shared/base/base.component';

@Component({
  selector: 'app-sensory-survey-detail',
  templateUrl: './sensory-survey-detail.component.html',
  styleUrls: ['./sensory-survey-detail.component.scss']
})
export class SensorySurveyDetailComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public Survey: Survey;
  @Input() public loadChnages;
  @Input() public isDetailVisible: boolean;
  private dataService: DataEditor;
  private deleteDialog: MatDialog;
  private formDrawer: FormDrawerService;
  private subscriptions: Subscription[] = [];
  public selectedTab = 0;
  surveyQAs = [];
  surveyPostData = [];
  editSurveyData = {};
  public preview = 1;
  public isEdit = false;
  currentDate: string;
  constructor(apiService: ApiService, public merService: MerchandisingService, deleteDialog: MatDialog, private cts: CommonToasterService, dataService: DataEditor, formDrawer: FormDrawerService) {
    super('Sensory Survey');
    Object.assign(this, { apiService, merService, deleteDialog, dataService, formDrawer });
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
    this.currentDate = today.getFullYear() + '-' + month + '-' + date;
  }



  public editSruvey(data): void {
    this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.Survey });
    this.formDrawer.setFormName('add-SensorySurvey');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.Survey) {
        let currentValue = changes.Survey.currentValue;
        this.Survey = currentValue;
        if (this.Survey) {
          this.selectedTabChange(this.selectedTab);
        }
      } else if (changes.loadChnages !== undefined) {
        if (this.selectedTab == 0) {
          this.selectedTabChange(this.selectedTab);
        }
      }
    }
  }

  changePreview(index) {
    if (this.isEdit == true && this.editSurveyData) {
      this.editSurveyData = {};
      this.isEdit = false;
      this.selectedTabChange(this.selectedTab);
    } else {
      this.closeDetailView();
    }
    this.preview = index;
  }

  public openDeleteBox(): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Survey ${this.Survey.name}` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteBank();
      }
    });
  }

  updateTableDataSurvey(data) {
    this.updateTableData.emit(data);
  }

  public deleteBank(): void {
    let delObj = { uuid: this.Survey.uuid, delete: true };
    this.merService.deleteSensorySurvey(this.Survey.uuid).subscribe(result => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully");

    });
  }

  surveyHandler(data) {
    if (data.actionType == 'edit') {
      this.Survey = data;
    } else if (data.actionType == 'qa-preview') {
      this.preview = 2;
      this.getSurveyQAs(data);
    }
  }

  getSurveyQAs(data) {
    this.subscriptions.push(
      this.merService.getSurveyQuestionAnswerList(data.id).subscribe((res) => {
        this.surveyQAs = res.data;
      })
    )
  }

  getSurveyPostList(data) {
    this.subscriptions.push(
      this.merService.getSurveyPostList(data.id, 'date', this.currentDate).subscribe((res) => {
        this.surveyPostData = res.data;
      })
    )
  }

  getSurveyQuestions(data) {
    this.subscriptions.push(
      this.merService.getSurveyQuestionList(data.id).subscribe(
        (res) => {
          this.surveyQAs = res.data;
        }
      )
    )
  }

  public closeDetailView(): void {
    this.selectedTab = 0;
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  selectedTabChange(index) {
    switch (index) {
      case 0:
        this.getSurveyQuestions(this.Survey);
        break;
      case 1:
        this.getSurveyPostList(this.Survey);
        break;
    }
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
}
