import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MerchandisingService } from '../../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-activitytable',
  templateUrl: './activitytable.component.html',
  styleUrls: ['./activitytable.component.scss']
})
export class ActivitytableComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['activity_name', 'activity_action', 'total_time', 'start_time', 'end_time'];
  public displayLabels = ['activity name', 'activity action', 'total time', 'start time', 'end time'];
  @Input() public displayData;


  dateFilterControl: FormControl;
  constructor(private merService: MerchandisingService) {
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    this.itemSource = new MatTableDataSource(this.displayData);
    this.itemSource.paginator = this.paginator;
  }

  ngOnChanges(): void {
    //console.log(this.displayedColumns, this.displayLabels, this.displayData);
    this.itemSource = new MatTableDataSource(this.displayData);
    this.itemSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
