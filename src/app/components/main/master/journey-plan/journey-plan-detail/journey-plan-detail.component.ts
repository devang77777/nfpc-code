import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import {
  JourneyPlanDayModel,
  JourneyPlanModel,
  JourneyPlanWeekModel,
} from '../journey-plan-model';
import { Router } from '@angular/router';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { MasterService } from '../../master.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-journey-plan-detail',
  templateUrl: './journey-plan-detail.component.html',
  styleUrls: ['./journey-plan-detail.component.scss'],
})
export class JourneyPlanDetailComponent extends BaseComponent
  implements OnInit, OnDestroy, OnChanges {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public journeyPlanData: JourneyPlanModel;

  public customers: JourneyPlanWeekModel[] | JourneyPlanDayModel[];

  private router: Router;
  private dataService: DataEditor;
  private deleteDialog: MatDialog;
  private masterService: MasterService;
  private changeDetectorRef: ChangeDetectorRef;
  private subscriptions: Subscription[] = [];
  public journeyIsApproved: boolean = false;
  dateFilterControl: FormControl;
  listData = [];
  selectedData: any;
  currentDate: string;
  public selectedTab = 0;
  public viewtype = 0;
  activityListData: any;
  constructor(
    private commonToasterService: CommonToasterService,
    masterService: MasterService,
    changeDetectorRef: ChangeDetectorRef,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    router: Router
  ) {
    super('Journey Plan');
    Object.assign(this, {
      masterService,
      changeDetectorRef,
      deleteDialog,
      dataService,
      router,
    });
  }

  public ngOnInit(): void { }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.journeyPlanData && changes.journeyPlanData.currentValue) {
      this.journeyPlanData = changes.journeyPlanData.currentValue;
      this.selectedTabChange(this.selectedTab);
    }
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.selectedTab = 0;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditJourneyPlan(): void {
    this.router
      .navigate(['masters/journey-plan', 'edit', this.journeyPlanData.uuid])
      .then();
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.journeyPlanData.name}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteJourneyPlan();
        }
      });
  }

  private deleteJourneyPlan(): void {
    let delObj = { uuid: this.journeyPlanData.uuid, delete: true };
    this.masterService
      .deleteJourneyPlan(this.journeyPlanData.uuid)
      .subscribe((result) => {
        this.commonToasterService.showInfo(
          'Deleted',
          'Sucessfully Deleted Journey-plan'
        );
        this.updateTableData.emit(delObj);
        this.closeDetailView();
      });
  }

  private fetchJourneyData(uuid: string): void {
    this.subscriptions.push(
      this.masterService.getJourneyPlanByKey(uuid).subscribe((result) => {
        const journey: JourneyPlanModel = result.data;
        if (journey.journey_plan_weeks !== undefined && journey.journey_plan_weeks.length) {
          this.customers = journey.journey_plan_weeks;
        } else if (journey.journey_plan_days !== undefined && journey.journey_plan_days.length) {
          this.customers = journey.journey_plan_days;
        }
      })
    );
  }
  approve() {
    if (this.journeyPlanData && this.journeyPlanData.objectid) {
      this.masterService.approveJourney(this.journeyPlanData.objectid).subscribe((res: any) => {
        const approvedStatus: boolean = res.data.approved_or_rejected;
        if (res.status && approvedStatus) {
          this.commonToasterService.showSuccess("Approved", "Journey Plan has been Approved");
          this.journeyIsApproved = false;
        }
      });
    }
  }
  reject() {
    if (this.journeyPlanData && this.journeyPlanData.objectid) {
      this.masterService.rejectJourneyApproval(this.journeyPlanData.objectid).subscribe((res: any) => {
        this.journeyIsApproved = false;
        this.commonToasterService.showSuccess("Reject", "Journey Plan Approval has been Rejected");
      });
    }
  }

  selectedTabChange(index) {
    switch (index) {
      case 0:
        this.fetchJourneyData(this.journeyPlanData.uuid);
        break;
      case 1:
        this.getCustomerVisitList();
        break;
    }
  }

  getCustomerVisitList() {
    let obj = {
      "journey_plan_id": this.journeyPlanData.id,
      "page": 1,
      "page_size": 10
    };
    this.subscriptions.push(
      this.masterService.getCustomerVisitList(obj).subscribe((res) => {
        this.listData = res;
      })
    )
  }

  getCustomerActivityList(id, page, page_size) {
    this.setViewType(1);
    this.subscriptions.push(
      this.masterService.getCustomerActivityList(id, page, page_size).subscribe((res) => {
        this.activityListData = res;
      })
    )
  }

  jpListHandler(data) {
    this.selectedData = data;
    if (data.actionType == 'activity-list') {
      this.getCustomerActivityList(data.id, 1, 10);
    }

  }

  setViewType(view) {
    this.viewtype = view;
  }
}
