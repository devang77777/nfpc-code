import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-sub-area-delete-dialog',
  templateUrl: './sub-area-delete-dialog.component.html',
  styleUrls: ['./sub-area-delete-dialog.component.scss']
})
export class SubAreaDeleteDialogComponent implements OnInit {

  constructor(
    private dialog: MatDialogRef<SubAreaDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public uuid: any,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
  }
  close() {
    this.dialog.close();
  }
  delete() {
    this.apiService.deleteSubarea(this.uuid).subscribe(res => {
      //console.log(res);
      window.location.reload();
    })
  }


}
