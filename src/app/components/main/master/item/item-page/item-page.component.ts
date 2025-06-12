import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';
import { MasterService } from '../../master.service';
import { Item } from '../item-dt/item-dt.component';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { ItemExportComponent } from '../item-export/item-export.component';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-item-page',
  templateUrl: './item-page.component.html',
  styleUrls: ['./item-page.component.scss'],
})
export class ItemPageComponent extends BaseComponent
  implements OnInit, AfterViewInit {
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public item: Item;
  checkedRows = [];
  public newItemData = {};
  private fds: FormDrawerService;
  constructor(
    fds: FormDrawerService,
    private router: Router,
    public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    super('Item');
    Object.assign(this, { fds, route });
  }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params.create) {
        setTimeout(() => {
          this.openAddItem();
        }, 500);
      }
    });
  }
  openAddItem() {
    this.fds.setFormName('item');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.item = data;
    }
  }
  selectedRows(data: any) {
    this.checkedRows = data;
  }
  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportItem() {
    const dialogRef = this.dialog.open(ItemExportComponent);
  }

  openImportItem() {
    this.router.navigate(['masters/item', 'import']).then();
  }

  updateTableData(data) {
    //console.log(data);
    this.newItemData = data;
  }

  public bulkAction(action): void {
    let phrase =
      action == 'active' || action == 'inactive' ? 'mark as ' + action : action;
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to ${phrase} selected Records `,
          btnText: phrase,
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
    this.checkedRows.forEach((element) => {
      ids.push(element.uuid);
    });
    let body = {
      module: 'item',
      action: action,
      ids: ids,
    };
    this.apiService.bulkAction(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.checkedRows = [];
          this.cts.showSuccess('Success', 'Action Successfull');
          this.updateTableData(body);
        } else {
          this.cts.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.cts.showError('Error', 'Action Un-successfull');
      }
    );
  }
}
