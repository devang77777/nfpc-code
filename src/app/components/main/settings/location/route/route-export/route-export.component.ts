import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../settings.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-route-export',
  templateUrl: './route-export.component.html',
  styleUrls: ['./route-export.component.scss']
})
export class RouteExportComponent implements OnInit {

  constructor(private apiService: ApiService,
    private settingsService: SettingsService) { }

  ngOnInit(): void {
  }

  exportRoute(data) {
    let type = data.file_type;
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.settingsService.exportRoute({
      module: 'route',
      criteria: data.criteria,
      start_date: data.start_date,
      end_date: data.end_date,
      file_type: data.file_type,
      is_password_protected: 'no'
    }).subscribe(
      (result: any) => {
        if (result.status) {
          //console.log(result);
          this.apiService.downloadFile(result.data.file_url, type);
        }
      }
    );
  }

}
