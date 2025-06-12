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
  selector: 'app-sensory-survey-master',
  templateUrl: './sensory-survey-master.component.html',
  styleUrls: ['./sensory-survey-master.component.scss']
})
export class SensorySurveyMasterComponent extends BaseComponent implements OnInit {
  @ViewChild('formDrawer') SurveyFormDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public Survey: any;
  public loadChnages;
  private fds: FormDrawerService;
  newSensorySurveyData: any = {};
  openSurveyFOrm = false;
  checkedRows = [];
  constructor(fds: FormDrawerService, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,) {
    super('Sensory Survey');
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
    this.newSensorySurveyData = data;
    this.loadChnages = data.close;
  }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.SurveyFormDrawer);
  }

  openAddSurvey() {
    this.fds.setFormName('add-SensorySurvey');
    this.fds.setFormType("Add");
    this.fds.open();
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
    this.openSurveyFOrm = false;
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
