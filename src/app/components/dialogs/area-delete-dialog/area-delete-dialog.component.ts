import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-area-delete-dialog',
  templateUrl: './area-delete-dialog.component.html',
  styleUrls: ['./area-delete-dialog.component.scss']
})
export class AreaDeleteDialogComponent implements OnInit {

  constructor(
    private dialog: MatDialogRef<AreaDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public uuid: any,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
  }
  close() {
    this.dialog.close();
  }
  delete() {
    this.apiService.deleteArea(this.uuid).subscribe(res => {
      //console.log(res);
      window.location.reload();
    })
  }
}
