import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { DetailsService } from 'src/app/services/details.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { RegionMaster } from '../region-master-dt/region-master-dt.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-region-master-details-page',
  templateUrl: './region-master-details-page.component.html',
  styleUrls: ['./region-master-details-page.component.scss'],
})
export class RegionMasterDetailsPageComponent extends BaseComponent
  implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public regionMaster: RegionMaster | any;
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
    private cts: CommonToasterService
  ) {
    super('Region');
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  }

  ngOnInit(): void { }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditRegion(): void {
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.regionMaster,
    });
    this.formDrawer.setFormName('region');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }
  public toggleStatus(): void {
    this.regionMaster.region_status =
      this.regionMaster.region_status === 0 ? 1 : 0;
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete region ${this.regionMaster.region_code}`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteRegion();
        }
      });
  }

  public deleteRegion(): void {
    let delObj = { uuid: this.regionMaster.uuid, delete: true };
    this.apiService.deleteRegion(this.regionMaster.uuid).subscribe((result) => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully");
    });
  }
}
