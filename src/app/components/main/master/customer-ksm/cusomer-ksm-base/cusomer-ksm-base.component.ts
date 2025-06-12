import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ExportDialogComponent } from 'src/app/components/dialogs/export-dialog/export-dialog.component';

@Component({
  selector: 'app-cusomer-ksm-base',
  templateUrl: './cusomer-ksm-base.component.html',
  styleUrls: ['./cusomer-ksm-base.component.scss']
})
export class CusomerKsmBaseComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
  }
  openExport() {
    const dialogRef = this.dialog.open(ExportDialogComponent, {
      data: {
        module: 'customer-ksm-kam-mapping',
        title: 'Customer KSM/KAM Mapping'
      }
    });
  }
  openImport() {
    this.router.navigate(['masters/customer-ksm-mapping/', 'import']).then();
  }
}
