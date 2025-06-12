import { Component, EventEmitter, OnInit, Output, Input, OnChanges } from '@angular/core';
import { DetailsService } from 'src/app/services/details.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Item } from '../item-dt/item-dt.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ActivatedRoute } from '@angular/router';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
})
export class ItemDetailComponent extends BaseComponent implements OnInit, OnChanges {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public item: Item | any;
  @Input() public isDetailVisible: boolean;
  public uoms;
  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;
  formPopulateData: any;
  constructor(
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    private commonToasterService: CommonToasterService,
    private route: ActivatedRoute,
    formDrawer: FormDrawerService
  ) {
    super('Item');

    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });

  }
  ngOnChanges() {
    const tempData: any = [];
    this.item?.item_main_price.forEach(element => {
      if (element.is_secondary == null) {
        element.is_secondary = 0;
      }
      if (element?.is_secondary !== 1) {
        tempData.push(element);
      }
    });
    if (tempData.length > 1 && tempData[1]) {
      tempData[1].is_secondary = 2;
    }
  }
  ngOnInit(): void {
    this.formPopulateData = this.route.snapshot.data[
      'item_resolve'
    ].itemAdd.data;
    this.uoms = this.formPopulateData.item_uom;

  }
  public getUOMName(id) {
    const name = this.uoms.find((x) => x.id == id);
    return name ? name.name : '';
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditItem(): void {
    this.formDrawer.setFormName('item');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.item,
    });
  }
  public toggleStatus(): void {
    this.item.item_status = this.item.item_status === 0 ? 1 : 0;
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete item ${this.item.item_name}`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteItem();
        }
      });
  }

  public deleteItem(): void {
    let delObj = { uuid: this.item.uuid, delete: true };
    this.apiService.deleteItem(this.item.uuid).subscribe((result) => {
      this.commonToasterService.showInfo('Deleted', 'Item deleted Sucessfully');
      this.updateTableData.emit(delObj);
      this.closeDetailView();
    });
  }
  public uomItemsTitle(value) {
    if (value?.is_secondary === 1) {
      return 'Secondary UOMs';
    } else if (value?.is_secondary === 0) {
      return 'Third UOMs';
    } else if (value?.is_secondary === 2) {
      return 'Other UOMs';
    }
  }
}
