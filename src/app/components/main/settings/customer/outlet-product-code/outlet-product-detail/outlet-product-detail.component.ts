import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OutletProductModel } from '../outlet-product-data-table/outlet-product-data-table.component';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-outlet-product-detail',
  templateUrl: './outlet-product-detail.component.html',
  styleUrls: ['./outlet-product-detail.component.scss']
})
export class OutletProductDetailComponent extends BaseComponent {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public outletProductData: OutletProductModel;

  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;

  constructor(apiService: ApiService, deleteDialog: MatDialog, dataService: DataEditor, formDrawer: FormDrawerService,
    private cts: CommonToasterService) {
    super("Outlet Product Code")
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditOutletProduct(): void {
    this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.outletProductData });
    this.formDrawer.setFormName('add-outlet-product-code');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  public openDeleteBox(): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete ${this.outletProductData.name}?` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteOutletProductCode();
      }
    });
  }

  private deleteOutletProductCode(): void {
    let delObj = { uuid: this.outletProductData.uuid, delete: true };
    this.apiService.deleteOutletProductCode(this.outletProductData.uuid).subscribe(result => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully");
    });
  }
}
