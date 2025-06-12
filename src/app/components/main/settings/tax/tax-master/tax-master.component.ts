import { Organisation } from './../../../master/customer/customer-dt/customer-dt.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-tax-master',
  templateUrl: './tax-master.component.html',
  styleUrls: ['./tax-master.component.scss']
})
export class TaxMasterComponent implements OnInit {

  public taxNavOptions: any[] = [];
  public activeRoute: string;

  Organisation = JSON.parse(localStorage.getItem('organization'));

  constructor(
    private route: Router,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.url.subscribe((response) => {
      this.activeRoute = this.activatedRoute.snapshot.firstChild.routeConfig.path;
      //console.log(this.activatedRoute.snapshot.firstChild.routeConfig.path);
    });
    this.apiService.getTaxNavOptions().subscribe((res: any[]) => {
      res.forEach((item, i) => {
        if (item.label == "Gst Settings") {
          if (this.Organisation?.org_country_id == 98) {
            this.taxNavOptions.push(item);
          }
        } else if (item.label == "Tax Settings") {
          if (this.Organisation?.org_country_id == 228) {
            this.taxNavOptions.push(item);
          }
        } else {
          this.taxNavOptions.push(item);
        }

      });
    });
  }
  routeTo(routeTo: string, index: number) {
    if (routeTo.length) {
      this.route.navigate([routeTo]);
      this.activeRoute = routeTo;
    }
  }
  isActive(route) {
    return route.indexOf(this.activeRoute) >= 0;
  }

}
