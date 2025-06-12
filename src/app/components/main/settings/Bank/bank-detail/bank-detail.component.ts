import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { BankData } from '../bankdt/bankdt.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-bank-detail',
  templateUrl: './bank-detail.component.html',
  styleUrls: ['./bank-detail.component.scss'],
})
export class BankDetailComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public bank: BankData | any;
  @Input() public isDetailVisible: boolean;

  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;

  constructor(
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    formDrawer: FormDrawerService, private cts: CommonToasterService,
  ) {
    super('Bank');
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  }

  ngOnInit(): void { }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditBank(): void {
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.bank,
    });
    this.formDrawer.setFormName('add-bank');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }
  public toggleStatus(): void {
    this.bank.status = this.bank.status === 0 ? 1 : 0;
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete bank ${this.bank.bank_code}`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteBank();
        }
      });
  }

  public deleteBank(): void {
    let delObj = { uuid: this.bank.uuid, delete: true };
    this.apiService.deleteBankItem(this.bank.uuid).subscribe((result) => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully");
    });
  }
}
