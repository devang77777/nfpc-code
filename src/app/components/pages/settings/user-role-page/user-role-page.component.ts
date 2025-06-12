import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Users } from 'src/app/components/datatables/users-dt/users-dt.component';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-user-role-page',
  templateUrl: './user-role-page.component.html',
  styleUrls: ['./user-role-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserRolePageComponent implements OnInit, AfterViewInit {
  @ViewChild('formDrawer') userRoleFormDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public roles: boolean = false;
  public user: Users;
  public newUserData = {};
  public newRoleData = {};

  private fds: FormDrawerService;

  constructor(fds: FormDrawerService) {
    Object.assign(this, { fds });
  }
  ngOnInit(): void {
    this.fds.formName.subscribe(res => {
      if (res == "role") {
        this.roles = true;
      }
    })
  }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.userRoleFormDrawer);
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.user = data;
    }
  }
  public closeClicked(): void {
    this.isDetailVisible = false;
  }
  public tabChange(event) {
    if (event.index == 1) {
      this.roles = true;
      this.isDetailVisible = false;
    } else {
      this.roles = false;
    }
  }
  public openAddRole() {
    this.fds.setFormName("role");
    this.fds.setFormType("Add");
    this.fds.open();
  }
  public openAddUser() {
    this.fds.setFormName("user");
    this.fds.open();
  }

  updateTableData(data, type) {
    if (type == 'role') {
      this.newRoleData = data;
    } else {
      this.newUserData = data;
    }

  }
}