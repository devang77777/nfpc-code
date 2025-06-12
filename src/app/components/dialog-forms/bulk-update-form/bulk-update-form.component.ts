import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-bulk-update-form',
  templateUrl: './bulk-update-form.component.html',
  styleUrls: ['./bulk-update-form.component.scss']
})
export class BulkUpdateFormComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<BulkUpdateFormComponent>) { }

  ngOnInit(): void {
  }
  close() {
    this.dialogRef.close();
  }
}
