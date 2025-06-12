import { Component, OnInit, ViewChild, Input, SimpleChanges } from '@angular/core';
import { MerchandisingService } from '../../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
@Component({
  selector: 'app-itemtable',
  templateUrl: './itemtable.component.html',
  styleUrls: ['./itemtable.component.scss']
})
export class ItemtableComponent implements OnInit {
  public paginator;
  @ViewChild(MatPaginator, { static: true }) set matPaginator(value: MatPaginator) {
    this.paginator = value;
  };
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = [
    'created_at',
    'item',
    'item_uom',
    'item_discount_amount',
    'item_excise',
    'item_grand_total',
    'item_gross',
    'item_net',
    'item_vat',
    'item_price',
    'item_qty',
    'order_status',
  ];
  public displayLabels = [
    'Date',
    'Item',
    'Item uom',
    'item discount',
    'item qty',
    'item gross',
    'item excise',
    'item net',
    'item vat',
    'item price',
    'item grand total',
    'order status',
  ];
  @Input() public data;


  dateFilterControl: FormControl;
  constructor(private merService: MerchandisingService, public dataEditor: DataEditor) {
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    this.itemSource = new MatTableDataSource<any>(this.data);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data.currentValue) {
      this.data = changes.data.currentValue;
      //console.log(changes.data.currentValue);
      this.itemSource = new MatTableDataSource(changes.data.currentValue);
      setTimeout(() => {
        //console.log(this.paginator);
        this.itemSource.paginator = this.paginator;
      });
    }
  }

  public hidePaginator(len: any): boolean {
    //console.log(len);
    return len < 3 ? true : false;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
