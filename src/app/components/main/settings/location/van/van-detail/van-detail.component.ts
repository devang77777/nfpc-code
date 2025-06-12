import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { OdometerVanEditComponent } from '../odometer-van-edit/odometer-van-edit.component';

@Component({
  selector: 'app-van-detail',
  templateUrl: './van-detail.component.html',
  styleUrls: ['./van-detail.component.scss'],
})
export class VanDetailComponent extends BaseComponent {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public vanData: any;

  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;
  odometerDetails: any = [];
  constructor(
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    formDrawer: FormDrawerService,
    private cts: CommonToasterService,
    private dialog: MatDialog,

  ) {
    super('Van Master');
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditVan(): void {
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.vanData,
    });
    this.formDrawer.setFormName('add-van');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  public toggleStatus(): void {
    this.vanData.van_status = this.vanData.van_status === 0 ? 1 : 0;

    this.apiService
      .editVan(this.vanData.uuid, {
        plate_number: this.vanData.plate_number,
        description: this.vanData.description,
        capacity: this.vanData.capacity,
        van_type_id: this.vanData.van_type_id,
        van_category_id: this.vanData.van_category_id,
        status: this.vanData.van_status,
        van_code: this.vanData.van_code,
      })
      .subscribe(
        (result) => {
          //console.log('Status has successfully Updated!');
        },
        (err) => {
          //console.log(err);
          this.vanData.van_status = this.vanData.van_status === 0 ? 1 : 0;
        }
      );
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete Van ${this.vanData.van_code}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteVan();
        }
      });
  }

  private deleteVan(): void {
    let delObj = { uuid: this.vanData.uuid, delete: true };
    this.apiService.deleteVan(this.vanData.uuid).subscribe((result) => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully");
    });
  }
  onTabChanged(event) {
    if (event.index === 1) {
      this.apiService.getOdometerDetails(this.vanData.id).subscribe(res => {
        this.odometerDetails = res.data;
      })
    }
  }
  getCalculation(end, start) {
    if (end && start) {
      return end - start;
    } else {
      return 0;
    }
  }
  openOdometerVanEdit(omd) {
    const dialogRef = this.dialog.open(OdometerVanEditComponent, {
      width: '600px',
      data: omd,
    });
  }
}
