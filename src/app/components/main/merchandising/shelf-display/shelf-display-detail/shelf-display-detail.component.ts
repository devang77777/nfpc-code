import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { MerchandisingService } from '../../merchandising.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { ShelfDisplay } from '../shelf-display-interface';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
@Component({
  selector: 'app-shelf-display-detail',
  templateUrl: './shelf-display-detail.component.html',
  styleUrls: ['./shelf-display-detail.component.scss']
})
export class ShelfDisplayDetailComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public ShelfDisplay: ShelfDisplay | any;
  @Input() public isDetailVisible: boolean;
  private dataService: DataEditor;
  private deleteDialog: MatDialog;
  private formDrawer: FormDrawerService;
  private subscriptions: Subscription[] = [];
  public stockData = [];
  public damageData = [];
  public imageData = [];
  public expiryData = [];
  public sosData = [];
  public surveyData = [];
  public view = 1;
  public selectedTab = 0;
  public surveyPostData;
  public selectedSurvey;
  editSurveyData: any;
  surveyQAs: any;
  currentDate: string;
  constructor(apiService: ApiService, public merService: MerchandisingService, deleteDialog: MatDialog, private cts: CommonToasterService, dataService: DataEditor, formDrawer: FormDrawerService) {
    super('Shelf Display');
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

  public openEditshelfdisplay(): void {
    this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.ShelfDisplay });
    this.formDrawer.setFormName('add-shelfdisplay');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.selectedTabChange(this.selectedTab);
    }
  }

  public addSurvey(view = 1, action = '') {
    this.view = view;
    if (action == 'add') {
      this.editSurveyData = [];
    }
    if (this.view == 1) {
      this.selectedTab = 6;
      this.getSurveyList();
    }
  }

  surveyHandler(data) {
    this.editSurveyData = data;
    if (data.actionType == 'edit') {
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
      this.merService.getSurveyPostList(data.id, 'date', this.currentDate).subscribe((res) => {
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

  public openDeleteBox(): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Shelf Display ${this.ShelfDisplay.name}` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteBank();
      }
    });
  }

  public deleteBank(): void {
    let delObj = { uuid: this.ShelfDisplay.uuid, delete: true };
    this.merService.deleteShelfDisplay(this.ShelfDisplay.uuid).subscribe(result => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully");

    });
  }

  public closeDetailView(): void {
    this.selectedTab = 0;
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  selectedTabChange(index) {

    switch (index) {
      case 2:
        this.getStockItemList();
        break;
      case 3:
        this.getDistributionImageList();
        break;
      case 4:
        this.getDamageItemList();
        break;
      case 5:
        this.getExpiryItemList();
        break;
      case 6:
        this.getSurveyList();
        break;
      case 7:
        this.getSosList();
        break;
    }
  }

  getExpiryItemList() {
    let model = {
      distribution_id: this.ShelfDisplay.id,
      date: '',
      salesman_name: '',
      item_name: '',
      item_code: '',
      customer_name: '',
      customer_code: '',
      distribution_name: '',
      today: this.currentDate,
      all: false
    };
    this.subscriptions.push(
      this.merService.getExpiryItemList(model).subscribe((res) => {
        this.expiryData = res.data;
      })
    )
  }

  getSosList() {
    let model = {
      distribution_id: this.ShelfDisplay.id,
      date: '',
      salesman_name: '',
      item_name: '',
      item_code: '',
      customer_name: '',
      customer_code: '',
      today: this.currentDate,
      all: false
    };
    this.subscriptions.push(
      this.merService.getSosList(model).subscribe((res) => {
        this.sosData = res.data;
      })
    )
  }

  getStockItemList() {
    let model = {
      distribution_id: this.ShelfDisplay.id,
      date: '',
      salesman_name: '',
      item_name: '',
      item_code: '',
      customer_name: '',
      customer_code: '',
      today: this.currentDate,
      all: false
    };
    this.subscriptions.push(
      this.merService.getStockItemList(model).subscribe((res) => {
        this.stockData = res.data;
      })
    )
  }

  getDamageItemList() {
    let model = {
      distribution_id: this.ShelfDisplay.id,
      date: '',
      salesman_name: '',
      item_name: '',
      item_code: '',
      customer_name: '',
      customer_code: '',
      distribution_name: '',
      today: this.currentDate,
      all: false
    };
    this.subscriptions.push(
      this.merService.getDamageItemList(model).subscribe((res) => {
        this.damageData = res.data;
      })
    )
  }

  getDistributionImageList() {
    let model = {
      distribution_id: this.ShelfDisplay.id,
      date: '',
      salesman_name: '',
      customer_name: '',
      customer_code: '',
      today: this.currentDate,
      all: false
    };
    this.subscriptions.push(
      this.merService.getDistributionImageList(model).subscribe((res) => {
        this.imageData = res.data;
      })
    )
  }

  getSurveyList() {
    let model = {
      distribution_id: this.ShelfDisplay.id,
      date: '',
      start_date: '',
      end_Date: '',
      name: '',
      today: this.currentDate,
      all: false
    };
    this.subscriptions.push(
      this.merService.getShelfDisplaySurveyList(model).subscribe((res) => {
        this.surveyData = res.data;
      })
    )
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
