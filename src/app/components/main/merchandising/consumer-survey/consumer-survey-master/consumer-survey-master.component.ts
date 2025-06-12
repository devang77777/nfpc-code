import { Component, OnInit, ViewChild } from '@angular/core';
import { Survey } from '../survey-interface';
import { FormDrawerService } from '../../../../../services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-consumer-survey-master',
  templateUrl: './consumer-survey-master.component.html',
  styleUrls: ['./consumer-survey-master.component.scss']
})
export class ConsumerSurveyMasterComponent extends BaseComponent implements OnInit {
  @ViewChild('formDrawer') SurveyFormDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public Survey: any;
  public loadChnages;
  private fds: FormDrawerService;
  newConsumerSurveyData: any = {};
  checkedRows = [];
  constructor(fds: FormDrawerService, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,) {
    super('Consumer Survey');
    Object.assign(this, { fds });
  }

  ngOnInit(): void { }


  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.Survey = data;

    }
  }

  updateTableData(data) {
    this.newConsumerSurveyData = data;
    this.loadChnages = data.close;
  }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.SurveyFormDrawer);
  }

  openAddSurvey() {
    this.fds.setFormName('add-ConsumerSurvey');
    this.fds.setFormType("Add");
    this.fds.open();
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  public bulkAction(action): void {
    let phrase = action == 'active' || action == "inactive" ? "mark as " + action : action;
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to ${phrase} selected Records `,
          btnText: phrase
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data?.hasConfirmed) {
          this.applyAulkAction(action);
        }
      });
  }

  applyAulkAction(action) {
    let ids = [];
    this.checkedRows.forEach(element => {
      ids.push(element.uuid);
    });
    let body = {
      module: 'Survey',
      action: action,
      ids: ids
    };
    this.apiService.bulkAction(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.checkedRows = [];
          this.cts.showSuccess('Success', 'Action Successfull');
          this.updateTableData(body);
        } else {
          this.cts.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.cts.showError('Error', 'Action Un-successfull');
      }
    )
  }

}
