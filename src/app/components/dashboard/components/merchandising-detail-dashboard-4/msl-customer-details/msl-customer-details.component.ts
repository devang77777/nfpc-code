import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-msl-customer-details',
  templateUrl: './msl-customer-details.component.html',
  styleUrls: ['./msl-customer-details.component.scss']
})
export class MslCustomerDetailsComponent implements OnInit {
@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
itemSource = new MatTableDataSource();
private subscriptions: Subscription[] = [];
expandedElement: any | null;
//public displayedColumns = ['merchandiserCode', 'merchandiserName',  'itemCode', 'itemName', 'modelCapacity', 'outOfStock', 'mslPerform'];
//public displayLabels = ['Merchandiser Code', 'Merchandiser Name', 'Item Code', 'Item Name', 'Model Qty', 'Out Of Stock', 'Msl Perform'];
public displayedColumns = ['item_code','item_name', 'out_of_stock_qty', 'model_stock_qty'];
@Input() public displayData;
@Input() public selected;
  constructor() { }

  ngOnInit(): void {
    this.itemSource = new MatTableDataSource(this.displayData);
    this.itemSource.paginator = this.paginator;
  }

}
