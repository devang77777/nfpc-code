import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from '../../shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { SalesMan } from '../../datatables/salesman-dt/salesman-dt.component';

@Component({
  selector: 'app-salesman-detail',
  templateUrl: './salesman-detail.component.html',
  styleUrls: ['./salesman-detail.component.scss']
})
export class SalesmanDetailComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public salesMan: SalesMan | any;
  @Input() public isDetailVisible: boolean;

  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;

  constructor(apiService: ApiService, deleteDialog: MatDialog,
    dataService: DataEditor, formDrawer: FormDrawerService) {
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  }

  ngOnInit(): void { }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditSalesMan(): void {
    this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.salesMan });
    this.formDrawer.setFormName('salesMan');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  public toggleStatus(): void {
    this.salesMan.status = this.salesMan.status === 0 ? 1 : 0;
  }

  public openDeleteBox(): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Salesman ${this.salesMan.user?.firstname} ${this.salesMan.user?.lastname}` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteSalesMan();
      }
    });
  }

  public deleteSalesMan(): void {
    this.apiService.deleteSalesMan(this.salesMan.user?.uuid).subscribe(result => {
      window.location.reload();
    });
  }
}
