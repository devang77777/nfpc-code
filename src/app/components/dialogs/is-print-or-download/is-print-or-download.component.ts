import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-is-print-or-download',
  templateUrl: './is-print-or-download.component.html',
  styleUrls: ['./is-print-or-download.component.scss']
})
export class IsPrintOrDownloadComponent implements OnInit {
  public customData : {
    hasConfirmed: boolean
  }
  public matDialogRef: MatDialogRef<IsPrintOrDownloadComponent>;
  constructor(
    matDialogRef: MatDialogRef<IsPrintOrDownloadComponent>,
    @Inject(MAT_DIALOG_DATA) customData: any
  ) {
    Object.assign(this, { matDialogRef, customData });
  }


  ngOnInit(): void {
  }
  printPic() {    
    this.matDialogRef.close('print');
  }
  generatePdf() {
    this.matDialogRef.close('pdf');
  }
}
