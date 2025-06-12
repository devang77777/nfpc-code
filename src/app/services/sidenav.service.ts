import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, filter } from 'rxjs/operators';
import { endpoints } from 'src/app/api-list/api-end-points';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { NetworkService } from 'src/app/services/network.service';
import { ApiService } from 'src/app/services/api.service';
@Injectable({
  providedIn: 'root',
})
export class SidenavService {
  private backNavigationPath = '/dashboard';
  public appSidebar;
  public appSettingSidebar;
  public sidebar = {
    setting: [],
    sidebar: [],
  };
  public module_name = '';
  public reportNavOptions = [];
  public domain = window.location.host;
  constructor(private http: HttpClient, public network: NetworkService, public apiService: ApiService,) {
    if (
      this.domain.split(':')[0] == 'localhost' ||
      this.domain.split('.')[0] == 'mobiato-msfa' || this.domain == 'https://presales-prodmobiato.nfpc.net'
    ) {
      this.sidebar = JSON.parse(localStorage.getItem('sidebar'));
      if (!this.sidebar) return;
      this.sidebar['sidebar'].sort(function (a, b) {
        return a.heading.localeCompare(b.heading);
      });
    } else {
      if (localStorage.getItem('isLoggedIn') == 'true') {
        this.softwareSidebar();
      }
    }
    this.reportNavOptions = JSON.parse(localStorage.getItem('reportbar'));
    if (!this.reportNavOptions) {
      this.apiService.getReportNavOptions().subscribe((res: any[]) => {
        this.reportNavOptions = res;
        localStorage.setItem('reportbar', JSON.stringify(res));
      });
    }

  }
  softwareSidebar() {
    this.getSideBarBySoftware().subscribe((resp) => {
      localStorage.setItem('sidebar', JSON.stringify(resp.data));
      this.sidebar = resp.data;
      this.sidebar['sidebar'].sort(function (a, b) {
        return a.heading.localeCompare(b.heading);
      });
    });
  }
  setBackNavigationPath(s) {
    this.backNavigationPath = s;
  }
  getBackNavigationPath(): string {
    return this.backNavigationPath;
  }

  getSideBarBySoftware() {
    return this.network.getAll(
      endpoints.apiendpoint.Software.sideBarBySoftware
    );
  }

