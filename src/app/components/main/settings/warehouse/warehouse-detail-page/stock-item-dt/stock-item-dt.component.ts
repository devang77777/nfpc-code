import { Component, OnInit, Input, ViewChild, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { EditModelstockItemDialogComponent } from 'src/app/components/dialogs/edit-modelstock-item-dialog/edit-modelstock-item-dialog.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-stock-item-dt',
  templateUrl: './stock-item-dt.component.html',
  styleUrls: ['./stock-item-dt.component.scss']
})
export class StockItemDtComponent implements OnInit {
  @Input() public itemsData: any[];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  public displayedColumns = ['item_code', 'item_name', 'name', 'qty'];
  selectedColumnFilter: string;
  filterColumnName: string = "item_code";
  constructor(public deleteDialog: MatDialog, private cts: CommonToasterService) {
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {

  }

  ngOnChanges(): void {
    this.itemSource = new MatTableDataSource(this.itemsData);
    this.itemSource.paginator = this.paginator;

  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
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
        // this.getCustomerItems.emit(this.customerData);
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
    // this.merService.delModelStockItem(item.uuid).subscribe(result => {
    //   this.itemSource.data.splice(index, 1);
    //   this.cts.showSuccess("", "Deleted Successfully");

    // });
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
    this.filterColumnName = item;
  }
  onColumnFilter(item) {

  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    var r = this.filterColumnName;
    this.itemSource.filterPredicate = function (data: any, filterValue: string) {
      return data.item[r].trim().toLocaleLowerCase().indexOf(filterValue.trim().toLocaleLowerCase()) >= 0;
    };
    this.itemSource.filter = filterValue;

  }
}
