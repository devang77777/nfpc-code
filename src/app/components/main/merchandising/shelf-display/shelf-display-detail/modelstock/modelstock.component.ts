import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MerchandisingService } from '../../../merchandising.service';
import { ModelStock } from '../../model-stock-interface';
import { ApiService } from 'src/app/services/api.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { AddModelStockDialogComponent } from 'src/app/components/dialogs/add-modelstock-dialog/add-modelstock-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  selector: 'app-modelstock',
  templateUrl: './modelstock.component.html',
  styleUrls: ['./modelstock.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ModelstockComponent extends BaseComponent implements OnInit {
  @Input() public customers: any[];
  @Input() public distribution_id;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  private deleteDialog: MatDialog;
  private apiService: ApiService;
  dataSource = new MatTableDataSource();
  columnsToDisplay = ['code', 'name', 'action'];
  itemsData = [];
  selectedColumnFilter: string;

  expandedElement: ModelStock | null;;
  private subscriptions: Subscription[] = [];
  constructor(
    apiService: ApiService,
    deleteDialog: MatDialog,
    public merService: MerchandisingService
  ) {
    super('Shelf Display');
    Object.assign(this, { apiService, deleteDialog });
    this.dataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource(this.customers);
    this.dataSource.paginator = this.paginator;
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }
  public getCustomerItems(data) {
    this.expandedElement = this.expandedElement === data ? null : data;
    if (this.expandedElement == null) {
      return false;
    }
    let customer_id = data.customer_id;
    this.subscriptions.push(
      this.merService.getModelStockList(customer_id, this.distribution_id).subscribe(
        (res) => {
          this.itemsData[customer_id] = res.data;
        })
    )
  }

  public addItemPopup($event, element) {
    $event.stopPropagation();
    this.deleteDialog
      .open(AddModelStockDialogComponent, {
        width: '1000px',
        height: 'auto',
        hasBackdrop: true,
        position: {
          top: '5px',
        },
        data: element
      })
      .afterClosed()
      .subscribe((data) => {
        if (data && data.length > 0) {
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
        }
      });
  }

}
