import { CommonToasterService } from './../../../../../services/common-toaster.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { VanToVanModel, ITEM_VANTOVAN_TABLE_HEADS } from '../van-to-van.model';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { ItemAddTableHeader } from 'src/app/components/main/transaction/orders/order-models';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
@Component({
  selector: 'app-van-to-van-detail-page',
  templateUrl: './van-to-van-detail-page.component.html',
  styleUrls: ['./van-to-van-detail-page.component.scss'],
})
export class VanToVanDetailPageComponent extends BaseComponent
  implements OnInit {
  public uuid: string;
  public isDepotOrder: boolean;
  public vanToVanData: VanToVanModel;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public hasApprovalPending: boolean;

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public uoms: ItemUoms[] | any = [];

  private router: Router;
  private apiService: ApiService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private dialogRef: MatDialog;

  constructor(
    apiService: ApiService,
    dataService: DataEditor,
    private ctc: CommonToasterService,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute
  ) {
    super('Van to Van Transfer');
    Object.assign(this, {
      apiService,
      dataService,
      dialogRef,
      formBuilder,
      router,
      route,
    });
  }

  public ngOnInit(): void {
    this.itemTableHeaders = ITEM_VANTOVAN_TABLE_HEADS;
    this.uuid = this.route.snapshot.params.uuid;
    // this.apiService.getVanToVanById(this.uuid).subscribe((item) => {
    //   this.vanToVanData = item.data;
    // });
    // this.subscriptions.push(
    //   this.apiService.getAllItems().subscribe(result => {
    //     if(result.data.length) {
    //       let data = [];
    //       result.data.forEach(item => {
    //         data.push(item);
    //       });
    //       this.vanToVanData.items = data;
    //     }
    //   })
    // );

    // this.hasApprovalPending = Boolean(this.vanToVanData.approval_status);
    // this.subscriptions.push(this.apiService.getItemUom().subscribe(result => {
    //   this.uoms = result.data;
    // }));

    // //console.log("Van Data : ", this.vanToVanData);
    this.vanToVanData = this.route.snapshot.data['returnvan'].returnPurchase;
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public getUomValue(item: any): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id === item.lower_unit_uom_id
    );
    return selectedUom ? selectedUom.name : '';
  }

  public goToVan(): void {
    this.router.navigate(['supervisor/van-to-van-transfer']);
  }

  getQty(qty: any): number {
    return parseInt(qty);
  }

  public editOrder(): void {
    this.router.navigate(['supervisor/van-to-van-transfer/edit', this.uuid]);
  }

  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.vanToVanData[0].code}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteOder();
          this.router.navigate(['supervisor/van-to-van-transfer']);
        }
      });
  }

  private deleteOder(): void {
    this.apiService
      .deletevantovan(this.vanToVanData[0].uuid)
      .subscribe((result) => {
        this.ctc.showSuccess('', 'Deleted Successfully!Please Check');
        this.router.navigate(['supervisor/van-to-van-transfer']);
      });
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
