import { FormGroup, FormControl } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { JourneyPlanCustomerModel, JourneyPlanDayModel, JourneyPlanWeekModel } from '../../journey-plan-model';

@Component({
  selector: 'app-jp-detail-customer-table',
  templateUrl: './jp-detail-customer-table.component.html',
  styleUrls: ['./jp-detail-customer-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JpDetailCustomerTableComponent implements OnInit, OnChanges {

  @Input() public customersData: JourneyPlanWeekModel[] | JourneyPlanDayModel[];
  @Input() public isWeekly: boolean;
  @Input() public journeyId: number;
  selectedColumnFilter: string;
  allcustomerData: JourneyPlanWeekModel[] | JourneyPlanDayModel[];

  public hasNewChanges: boolean;
  public tableHeads = ['Sequence', 'Name', 'Code', 'Start Time', 'End Date'];

  private changeDetectorRef: ChangeDetectorRef;

  constructor(changeDetectorRef: ChangeDetectorRef) {
    Object.assign(this, { changeDetectorRef });
  }
  filterForm: FormGroup;
  public ngOnInit(): void {
    this.filterForm = new FormGroup({
      customer: new FormControl(''),
      customer_code: new FormControl(''),
    })
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(status, day, weekIndex, dayIndex) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue("");
      // return;
    }
    //Filter only if he click on yes button
    //add the validation here if selected control has the value 
    this.filterData(day, weekIndex, dayIndex);
  }
  filterData(day, weekIndex, dayIndex) {
    let form = this.filterForm.value;
    if (form.customer_code == "" && form.customer == "") {
      this.customersData = this.cloneData(this.allcustomerData);
      return false;
    }
    let users = [];
    let filterIn = [];
    if (!this.isWeekly) {
      filterIn = this.cloneData(this.allcustomerData[dayIndex]['journey_plan_customers']);
    } else {
      filterIn = this.cloneData(this.allcustomerData[weekIndex]['journey_plan_days'][dayIndex]['journey_plan_customers']);
    }
    if (form.customer_code !== "" && form.customer !== "") {
      users = filterIn.filter((x) => { return ((x.customer_info.customer_code.includes(form.customer_code)) && (x.customer_info.user.firstname.toLowerCase().includes(form.customer.toLowerCase()))) });
    } else if (form.customer_code !== "") {
      users = filterIn.filter((x) => { return x.customer_info.customer_code.includes(form.customer_code) });
    } else if (form.customer !== "") {
      users = filterIn.filter((x) => { return x.customer_info.user.firstname.toLowerCase().includes(form.customer.toLowerCase()) });
    }
    if (!this.isWeekly) {
      this.customersData[dayIndex]['journey_plan_customers'] = users;
    } else {
      this.customersData[weekIndex]['journey_plan_days'][dayIndex]['journey_plan_customers'] = users;
    }

  }

  cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.hasNewChanges = false;
    this.changeDetectorRef.detectChanges();

    if (changes.customersData && changes.customersData.currentValue) {
      this.hasNewChanges = true;
      if (this.isWeekly) {
        this.customersData.sort((item1, item2) => {
          const charItem1 = Number(item1.week_number.charAt(item1.week_number.length - 1));
          const charItem2 = Number(item2.week_number.charAt(item2.week_number.length - 1));

          return charItem1 - charItem2;
        });
      }
      this.allcustomerData = this.cloneData(this.customersData);

      this.changeDetectorRef.detectChanges();
    }
  }

  public getWeekNameLabel(weekName: string): string {
    const weekNumber = weekName.charAt(weekName.length - 1);

    return `Week ${weekNumber}`;
  }

  public getUsersName(customer: JourneyPlanCustomerModel): string {
    if (customer.customer_info) {
      return `${customer.customer_info.user.firstname} ${customer.customer_info.user.lastname}`;
    }
    return 'No name';
  }
}
