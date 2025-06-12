import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ItemUoms } from '../itemuoms-dt/itemuoms-dt.component';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-itemUoms-detail',
  templateUrl: './item-Uoms-detail.component.html',
  styleUrls: ['./item-Uoms-detail.component.scss'],
})
export class ItemUomsDetailComponent extends BaseComponent {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public itemUoms: ItemUoms | any;
  @Input() public isDetailVisible: boolean;

  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;
  constructor(
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    formDrawer: FormDrawerService,
    private cts: CommonToasterService,
  ) {
    super('UOM');
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditItemUoms(): void {
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.itemUoms,
    });
    this.formDrawer.setFormName('add-Uoms');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  public toggleStatus(): void {
    this.itemUoms.status = this.itemUoms.status === 0 ? 1 : 0;
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete Item Uom ${this.itemUoms.code}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteItemUoms();
        }
      });
  }

  private deleteItemUoms(): void {
    let delObj = { uuid: this.itemUoms.uuid, delete: true };
    this.apiService.deleteItemUom(this.itemUoms.uuid).subscribe((result) => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully");
    });
  }
}
