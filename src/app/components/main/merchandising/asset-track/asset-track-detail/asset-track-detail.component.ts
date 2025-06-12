import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { AssetTrack } from '../asset-track-interface';
import { Lightbox } from 'ngx-lightbox';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { MerchandisingService } from '../../merchandising.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
@Component({
  selector: 'app-asset-track-detail',
  templateUrl: './asset-track-detail.component.html',
  styleUrls: ['./asset-track-detail.component.scss']
})
export class AssetTrackDetailComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public AssetTrack: AssetTrack | any;
  @Input() public isDetailVisible: boolean;
  private dataService: DataEditor;
  private deleteDialog: MatDialog;
  private formDrawer: FormDrawerService;
  private subscriptions: Subscription[] = [];
  images: any[];
  postList = [];
  public surveyData = [];
  public view = 1;
  selectedTab = 0;
  public surveyPostData;
  public selectedSurvey;
  editSurveyData: any;
  surveyQAs: any;
  currentDate = '';
  constructor(apiService: ApiService, private _lightbox: Lightbox, public merService: MerchandisingService, deleteDialog: MatDialog, private cts: CommonToasterService, dataService: DataEditor, formDrawer: FormDrawerService) {
    super('Asset Tracking');
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.selectedTabChange(this.selectedTab);
      if (changes.AssetTrack) {
        let currentValue = changes.AssetTrack.currentValue;
        this.AssetTrack = currentValue;
        let images = [];
        if (this.AssetTrack !== undefined && this.AssetTrack.image !== "") {
          images.push({
            src: this.AssetTrack?.image,
            caption: '',
            thumb: this.AssetTrack?.image
          });
          this.images = images;
        }
      }
    }
  }

  selectedTabChange(index) {
    switch (index) {
      case 1:
        this.getAssetTrackPostList();
        break;
      case 2:
        this.getSurveyList();
        break;
    }
  }

  getAssetTrackPostList() {
    let model = {
      asset_tracking_id: this.AssetTrack.id,
      date: '',
      salesman_name: '',
      all: false,
      today: this.currentDate,
    };
    this.subscriptions.push(
      this.merService.getAssetTrackPostList(model).subscribe((res) => {
        this.postList = res.data;
      })
    )
  }

  getSurveyList() {
    let model = {
      asset_tracking_id: this.AssetTrack.id,
      date: '',
      name: '',
      start_date: '',
      end_date: '',
      all: false,
      today: this.currentDate,
    };
    this.subscriptions.push(
      this.merService.getAssetTrackSurveyList(model).subscribe((res) => {
        this.surveyData = res.data;
      })
    )
  }

  public addSurvey(view = 1, action = '') {
    this.view = view;
    if (action == 'add') {
      this.editSurveyData = [];
    }
    if (this.view == 1) {
      this.selectedTab = 2;
      this.getSurveyList();
    }
  }

  surveyHandler(data) {
    if (data.actionType == 'edit') {
      this.editSurveyData = data;
      this.addSurvey(2);
    } else if (data.actionType == 'post_list') {
      this.getSurveyPostList(data);
    } else if (data.actionType == 'preview') {
      this.getSurveyQuestions(data);
    } else if (data.actionType == 'qa-preview') {
      this.getSurveyQAs(data);
    }
  }

  getSurveyPostList(data) {
    this.selectedSurvey = data;
    this.addSurvey(3);
    this.subscriptions.push(
      this.merService.getSurveyPostList(data.id, 'all', true).subscribe((res) => {
        this.surveyPostData = res.data;
      })
    )
  }

  getSurveyQuestions(data) {
    this.selectedSurvey = data;
    this.addSurvey(4);
    this.subscriptions.push(
      this.merService.getSurveyQuestionList(data.id).subscribe(
        (res) => {
          this.surveyQAs = res.data;
        }
      )
    )
  }

  getSurveyQAs(data) {
    this.selectedSurvey = data;
    this.addSurvey(5);
    this.subscriptions.push(
      this.merService.getSurveyQuestionAnswerList(data.id).subscribe((res) => {
        this.surveyQAs = res.data;
      })
    )
  }

  public openEditAssetTrack(): void {
    this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.AssetTrack });
    this.formDrawer.setFormName('add-AssetTrack');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  public openDeleteBox(): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Asset Track ${this.AssetTrack.title}` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteBank();
      }
    });
  }

  public deleteBank(): void {
    let delObj = { uuid: this.AssetTrack.uuid, delete: true };
    this.merService.deleteAssetTrack(this.AssetTrack.uuid).subscribe(result => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully");

    });
  }

  open(index: number): void {
    this._lightbox.open(this.images, index);
  }

  close(): void {
    this._lightbox.close();
  }

  public closeDetailView(): void {
    this.selectedTab = 0;
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
