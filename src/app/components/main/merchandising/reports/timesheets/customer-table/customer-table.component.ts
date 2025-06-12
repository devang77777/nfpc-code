import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MerchandisingService } from '../../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
@Component({
  selector: 'app-customer-table',
  templateUrl: './customer-table.component.html',
  styleUrls: ['./customer-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class CustomerTableComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  expandedElement: any | null;
  public displayedColumns = ['customerCode', 'customerName', 'visit_total_time', 'start_time', 'end_time'];
  public displayLabels = ['Customer Code', 'Customer Name', 'total Time', 'start time', 'end time'];
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

  expandList(data) {
    this.expandedElement = this.expandedElement === data ? null : data;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
