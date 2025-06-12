import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../notifications-drawer.component';

@Component({
  selector: 'app-reject-reason',
  templateUrl: './reject-reason.component.html',
  styleUrls: ['./reject-reason.component.scss']
})
export class RejectReasonComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<RejectReasonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}
  ngOnInit(): void {
    //throw new Error('Method not implemented.');
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
