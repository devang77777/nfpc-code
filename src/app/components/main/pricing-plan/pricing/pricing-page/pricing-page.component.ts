import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Router } from '@angular/router';
import { Pricing } from '../pricing-dt/pricing-dt.component';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { ExportDialogComponent } from "src/app/components/dialogs/export-dialog/export-dialog.component";
@Component({
  selector: 'app-pricing-page',
  templateUrl: './pricing-page.component.html',
  styleUrls: ['./pricing-page.component.scss'],
})
export class PricingPageComponent extends BaseComponent implements OnInit {
  public isDetailVisible: boolean;
  public pricing: Pricing;
  checkedRows = [];
  private fds: FormDrawerService;
  private router: Router;
  public newPricingData = {};

  constructor(fds: FormDrawerService, router: Router, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {

    super('Pricing');
    Object.assign(this, { fds, router });
  }
  ngOnInit(): void { }
  openAddPricing() {
    // this.fds.setFormName('area');
    // this.fds.setFormType("Add")
    // this.fds.open();
    this.router.navigate(['pricing-plan/pricing/add']);
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.pricing = data;
    }
  }
  selectedRows(data: any) {
    this.checkedRows = data;
  }
  public closeClicked(): void {
    this.isDetailVisible = false;
  }
  updateTableData(data) {
    //console.log(data);
    this.newPricingData = data;
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
  downloadPricingReport() {
    let body = {
      type: 'pricing',
    };
    this.apiService.getSalesmanData(body).subscribe(
      (res) => {

      })

  }
  openImportPricing() {
    this.router.navigate(['pricing-plan/pricing', 'import']).then();
  }
  openExportPricing() {
    const dialogRef = this.dialog.open(ExportDialogComponent, {
      data: {
        module: 'pricing',
        title: 'Pricing'
      }
    });
  }
  backToCreditNote() {
    this.router.navigate(['pricing-plan/pricing']).then();
  }
}
