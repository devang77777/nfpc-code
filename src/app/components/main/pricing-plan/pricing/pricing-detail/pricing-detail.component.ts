import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { DetailsService } from 'src/app/services/details.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Router } from '@angular/router';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { CustomPaggingComponent } from 'src/app/features/shared/custom-pagging/custom-pagging.component';
@Component({
  selector: 'app-pricing-detail',
  templateUrl: './pricing-detail.component.html',
  styleUrls: ['./pricing-detail.component.scss'],
})
export class PricingDetailComponent extends BaseComponent
  implements OnInit, OnChanges {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public pricing: any;
  @Input() public isDetailVisible: boolean;
  @ViewChild('customPagging', { static: true }) customPagging: CustomPaggingComponent;
  @ViewChild('customPagging1', { static: true }) customPagging1: CustomPaggingComponent;
  keyCombos: any[];
  public keyCombination: any[];
  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;
  public isPending: Boolean = false;
  private router: Router;
  constructor(
    private commonToasterService: CommonToasterService,
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    formDrawer: FormDrawerService,
    router: Router
  ) {
    super('Pricing');
    Object.assign(this, {
      apiService,
      deleteDialog,
      dataService,
      formDrawer,
      router,
    });
  }

  ngOnInit(): void { }
  ngOnChanges(): void {
    if (this.pricing && this.pricing.keyCombinations) {
      this.keyCombos = this.pricing.keyCombinations;
      this.keyCombos.splice(
        this.keyCombos.findIndex((x) => x.title == 'Item'),
        1
      );
    }
    if (!this.pricing) return;
    let items: any[] = this.pricing?.p_d_p_items;
    let itemPricing: any[] = [];
    items.forEach((item) => {
      itemPricing.push({
        name: item.item?.item_name + ' - ' + item.item?.item_code,
        description: '',
        uoms: [
          {
            name: item.item_uom?.name,
            id: item?.item_uom_id,
            price: item?.price,
            max_price: item?.max_price,
          },
        ],
      });
    });
    var output = [];

    itemPricing.forEach(function (item) {
      var existing = output.filter(function (v, i) {
        return v.name == item.name;
      });
      if (existing.length) {
        var existingIndex = output.indexOf(existing[0]);
        output[existingIndex].uoms = output[existingIndex].uoms.concat(
          item.uoms
        );
      } else {
        // item.uoms = [item.uoms];
        output.push(item);
      }
    });
    this.pricing.p_d_p_items = output;
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditPricing(): void {
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.pricing,
    });
    this.router.navigate([`pricing-plan/pricing/edit/${this.pricing.uuid}`]);
  }
  // public toggleStatus(): void {
  //   this.pricing.area_status = this.pricing.area_status === 0 ? 1 : 0;
  // }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete pricing plan ${this.pricing.name}`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deletePricingPlan();
        }
      });
  }
  rejectLoad(): void {
  }

  approveLoad(): void {
  }
  public openConfirmBox(type): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to ${type} Pricing ${this.pricing.name}`, btnText: type }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        if (type == 'approve') {
          this.approveLoad();
        } else if (type == 'reject') {
          this.rejectLoad();
        }
      }
    });
  }

  public deletePricingPlan(): void {
    let delObj = { uuid: this.pricing.uuid, delete: true };
    this.apiService.deletePricingPlan(this.pricing.uuid).subscribe((result) => {
      this.commonToasterService.showInfo(
        'Deleted',
        'Promotion deleted sucessfully'
      );
      this.updateTableData.emit(delObj);
      this.closeDetailView();
    });
  }
}
const keycombinations = [
  {
    title: 'Region',
    data: ['East', 'North'],
  },
  {
    title: 'Route',
    data: ['route1', 'route2', 'route3', 'route4', 'route5', 'route6'],
  },
  {
    title: 'Channel',
    data: ['Channel1'],
  },
  {
    title: 'Item Group',
    data: ['Group A'],
  },
];
