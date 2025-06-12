import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Promotional } from '../promotional-interface';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MerchandisingService } from '../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
@Component({
  selector: 'app-promo-detail',
  templateUrl: './promo-detail.component.html',
  styleUrls: ['./promo-detail.component.scss']
})
export class PromoDetailComponent extends BaseComponent implements OnInit {

  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public Promotional: Promotional | any;
  @Input() public isDetailVisible: boolean;
  private dataService: DataEditor;
  private deleteDialog: MatDialog;
  private formDrawer: FormDrawerService;
  public selectedTab = 0;
  private subscriptions: Subscription[] = [];
  public postList = [];
  currentDate: string;
  constructor(apiService: ApiService, public merService: MerchandisingService, deleteDialog: MatDialog, private cts: CommonToasterService, dataService: DataEditor, formDrawer: FormDrawerService) {
    super('Promotional Accountability');
    Object.assign(this, { apiService, merService, deleteDialog, dataService, formDrawer });
  }

  ngOnInit(): void {
    let today = new Date();
    let month = '' + (today.getMonth() + 1);
    let date = '' + (today.getDate());
    if ((today.getMonth() + 1) < 10) {
      month = '0' + (today.getMonth() + 1);
    }
    if ((today.getDate()) < 10) {
      date = '0' + (today.getDate());
    }
    this.currentDate = today.getFullYear() + '-' + month + '-' + date;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.competitor) {
        let currentValue = changes.competitor.currentValue;
        this.Promotional = currentValue;
      }
      this.selectedTabChange(this.selectedTab);
    }
  }

  public openDeleteBox(): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Promotion ${this.Promotional.item.item_name}` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteBank();
      }
    });
  }

  selectedTabChange(index) {
    switch (index) {
      case 1:
        this.getPromotionalPostList('date', this.currentDate);
        break;
    }
  }

  getPromotionalPostList(filter, value) {
    this.subscriptions.push(
      this.merService.getPromotionalPostList(this.Promotional.id, filter, value).subscribe((res) => {
        this.postList = res.data;
      })
    )
  }

  public openEditPromotion(): void {
    this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.Promotional });
    this.formDrawer.setFormName('add-promotional');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  public deleteBank(): void {
    let delObj = { uuid: this.Promotional.uuid, delete: true };
    this.merService.deletePromotional(this.Promotional.uuid).subscribe(result => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully");

    });
  }


  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.selectedTab = 0;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }
}
