import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-majorcategory-delete-dialog',
  templateUrl: './major-category-delete-dialog.component.html',
  styleUrls: ['./major-category-delete-dialog.component.scss']
})
export class MajorCategoryDeleteDialogComponent implements OnInit {

  constructor(
    private dialog: MatDialogRef<MajorCategoryDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public uuid: any,
    private apiService: ApiService
  ) { }

  ngOnInit(): void { }

  close() {
    this.dialog.close();
  }
  delete() {
    this.apiService.deleteMajor(this.uuid).subscribe(res => {
      //console.log(res);
      window.location.reload();
    })
  }
}
