import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { SalesmanUnload } from '../salesman-unload-interface';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-salesman-unload-master',
  templateUrl: './salesman-unload-master.component.html',
  styleUrls: ['./salesman-unload-master.component.scss']
})
export class SalesmanUnloadMasterComponent extends BaseComponent implements OnInit {

  public isDetailVisible: boolean;
  public salesmanUnload: SalesmanUnload;
  constructor(
    private router: Router,
    private dialog: MatDialog,
  ) {
    super('Salesman Unload');
  }

  ngOnInit(): void { }
  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.salesmanUnload = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  // openExportInfo() {
  //   const dialogRef = this.dialog.open(CompetitorExportComponent);
  // }

  // openImpotInfo() {
  //   this.router.navigate(['merchandising/competitors', 'import']).then();
  // }


}
