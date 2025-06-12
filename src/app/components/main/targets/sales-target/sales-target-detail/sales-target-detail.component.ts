import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SalesTargetModel } from '../sales-target-model';
import { Router } from '@angular/router';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { TargetService } from '../../target.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';

@Component({
  selector: 'app-sales-target-detail',
  templateUrl: './sales-target-detail.component.html',
  styleUrls: ['./sales-target-detail.component.scss'],
})
export class SalesTargetDetailComponent extends BaseComponent {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();

  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public salesTargetData: SalesTargetModel;
  private dialogRef: MatDialog;
  private dataService: DataEditor;
  private router: Router;
  private toaster: CommonToasterService;
  private targetService: TargetService;
  constructor(
    deleteDialog: MatDialog,
    targetService: TargetService,
    dataService: DataEditor,
    toaster: CommonToasterService,
    dialogRef: MatDialog,
    formDrawer: FormDrawerService,
    router: Router
  ) {
    super('Sales Target');
    Object.assign(this, {
      targetService,
      deleteDialog,
      dataService,
      toaster,
      dialogRef,
      formDrawer,
      router,
    });
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditForm(): void {
    this.router.navigate([
      'target/sales-target/edit',
      this.salesTargetData.uuid,
    ]);
  }

  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '400px',
        data: { title: `Are you sure you want to delete?` },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteTarget();
        }
      });
  }
  deleteTarget(): void {
    let delObj = { uuid: this.salesTargetData.uuid, delete: true };
    this.targetService
      .deleteSalesTarget(this.salesTargetData.uuid)
      .subscribe((result) => {
        this.toaster.showSuccess(
          'Success',
          'Sales target has been deleted successfuly.'
        );
        this.closeDetailView();
        this.updateTableData.emit(delObj);
      });
  }
}
