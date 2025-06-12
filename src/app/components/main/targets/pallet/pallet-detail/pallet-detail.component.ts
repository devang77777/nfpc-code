import { Subscription } from 'rxjs';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType, getCurrency, getCurrencyDecimalFormat } from 'src/app/services/constants';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ItemUoms } from '../../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { ItemAddTableHeader } from '../../../transaction/orders/order-models';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { DataEditor } from 'src/app/services/data-editor.service';
import { TargetService } from '../../target.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { FormBuilder } from '@angular/forms';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { Utils } from 'src/app/services/utils';
import { PalletPdfMakerService } from '../pallet-pdf-maker.service';
import { PalletPdfReturnService } from '../pallet-pdf-return.service';

@Component({
  selector: 'app-pallet-detail',
  templateUrl: './pallet-detail.component.html',
  styleUrls: ['./pallet-detail.component.scss']
})
export class PalletDetailComponent extends BaseComponent implements OnInit, OnDestroy {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public pallet: any;
  @Input() public isDetailVisible: boolean;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public orderStats: { key: string; label: string }[] = [
    { key: 'total_gross', label: 'Gross Total' },
    { key: 'total_vat', label: 'Vat' },
    { key: 'total_excise', label: 'Excise' },
    { key: 'total_net', label: 'Net Total' },
    { key: 'total_discount_amount', label: 'Discount' },
    { key: 'grand_total', label: 'Total' },
  ];
  public itemTableHeaders: ItemAddTableHeader[] = [];
  public uoms: ItemUoms[] | any = [];
  private router: Router;
  public inventoryData = [];
  private apiService: ApiService;
  private fds: FormDrawerService;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private dialogRef: MatDialog;
  private sanitizer: DomSanitizer;
  private dataService: DataEditor;
  private tService: TargetService;
  itemTableInventoryHeader: ItemAddTableHeader[];
  qtyInd = -1;
  itemList = [];
  selectedItems = [];
  settings = {};
  count = 6;
  reasonsList: any = [];
  isEdit = false;
  isDisableSave = true;
  itemLists = [];
  itemTableHeaders1 = ['Date', 'Item Code', 'Item Name', 'Qty', 'Pallet Type'];
  palletItemReturnList: any = [];
  selectedIndex = 0;
  constructor(
    apiService: ApiService,
    private cts: CommonToasterService,
    fds: FormDrawerService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    tService: TargetService,
    sanitizer: DomSanitizer,
    private palletPdfMakerService: PalletPdfMakerService,
    private palletPdfReturnService: PalletPdfReturnService
  ) {

    super('Pallet');
    Object.assign(this, {
      apiService,
      fds,
      dataService,
      dialogRef,
      formBuilder,
      router,
      sanitizer,
      route,
      tService,
    });

  }

