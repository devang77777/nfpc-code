import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Router } from '@angular/router';
import { Promotion } from '../promotion-dt/promotion-dt.component';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { PromotionExportComponent } from '../promotion-export/promotion-export.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-promotion-page',
  templateUrl: './promotion-page.component.html',
  styleUrls: ['./promotion-page.component.scss'],
})
export class PromotionPageComponent extends BaseComponent
  implements OnInit, OnDestroy {
  public isDetailVisible: boolean;
  public promotion: Promotion;
  checkedRows = [];
  private fds: FormDrawerService;
  private router: Router;
  public newPromotionData = {};
  constructor(fds: FormDrawerService, router: Router, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {
    super('Promotion');
    Object.assign(this, { fds, router });
  }
  ngOnInit(): void { }
  ngOnDestroy() { }
  openAddPromotion() {
    this.router.navigate(['pricing-plan/promotion/add']);
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.promotion = data;
    }
  }
  selectedRows(data: any) {
    this.checkedRows = data;
  }
  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportpromotion() {
    const dialogRef = this.dialog.open(PromotionExportComponent);
  }

  openImportPromotion() {
    this.router.navigate(['pricing-plan/promotion', 'import']).then();
  }

  updateTableData(data) {
    //console.log(data);
    this.newPromotionData = data;
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
      module: 'PriceDiscoPromoPlan',
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
