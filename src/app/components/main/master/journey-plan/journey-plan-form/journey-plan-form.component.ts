import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  JourneyFormsCustomerModel,
  JourneyFormsDayPlanModel,
  JourneyFormsWeekPlanModel,
  JourneyPlanCustomerModel,
  JourneyPlanDayModel,
  JourneyPlanFormData,
  JourneyPlanModel,
  JourneyPlanWeekModel,
} from '../journey-plan-model';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { DAYS_CONFIG } from 'src/app/features/shared/shared-interfaces';
import { MasterService } from '../../master.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-journey-plan-form',
  templateUrl: './journey-plan-form.component.html',
  styleUrls: ['./journey-plan-form.component.scss'],
})
export class JourneyPlanFormComponent implements OnInit {
  public getCustomersByObj;
  public disableCustomerTab = true;
  public pageTitle: string;
  public isEditForm: boolean;
  public journeyFormGroup: FormGroup;
  public selectedIndex = 0;
  public payload = {};
  public uuid: string;
  public journey: JourneyPlanModel;
  public jpFormsData: JourneyPlanFormData;

  private router: Router;
  private apiService: MasterService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  public addEditBtn = 'Add Journey';

  constructor(
    private toaster: CommonToasterService,
    apiService: MasterService,
    dataService: DataEditor,
    router: Router,
    route: ActivatedRoute
  ) {
    Object.assign(this, { apiService, dataService, router, route });
  }

  public ngOnInit(): void {
    this.journeyFormGroup = new FormGroup({});
    this.isEditForm = this.router.url.includes('journey-plan/edit/');

    if (this.isEditForm) {
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = 'Edit Journey Plan';
      this.addEditBtn = 'Edit Journey';

      this.subscriptions.push(
        this.apiService.getJourneyPlanByKey(this.uuid).subscribe((result) => {
          this.journey = result.data;
          this.setupCustomersData(this.journey);
          this.setupFormGroupData();
          this.dataService.sendData({
            type: CompDataServiceType.SETUP_JOURNEY_PLAN_EDIT_FORM,
            data: this.jpFormsData,
            isEdit: this.isEditForm,
          });
        })
      );
    } else {
      this.pageTitle = 'Add Journey Plan';
      this.dataService.sendData({
        type: '',
      });
    }
  }

  customerHandler(data) {
    if (data.id !== undefined && data.id > 0) {
      this.disableCustomerTab = false;
    } else {
      this.disableCustomerTab = true;
    }
    this.getCustomersByObj = data;
  }

  public next(): void {
    this.selectedIndex++;
  }

  public previous(): void {
    this.selectedIndex--;
  }

  public saveJourney(): void {
    this.buildPayload();

    if (this.payload && this.isEditForm) {
      this.editJourneyPlan();
    } else if (this.payload && !this.isEditForm) {
      this.addNewJourneyPlan();
    }
  }

  private addNewJourneyPlan(): void {
    this.apiService.addJourneyPlan(this.payload).subscribe((result) => {
      this.toaster.showSuccess(
        'Journey-Plan',
        'Successfully added journey plan'
      );
      this.router.navigate(['masters/journey-plan']);
    });
  }

  private editJourneyPlan(): void {
    this.apiService
      .editJourneyPlan(this.uuid, this.payload)
      .subscribe((result) => {
        this.toaster.showSuccess(
          'Journey-Plan',
          'Successfully Updated journey plan'
        );
        this.router.navigate(['masters/journey-plan']);
      });
  }

  private buildPayload(): void {
    const journeyData = this.journeyFormGroup.value;
    const customers = journeyData.customers;
    const planType = journeyData.plan_type === 'day' ? 1 : 2;
    const is_merchandiser = journeyData.journey_type === 'merchandiser' ? 1 : 0;

    let startDayOfWeek = 1;
    [...DAYS_CONFIG].forEach((item, index) => {
      if (item.label.toLowerCase() === journeyData.start_day_of_the_week) {
        startDayOfWeek = index + 1;

        return;
      }
    });

    const weeks = {};
    Object.keys(journeyData.weeks).forEach((item, index) => {
      weeks[`week_${index + 1}`] = journeyData.weeks[item];
    });

    this.payload = {
      name: journeyData.name,
      description: journeyData.description,
      start_date: journeyData.start_date,
      end_date: journeyData.end_date,
      no_end_date: journeyData.no_end_date,
      start_time: journeyData.start_time,
      end_time: journeyData.end_time,
      route_id: journeyData.route_id || 0,
      merchandiser_id: journeyData.merchandiser_id || 0,
      merchandiser : journeyData.merchandiser || null,
      plan_type: planType,
      is_merchandiser: is_merchandiser,
      is_enforce: journeyData.is_enforce,
      start_day_of_the_week: startDayOfWeek,
      customers,
      weeks,
    };
  }

