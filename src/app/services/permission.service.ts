import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  public allPermissions = [];
  public permission = [];
  public userRole;
  public domain = window.location.host;
<<<<<<< HEAD
  public baseUrl: string = this.domain == 'devmobiato.nfpc.net' ? environment.nfpcApiUrl : environment.baseApiUrl;
=======
  public baseUrl: string = this.domain == 'devmobiato.nfpc.net' ? environment.nfpcApiUrl : environment.baseApiUrl;
>>>>>>> master
  constructor(private http: HttpClient) {
    this.getRolesPermission().subscribe((res: any) => {
      this.allPermissions = res.data;
      // //console.log(this.allPermissions);
      this.userRole = localStorage.getItem('roleId');
      let userId = localStorage.getItem('id');
      this.permission = this.allPermissions
        .filter((x) => {
          if (x.id == this.userRole) {
            return x;
          }
        })[0]
        .organisation_role_has_permissions.map((x) => x.permission_id);
    });
  }
  getRolesPermission() {
    let url = `${this.baseUrl}/org-roles-with-permission/list`;
    return this.http.get(url);
  }
  hasAccess(id) {
    if (this.permission.includes(id)) {
      return true;
    } else {
      return false;
    }
  }
}
