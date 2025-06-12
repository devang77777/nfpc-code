import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { DriverReplacementService } from '../driver-replacement.service';


@Component({
  selector: 'app-driver-replacement-dt',
  templateUrl: './driver-replacement-dt.component.html',
  styleUrls: ['./driver-replacement-dt.component.scss']
})
export class DriverReplacementDtComponent implements OnInit {
  @Input() public data: any;

  public dataSource: MatTableDataSource<any>;
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'date', title: 'Date', show: true },
    { def: 'order', title: 'Order No', show: true },
    { def: 'new', title: 'New', show: true },
    { def: 'old', title: 'Old', show: true },
    { def: 'newVan', title: 'New Van', show: true },
    { def: 'oldVan', title: 'Old Van', show: true },
    { def: 'reason', title: 'Reason', show: true },
    // { def: 'action', title: 'Action', show: true },
  ];
  public apiResponse = {
    pagination: {
      total_records: 0,
    },
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  constructor(
    private service: DriverReplacementService
  ) {
    this.dataSource = new MatTableDataSource<any>();
  }
  ngOnInit() {
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
  }
  getDriverReplacement() {
    this.service.getReplace(this.page, this.pageSize).subscribe((result: any) => {
      this.apiResponse = result;
      this.updateDataSource(result.data);

    });
  }
  ngOnChanges(changes: SimpleChanges) {

    if (changes) {
      if (changes.data && changes.data.currentValue) {
        this.updateDataSource(changes.data.currentValue);
      }
    }
  }
  updateDataSource(data) {
    this.dataSource = new MatTableDataSource<any>(data);
  }
  public getDisplayedColumns(): string[] {
    return this.displayedColumns
      .filter((column) => column.show)
      .map((column) => column.def);
  }
  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getDriverReplacement();
  }
}
