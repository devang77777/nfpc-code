import { Component, OnInit, ViewChild } from '@angular/core';
import { Planogram } from '../planogram-interface';
import { FormDrawerService } from '../../../../../services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { PlanogramExportComponent } from '../planogram-export/planogram-export.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-planogram-master',
  templateUrl: './planogram-master.component.html',
  styleUrls: ['./planogram-master.component.scss'],
})
export class PlanogramMasterComponent extends BaseComponent implements OnInit {
  @ViewChild('formDrawer') PlanogramFormDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public planogram: Planogram;
  private fds: FormDrawerService;
  newPlanogramData: any = {};
  checkedRows = [];
  constructor(
    fds: FormDrawerService,
    private router: Router,
    public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog
  ) {
    super('Planogram');
    Object.assign(this, { fds });
  }

  ngOnInit(): void {}

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.planogram = data;
    }
  }

  updateTableData(data) {
    this.newPlanogramData = data;
  }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.PlanogramFormDrawer);
  }

  openAddPlanogram() {
    this.fds.setFormName('add-planogram');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportPlanogram() {
    const dialogRef = this.dialog.open(PlanogramExportComponent);
  }

  openImportPlanogram() {
    this.router.navigate(['/merchandising/planograms', 'import']);
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  public bulkAction(action): void {
    let phrase =
      action == 'active' || action == 'inactive' ? 'mark as ' + action : action;
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to ${phrase} selected Records `,
          btnText: phrase,
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
    this.checkedRows.forEach((element) => {
      ids.push(element.uuid);
    });
    let body = {
      module: 'Planogram',
      action: action,
      ids: ids,
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
    );
  }
}
