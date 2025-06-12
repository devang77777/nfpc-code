import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-activity-profile',
  templateUrl: './activity-profile.component.html',
  styleUrls: ['./activity-profile.component.scss']
})
export class ActivityProfileComponent implements OnInit {

  activityProfileList: any[] = [];
  activityProfileSelected: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  public selections = new SelectionModel(true, []);
  private subscriptions: Subscription[] = [];
  page = 1;
  pageSize = PAGE_SIZE_10;
  public displayedColumns = ['select', 'activity_name', 'valid_from', 'valid_to', 'actions'];
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  constructor(private router: Router, private dataService: DataEditor, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,) {
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    this.getActivityProfileList();
  }

  getActivityProfileList() {
    this.activityProfileList = [];
    this.subscriptions.push(
      this.apiService.getActivityProfileList().subscribe((res: any) => {
        if (res.status) {
          this.activityProfileList = res.data;
          this.apiResponse = res;
          this.allResData = res.data;
          this.itemSource = new MatTableDataSource<any>(res.data);
          this.itemSource.paginator = this.paginator;
        }
      })
    );
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getActivityProfileList();
  }

  open() {
    this.dataService.sendData({});
    this.router.navigateByUrl('settings/preference/add-activity-profile');
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  deleteActivityProfile(workdata: any) {
    this.apiService.deleteActivityProfile(workdata.uuid).subscribe((res: any) => {
      if (res.status) {
        //console.log("Deleted Activity Profile: ", res);
        this.getActivityProfileList();
      }
    })
  }

  setActivityProfile(data) {
    return false;
    this.dataService.sendData(data)
    this.router.navigate(['settings/preference/activity-profile-detail']);

  }
  editActivityProfile(data) {
    data.isEdit = true;
    this.dataService.sendData(data);
    this.router.navigate(['settings/preference/edit-activity-profile'])
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.itemSource.data.length;
  }

  public toggleSelection(): void {
    this.isAllSelected() ? this.selections.clear() : this.itemSource.data.forEach(row => this.selections.select(row));
  }

  public checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;

      return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
    }
  }

  public bulkAction(action): void {
    let phrase = action == 'active' || action == "inactive" ? "mark as " + action : action;
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to ${phrase} selected Records `,
          btnText: phrase
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data?.hasConfirmed) {
          this.applyAulkAction(action);
        }
      });
  }

  applyAulkAction(action) {
    let ids = [];
    this.selections.selected.forEach(element => {
      ids.push(element.uuid);
    });
    let body = {
      module: 'ActivityProfile',
      action: action,
      ids: ids
    };
    this.apiService.bulkAction(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.cts.showSuccess('Success', 'Action Successfull');
          this.selections = new SelectionModel(true, []);
        } else {
          this.cts.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.cts.showError('Error', 'Action Un-successfull');
      }
    )
  }

}
