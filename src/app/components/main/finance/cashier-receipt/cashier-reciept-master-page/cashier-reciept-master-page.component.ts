import { Component, OnInit } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Router } from '@angular/router';
import { DataEditor } from 'src/app/services/data-editor.service';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-cashier-reciept-master-page',
  templateUrl: './cashier-reciept-master-page.component.html',
  styleUrls: ['./cashier-reciept-master-page.component.scss'],
})
export class CashierRecieptMasterPageComponent extends BaseComponent
  implements OnInit {
  public isDetailVisible: boolean;
  public cashier: Cashier;
  public uuid: string;
  private fds: FormDrawerService;
  public newCRData = {};
  public checkedRows = [];
  constructor(
    fds: FormDrawerService,
    public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private router: Router,
    private dataEditor: DataEditor
  ) {
    super('Cashier Receipt');
    Object.assign(this, { fds });
  }

  ngOnInit(): void { }

  openAddCashier() {
    this.router.navigate(['finance/cashier-reciept/add']);
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.cashier = data;
      this.uuid = data.uuid;
      this.dataEditor.sendData(data);
      this.router.navigate(['finance/cashier-reciept/detail-page', this.uuid]);
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  updateTableData(data) {
    this.newCRData = data;
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
      module: 'CashierReciept',
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

export interface Cashier {
  id: number;
  organisation_id: number;
  cashier_reciept_number: string;
  code: string;
  firstname: string;
  lastname: string;
  email: string;
  company_name: string;
  mobile: string;
  status: number;
  route: {
    id: number;
    route_name: string;
  };
  salesman: {
    firstname: string;
    lastname: string;
  };
  total_amount: string;
}

export const cashierData = [
  {
    id: 1,
    organisation_id: 119341,
    code: 'RFJVJ7868',
    firstname: 'Hello',
    company_name: 'hello body organisation',
    lastname: 'Body',
    email: 'hellobody@gmail.com',
    mobile: '9087654321',
    route: 2,
    amount: 230,
    status: 1,
  },
];
