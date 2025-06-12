import { MerchandisingService } from './../../merchandising.service';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DataEditor } from 'src/app/services/data-editor.service';
import { ScheduleDialogComponent } from './../../../../dialogs/schedule-dialog/schedule-dialog.component';
import { CompDataServiceType } from 'src/app/services/constants';
@Component({
  selector: 'app-sos-master',
  templateUrl: './sos-master.component.html',
  styleUrls: ['./sos-master.component.scss']
})
export class SosMasterComponent implements OnInit {
  public sosNavOptions: any[] = [];
  public activeRoute: string;
  public SelectedName: string;
  public showSidePanle = false;
  constructor(private route: Router,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public dataEditor: DataEditor,
    public merService: MerchandisingService) { }

  ngOnInit(): void {
    this.activatedRoute.url.subscribe((response) => {
      this.activeRoute = this.activatedRoute.snapshot.firstChild.routeConfig.path;
      //console.log(this.activatedRoute.snapshot.firstChild.routeConfig.path);
    });
    this.apiService.getSosNavOptions().subscribe((res: any[]) => {
      res.forEach((item, i) => {
        this.sosNavOptions.push(item);
      });
    });
  }

  routeTo(routeTo: string, index: number, label: string) {
    if (routeTo.length) {
      this.route.navigate([routeTo]);
      this.activeRoute = routeTo.split('/')[routeTo.split('/').length - 1];
      this.SelectedName = label;
    }
  }
  isActive(route, label) {
    if (route.indexOf(this.activeRoute) >= 0) {
      this.SelectedName = label;
      return true;
    }
  }

  toggleSideNav() {
    this.showSidePanle = this.showSidePanle == true ? false : true;
  }

}