  ngOnInit(): void {
    this.itemTableHeaders = ITEM_ADD_FORM_TABLE_HEADS;
    this.itemTableInventoryHeader = ITEM_ADD_FORM_TABLE_HEADS_INV;
    this.subscriptions.push(
      this.apiService.getItemUom().subscribe((result) => {
        this.uoms = result.data;
      })
    );
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.pallet) {
        ;

        // this.selectedItems = [
        //   { "id": 1, "itemName": "India", "name": "IN" }];
        this.settings = {
          enableSearchFilter: true,
          singleSelection: true,
          classes: "myclass custom-class",
          disabled: true,
          badgeShowLimit: 2,
          maxHeight: 141,
          autoPosition: false,
          position: 'bottom'
        };

        let currentValue = changes.pallet.currentValue;
        this.pallet = currentValue;
        if (this.pallet) {

          this.getPalletDetails();
          this.getPalletReturns();
        }
        // this.pallet.salesman_unload_details.forEach(element => {
        //   let reason = { id: element.reason.id, itemName: element.reason.code + ' - ' + element.reason.name };
        //   element.reason=null;
        //   element.reason.push(reason);
        //   element.reason ? element.reason.push({ id: element.reason.id, itemName: element.reason.code + ' - ' + element.reason.name }) : null
        // });
        this.apiService.getReturnAllReasonsType().subscribe(res => {
          this.reasonsList = res.data;
          this.itemList = this.reasonsList.map(i => ({ id: i.id, itemName: i.code + ' - ' + i.name }));
        });
        if (this.palletItemReturnList) {
          this.palletItemReturnList?.forEach(element => {
            if (element.reason) {
              let reason = { id: element?.reason?.id, itemName: element?.reason.code + ' - ' + element.reason.name };
              element.reason = [];
              element.reason.push(reason);
            }
            // element.reason ? element.reason.push({ id: element.reason.id, itemName: element.reason.code + ' - ' + element.reason.name }) : null
          });
        }
      }
    }
  }
  getPalletDetails() {
    this.tService.getPalletDetailsBySalesman(this.pallet?.salesman_id).subscribe(res => {
      this.itemLists = res.data;
    });
  }
  getPalletReturns() {
    this.tService.getPalletReturn(this.pallet?.salesman_id).subscribe(res => {
      this.palletItemReturnList = res.data;
      this.palletItemReturnList.forEach(element => {
        element.isQtyChange = false;
      });
    });
  }
  enableEdit() {
    this.settings = {
      enableSearchFilter: true,
      singleSelection: true,
      classes: "myclass custom-class",
      disabled: false,
      badgeShowLimit: 2,
      maxHeight: 141,
      autoPosition: false,
      position: 'bottom'
    };
    this.isEdit = !this.isEdit;
    this.isDisableSave = true;
  }
  changeQty(qty, i) {
    this.qtyInd = i;
    if (+this.palletItemReturnList[i].original_item_qty !== +qty) {
      this.palletItemReturnList[i]['isQtyChange'] = true;
      this.isDisableSave = false;
    } else {
      this.palletItemReturnList[i]['reason'] = null;
      this.palletItemReturnList[i]['isQtyChange'] = false;
      this.isDisableSave = true;
    }
    this.palletItemReturnList[i].qty = qty;
  }
  OnItemDeSelect(item: any) {
  }
  onSelectAll(items: any) {
  }
  onDeSelectAll(items: any, i) {
    this.isDisableSave = false;
    this.palletItemReturnList[i]['isQtyChange'] = true;
  }
  onItemSelect(item: any, i) {
    this.isDisableSave = true;
    this.palletItemReturnList[i]['isQtyChange'] = false;
  }
  savePallet() {
    this.pallet.items = [...this.palletItemReturnList];
    const model: any = [];
    this.palletItemReturnList.forEach(element => {
      model.push(
        {
          "id": element.id,
          "approval_status": "1",
          "qty": element.qty
        }
      );
    });
    const palletModel = {
      "pallets": model
    };
    // this.pallet.items.forEach(element => {
    //   if (element.reason) {
    //     let reason = [...element.reason];
    //     element.reason_id = reason[0].id;
    //     element.reason = null;
    //   }
    //   delete element.isQtyChange
    // });
    this.qtyInd = -1;
    this.tService
      .updatePalletReturn(palletModel)
      .subscribe((res) => {
        this.isEdit = false;
        this.dataService.sendData({
          type: CompDataServiceType.GET_NEW_DATA,
          data: { id: this.pallet.id }
        });
        this.detailsClosed.emit();
        this.fds.close();
        this.getDocumentForReturn();
      });

  }
  getDocumentForReturn() {
    this.palletPdfReturnService.palletData = this.palletItemReturnList;
    this.palletPdfReturnService.generatePDF();
  }
  selectedTabChange(index) {
    this.selectedIndex = index;
  }

  approve() {

    if (this.pallet && this.pallet.objectid) {
      this.apiService
        .approveItem(this.pallet.objectid)
        .subscribe((res: any) => {

          const approvedStatus: boolean = res.data.approved_or_rejected;
          if (res.status && approvedStatus) {
            this.cts.showSuccess(
              'Approved',
              'Salesman Unload has been Approved'
            );
            this.dataService.sendData({
              type: CompDataServiceType.GET_NEW_DATA,
              data: { id: this.pallet.id }
            });
            this.closeDetailView();
          }
        });
    }
  }
  reject() {

    if (this.pallet && this.pallet.objectid) {
      this.apiService
        .rejectItemApproval(this.pallet.objectid)
        .subscribe((res: any) => {
          this.cts.showSuccess(
            'Reject',
            'Salesman Unload Approval has been Rejected'
          );
          this.dataService.sendData({
            type: CompDataServiceType.GET_NEW_DATA,
            data: { id: this.pallet.id }
          });
          this.closeDetailView();
        });
    }
  }
  getInventoryData(data) {
    var inventoryArray = [];
    if (data.length > 1) {
      for (var i = 0; i < data.length; i++) {
        if (inventoryArray.length !== 0) {
          const val = inventoryArray.find((x) => x.item_id == data[i].item_id && x.item_uom == data[i].item_uom);
          if (val) {
            if (data[i].unload_type == 1) {
              val.freshInv = data[i].load_qty;
            } else if (data[i].unload_type == 4) {
              val.env_qty = data[i].load_qty
            }
          } else {
            if (data[i].unload_type == 4) {
              data[i].env_qty = data[i].load_qty;
              data[i].freshInv = 0;
            } else if (data[i].unload_type == 1) {
              data[i].env_qty = 0;
              data[i].freshInv = data[i].load_qty;
            }
            inventoryArray.push(data[i]);
          }
        } else {
          if (data[i].unload_type == 4) {
            data[i].env_qty = data[i].load_qty;
            data[i].freshInv = 0;
          } else if (data[i].unload_type == 1) {
            data[i].env_qty = 0;
            data[i].freshInv = data[i].load_qty;
          }
          inventoryArray.push(data[i]);
        }
      }
    } else {
      data.forEach(element => {
        if (element.unload_type == 1) {
          element.freshInv = element.load_qty;
          element.env_qty = 0;
        } else if (element.unload_type == 4) {
          element.env_qty = element.load_qty
          element.freshInv = 0;
        }
      });
      inventoryArray = [...data];
    }
    this.inventoryData = inventoryArray;
    this.pallet.inventoryData = this.inventoryData;
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.isEdit = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.pallet?.salesman_code}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deletePallet();
        }
      });
  }

  private deletePallet(): void {
    this.tService
      .deletePallet(this.pallet.uuid)
      .subscribe(() => {
        this.cts.showInfo('Salesman Unload Deleted sucessfully');
        // this.router.navigate(['transaction/invoice']);
        this.isDetailVisible = false;
        this.detailsClosed.emit();
        this.dataService.sendData({
          type: CompDataServiceType.CLOSE_DETAIL_PAGE,
          uuid: this.pallet.uuid,
        });
      });
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
  getUnloadTypeValue(element) {
    var val = '';
    if (element == 4) {
      val = 'End Inventory';
    } else if (element == 5) {
      val = 'Variance';
    } else if (element == 1) {
      val = 'Fresh Unload';
    } else {
      val = '';
    }
    return val;
  }
  getDocument() {
    // this.palletPdfMakerService.unloadData = this.pallet;
    // this.palletPdfMakerService.generatePDF()
  }
}

const ITEM_ADD_FORM_TABLE_HEADS: ItemAddTableHeader[] = [
  { id: 1, key: 'sequence', label: 'Date', show: true },
  { id: 2, key: 'sequence', label: 'Request No', show: true },
  { id: 3, key: 'item_code', label: 'Item Code', show: true },
  { id: 4, key: 'item', label: 'Item Name', show: true },
  { id: 5, key: 'qty', label: 'Quantity', show: true },
  { id: 6, key: 'reason', label: 'Reason', show: true },
];
const ITEM_ADD_FORM_TABLE_HEADS_INV: ItemAddTableHeader[] = [
  { id: 0, key: 'sequence', label: '#', show: true },
  { id: 1, key: 'item_code', label: 'Item Code', show: true },
  { id: 1, key: 'item', label: 'Item Name', show: true },
  { id: 2, key: 'uom', label: 'UOM', show: true },
  { id: 2, key: 'end_qty', label: 'End Inventory Qty', show: true },
  { id: 3, key: 'fresh_qty', label: 'Fresh Unload Qty', show: true }
];



