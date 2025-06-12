import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Utils } from 'src/app/services/utils';
import { MerchandisingService } from '../../../merchandising.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-msl-detail-table',
  templateUrl: './msl-detail-table.component.html',
  styleUrls: ['./msl-detail-table.component.scss']
})
export class MslDetailTableComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  expandedElement: any | null;
  public displayedColumns = ['merchandiserCode', 'merchandiserName',  'itemCode', 'itemName', 'modelCapacity', 'outOfStock', 'mslPerform'];
  public displayLabels = ['Merchandiser Code', 'Merchandiser Name', 'Item Code', 'Item Name', 'Model Qty', 'Out Of Stock', 'Msl Perform'];
  @Input() public displayData;
  @Input() public selected;


  dateFilterControl: FormControl;
  constructor(private merService: MerchandisingService) {
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    if(this.selected == 'customer'){
      this.displayedColumns[0] = 'customerCode';
      this.displayedColumns[1] = 'customerName';
      this.displayLabels[0] = 'Customer Code';
      this.displayLabels[1] = 'Customer Name';
    }
    else if(this.selected == 'salesman'){
      this.displayedColumns[0] = 'merchandiserCode';
      this.displayedColumns[1] = 'merchandiserName';
      this.displayLabels[0] = 'Merchandiser Code';
      this.displayLabels[1] = 'Merchandiser Name';
    }
    else{
      this.displayedColumns = [];
      this.displayLabels = [];
      this.displayedColumns = ['channelName',  'itemCode', 'itemName', 'modelCapacity', 'outOfStock', 'mslPerform'];
      this.displayLabels = ['Channel Name', 'Item Code', 'Item Name', 'Model Qty', 'Out Of Stock', 'Msl Perform'];
    }
    this.itemSource = new MatTableDataSource(this.displayData);
    this.itemSource.paginator = this.paginator;
    console.log("displayData", this.displayData);
  }

  ngOnChanges(): void {
    //console.log(this.displayedColumns, this.displayLabels, this.displayData);
    this.itemSource = new MatTableDataSource(this.displayData);
    this.itemSource.paginator = this.paginator;
  }

  expandList(data) {
    this.expandedElement = this.expandedElement === data ? null : data;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
}
