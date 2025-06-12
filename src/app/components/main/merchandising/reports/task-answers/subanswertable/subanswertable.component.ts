import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MerchandisingService } from '../../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-subanswertable',
  templateUrl: './subanswertable.component.html',
  styleUrls: ['./subanswertable.component.scss']
})
export class SubAnswertableComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['created_at', 'question', 'answer'];
  public displayLabels = ['Date', 'Question', 'Answer'];
  @Input() public displayData;


  dateFilterControl: FormControl;
  constructor(private merService: MerchandisingService) {
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    this.itemSource = new MatTableDataSource<any>(this.displayData);
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
