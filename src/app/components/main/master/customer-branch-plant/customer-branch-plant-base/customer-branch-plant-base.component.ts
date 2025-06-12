import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ExportDialogComponent } from "src/app/components/dialogs/export-dialog/export-dialog.component";

@Component({
  selector: 'app-customer-branch-plant-base',
  templateUrl: './customer-branch-plant-base.component.html',
  styleUrls: ['./customer-branch-plant-base.component.scss']
})
export class CustomerBranchPlantBaseComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
  }
  openExport() {
    const dialogRef = this.dialog.open(ExportDialogComponent, {
      data: {
        module: 'customer-warehouse-mapping',
        title: 'Customer Branch Plant'
      }
    });
  }
  openImport() {
    this.router.navigate(['masters/customer-branch-plant/', 'import']).then();
  }
}
