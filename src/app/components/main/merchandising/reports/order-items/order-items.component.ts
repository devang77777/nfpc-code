import { Component, OnInit, ViewChild } from '@angular/core';
import { MerchandisingService } from '../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-order-items',
  templateUrl: './order-items.component.html',
  styleUrls: ['./order-items.component.scss']
})
export class OrderItemsComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['created_at', 'product_code', 'product_desc', 'product_price', 'product_qty'];
  dateFilterControl: FormControl;
  selectedColumnFilter: string;

  constructor(private merService: MerchandisingService) {
    this.itemSource = new MatTableDataSource<any>();
  }


  data = [
    { created_at: '2020-09-25T14:47:07.000000Z', 'product_code': '', 'product_desc': '', 'product_price': '', 'product_qty': '' },
    { created_at: '2020-09-25T14:47:07.000000Z', 'product_code': '', 'product_desc': '', 'product_price': '', 'product_qty': '' },
    { created_at: '2020-09-25T14:47:07.000000Z', 'product_code': '', 'product_desc': '', 'product_price': '', 'product_qty': '' },
    { created_at: '2020-09-25T14:47:07.000000Z', 'product_code': '', 'product_desc': '', 'product_price': '', 'product_qty': '' },
    { created_at: '2020-09-25T14:47:07.000000Z', 'product_code': '', 'product_desc': '', 'product_price': '', 'product_qty': '' },
  ]

  ngOnInit(): void {
    this.itemSource = new MatTableDataSource<any>(this.data);
    this.itemSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }
}
