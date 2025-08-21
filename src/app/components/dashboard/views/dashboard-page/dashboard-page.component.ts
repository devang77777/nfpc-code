import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent implements OnInit {
  // dashboardIndex: 0;
  // navLinks: any[];
  // activeLinkIndex = 1;
  // domain = window.location.host;
  // constructor(private router: Router) { }
  // ngOnInit(): void {
  //   this.navLinks = [
  //     {
  //       label: 'Dashboard 1',
  //       link: './board1',
  //       index: 0
  //     },
  //     {
  //       label: 'Dashboard 2',
  //       link: './board2',
  //       index: 1
  //     },
  //     {
  //       label: 'Dashboard 3',
  //       link: './board3',
  //       index: 2
  //     },
  //     {
  //       label: 'Dashboard 4',
  //       link: './board4',
  //       index: 3
  //     },
  //     {
  //       label: 'Jp Compliance',
  //       link: './jp-compliance',
  //       index: 5
  //     },
  //     {
  //       label: 'Coverage',
  //       link: './coverage',
  //       index: 6
  //     },
  //     {
  //       label: 'Visit Frequency',
  //       link: './visit-frequency',
  //       index: 7
  //     },
  //   ];

  //   if (this.domain !== 'presales-prodmobiato.nfpc.net') {
  //     this.navLinks.push({
  //       label: 'Dashboard 5',
  //       link: './board5',
  //       index: 4
  //     })
  //   }
  //   this.router.events.subscribe((res) => {
  //     this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url));
  //   });
  // }
  // tabChanged(item) {
  //   this.dashboardIndex = item.index;
  // }

  // checkPermission(value) {
  //   if (value == "Dashboard 1") {
  //     return false;
  //   }
  //   let data: any = localStorage.getItem('permissions');
  //   let userPermissions = [];
  //   if (!data) return true;
  //   data = JSON.parse(data);

  //   let module = data.find((x) => x.moduleName === value);
  //   if (!module) {
  //     userPermissions = [];
  //     return true;
  //   }
  //   userPermissions = module.permissions.map((permission) => {
  //     const name = permission.name.split('-').pop();
  //     return { name };
  //   });
  //   const isView = userPermissions.find((x) => x.name == 'list');
  //   return isView ? false : true;
  // }
  dashboardIndex: 0;
  navLinks: any = [];
  activeLinkIndex = 1;
  domain = window.location.host;
  constructor(private router: Router) {

  }
  ngOnInit(): void {
    if (this.domain != 'presales-devmobiato.nfpc.net' && this.domain != 'presales-prodmobiato.nfpc.net' && this.domain !== 'localhost:4200' && this.domain !== 'presales.nfpc.net') {
      this.navLinks.push(
        {
          label: 'Dashboard 1',
          link: './board1',
          index: 0
        },
        {
          label: 'Dashboard 2',
          link: './board2',
          index: 1
        },
        {
          label: 'Dashboard 3',
          link: './board3',
          index: 2
        },
        {
          label: 'Dashboard 4',
          link: './board4',
          index: 3
        },
        {
          label: 'Dashboard 5',
          link: './board5',
          index: 4
        });
    } else {
      this.navLinks.push(
        {
          label: 'Monthly KPI',
          link: './monthly-kpi',
          index: 0
        },
        {
          label: 'Order Analysis',
          link: './order-analysis',
          index: 4
        },
        {
          label: 'Live Tracking',
          link: './live-tracking',
          index: 1
        },
        {
          label: 'Logistic',
          link: './logistic',
          index: 2
        }

        );
    }
    this.router.events.subscribe((res) => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url));
      console.log(this.activeLinkIndex,"presales-devmobiato.nfpc.net")
    });
    if (this.router.url.includes('/dashboard/board1') && this.domain == 'presales-prodmobiato.nfpc.net') {
      this.router.navigate(['/dashboard/monthly-kpi']);
    }
  }
  tabChanged(item) {
    this.dashboardIndex = item.index;
  }

  checkPermission(value) {
    if (value == "Dashboard 1") {
      return false;
    }
    let data: any = localStorage.getItem('permissions');
    let userPermissions = [];
    if (!data) return true;
    data = JSON.parse(data);

    let module = data.find((x) => x.moduleName === value);
    if (!module) {
      userPermissions = [];
      return true;
    }
    userPermissions = module.permissions.map((permission) => {
      const name = permission.name.split('-').pop();
      return { name };
    });
    const isView = userPermissions.find((x) => x.name == 'list');
    return isView ? false : true;
  }
}
