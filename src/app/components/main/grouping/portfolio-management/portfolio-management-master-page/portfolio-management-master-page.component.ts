import { Component, OnInit, ViewChild } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-portfolio-management-master-page',
  templateUrl: './portfolio-management-master-page.component.html',
  styleUrls: ['./portfolio-management-master-page.component.scss'],
})
export class PortfolioManagementMasterPageComponent extends BaseComponent
  implements OnInit {
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  public isDetailVisible: boolean = false;
  public portfolio: Portfolio;
  public newPortfolioManagementData = {};
  public checkedRows = [];
  private fds: FormDrawerService;
  constructor(fds: FormDrawerService, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,) {
    super('Portfolio Management');
    Object.assign(this, { fds });
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }

  openAddPortfolio() {
    this.fds.setFormName('portfolio-management');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.portfolio = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }

  updateTableData(data) {
    this.newPortfolioManagementData = data;
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
    this.checkedRows.forEach(element => {
      ids.push(element.uuid);
    });
    let body = {
      module: 'PortfolioManagement',
      action: action,
      ids: ids
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
    )
  }
}

export interface Portfolio {
  id: number;
  uuid: string;
  organisation_id: number;
  code: string;
  firstname: string;
  lastname: string;
  email: string;
  company_name: string;
  portfolio_management_item: PortfolioItemGroupingDetails[];
  mobile: string;
  status: number;
}

interface PortfolioItemGroupingDetails {
  id: number;
  item: Item;
  item_id: number;
}

interface Item {
  id: number;
  item_major_category_id: number;
  item_sub_category_id: number;
  item_group_id: number;
  brand_id: number;
  sub_brand_id: number;
  item_code: string;
  item_name: string;
  item_description: string;
  item_barcode: string;
  item_weight: string;
  item_shelf_life: string;
  lower_unit_item_upc: number;
  lower_unit_uom_id: number;
  lower_unit_item_price: string;
  is_tax_apply: number;
  item_vat_percentage: string;
  status: number;
}
