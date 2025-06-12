import { Component, OnInit, Input, ViewChild, Output } from '@angular/core';
import { MerchandisingService } from '../../../../merchandising.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { EditModelstockItemDialogComponent } from 'src/app/components/dialogs/edit-modelstock-item-dialog/edit-modelstock-item-dialog.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { EventEmitter } from '@angular/core';
@Component({
  selector: 'app-modelstock-dt',
  templateUrl: './modelstock-dt.component.html',
  styleUrls: ['./modelstock-dt.component.scss']
})
export class ModelstockDtComponent implements OnInit {
  @Input() public itemsData: any[];
  @Input() public customerData: any[];
  @Output() public getCustomerItems: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  public displayedColumns = ['item_code', 'item', 'item_uom', 'capacity', 'total_number_of_facing', 'actions'];
  selectedColumnFilter: string;

  constructor(private merService: MerchandisingService, public deleteDialog: MatDialog, private cts: CommonToasterService) {
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.itemSource = new MatTableDataSource(this.itemsData['distribution_model_stock_details']);
    this.itemSource.paginator = this.paginator;
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }

  editStockItem(item) {
    this.deleteDialog
      .open(EditModelstockItemDialogComponent, {
        width: '1000px',
        height: 'auto',
        hasBackdrop: true,
        position: {
          top: '5px',
        },
        data: item
      })
      .afterClosed()
      .subscribe((data) => {
        this.getCustomerItems.emit(this.customerData);
      });
  }

  deleteStockItem(item, index) {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Item ${item.item?.item_name}` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteBank(item, index);
      }
    });
  }

  public deleteBank(item, index): void {
    let delObj = { uuid: item.uuid, delete: true };
    this.merService.delModelStockItem(item.uuid).subscribe(result => {
      this.itemSource.data.splice(index, 1);
      this.cts.showSuccess("", "Deleted Successfully");

    });
  }
}
