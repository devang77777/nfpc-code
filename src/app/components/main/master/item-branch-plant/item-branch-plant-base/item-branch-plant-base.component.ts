import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ExportDialogComponent } from 'src/app/components/dialogs/export-dialog/export-dialog.component';

@Component({
  selector: 'app-item-branch-plant-base',
  templateUrl: './item-branch-plant-base.component.html',
  styleUrls: ['./item-branch-plant-base.component.scss']
})
export class ItemBranchPlantBaseComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
  }
  openExport() {
    const dialogRef = this.dialog.open(ExportDialogComponent, {
      data: {
        module: 'item-branch-plant',
        title: 'Item Branch Plant'
      }
    });
  }
  openImport() {
    this.router.navigate(['masters/item-branch-plant/', 'import']).then();
  }
}
