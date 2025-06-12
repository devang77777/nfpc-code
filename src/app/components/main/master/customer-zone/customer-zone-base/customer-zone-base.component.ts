import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ExportDialogComponent } from 'src/app/components/dialogs/export-dialog/export-dialog.component';

@Component({
  selector: 'app-customer-zone-base',
  templateUrl: './customer-zone-base.component.html',
  styleUrls: ['./customer-zone-base.component.scss']
})
export class CustomerZoneBaseComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
  }
  openExport() {
    const dialogRef = this.dialog.open(ExportDialogComponent, {
      data: {
        module: 'customer-region-mapping',
        title: 'Customer Region'
      }
    });
  }
  openImport() {
    this.router.navigate(['masters/customer-region/', 'import']).then();
  }
}
