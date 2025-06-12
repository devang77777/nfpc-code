import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouteMaster } from '../route-master-dt/route-master-dt.component';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-route-detail',
  templateUrl: './route-detail.component.html',
  styleUrls: ['./route-detail.component.scss'],
})
export class RouteDetailComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public routeData: RouteMaster | any;

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
    super('Route');
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
    
  }
  ngOnInit(){
    
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditRoute(): void {
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.routeData,
    });

    this.formDrawer.setFormName('add-route');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  public toggleStatus(): void {
    this.routeData.status = this.routeData.status === 0 ? 1 : 0;

    this.apiService
      .editRoute(this.routeData.uuid, {
        status: this.routeData.status,
        route_name: this.routeData.route_name,
        area_id: this.routeData.area_id,
        depot_id: this.routeData.depot_id,
        van_id: this.routeData.van_id
      })
      .subscribe(
        (result) => {
          //console.log('Status has successfully Updated!');
        },
        (err) => {
          //console.log(err);
          this.routeData.status = this.routeData.status === 0 ? 1 : 0;
        }
      );
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete Route ${this.routeData.route_name}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteRoute();
        }
      });
  }

  private deleteRoute(): void {
    let delObj = { uuid: this.routeData.uuid, delete: true };
    this.apiService.deleteRoute(this.routeData.uuid).subscribe((result) => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully");
    });
  }
}
