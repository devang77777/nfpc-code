import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { Complaint } from '../complaint-interface';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { Router } from '@angular/router';
import { ComplaintFeedbackExportComponent } from '../complaint-feedback-export/complaint-feedback-export.component';


@Component({
  selector: 'app-complaint-feedback-master',
  templateUrl: './complaint-feedback-master.component.html',
  styleUrls: ['./complaint-feedback-master.component.scss']
})
export class ComplaintFeedbackMasterComponent extends BaseComponent implements OnInit {
  @ViewChild('formDrawer') ComplaintFeedbackFormDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public complaints: Complaint;
  public newComplaintFeedbackData = {};
  private fds: FormDrawerService;
  checkedRows = [];
  constructor(fds: FormDrawerService, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private router: Router,
    private dialog: MatDialog) {
    super('Complaint Feedback');
    Object.assign(this, { fds, router });
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.ComplaintFeedbackFormDrawer);
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.complaints = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  updateTableData(data) {
    //console.log(data);
    this.newComplaintFeedbackData = data;
  }

  openAddShelfDisplay() {
    this.fds.setFormName('add-complaintfeedback');
    this.fds.setFormType("Add");
    this.fds.open();
  }

  exportComlain() {
    const dialogRef = this.dialog.open(ComplaintFeedbackExportComponent);

  }

  importComlain() {
    this.router.navigate(['merchandising/complaint-feedback', 'import']).then();
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
      module: 'ComplaintFeedback',
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
