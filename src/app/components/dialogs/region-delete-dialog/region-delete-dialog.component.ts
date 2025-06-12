import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-region-delete-dialog',
  templateUrl: './region-delete-dialog.component.html',
  styleUrls: ['./region-delete-dialog.component.scss']
})
export class RegionDeleteDialogComponent implements OnInit {

  constructor(
    private dialog: MatDialogRef<RegionDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public uuid: any,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {

  }
  close() {
    this.dialog.close();
  }
  delete() {
    this.apiService.deleteRegion(this.uuid).subscribe(res => {
      //console.log(res);
      window.location.reload();
    })
  }

}
