import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-preference-left-panel',
  templateUrl: './preference-left-panel.component.html',
  styleUrls: ['./preference-left-panel.component.scss'],
})
export class PreferenceLeftPanelComponent implements OnInit {
  public preferenceNavOptions: any[] = [];
  public activeRoute: number = 3;

  constructor(private route: Router, private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getPreferenceNavOptions().subscribe((res: any[]) => {
      // res.forEach((item, i) => {
      //   this.preferenceNavOptions.push(item);
      // });
      this.preferenceNavOptions.push({
        label: 'Custom Fields',
        routeTo: 'settings/custom-fields',
      });
      this.preferenceNavOptions.push({
        label: 'Work Flow Approval',
        routeTo: 'settings/preference',
      });
    });
  }

  routeTo(routeTo: string, index: number) {
    if (routeTo.length) {
      this.route.navigate([routeTo]);
      this.activeRoute = index;
    }
  }
}