  getSideBar(): Observable<any> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    let appSidebar = this.http
      .get<any>('../../assets/constants/sidebar.json', { headers })
      .pipe(map((r) => r));
    appSidebar.subscribe((res) => { localStorage.setItem('appSidebar', JSON.stringify(res)); this.appSidebar = res });
    return appSidebar;
  }

  getSettingSideBar(): Observable<any> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    let appSettingSidebar = this.http
      .get<any>('../../assets/constants/settingSidebar.json', { headers })
      .pipe(map((r) => r));
    appSettingSidebar.subscribe((res) => { localStorage.setItem('appSettingSidebar', JSON.stringify(res)); this.appSettingSidebar = res });

    return appSettingSidebar;
  }

  getAdvanceSearch(): Observable<any> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .get<any>('../../assets/constants/advanceSearch.json', { headers })
      .pipe(map((r) => r));
  }
  featureCheck(value) {
    if (this.checkDomain() == false) {
      return false;
    }
    if (value == 'Dashboard') {
      return false;
    }
    let obj = this.sidebar['sidebar'].filter((x) => {
      // return x.feature_name.toLowerCase().replace(/\s/g, '') == value.toLowerCase().replace(/\s/g, '')
      return x.feature_name
        .toLowerCase()
        .replace(/\s/g, '')
        .includes(value.toLowerCase().replace(/\s/g, ''));
    });
    let permission = false;
    if (value == 'Reports') {
      this.reportNavOptions = JSON.parse(localStorage.getItem('reportbar'));
      if (!this.reportNavOptions) {
        this.apiService.getReportNavOptions().subscribe((res: any[]) => {
          this.reportNavOptions = res;
          permission = this.checkReportsPermission(value);
          localStorage.setItem('reportbar', JSON.stringify(res));
        });
      } else {
        permission = this.checkReportsPermission(value)
      }
    } else {
      // if (value == "Merchandiser") {
      //   permission = true;
      // } else {
      permission = this.checkPermission(value);
      // }
    }
    return obj.length > 0 && permission ? false : true;
  }

  sumenuExistCheck(submenu, hasSubmenu) {
    if (hasSubmenu == true) {
      return false;
    }
    let numOfSubmenuExist = 0;
    submenu.forEach((element, i) => {
      let obj = this.sidebar['setting'].filter((x) => {
        return (
          x.name.toLowerCase().replace(/\s/g, '') ==
          element.label.toLowerCase().replace(/\s/g, '')
        );
      });
      numOfSubmenuExist =
        obj.length > 0 ? numOfSubmenuExist + 1 : numOfSubmenuExist;
    });
    return numOfSubmenuExist > 0 ? false : true;
  }

  settingFeatureCheck(value, hasSubmenu) {
    if (hasSubmenu == true) {
      return true;
    }
    if (this.checkDomain() == false) {
      return false;
    }
    let obj = this.sidebar['setting'].filter((x) => {
      return (
        x.name.toLowerCase().replace(/\s/g, '') ==
        value.toLowerCase().replace(/\s/g, '')
      );
    });
    let permission = this.checkPermission(value);
    return obj.length > 0 && permission ? false : true;
    // return obj.length > 0 ? false : true;
  }

  settingFeatureCheckDropDowns(value) {
    if (this.checkDomain() == false) {
      return false;
    }
    let obj = this.sidebar['setting'].filter((x) => {
      return (
        x.name.toLowerCase().replace(/\s/g, '') ==
        value.toLowerCase().replace(/\s/g, '')
      );
    });
    let permission = this.checkPermission(value);
    return obj.length > 0 && permission ? false : true;
  }

  isSpacing(value) {
    if (this.sidebar !== null && this.sidebar['sidebar'] !== null) {
      let obj = this.sidebar['sidebar'].filter((x) => {
        return (
          x.feature_name.toLowerCase().replace(/\s/g, '') ==
          value.toLowerCase().replace(/\s/g, '')
        );
      });

      if (obj.length > 0) {
        if (obj[0].heading !== this.module_name) {
          this.module_name = obj[0].heading;
          return true;
        } else {
          this.module_name = obj[0].heading;
          return false;
        }
      }
    }
  }

  checkPermission(value) {
    if (value == "Users & Roles") {
      return true;
    }
    let data: any = localStorage.getItem('permissions');
    let userPermissions = [];
    if (!data) return false;
    data = JSON.parse(data);

    let module = data.find((x) => x.moduleName === value);
    if (!module) {
      userPermissions = [];
      return false;
    }
    userPermissions = module.permissions.map((permission) => {
      const name = permission.name.split('-').pop();
      return { name };
    });
    const isView = userPermissions.find((x) => x.name == 'list');
    return isView ? true : false;
  }

  checkReportsPermission(value) {
    let data: any = localStorage.getItem('permissions');
    let userPermissions = [];
    let isView = false;
    if (!data) return false;
    data = JSON.parse(data);
    // console.log(this.reportNavOptions, data);

    this.reportNavOptions.forEach(element => {
      let module = data.find((x) => x.moduleName === element.label);
      if (!module) {
        userPermissions = [];
        return false;
      }
      userPermissions = module.permissions.map((permission) => {
        const name = permission.name.split('-').pop();
        return { name };
      });
      let isViewObj = userPermissions.find((x) => x.name == 'list');
      if (isViewObj) {
        isView = true;
      }

    });
    return isView;
  }

  checkDomain() {
    if (
      this.domain.split(':')[0] == 'localhost' ||
      this.domain.split('.')[0] == 'mobiato-msfa' || this.domain == 'https://presales-prodmobiato.nfpc.net'
    ) {
      return false;
    }
    return true;
  }
}
