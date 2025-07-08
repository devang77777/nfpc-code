import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ExportDialogComponent } from "src/app/components/dialogs/export-dialog/export-dialog.component";
import { CustomerService } from "src/app/components/main/master/customer/customer.service";
import { ApiService } from "src/app/services/api.service";
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { CustomerSupervisorExportComponent } from '../../../master/customer-supervisor/customer-supervisor-export/customer-supervisor-export.component';
@Component({
  selector: 'app-jde-push-status-base',
  templateUrl: './jde-push-status-base.component.html',
  styleUrls: ['./jde-push-status-base.component.scss']
})
export class JdePushStatusBaseComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private customerService: CustomerService,
    private apiService: ApiService,
    private commonToasterService: CommonToasterService
  ) { }

  ngOnInit(): void {
  }
  openExport() {
    // const dialogRef = this.dialog.open(ExportDialogComponent, {
    //   this.customerService.exportSupervisorList().subscribe(result => {
    //     if (result.status) {
    //       this.apiService.downloadFile(result.data.file_url, 'file.xlsx');
    //     } else {
    //       this.commonToasterService.showError(result.message);
    //     }
    //   })
    // });
    const dialogRef = this.dialog.open(CustomerSupervisorExportComponent);
  }
  openImport() {
    this.router.navigate(['masters/customer-supervisor/', 'import']).then();
  }

}
