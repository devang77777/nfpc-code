import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  OnChanges,
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

@Component({
  selector: 'app-discount-detail',
  templateUrl: './discount-detail.component.html',
  styleUrls: ['./discount-detail.component.scss'],
})
export class DiscountDetailComponent extends BaseComponent
  implements OnInit, OnChanges {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public discount: any;
  @Input() public isDetailVisible: boolean;
  keyCombos;
  public keyCombination: any[];
  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;
  private router: Router;
  constructor(
    private commonToasterService: CommonToasterService,
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    formDrawer: FormDrawerService,
    router: Router
  ) {
    super('Discount');
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
    if (this.discount && this.discount.keyCombinations) {
      this.keyCombos = this.discount.keyCombinations;
    }
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditPricing(): void {
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.discount,
    });
    this.router.navigate([`pricing-plan/discount/edit/${this.discount.uuid}`]);
  }
  // public toggleStatus(): void {
  //   this.pricing.area_status = this.pricing.area_status === 0 ? 1 : 0;
  // }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete discount ${this.discount.name}`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteDiscount();
        }
      });
  }

  public deleteDiscount(): void {
    let delObj = { uuid: this.discount.uuid, delete: true };
    this.apiService.deleteDiscount(this.discount.uuid).subscribe((result) => {
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
