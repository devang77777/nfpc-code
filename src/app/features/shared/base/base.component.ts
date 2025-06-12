import { Component } from '@angular/core';

@Component({
  selector: 'app-base',
  template: '<span></span>',
  styles: [],
})
export class BaseComponent {
  userPermissions: any[];
  domain = window.location.host;
  constructor(private moduleName?: String) {
    if (moduleName == 'Salesman') {
      moduleName = this.domain == 'merchandising' || this.domain == 'devmobiato.nfpc.net' || this.domain == 'presales-prodmobiato.nfpc.net' ? 'Merchandiser' : 'Salesman'
    }

    let data: any = localStorage.getItem('permissions');
    if (!data) return;
    data = JSON.parse(data);

    let module = data.find((x) => x.moduleName == moduleName);
    if (!module) {
      this.userPermissions = [];
      return;
    }
    this.userPermissions = module.permissions.map((permission) => {
      const name = permission.name.split('-').pop();
      return { name };
    });
  }
}
