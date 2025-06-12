// import { ItemGroup } from './../../datatables/itemgroup-dt/itemgroup-dt.component';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { DetailsService } from 'src/app/services/details.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
// import { ItemGroupDeleteDialogComponent } from '../../dialogs/item-group-delete-dialog/item-group-delete-dialog.component';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
// import { DeleteConfirmModalComponent } from '../../shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ItemGroup } from '../itemgroup-dt/itemgroup-dt.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-item-group-details-page',
  templateUrl: './item-group-details-page.component.html',
  styleUrls: ['./item-group-details-page.component.scss'],
})
export class ItemGroupDetailsPageComponent extends BaseComponent {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public itemGroupData: ItemGroup | any;
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
    super('Item Group');
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEdititem(): void {
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.itemGroupData,
    });
    this.formDrawer.setFormName('itemGroup');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  public toggleStatus(): void {
    this.itemGroupData.status = this.itemGroupData.status === 0 ? 1 : 0;
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete  ${this.itemGroupData.name}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteitem();
        }
      });
  }

  private deleteitem(): void {
    let delObj = { uuid: this.itemGroupData.uuid, delete: true };
    this.apiService
      .deleteItemGroup(this.itemGroupData.uuid)
      .subscribe((result) => {
        this.closeDetailView();
        this.updateTableData.emit(delObj);
        this.cts.showSuccess("", "Deleted Successfully");
      });
  }
}
