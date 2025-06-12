import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Customer } from 'src/app/components/main/master/customer/customer-dt/customer-dt.component';
import { JourneyWeeklyConfig } from 'src/app/features/shared/shared-interfaces';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { JourneyPlanFormData } from '../../journey-plan-model';

@Component({
  selector: 'app-journey-plan-form-customers',
  templateUrl: './journey-plan-form-customers.component.html',
  styleUrls: ['./journey-plan-form-customers.component.scss']
})
export class JourneyPlanFormCustomersComponent implements OnInit, OnDestroy {
  @Input() public journeyPlanFormGroup: FormGroup;
  @Input() public isEditForm: boolean;
  @Input() public getCustomersByObj;

  public daysFormGroup: FormGroup;
  public weeksFormGroup: FormGroup;

  public isWeekly: boolean;
  public currentIndex: number;
  public weeklyCustomers: Customer[] = [];
  public dailyCustomers: Customer[] = [];
  public appliedWeeks: JourneyWeeklyConfig[];
  public weeklyConfigs: JourneyWeeklyConfig[] = [
    { tabLabel: 'Week 1 [1-7]', number: 1 },
    { tabLabel: 'Week 2 [8-14]', number: 2 },
    { tabLabel: 'Week 3 [15-21]', number: 3 },
    { tabLabel: 'Week 4 [22-28]', number: 4 },
    { tabLabel: 'Week 5 [29-31]', number: 5 }
  ];

  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  private detectorRef: ChangeDetectorRef;

  constructor(apiService: ApiService, dataEditor: DataEditor, detectorRef: ChangeDetectorRef) {
    Object.assign(this, { apiService, dataEditor, detectorRef });
  }

  public ngOnInit(): void {
    this.currentIndex = 0;
    this.isWeekly = this.journeyPlanFormGroup.controls['plan_type'] && this.journeyPlanFormGroup.controls['plan_type'].value === 'week';

    this.daysFormGroup = new FormGroup({});
    this.weeksFormGroup = new FormGroup({});

    this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
      if (result.type === CompDataServiceType.SETUP_JOURNEY_PLAN_EDIT_FORM) {
        this.setupEditForm(result.data);
      }
    }));

    this.subscriptions.push(this.journeyPlanFormGroup.controls['plan_type'].valueChanges.subscribe(value => {
      this.isWeekly = this.journeyPlanFormGroup.controls['plan_type'].value === 'week';
    }));

    this.subscriptions.push(this.journeyPlanFormGroup.controls.weeks.valueChanges.subscribe(value => {
      this.appliedWeeks = [];
      // console.log(this.journeyPlanFormGroup.value, value, this.weeklyConfigs)
      Object.values(value).forEach((item, index) => {
        if (item) {
          
          return this.appliedWeeks.push(this.weeklyConfigs[index]);
        }
      });
      // console.log(this.journeyPlanFormGroup.value, value, this.weeklyConfigs)
    }));

    this.subscriptions.push(this.daysFormGroup.valueChanges.subscribe(data => {
      this.updateJourneyPlanFormGroup(data);
    }));

    this.subscriptions.push(this.weeksFormGroup.valueChanges.subscribe(data => {
      this.updateJourneyPlanFormGroup(data);
    }));
  }

  ngOnChanges(changes: SimpleChanges) {
    //console.log(this.isEditForm);
    if (changes.getCustomersByObj) {
      let currentValue = changes.getCustomersByObj.currentValue;
      if (currentValue !== undefined) {
        if (currentValue.id !== undefined && currentValue.isEdit !== true) {
          this.subscriptions.push(this.apiService.getCustomersByMerchandiser(currentValue).subscribe(result => {
            this.weeklyCustomers = [];
            this.dailyCustomers = [];
            Object.assign(this.weeklyCustomers, result.data);
            Object.assign(this.dailyCustomers, result.data);
            if (this.isWeekly) {
              this.dataEditor.sendData({ type: CompDataServiceType.SETUP_JOURNEY_INITIAL_USERS_TABLE, data: { isWeekly: this.isWeekly, customers: this.weeklyCustomers } });
            } else {
              this.dataEditor.sendData({ type: CompDataServiceType.SETUP_JOURNEY_INITIAL_USERS_TABLE, data: { isWeekly: this.isWeekly, customers: this.dailyCustomers } });
            }
          }));
        }
      }
    }
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private updateJourneyPlanFormGroup(data: any): void {
    if (this.journeyPlanFormGroup.contains('customers')) {
      this.journeyPlanFormGroup.controls['customers'].setValue(data);
    } else {
      this.journeyPlanFormGroup.addControl('customers', new FormControl(data));
    }
  }

  private setupEditForm(journey: JourneyPlanFormData): void {
    // console.log(journey)
    this.isWeekly = journey.plan_type === "week";
    // console.log(this.journeyPlanFormGroup.value, journey.weeks, this.weeklyConfigs)
    if (this.isWeekly) {
      this.appliedWeeks = [];
      Object.values(journey.weeks).forEach((item, index) => {
        if (item) {
          // console.log(this.journeyPlanFormGroup.value, journey.weeks, this.weeklyConfigs, item, index, this.weeklyConfigs[index], this.appliedWeeks)
          return this.appliedWeeks.push(this.weeklyConfigs[index]);
        }
      });
    }

    this.detectorRef.detectChanges();
  }
}
