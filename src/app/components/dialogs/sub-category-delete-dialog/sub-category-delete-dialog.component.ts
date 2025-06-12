import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-sub-category-delete-dialog',
  templateUrl: './sub-category-delete-dialog.component.html',
  styleUrls: ['./sub-category-delete-dialog.component.scss']
})
export class SubCategoryDeleteDialogComponent implements OnInit {
  constructor(
    private dialog: MatDialogRef<SubCategoryDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public uuid: any,
    private apiService: ApiService
  ) { }

  ngOnInit(): void { }

  close() {
    this.dialog.close();
  }
  delete() {
    this.apiService.deleteSubCategory(this.uuid).subscribe(res => {
      //console.log(res);
      window.location.reload();
    })
  }
}
