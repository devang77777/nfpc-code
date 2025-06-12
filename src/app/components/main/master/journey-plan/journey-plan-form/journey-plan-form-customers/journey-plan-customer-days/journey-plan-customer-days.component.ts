import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Customer } from 'src/app/components/main/master/customer/customer-dt/customer-dt.component';
import { JourneyDaysConfig, DAYS_CONFIG } from 'src/app/features/shared/shared-interfaces';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-journey-plan-customer-days',
  templateUrl: './journey-plan-customer-days.component.html',
  styleUrls: ['./journey-plan-customer-days.component.scss']
})
export class JourneyPlanCustomerDaysComponent implements OnInit {
  @Input() public journeyPlanFormGroup: FormGroup;
  @Input() public daysFormGroup: FormGroup;
  @Input() public weeksFormGroup: FormGroup;
  @Input() public isWeekly: boolean;
  @Input() public customers: Customer[] = [];
  @Input() public weekNumber?: number;
  @Input() public getCustomersByObj;

  public dailyTableControl: FormControl;
  public weeklyTableControl: FormControl;

  public dayConfigs: JourneyDaysConfig[] = [
    { label: 'Monday', number: 1 },
    { label: 'Tuesday', number: 2 },
    { label: 'Wednesday', number: 3 },
    { label: 'Thursday', number: 4 },
    { label: 'Friday', number: 5 },
    { label: 'Saturday', number: 6 },
    { label: 'Sunday', number: 7 }
  ];

  private subscription: Subscription[] = [];
  private weeklyData = {};
  private dataService: DataEditor;

  constructor(dataService: DataEditor, public cts: CommonToasterService,) {
    Object.assign(this, { dataService });
  }

  public ngOnInit(): void {
    this.dailyTableControl = new FormControl();
    this.weeklyTableControl = new FormControl();

    this.setupDays(this.journeyPlanFormGroup.controls['start_day_of_the_week'].value);

    this.subscription.push(this.dailyTableControl.valueChanges.subscribe(value => {
      if (this.daysFormGroup.contains(`day${value.day_number}`)) {
        this.daysFormGroup.controls[`day${value.day_number}`].setValue(value);
      } else {
        this.daysFormGroup.addControl(`day${value.day_number}`, new FormControl(value));
      }
    }));

    this.subscription.push(this.weeklyTableControl.valueChanges.subscribe(value => {
      this.weeklyData = {
        ...this.weeklyData,
        [`day${value.day_number}`]: value
      };
      if (this.weeksFormGroup.contains(`week${value.week_number}`)) {
        this.weeksFormGroup.controls[`week${value.week_number}`].setValue(this.weeklyData);
      } else {
        this.weeksFormGroup.addControl(`week${value.week_number}`, new FormControl(this.weeklyData));
      }
    }));

    this.subscription.push(this.journeyPlanFormGroup.controls['weeks'].valueChanges.subscribe(value => {
      const weeks = Object.keys(value);

      this.weeksFormGroup && weeks.forEach((key, index) => {
        if (!value[key] && this.weeksFormGroup.contains(`week${index + 1}`)) {
          this.weeksFormGroup.removeControl(`week${index + 1}`);
        }
      });
    }));

    this.subscription.push(this.journeyPlanFormGroup.controls['start_day_of_the_week'].valueChanges.subscribe(value => {
      this.setupDays(value);
    }));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.customers) {
      //console.log(changes.customers);
      let values = changes.customers.currentValue;
      this.customers = values;
    }
  }

  public applyToAllDays(data: JourneyDaysConfig): void {
    if (this.weeksFormGroup) {
      const weeklyDayData = this.weeksFormGroup.controls[`week${this.weekNumber}`].value;
      const customers = weeklyDayData[`day${data.number}`].customers;

      Object.keys(weeklyDayData).forEach(item => {
        if (item !== `day${data.number}`) {
          weeklyDayData[item].customers = customers;
        }
      });

      this.weeksFormGroup.controls[`week${this.weekNumber}`].setValue(weeklyDayData);
      this.dataService.sendData({ type: CompDataServiceType.UPDATE_JOURNEY_CUSTOMER_DATA, data: { weekNumber: this.weekNumber, newData: weeklyDayData } });

    } else if (this.daysFormGroup) {
      const customers = this.daysFormGroup.controls[`day${data.number}`].value.customers;

      Object.keys(this.daysFormGroup.controls).forEach(item => {
        if (item !== `day${data.number}`) {
          const oldData = this.daysFormGroup.controls[item].value;
          oldData.customers = customers;
          this.daysFormGroup.controls[item].setValue(oldData);
          this.dataService.sendData({ type: CompDataServiceType.UPDATE_JOURNEY_CUSTOMER_DATA, data: { weekNumber: undefined, newData: this.daysFormGroup.value } })
        }
      });
    }
    this.cts.showSuccess('Success', 'Coppied to all days Successfully')
  }

  public applyToAllWeekDays(data: JourneyDaysConfig): void {
    if (this.weeksFormGroup) {
      let weeklyDayData = this.weeksFormGroup.value;
      const customers = weeklyDayData[`week${this.weekNumber}`][`day${data.number}`].customers;
      Object.keys(weeklyDayData).forEach((element, key) => {
        if (element !== `week${this.weekNumber}`) {
          Object.keys(weeklyDayData[element]).forEach(item => {
            if (item == `day${data.number}`) {
              weeklyDayData[element][item].customers = customers;
              this.weeksFormGroup.controls[element].setValue(weeklyDayData[element]);
              this.dataService.sendData({ type: CompDataServiceType.UPDATE_JOURNEY_CUSTOMER_DATA, data: { weekNumber: key + 1, newData: weeklyDayData[element] } });
            }
          });

        }
      });
      this.cts.showSuccess('Success', 'Coppied to all weeks Successfully')
    }

  }

  private setupDays(day: string): void {
    const firstDay = DAYS_CONFIG.findIndex(item => {
      return item.label.toLowerCase() === day;
    });

    const newDays: JourneyDaysConfig[] = [...DAYS_CONFIG.slice(firstDay), ...DAYS_CONFIG.slice(0, firstDay)];

    newDays.forEach((item: JourneyDaysConfig, index: number) => {
      this.dayConfigs[index].label = `${item.label}`;
    });
  }
}
