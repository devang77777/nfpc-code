import { Component, OnInit, ViewChild } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { RouteItemGrouping } from '../route-groupdt/route-groupdt.component';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from '../../../../../features/shared/base/base.component';

@Component({
  selector: 'app-route-item-group-master-page',
  templateUrl: './route-item-group-master-page.component.html',
  styleUrls: ['./route-item-group-master-page.component.scss'],
})
export class RouteItemGroupMasterPageComponent extends BaseComponent
  implements OnInit {
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public routeItemGroup: RouteItemGrouping;
  public newRouteItemGroupData = {};

  private fds: FormDrawerService;

  constructor(fds: FormDrawerService) {
    super('Route Item Grouping');
    Object.assign(this, { fds });
  }
  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }

  openAddRouteItemGroup() {
    this.fds.setFormName('routeItemGroup');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.routeItemGroup = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  updateTableData(data) {
    this.newRouteItemGroupData = data;
  }
}
