import { ApiService } from './../../../../../services/api.service';
import { state } from '@angular/animations';
import { CommonToasterService } from './../../../../../services/common-toaster.service';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Customer } from '../customer-dt/customer-dt.component';
import { MatDrawer } from '@angular/material/sidenav';
import { MasterService } from '../../master.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ExportDialogComponent } from '../../export-dialog/export-dialog.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-customer-page',
  templateUrl: './customer-page.component.html',
  styleUrls: ['./customer-page.component.scss'],
})
export class CustomerPageComponent extends BaseComponent
  implements OnInit, AfterViewInit {
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public customer: Customer;
  checkedRows = [];
  private fds: FormDrawerService;
  private router: Router;
  public newCustomerData = {};
  constructor(
    fds: FormDrawerService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    router: Router
  ) {
    super('Customer');
    Object.assign(this, { fds, router, route });
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params.create) {
        setTimeout(() => {
          this.openAddCustomer();
        }, 500);
      }
    });
  }
  openImportPricing() {
    this.router.navigate(['masters/customer/customerGeoImport']).then();
  }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }
  openAddCustomer() {
    this.fds.setFormName('customer');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.customer = data;
    }
  }
  selectedRows(data: any) {
    this.checkedRows = data;
  }
  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportDialog() {
    const dialogRef = this.dialog.open(ExportDialogComponent);
  }

  openImpotComp() {
    this.router.navigate(['masters/customer', 'import']).then();
  }

  updateTableData(data) {
    this.newCustomerData = data;
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
      module: 'CustomerInfo',
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
