import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import {
  APP_CURRENCY_CODE,
  CompDataServiceType,
} from 'src/app/services/constants';
import { FormBuilder } from '@angular/forms';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { Subscription } from 'rxjs';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { ItemUoms } from '../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { ITEM_ADD_FORM_TABLE_HEADS } from '../../transaction/orders/order-form/order-form.component';
import {
  ItemAddTableHeader,
  OrderItemsPayload,
} from '../../transaction/orders/order-models';

import { CommonToasterService } from '../../../../services/common-toaster.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EstimateService } from '../estimate.service';

@Component({
  selector: 'app-estimatedetail',
  templateUrl: './estimatedetail.component.html',
  styleUrls: ['./estimatedetail.component.scss'],
})
export class EstimatedetailComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public estimateData: any;
  @Input() public isDetailVisible: boolean;

  public uuid: string;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public hasApprovalPending: boolean;
  public orderStats: { key: string; label: string }[] = [
    { key: 'price', label: 'Gross Total' },
    { key: 'vat', label: 'Vat' },
    { key: 'excise', label: 'Excise' },
    { key: 'total_net', label: 'Net Total' },
    { key: 'discount', label: 'Discount' },
    { key: 'total', label: 'Total' },
  ];
  private sanitizer: DomSanitizer;
  estimateService: EstimateService;

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public uoms: ItemUoms[] | any = [];
  public terms: PaymentTerms[] = [];
  estimateTemplate: any;
  private router: Router;
  private apiService: ApiService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  emailData: any;
  private dialogRef: MatDialog;
  public storepurchas: any[] = [];
  constructor(
    apiService: ApiService,
    private CommonToasterService: CommonToasterService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    sanitizer: DomSanitizer,
    estimateService: EstimateService
  ) {
    super('Estimate');
    Object.assign(this, {
      apiService,
      dataService,
      dialogRef,
      formBuilder,
      estimateService,
      router,
      route,
      sanitizer,
    });
  }

  public ngOnInit(): void {
    this.itemTableHeaders = ITEM_ADD_FORM_TABLE_HEADS;
    this.subscriptions.push(
      this.apiService.getItemUom().subscribe((result) => {
        this.uoms = result.data;
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.estimateData?.currentValue != changes.estimateData?.previousValue
    ) {
      this.initForm(changes.estimateData.currentValue);
      this.uuid = this.estimateData.uuid;
      if (this.estimateData.id) {
        this.getDocument('print');
      }
    }
  }
  initForm(data) {
    const orgName = localStorage.getItem('org_name');
    const subject = `${orgName} sent you an estimate`;
    const message = `${orgName} sent you an estimate`;
    this.emailData = {
      email: data.customer.email,
      subject,
      message,
      type: 'estimate',
    };
  }
  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  getDocument = (type) => {
    const model = {
      id: this.estimateData.id,
      status: type,
    };

    this.estimateService.getDocument(model).subscribe((res: any) => {
      if (res.status) {
        if (res.data && res.data.html_string) {
          this.estimateTemplate = this.sanitizer.bypassSecurityTrustHtml(
            res.data.html_string
          );
        } else {
          const link = document.createElement('a');
          link.setAttribute('target', '_blank');
          link.setAttribute('href', `${res.data.file_url}`);
          link.setAttribute('download', `statement.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      }
    });
  };
  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );

    return selectedUom ? selectedUom.name : '';
  }

  public goToOrders(): void {
    this.router.navigate(['/estimate']);
  }

  public editOrder(): void {
    this.router.navigate(['/estimate/edit', this.uuid]);
  }

  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.estimateData.estimate_code}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteEstimate();
        }
      });
  }
  
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }
  public startDelivery(): void {
    this.router.navigate([
      'inventory/purchase-order/start-delivery',
      this.uuid,
    ]);
  }

  private deleteEstimate(): void {
    this.apiService
      .deleteEstimation(this.estimateData.uuid)
      .subscribe((result) => {
        this.CommonToasterService.showInfo('Estimate Deleted sucessfully');
        this.isDetailVisible = false;
        this.detailsClosed.emit();
        this.dataService.sendData({
          type: CompDataServiceType.CLOSE_DETAIL_PAGE,
          uuid: this.estimateData.uuid,
        });
      });
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
interface Food {
  value: string;
  viewValue: string;
  routeValue: string;
  bank: string;
}
