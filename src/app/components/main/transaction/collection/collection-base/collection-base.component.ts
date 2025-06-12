import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
//import {OrderModel} from 'src/app/components/main/Transaction/order/order-models';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { CollectionExportComponent } from '../collection-export/collection-export.component';
import { CollectionService } from '../collection.service';

@Component({
  selector: 'app-collection-base',
  templateUrl: './collection-base.component.html',
  styleUrls: ['./collection-base.component.scss'],
})
export class CollectionBaseComponent extends BaseComponent {
  public isDetailVisible: boolean;
  public collectionData: any;
  private collectionService: CollectionService;
  public invoices: any;
  private router: Router;
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  private fds: FormDrawerService;
  module: any;
  checkedRows = [];
  newCollectionData = {};
  constructor(collectionService: CollectionService, router: Router, fds: FormDrawerService, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {
    super('Collection');
    Object.assign(this, { collectionService, router, fds });
    this.module = {
      module: 'Collection ',
      module_id: '',
    };
  }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }

  openHistoryView() {
    this.fds.setFormName('History');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public openForm() {
    this.router.navigate(['transaction', 'collection', 'add']).then();
  }
  onClose() {
    this.fds.close();
  }
  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.collectionData = data;
      console.log('data', data);
      if (data.customer_group_id != null) {
        this.getGroupFilterecInvocies(data);
      } else {
        this.getFilteredInvoices(data);
      }
      const newModule = { ...this.module };
      newModule.module_id = data.id;
      this.module = JSON.parse(JSON.stringify(newModule));
    }
  }
  getFilteredInvoices(data) {
    let body = {
      customer_id: data.customer_id ? data.customer_id : '',
      lob_id: data.lob_id ? data.lob_id : '',
      start_date: '',
      end_date: '',
    }
    this.collectionService.getPendingInvoiceByDates(body).subscribe(
      (response) => {
        this.invoices = response.data;
      },
      (error) => {
        //console.log(error);
      }
    );
  }
  getGroupFilterecInvocies(data) {
    let body = {
      lob_id: data.customer_group_id,
      start_date: '',
      end_date: '',
    }
    this.collectionService.getPendingGroupInvoiceByDates(body).subscribe((response) => {
      this.invoices = response.data;
    }, (error) => {

    })
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportCollection() {
    const dialogRef = this.dialog.open(CollectionExportComponent);
  }

  openImportCollection() {
    this.router.navigate(['transaction/collection', 'import']).then();
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  updateTableData(data) {
    this.newCollectionData = data;
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
      module: 'collection',
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
