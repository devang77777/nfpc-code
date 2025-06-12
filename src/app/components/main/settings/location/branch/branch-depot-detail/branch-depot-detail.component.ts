import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BranchDepotMaster } from '../branch-depot-master-dt/branch-depot-master-dt.component';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-branch-depot-detail',
  templateUrl: './branch-depot-detail.component.html',
  styleUrls: ['./branch-depot-detail.component.scss'],
})
export class BranchDepotDetailComponent extends BaseComponent {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public depotData: BranchDepotMaster | any;

  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;

  constructor(
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    formDrawer: FormDrawerService,
    private cts: CommonToasterService
  ) {
    super('Branch/Depot');
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditDepot(): void {
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.depotData,
    });
    this.formDrawer.setFormName('add-branch-depot');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  public toggleStatus(): void {
    this.depotData.status = this.depotData.status === 0 ? 1 : 0;

    this.apiService
      .editBranchDepot(this.depotData.uuid, {
        user_id: '1',
        status: this.depotData.status,
        depot_name: this.depotData.depot_name,
        depot_manager: this.depotData.depot_manager,
        region_id: this.depotData.region_id,
        depot_manager_contact: this.depotData.depot_manager_contact,
      })
      .subscribe(
        (result) => {
          //console.log('Status has successfully Updated!');
        },
        (err) => {
          //console.log(err);
          this.depotData.status = this.depotData.status === 0 ? 1 : 0;
        }
      );
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.depotData.depot_name}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteBranchDepot();
        }
      });
  }

  private deleteBranchDepot(): void {
    let delObj = { uuid: this.depotData.uuid, delete: true };
    this.apiService
      .deleteBranchDepot(this.depotData.uuid)
      .subscribe((result) => {
        this.closeDetailView();
        this.updateTableData.emit(delObj);
        this.cts.showSuccess("", "Deleted Successfully");
      });
  }
}
