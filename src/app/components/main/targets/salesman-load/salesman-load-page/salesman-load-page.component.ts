import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Router } from '@angular/router';
import { SalesmanLoad } from '../salesman-load-dt/salesman-load-dt.component';
import { BaseComponent } from 'src/app/features/shared/base/base.component';

@Component({
  selector: 'app-salesman-load-page',
  templateUrl: './salesman-load-page.component.html',
  styleUrls: ['./salesman-load-page.component.scss'],
})
export class SalesmanLoadPageComponent extends BaseComponent implements OnInit {
  public isDetailVisible: boolean;
  public salesmanLoad: SalesmanLoad;
  checkedRows = [];
  private fds: FormDrawerService;
  private router: Router;
  public newSalesmanLoadData = {};

  constructor(fds: FormDrawerService, router: Router) {
    super('Salesman Load');
    Object.assign(this, { fds, router });
  }
  ngOnInit(): void { }

  openAddSalesmanLoad() {
    // this.fds.setFormName('salesmanLoad');
    // this.fds.setFormType("Add")
    // this.fds.open();
    this.router.navigate(['target/salesman-load/add']);
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.salesmanLoad = data;
    }
  }
  selectedRows(data: any) {
    this.checkedRows = data;
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  updateTableData(data) {
    this.newSalesmanLoadData = data;
  }
}
