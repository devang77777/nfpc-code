import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Customer } from '../customer-dt/customer-dt.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss'],
})
export class CustomerDetailComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public customer: Customer | any;
  @Input() public isDetailVisible: boolean;

  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;
  customerLobList: any[] =[];

  constructor(
    private commonToasterService: CommonToasterService,
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    formDrawer: FormDrawerService,
    private route: ActivatedRoute,
  ) {
    super('Customer');
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  }

  ngOnInit(): void {
    this.customerLobList = this.route.snapshot.data[
      'customer_resolve'
    ].lobList.data;

   }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditCustomer(): void {
    this.formDrawer.setFormName('customer');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.customer,
    });
  }
  public toggleStatus(): void {
    this.customer.customer = this.customer.status === 0 ? 1 : 0;
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete customer ${this.customer?.user?.firstname}`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteCustomer();
        }
      });
  }

  public deleteCustomer(): void {
    let delObj = { uuid: this.customer.uuid, delete: true };
    this.apiService.deleteCustomer(this.customer.uuid).subscribe((result) => {
      this.commonToasterService.showInfo(
        'Deleted',
        'Customer deleted sucessfully'
      );
      this.updateTableData.emit(delObj);
      this.closeDetailView();
    });
  }

  getLobById(id) {
    return this.customerLobList.find((x) => x.id == id) || "N/A";
  }
}
