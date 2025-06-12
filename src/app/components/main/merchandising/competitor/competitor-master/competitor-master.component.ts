import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { Competitor } from '../competitor-interface';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { CompetitorExportComponent } from '../competitor-export/competitor-export.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-competitor-master',
  templateUrl: './competitor-master.component.html',
  styleUrls: ['./competitor-master.component.scss'],
})
export class CompetitorMasterComponent extends BaseComponent implements OnInit {
  @ViewChild('formDrawer') CompetitorFormDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public competitor: Competitor;
  public newCompetitorData = {};
  checkedRows = [];
  constructor(
    private router: Router,
    private dialog: MatDialog, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    public fds: FormDrawerService,
  ) {
    super('Competitor Info');
  }

  ngOnInit(): void { }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.CompetitorFormDrawer);
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.competitor = data;
    }
  }

  openAddCompetitor() {
    this.fds.setFormName('add-competitor');
    this.fds.setFormType("Add");
    this.fds.open();
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportInfo() {
    const dialogRef = this.dialog.open(CompetitorExportComponent);
  }

  openImpotInfo() {
    this.router.navigate(['merchandising/competitors', 'import']).then();
  }

  updateTableData(data) {
    this.newCompetitorData = data;
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
      module: 'CompetitorInfo',
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
