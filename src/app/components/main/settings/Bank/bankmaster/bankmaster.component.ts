import { Component, OnInit, ViewChild } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { BankData } from '../bankdt/bankdt.component';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-bankmaster',
  templateUrl: './bankmaster.component.html',
  styleUrls: ['./bankmaster.component.scss'],
})
export class BankmasterComponent extends BaseComponent implements OnInit {
  @ViewChild('formDrawer') BankFormDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public bank: BankData;
  isNew = false;
  private fds: FormDrawerService;
  public newBankData = {};
  checkedRows = [];

  constructor(fds: FormDrawerService, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
  ) {
    super('Bank');
    Object.assign(this, { fds });
  }
  ngOnInit(): void { }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.BankFormDrawer);
  }
  openAddBank() {
    this.fds.setFormName('add-bank');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.bank = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  public updateTableData(data) {
    this.newBankData = data;
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
      module: 'Bank',
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
