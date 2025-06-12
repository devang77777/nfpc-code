import { Component, Input, OnDestroy, OnInit, OnChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
// import { RouteMaster } from '../../../../components/datatables/route-master-dt/route-master-dt.component';
import { RouteMaster } from 'src/app/components/main/settings/location/route/route-master-dt/route-master-dt.component';
import { ApiService } from 'src/app/services/api.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-promotion-form-promotion',
  templateUrl: './promotion-form-promotion.component.html',
  styleUrls: ['./promotion-form-promotion.component.scss'],
})
export class PromotionFormPromotionComponent implements OnInit, OnChanges {
  @Input() public overviewFormGroup: FormGroup;
  @Input() public editData: any;

  public nameFormControl: FormControl;
  public sdateFormControl: FormControl;
  public edateFormControl: FormControl;
  public routesFormControl: FormControl;
  public orderTypeFormControl: FormControl;
  public offerTypeFormControl: FormControl;
  public routes: RouteMaster[] = [];

  private apiService: ApiService;
  private subscriptions: Subscription[] = [];

  constructor(apiService: ApiService) {
    Object.assign(this, { apiService });
  }

  public ngOnInit(): void {
    this.nameFormControl = new FormControl('');
    this.sdateFormControl = new FormControl('');
    this.edateFormControl = new FormControl('');
    this.routesFormControl = new FormControl('');
    this.orderTypeFormControl = new FormControl('');
    this.offerTypeFormControl = new FormControl('');

    this.overviewFormGroup.addControl('name', this.nameFormControl);
    this.overviewFormGroup.addControl('startDate', this.sdateFormControl);
    this.overviewFormGroup.addControl('endDate', this.edateFormControl);
    this.overviewFormGroup.addControl('routes', this.routesFormControl);
    this.overviewFormGroup.addControl('orderType', this.orderTypeFormControl);
    this.overviewFormGroup.addControl('offerType', this.offerTypeFormControl);

    // this.subscriptions.push(
    //   this.apiService.getAllRoute().subscribe((result) => {
    //     this.routes = result.data;
    //   })
    // );
    // this.subscriptions.push(
    this.apiService.getMasterDataLists().subscribe((result: any) => {
      this.routes = result.data.routes;
    })
    // );
  }
  public ngOnChanges() {
    if (this.editData) {
      this.nameFormControl.setValue(this.editData.name);
      this.sdateFormControl.setValue(this.editData.start_date);
      this.edateFormControl.setValue(this.editData.end_date);
      this.orderTypeFormControl.setValue(this.editData.order_item_type);
      this.offerTypeFormControl.setValue(this.editData.offer_item_type);
    }
  }
  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }
}
