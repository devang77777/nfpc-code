import { Component, EventEmitter, OnInit, Output, Input, SimpleChanges } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { SalesMan } from '../salesman-dt/salesman-dt.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';


@Component({
  selector: 'app-salesman-detail',
  templateUrl: './salesman-detail.component.html',
  styleUrls: ['./salesman-detail.component.scss']
})
export class SalesmanDetailComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();

  @Input() public salesMan: SalesMan | any;
  @Input() public isDetailVisible: boolean;
  domain = window.location.host.split('.')[0];

  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;
  public loginData = [];
  public selectedTab = 0;
  public salesManIsApproved: boolean = false;
  currentRole = '';
  constructor(public cts: CommonToasterService, apiService: ApiService, deleteDialog: MatDialog, private commonToasterService: CommonToasterService,
    dataService: DataEditor, formDrawer: FormDrawerService) {
    super('Salesman')
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
    this.currentRole = localStorage.getItem('roleName');

  }

  ngOnInit(): void {

  }

  selectedTabChange(index) {

    switch (index) {
      case 3:
        this.getSalesmanLoginInfo();
        break;
    }
  }

  getSalesmanLoginInfo() {
    this.apiService.getSalesmanLoginInfo({ merchandiser_id: this.salesMan.user?.id }).subscribe((res) => {
      this.loginData = res.data;
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.selectedTabChange(this.selectedTab);
    }
  }


  public closeDetailView(): void {
    this.selectedTab = 0;
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditSalesMan(): void {
    this.formDrawer.setFormName('salesMan');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
    this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.salesMan });
  }

  public toggleStatus(): void {
    let action = this.salesMan.status === 1 ? 'active' : 'inactive';
    let ids = [];
    ids.push(this.salesMan.uuid);
    let body = {
      module: 'SalesmanInfo',
      action: action,
      ids: ids
    };
    this.apiService.bulkAction(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.cts.showSuccess('Success', 'Action Successfull');
          body['edit'] = true;
          // this.salesMan.status = this.salesMan.status === 0 ? 1 : 0;
          this.updateTableData.emit(body);
        } else {
          this.cts.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.cts.showError('Error', 'Action Un-successfull');
      }
    )
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
    let delObj = { uuid: this.salesMan.user?.uuid, delete: true };
    this.apiService.deleteSalesMan(this.salesMan.user?.uuid).subscribe(result => {
      this.commonToasterService.showInfo("Deleted", "Salesman deleted sucessfully");
      this.updateTableData.emit(delObj);
      this.closeDetailView();
    });
  }
  approve() {
    if (this.salesMan && this.salesMan.objectid) {
      this.apiService.approveItem(this.salesMan.objectid).subscribe((res: any) => {
        const approvedStatus: boolean = res.data.approved_or_rejected;
        if (res.status && approvedStatus) {
          this.commonToasterService.showSuccess("Approved", "Salesman has been Approved");
          this.salesManIsApproved = false;
        }
      });
    }
  }
  reject() {
    if (this.salesMan && this.salesMan.objectid) {
      this.apiService.rejectItemApproval(this.salesMan.uuid).subscribe((res: any) => {
        if (res == 'Reject') {
          this.commonToasterService.showSuccess("Reject", "Salesman Approval has been Rejected");
          this.salesManIsApproved = true;
        }
        else {
          this.commonToasterService.showError("Salesman Failed Rejection!!!", "Please try again");
          this.salesManIsApproved = false;
        }
      });
    }
  }
}
