import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-preference-parent',
  templateUrl: './preference-parent.component.html',
  styleUrls: ['./preference-parent.component.scss'],
})
export class PreferenceParentComponent implements OnInit {
  public preferenceNavOptions: any[] = [];
  public activeRoute: string;

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
    this.apiService.getPreferenceNavOptions().subscribe((res: any[]) => {
      res.forEach((item, i) => {
        this.preferenceNavOptions.push(item);
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
