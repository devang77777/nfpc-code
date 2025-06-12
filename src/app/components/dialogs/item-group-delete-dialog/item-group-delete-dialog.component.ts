import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-item-group-delete-dialog',
  templateUrl: './item-group-delete-dialog.component.html',
  styleUrls: ['./item-group-delete-dialog.component.scss']
})
export class ItemGroupDeleteDialogComponent implements OnInit {
  constructor(
    private dialog: MatDialogRef<ItemGroupDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public uuid: any,
    private apiService: ApiService
  ) { }

  ngOnInit(): void { }

  close() {
    this.dialog.close();
  }
  delete() {
    this.apiService.deleteItemGroup(this.uuid).subscribe(res => {
      //console.log(res);
      window.location.reload();
    })
  }
}
