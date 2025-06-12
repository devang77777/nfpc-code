import { Component, OnInit, ViewChild } from '@angular/core';
import { MerchandisingService } from '../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
@Component({
  selector: 'app-store-summary',
  templateUrl: './store-summary.component.html',
  styleUrls: ['./store-summary.component.scss'],
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
export class StoreSummaryComponent implements OnInit {
  selectedColumnFilter: string;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  allrowsExpended = false;
  public displayedColumns = ['name', 'action'];


  dateFilterControl: FormControl;
  constructor(private merService: MerchandisingService, public dataEditor: DataEditor) {
    this.itemSource = new MatTableDataSource<any>();
  }

  reports = [
    {
      name: 'Task Completed', expanded: true, cols: ['created_at', 'activity_name', 'start_time', 'end_time'], labels: ['Date', 'activity name', 'start time', 'end time'], data: []
    },
    {
      name: 'SOS', expanded: true, cols: ['date', 'customerName', 'merchandiserName', 'displayTool', 'itemCode', 'itemName', 'category', 'facing', 'actualFacing', 'totalScore'], labels: ['Date', 'customer', 'merchandiser', 'display tool', 'item code', 'item', 'category', 'total facing', 'actual facing', 'score'], data: []
    },
    {
      name: 'Stock Availibility', expanded: true, cols: ['created_at', 'customer', 'distribution', 'is_out_of_stock', 'item_code', 'item', 'stock'], labels: ['Date', 'customer', 'Display Tool', 'available', 'item code', 'item', 'stock'], data: []
    },
    {
      name: 'Planogram', expanded: true, cols: ['created_at', 'customer', 'distribution', 'ref_planogram', 'before_image', 'after_image', 'feedback', 'score'], labels: ['Date', 'customer', 'Display Tool', 'ref planogram', 'before', 'after', 'feedback', 'score'], data: []
    },
    {
      name: 'Orders', expanded: true, cols: ['createdAt', 'customerName', 'deliveryDate', 'dueDate', 'grandTotal', 'orderDate', 'salesmanName', 'totalDiscountAmount', 'totalExcise', 'totalGross', 'type', 'vat'], labels: ['Date', 'customer', 'delivery Date', 'due Date', 'grand Total', 'order Date', 'salesman', 'Discount', 'Excise', 'Gross', 'type', 'vat'], data: []
    },
    {
      name: 'Complaint', expanded: true, cols: ['created_at', 'complaint_id', 'customer', 'item_code', 'item', 'title', 'type', 'description'], labels: ['Date', 'complaint id', 'customer', 'item code', 'item', 'title', 'type', 'description'], data: []
    }
  ];
  expandedElement: any | null;

  ngOnInit(): void {
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.REPORT_DATA) {
          //console.log(value);
          this.reports[0].data = value.data.taskCompleted;
          this.reports[1].data = value.data.shareOfShelf;
          this.reports[2].data = value.data.stockAvailability;
          this.reports[3].data = value.data.planogram;
          this.reports[4].data = value.data.orders;
          this.reports[5].data = value.data.complaint;
          this.updateTableData(this.reports);
        }
      })
    );
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }
  updateTableData(data = []) {
    let newData = data.length > 0 ? data : this.reports;
    this.itemSource = new MatTableDataSource<any>(newData);
    this.itemSource.paginator = this.paginator;
  }

  toggle() {
    this.allrowsExpended = !this.allrowsExpended;
  }

  expandList(data) {
    this.expandedElement = this.expandedElement === data ? null : data;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

}
