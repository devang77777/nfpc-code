import { Component, OnInit } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Router } from '@angular/router';
import { SidenavService } from 'src/app/services/sidenav.service';

@Component({
  selector: 'app-settings-drawer',
  templateUrl: './settings-drawer.component.html',
  styleUrls: ['./settings-drawer.component.scss']
})
export class SettingsDrawerComponent implements OnInit {
  panelOpenState;
  sidebarSettingConfig = [];
  module_name = "";
  sidebar = [];
  constructor(
    private fds: FormDrawerService,
    private router: Router,
    private sidenavService: SidenavService
  ) { }

  ngOnInit(): void {
    this.initSideBar();
  }

  initSideBar() {
    if (this.sidebarSettingConfig.length == 0) {
      this.getSideBar();
    }
  }

  close() {
    this.fds.closeNav();
  }
  navigateTo(s: string) {
    let path: string = this.router.url;
    if (!(path.includes('settings'))) {
      this.sidenavService.setBackNavigationPath(path);
      // //console.log("path is: ",this.sidenavService.getBackNavigationPath());
    }
    this.fds.closeNav();
    this.router.navigate([s])
  }
  displayRoles(): boolean {
    if (localStorage.getItem('userType') == '1' || localStorage.getItem('userType') == '0') {
      return true;
    } else {
      return false;
    }
  }

  getSideBar() {
    this.sidenavService.getSettingSideBar().subscribe((res) => {
      this.sidebarSettingConfig = res;
    });
  }

  featureCheck(value) {
    return this.sidenavService.featureCheck(value);
  }

  settingFeatureCheckDropDowns(value) {
    return this.sidenavService.settingFeatureCheckDropDowns(value);
  }

  sumenuExistCheck(submenu, hasSubmenu) {
    return this.sidenavService.sumenuExistCheck(submenu, hasSubmenu);
  }

  settingFeatureCheck(value, hasSubmenu) {
    return this.sidenavService.settingFeatureCheck(value, hasSubmenu);
  }
}
