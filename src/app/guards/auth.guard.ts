import { SidenavService } from 'src/app/services/sidenav.service';
import { state } from '@angular/animations';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, public apiService: ApiService, public sService: SidenavService) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let appUrl = state.url;
    let url_string = window.location.href;
    let url = new URL(url_string);
    let access_token = url.searchParams.get("access_token");
    let is_active = url.searchParams.get("is_active");
    url.searchParams.delete("access_token");
    url.searchParams.delete("is_active");
    // console.log('auth');
    if (access_token == null && this.isLoggedIn()) {
      if (appUrl == '/auth/login' || appUrl.split('?')[0] == '/auth/reset-password' || appUrl == '/auth/signup') {
        this.router.navigate(['/dashboard']);
        return false;
      } else {
        if (this.checkMenu(appUrl)) {
          return true;
        } else {
          this.router.navigate(['/dashboard']);
          return false;
        }

      }
    }
    if (access_token !== null && is_active !== null) {
      localStorage.setItem('token', access_token);
      if (is_active == '0') {
        this.apiService.LoginTrack().subscribe();
      }
      this.apiService.getGlobalSetting().subscribe(
        (res) => {
          if (res) {
            localStorage.setItem('avatar_img', JSON.stringify(res.data.user_info?.organisation_trim?.org_logo));
            localStorage.setItem(
              'permissions',
              JSON.stringify(res.data['permissions-name'])
            );
            localStorage.setItem('firstname', res.data.user_info.firstname);
            localStorage.setItem('lastname', res.data.user_info.lastname);
            localStorage.setItem('email', res.data.user_info.email);
            localStorage.setItem('id', res.data.user_info.id);
            localStorage.setItem(
              'org_name',
              res.data.user_info.organisation_trim.org_name
            );
            localStorage.setItem('roleId', res.data.user_info.role_id);
            localStorage.setItem('userType', res.data.user_info.usertype);
            localStorage.setItem('isLoggedIn', 'true');

            localStorage.setItem(
              'sidebar',
              JSON.stringify({
                sidebar: res.data.sidebar,
                setting: res.data.setting
              })
            );
            localStorage.setItem(
              'login_track_activity',
              JSON.stringify(res.data.login_track_activity)
            );
            localStorage.setItem(
              'allSoftware',
              JSON.stringify(res.data.allSoftware)
            );

            this.router.navigate(['/dashboard']);
          }
        });
    } else {
      //console.log('inelse', appUrl);
      if (appUrl == '/auth/login' || appUrl.split('?')[0] == '/auth/reset-password' || appUrl == '/auth/signup') {
        return true;
      } else {
        this.router.navigate(['/auth/login']);
        return false;
      }
    }
    // navigate to login page as user is not authenticated      

  }
  public isLoggedIn(): boolean {
    let status = false;
    if (localStorage.getItem('isLoggedIn') == "true") {
      status = true;
    }
    else {
      status = false;
    }
    return status;
  }

  public checkMenu(appUrl) {
    if (this.isLoggedIn()) {
      if (this.sService.checkDomain() == false) {
        return true;
      }
      if (appUrl == '/dashboard' || appUrl == '/dashboard/board1') {
        return true;
      }
      let newAppUrl = '';
      if (appUrl.split('/').length >= 1) {
        newAppUrl += '/' + appUrl.split('/')[1];
      }
      if (appUrl.split('/').length > 2) {
        newAppUrl += '/' + appUrl.split('/')[2];
      }
      console.log(appUrl, newAppUrl);
      let menu;
      if (JSON.parse(localStorage.getItem('appSidebar'))) {
        console.log('get from local');
        menu = JSON.parse(localStorage.getItem('appSidebar')).filter((x) => { return '/' + x.routeTo == newAppUrl; })[0];
      } else {
        console.log('get from api');
        menu = this.sService.appSidebar.filter((x) => { return '/' + x.routeTo == newAppUrl; })[0];
      }

      if (menu) {
        console.log(appUrl, menu);
        let obj = JSON.parse(localStorage.getItem('sidebar'))['sidebar'].filter(
          (x) => {
            // return x.feature_name.toLowerCase().replace(/\s/g, '') == value.toLowerCase().replace(/\s/g, '')
            return x.feature_name.toLowerCase().replace(/\s/g, '').includes(menu.label.toLowerCase().replace(/\s/g, ''))
          });
        console.log(obj, menu);
        let permission = false;
        if (menu.label == "Reports") {
          if (appUrl == "/reports") {
            permission = true;
          } else {
            permission = this.checkReportsPermission(appUrl);
          }
        } else {
          // if (appUrl == "/masters/merchandiser") {
          //   permission = true;
          // } else {
          permission = this.checkPermission(menu.label);
          // }
        }

        return obj.length > 0 && permission ? true : false;
      } else {
        console.log(appUrl, menu);
        let smenu;
        if (JSON.parse(localStorage.getItem('appSettingSidebar'))) {
          console.log('get from local');
          smenu = JSON.parse(localStorage.getItem('appSettingSidebar')).filter((x) => { return '/' + x.routeTo == newAppUrl; })[0];
        } else {
          console.log('get from api');
          smenu = this.sService.appSettingSidebar.filter((x) => { return '/' + x.routeTo == newAppUrl; })[0];
        }
        if (smenu) {
          console.log(appUrl, smenu);
          let obj = JSON.parse(localStorage.getItem('sidebar'))['setting'].filter(
            (x) => {
              // return x.feature_name.toLowerCase().replace(/\s/g, '') == value.toLowerCase().replace(/\s/g, '')
              return x.name.toLowerCase().replace(/\s/g, '').includes(smenu.label.toLowerCase().replace(/\s/g, ''))
            });
          console.log(obj);
          return obj.length > 0 ? true : false;
        } else {
          console.log(appUrl);
          if (appUrl.split('/').length > 3) {
            newAppUrl += '/' + appUrl.split('/')[3];
          }
          let ssmenu = this.sService.appSettingSidebar.filter((x) => { return x.submenu.some((y) => { return '/' + y.routeTo == newAppUrl; }) });

          if (ssmenu) {
            console.log(appUrl, ssmenu);
            let ssubmenu = ssmenu[0].submenu.filter((x) => { return '/' + x.routeTo == newAppUrl; })[0];
            if (ssubmenu) {
              let obj = this.sService.sidebar['setting'].filter(
                (x) => {
                  // return x.feature_name.toLowerCase().replace(/\s/g, '') == value.toLowerCase().replace(/\s/g, '')
                  return x.name.toLowerCase().replace(/\s/g, '').includes(ssubmenu.label.toLowerCase().replace(/\s/g, ''))
                });
              console.log(obj);
              let permission = this.checkPermission(ssubmenu.label);
              return obj.length > 0 && permission ? true : false;
            }
          } else {
            console.log('not found');
            return false;
          }
        }
      }

    }
  }

  checkPermission(value) {
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
    let reportNavOptions = JSON.parse(localStorage.getItem('reportbar'));
    // if(!this.reportNavOptions){
    //   this.apiService.getReportNavOptions().subscribe((res: any[]) => {
    //     this.reportNavOptions = res;
    //     localStorage.setItem('reportbar', JSON.stringify(res));
    //   });
    // }
    console.log(reportNavOptions, data);
    let repmenu = reportNavOptions.find((x) => '/' + x.routeTo == value);
    console.log(repmenu);
    if (!repmenu) {
      userPermissions = [];
      return false;
    }
    let module = data.find((x) => x.moduleName === repmenu.label);
    console.log(module);
    if (!module) {
      userPermissions = [];
      return false;
    }
    userPermissions = module.permissions.map((permission) => {
      const name = permission.name.split('-').pop();
      return { name };
    });
    isView = userPermissions.find((x) => x.name == 'list');
    console.log(isView);
    return isView;
  }

}
