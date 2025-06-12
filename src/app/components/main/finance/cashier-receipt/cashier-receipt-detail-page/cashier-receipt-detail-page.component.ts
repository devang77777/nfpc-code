import { CommonToasterService } from './../../../../../services/common-toaster.service';
import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Router } from '@angular/router';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Cashier } from '../cashier-reciept-master-page/cashier-reciept-master-page.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CashierReceiptService } from '../cashier-receipt.service';
import { BaseComponent } from '../../../../../features/shared/base/base.component';

@Component({
  selector: 'app-cashier-receipt-detail-page',
  templateUrl: './cashier-receipt-detail-page.component.html',
  styleUrls: ['./cashier-receipt-detail-page.component.scss'],
})
export class CashierReceiptDetailPageComponent extends BaseComponent
  implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public cashier: Cashier | any;
  @Input() public isDetailVisible: boolean;
  public showSpinner: boolean = false;
  public color: ThemePalette = 'primary';
  public mode: ProgressSpinnerMode = 'determinate';

  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;

  constructor(
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    formDrawer: FormDrawerService,
    private ctc: CommonToasterService,
    private cash: CashierReceiptService,
    private router: Router
  ) {
    super('Cashier Receipt');
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  }

  ngOnInit(): void {
    this.dataService.newData.subscribe((res: any) => {
      if (res) {
        this.isDetailVisible = true;
        this.cashier = res;
      }
    });
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit(false);
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
    this.router.navigate(['finance/cashier-reciept']);
  }

  public openEditCustomer(): void {
    // this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.cashier });
    // this.formDrawer.setFormName('customer');
    // this.formDrawer.setFormType('Edit');
    // this.formDrawer.open();
  }
  public toggleStatus(): void {
    this.cashier.cashier = this.cashier.status === 0 ? 1 : 0;
  }
  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.cashier.cashier_reciept_number}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteOder();
        }
      });
  }

  private deleteOder(): void {
    this.cash.deleteCashierReceipt(this.cashier.uuid).subscribe((result) => {
      this.ctc.showSuccess('', 'Deleted Successfully!Please check the table');
      this.router.navigate(['finance/cashier-reciept']);
    });
  }
}
