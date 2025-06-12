import { Component, OnInit, ViewChild } from '@angular/core';
import { Promotional } from '../promotional-interface';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-promo-master',
  templateUrl: './promo-master.component.html',
  styleUrls: ['./promo-master.component.scss']
})
export class PromoMasterComponent extends BaseComponent implements OnInit {
  @ViewChild('formDrawer') PromotionalFormDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public Promotional: Promotional;
  private fds: FormDrawerService;
  public newPromosData = {};
  checkedRows = [];
  constructor(fds: FormDrawerService, private router: Router, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,) {
    super('Promotional Accountability');
    Object.assign(this, { fds });
  }

  ngOnInit(): void { }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.PromotionalFormDrawer);
  }

  updateTableData(data) {
    this.newPromosData = data;
  }

  openAddPromotion() {
    this.fds.setFormName('add-Promotional');
    this.fds.setFormType("Add");
    this.fds.open();
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.Promotional = data;
    }
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
      module: 'Promotional',
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
