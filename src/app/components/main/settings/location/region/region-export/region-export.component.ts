import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../settings.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-region-export',
  templateUrl: './region-export.component.html',
  styleUrls: ['./region-export.component.scss']
})
export class RegionExportComponent implements OnInit {

  constructor(private settingsService: SettingsService,
    private apiService: ApiService) { }

  ngOnInit(): void {
  }

  exportRegion(data) {

    let type = data.file_type;
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.settingsService.exportRegion({
      module: 'region',
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
