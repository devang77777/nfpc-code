import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SidenavService } from 'src/app/services/sidenav.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { RouteService } from './route-active.service';
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit, OnDestroy {
  menu : any;
  activePath: string;
  settingsNav: boolean;
  panelOpenState;
  showTitle: boolean = true;
  sidebarConfig = [];
  sidebarSettingConfig = [];
  domain = window.location.host;
  constructor(
    private router: Router,
    private sidenavService: SidenavService,
    private fds: FormDrawerService,
    public routeService: RouteService
  ) {
    this.sidenavService.softwareSidebar();

  }

  ngOnInit(): void {
    if (this.router.url.includes('/dashboard/board1') && this.domain == 'presales-prodmobiato.nfpc.net') {
      this.router.navigate(['/dashboard/monthly-kpi']);
    }
  }

  ngAfterViewInit(): void {
    this.initSideBar();
  }

  initSideBar() {
    this.router.events.subscribe(e => {
      this.fds.close();
      if (e instanceof NavigationEnd) {
        this.activePath = e.url;
        if (this.activePath.includes('/settings')) {
          this.settingsNav = true;
        }
        else {
          this.settingsNav = false;
        }
      }
    })
    if (this.sidebarConfig.length == 0) {
      this.getSideBar();
    }
  }

  getSideBar() {
    this.sidenavService.getSideBar().subscribe((res) => {
      this.sidebarConfig = res;
    });
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

  isSpacing(value) {
    return this.sidenavService.isSpacing(value);
  }
  // onSideNavClick(){
  //   this.showTitle = !this.showTitle;
  //   document.querySelector('body').classList.add('sideclosed');
  // }
  ngOnDestroy() {

  }
  navigateTo(path) {
    const sidebarContainer = document.querySelector('._sidenav');
    // sidebarContainer.classList.add('mobilemenu')
    sidebarContainer.classList.remove('collapse_sidenav')
    this.router.navigate([path]);
  }
  onToggle() {
    const sidebarContainer = document.querySelector('._sidenav');
    //sidebarContainer.classList.remove('mobilemenu')
    sidebarContainer.classList.toggle('collapse_sidenav')
    // this.showTitle = !this.showTitle
  }
  // navigateBack() {
  //   let backNavigationPath: string = this.sidenavService.getBackNavigationPath();
  //   this.router.navigate([backNavigationPath]);
  // }
  navigateBack() {
  const backNavigationPath = this.sidenavService.getBackNavigationPath();

  if (!backNavigationPath) {
    console.warn('Back navigation path is undefined');
    return;
  }

  if (this.router.url === '/' + backNavigationPath) {
    console.log('Already on the target route. Navigation skipped.');
    return;
  }

  this.router.navigate([backNavigationPath])
    .catch(err => console.error('Navigation failed:', err));
}

  isActive(s: string) {
    if (this.router.url.includes(s)) {
      return true;
    }
    else {
      return false;
    }
  }
  isActivePath(s: string) {
    if (this.router.url.startsWith(s))
      return true;
    else
      return false;
  }
  displayRoles(): boolean {
    if (localStorage.getItem('userType') == '1' || localStorage.getItem('userType') == '0') {
      return true;
    } else {
      return false;
    }
  }

    isRouteActiveExact(path: string): boolean {
  return this.router.url === path;
}

}
