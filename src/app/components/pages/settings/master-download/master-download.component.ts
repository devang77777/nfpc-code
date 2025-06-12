import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-master-download',
  templateUrl: './master-download.component.html',
  styleUrls: ['./master-download.component.scss']
})
export class MasterDownloadComponent implements OnInit {

  displayedColumns: string[] = ['position', 'name', 'description', 'module'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  constructor(private http: HttpClient, private commonToasterService: CommonToasterService,
  ) {

  }
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit() {

  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  download(module) {
    console.log(module);
    if (module) {
      // this.http.get(module, { headers: {'Access-Control-Allow-Origin': '*'} }).subscribe(res => {
      //   console.log(res);
      // });
      this.http.get(module).subscribe((res: any) => {
        if (res?.status == 'Sucess') {
          this.commonToasterService.showSuccess(
            'Success',
            'Master Data Download Successfully.'
          );
        } else {
          this.commonToasterService.showError(
            'Error',
            'error while downloading.'
          );
        }
      });
    }
  }
}

export interface PeriodicElement {
  name: string;
  position: number;
  description: string;
  module: string
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Customer Master', description: 'Customer Master', module: 'https://devmobiato.nfpc.net/merchandising/odbc_customer_master_prd.php' },
  { position: 2, name: 'Item Master', description: 'Item Maste', module: 'https://devmobiato.nfpc.net/merchandising/odbc_item_prd.php' },
  { position: 3, name: 'Item branch Plant', description: 'Item branch Plant', module: 'https://devmobiato.nfpc.net/merchandising/odbc_item_branch_prd.php' },
  { position: 4, name: 'Warehouse Stock', description: 'Warehouse Stock', module: 'https://devmobiato.nfpc.net/merchandising/odbc_stock_date_prd.php' },
];


