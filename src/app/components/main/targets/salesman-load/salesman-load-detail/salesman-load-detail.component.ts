import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { CompDataServiceType } from 'src/app/services/constants';
import { SalesmanLoad } from '../salesman-load-dt/salesman-load-dt.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { Router } from '@angular/router';
import { TargetService } from '../../target.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { SalesmanLoadPdfMakerService } from '../salesman-load-detail-pdf.service';

@Component({
  selector: 'app-salesman-load-detail',
  templateUrl: './salesman-load-detail.component.html',
  styleUrls: ['./salesman-load-detail.component.scss'],
})
export class SalesmanLoadDetailComponent extends BaseComponent
  implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public salesmanLoad: SalesmanLoad | any;
  @Input() public isDetailVisible: boolean;
  itemTableHeaders = ['#', 'Item Code', 'Name', 'UOM', 'Approved Quantity', 'Requested Quantity'];
  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private targetService: TargetService;
  private router: Router;
  constructor(
    private commonToasterService: CommonToasterService,
    targetService: TargetService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    formDrawer: FormDrawerService,
    router: Router,
    private salesmanLoadPdfMakerService: SalesmanLoadPdfMakerService
  ) {
    super('Salesman Load');
    Object.assign(this, {
      targetService,
      deleteDialog,
      dataService,
      formDrawer,
      router,
    });
  }

  ngOnInit(): void {
    console.log("this.salesmanLoad", this.salesmanLoad)
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }
  ngOnChanges() {
    console.log("this.salesmanLoad", this.salesmanLoad)

  }

  public openEditSalesmanLoad(): void {
    console.log("this.salesmanLoad", this.salesmanLoad)

    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.salesmanLoad,
    });
    this.router.navigate([
      `target/salesman-load/edit/${this.salesmanLoad?.uuid}`,
    ]);
  }
  // public toggleStatus(): void {
  //   this.country.country_status = this.country.country_status === 0 ? 1 : 0;
  // }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: { title: `Are you sure want to delete salesman load` },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteSalesmanLoad();
        }
      });
  }

  public deleteSalesmanLoad(): void {
    let delObj = { uuid: this.salesmanLoad.uuid, delete: true };
    this.targetService
      .deleteSalesmanLoad(this.salesmanLoad.uuid)
      .subscribe((res) => {
        this.commonToasterService.showInfo(
          'Deleted',
          'Sucessfully Deleted Portfolio Management'
        );
        this.closeDetailView();
        this.updateTableData.emit(delObj);
      });
  }

  getDocument() {
    this.salesmanLoadPdfMakerService.salesmanLoad = this.salesmanLoad;
    this.salesmanLoadPdfMakerService.generatePDF()
  }
}
