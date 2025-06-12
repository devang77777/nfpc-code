import { Component, OnInit, ViewChild } from '@angular/core';
import { MerchandisingService } from '../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { animate, state, style, transition, trigger } from '@angular/animations';
@Component({
  selector: 'app-order-sumamry',
  templateUrl: './order-sumamry.component.html',
  styleUrls: ['./order-sumamry.component.scss'],
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
export class OrderSumamryComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['created_at', 'merchandiser_name', 'customer_name', 'order_code', 'due_date', 'delivery_date', 'type', 'gross_total', 'discount', 'net_total', 'excise', 'vat', 'total', 'status'];
  dateFilterControl: FormControl;
  selectedColumnFilter: string;

  constructor(private merService: MerchandisingService,
    public dataEditor: DataEditor) {
    this.itemSource = new MatTableDataSource<any>();
  }

  data = [];
  expandedElement: any | null;

  ngOnInit(): void {
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.REPORT_DATA) {
          //console.log(value);
          this.data = value.data;
          this.updateTableData(value.data);
        }
      })
    );
  }
  expandList(data) {
    this.expandedElement = this.expandedElement === data ? null : data;
  }

  updateTableData(data = []) {
    let newData = data.length > 0 ? data : this.data;
    this.itemSource = new MatTableDataSource<any>(newData);
    this.itemSource.paginator = this.paginator;
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
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
