import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { VendorData } from '../vendor-dt-page/vendor-dt-page.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-vendor-detail-page',
  templateUrl: './vendor-detail-page.component.html',
  styleUrls: ['./vendor-detail-page.component.scss'],
})
export class VendorDetailPageComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public vendor: VendorData | any;
  @Input() public isDetailVisible: boolean;

  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;

  constructor(
    private commonToasterService: CommonToasterService,
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    formDrawer: FormDrawerService
  ) {
    super('Vendor');
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  }

  ngOnInit(): void { }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditVendor(): void {
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.vendor,
    });
    this.formDrawer.setFormName('vendor');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  public toggleStatus(): void {
    this.vendor.vendor = this.vendor.status === 0 ? 1 : 0;
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete vendor ${this.vendor.vender_code}`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteVendor();
        }
      });
  }

  public deleteVendor(): void {
    let delObj = { uuid: this.vendor.uuid, delete: true };
    this.apiService.deleteVendorItem(this.vendor.uuid).subscribe((result) => {
      this.commonToasterService.showInfo(
        'Deleted',
        'Sucessfully Deleted Vendor'
      );
      this.closeDetailView();
      this.updateTableData.emit(delObj);
    });
  }
}
