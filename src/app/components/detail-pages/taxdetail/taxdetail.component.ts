
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { DeleteConfirmModalComponent } from '../../shared/delete-confirmation-modal/delete-confirmation-modal.component';
//import { vatgroup } from '../../datatables/taxdt/taxdt.component';
@Component({
  selector: 'app-taxdetail',
  templateUrl: './taxdetail.component.html',
  styleUrls: ['./taxdetail.component.scss']
})
export class TaxdetailComponent  {

  // @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  // @Input() public vatdata: vatgroup | any;
  // @Input() public isDetailVisible: boolean;

  // private dataService: DataEditor;
  // private formDrawer: FormDrawerService;
  // private deleteDialog: MatDialog;
  // private apiService: ApiService;

  // constructor(apiService: ApiService, deleteDialog: MatDialog, dataService: DataEditor, formDrawer: FormDrawerService) {
  //   Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  // }

  // public closeDetailView(): void {
  //   this.isDetailVisible = false;
  //   this.detailsClosed.emit();
  //   this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  // }

  // public openEdititem(): void {
  //   this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.vatdata});
  //   this.formDrawer.setFormName('TAX-SETTINGS');
  //   this.formDrawer.setFormType("Edit");
  //   this.formDrawer.open();
  // }

  // public toggleStatus(): void {
  //   this.vatdata.status = this.vatdata.status === 0 ? 1 : 0;
  // }

  // public openDeleteBox(): void {
  //   this.deleteDialog.open(DeleteConfirmModalComponent, {
  //     width: '500px',
  //     data: { title: `Are you sure want to delete Brand ${this.branddata.uuid}?` }
  //   }).afterClosed().subscribe(data => {
  //     if (data.hasConfirmed) {
  //       this.deleteitem();
  //     }
  //   });
  // }

  // private deleteitem(): void {
  //   this.apiService.deleteBrandItem(this.branddata.uuid).subscribe(result => {
  //     window.location.reload();
  //   });
  // }
}