  private setupCustomersData(journey: JourneyPlanModel): void {
    const isWeekly = journey.plan_type === '2' || journey.plan_type === 2;

    if (!isWeekly) {
      const customers: JourneyFormsDayPlanModel = {};

      const journeyPlanDays = journey.journey_plan_days;
      journeyPlanDays.forEach((item: JourneyPlanDayModel) => {
        const formCustomers: JourneyFormsCustomerModel[] = [];
        item.journey_plan_customers.forEach(
          (cust: JourneyPlanCustomerModel) => {
            formCustomers.push({
              customer_id: cust.customer_id,
              customer_code: cust.customer_info?.customer_code,
              name: cust.customer_info
                ? `${cust.customer_info.user.firstname} ${cust.customer_info.user.lastname}`
                : '',
              day_start_time: cust.day_start_time,
              day_end_time: cust.day_end_time,
              day_customer_sequence: cust.day_customer_sequence,
            });
          }
        );

        customers[`day${item.day_number}`] = {
          day_number: item.day_number,
          day_name: item.day_name,
          customers: formCustomers,
        };
      });

      journey.dailyCustomers = customers;
    } else {
      const customers: JourneyFormsWeekPlanModel = {};

      const journeyPlanWeeks = journey.journey_plan_weeks;
      journeyPlanWeeks.forEach((item: JourneyPlanWeekModel) => {
        const formDays: JourneyFormsDayPlanModel = {};

        item.journey_plan_days.forEach((day: JourneyPlanDayModel) => {
          const formCustomers: JourneyFormsCustomerModel[] = [];

          day.journey_plan_customers.forEach(
            (cust: JourneyPlanCustomerModel) => {
              formCustomers.push({
                customer_id: cust.customer_id,
                customer_code: cust.customer_info?.customer_code,
                name: cust.customer_info
                  ? `${cust.customer_info.user.firstname} ${cust.customer_info.user.lastname}`
                  : '',
                day_start_time: cust.day_start_time,
                day_end_time: cust.day_end_time,
                day_customer_sequence: cust.day_customer_sequence,
              });
            }
          );

          formDays[`day${day.day_number}`] = {
            day_number: day.day_number,
            day_name: day.day_name,
            customers: formCustomers,
          };
        });

        const weekNumber = item.week_number.charAt(item.week_number.length - 1);

        customers[`week${weekNumber}`] = {
          ...formDays,
        };
      });

      journey.weeklyCustomers = customers;
    }
  }

  private setupFormGroupData(): void {
    let startDay = '';
    [...DAYS_CONFIG].forEach((item, index) => {
      if (this.journey.start_day_of_the_week === index + 1) {
        startDay = item.label.toLowerCase();
      }
    });

    const isWeekly =
      this.journey.plan_type === '2' || this.journey.plan_type === 2;
    const planType = isWeekly ? 'week' : 'day';
    const journeyType = this.journey.journey_type;
    this.jpFormsData = {
      name: this.journey.name,
      description: this.journey.description,
      start_date: this.journey.start_date,
      end_date: this.journey.end_date,
      no_end_date: this.journey.no_end_date,
      start_time: this.journey.start_time,
      end_time: this.journey.end_time,
      route_id: this.journey.route_id || 0,
      merchandiser_id: this.journey.merchandiser_id || 0,
      merchandiser : this.journey.merchandiser || null,
      plan_type: planType,
      journey_type: journeyType,
      is_enforce: this.journey.is_enforce,
      start_day_of_the_week: startDay,
      weeks: {
        week1: Boolean(this.journey.week_1),
        week2: Boolean(this.journey.week_2),
        week3: Boolean(this.journey.week_3),
        week4: Boolean(this.journey.week_4),
        week5: Boolean(this.journey.week_5),
      },
      customers: isWeekly
        ? this.journey.weeklyCustomers
        : this.journey.dailyCustomers,
    };
  }
}
