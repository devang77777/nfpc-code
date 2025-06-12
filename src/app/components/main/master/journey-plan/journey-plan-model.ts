import { RouteMaster } from 'src/app/components/main/settings/location/route/route-master-dt/route-master-dt.component';

export interface JourneyPlanModel {
  "id": number;
  "uuid": string;
  "organisation_id": number;
  "route_id": number;
  "merchandiser_id": number;
  "merchandiser" : any;
  "name": string;
  "description": string;
  "start_date": string;
  "end_date": string;
  "no_end_date": boolean;
  "start_time": string;
  "end_time": string;
  "plan_type": number | string;
  "journey_type": number | string;
  "is_enforce": number | string;
  "month_week": number;
  "status": number;
  "need_to_approve": string;
  "objectid": string;
  "created_at": string;
  "updated_at": string;
  "start_day_of_the_week": number;
  "start_day_name": string;
  "week_1": number;
  "week_2": number;
  "week_3": number;
  "week_4": number;
  "week_5": number;
  "journey_plan_days": JourneyPlanDayModel[];
  "journey_plan_weeks": JourneyPlanWeekModel[];
  "route": RouteMaster;
  "dailyCustomers": JourneyFormsDayPlanModel;
  "weeklyCustomers": JourneyFormsWeekPlanModel;
}

export interface JourneyPlanWeekModel {
  id: number;
  journey_plan_days: JourneyPlanDayModel[];
  journey_plan_id: number;
  uuid: string;
  week_number: string;
}

export interface JourneyPlanDayModel {
  "id": number;
  "uuid": string;
  "journey_plan_id": number;
  "day_number": number;
  "day_name": string;
  "journey_plan_customers": JourneyPlanCustomerModel[];
}

export interface JourneyPlanCustomerModel {
  "customer_id": number;
  "user": JourneyPlanUser;
  "customer_info": {
    id: number;
    customer_code: string;
    user_id: number;
    user: JourneyPlanUser;
  };
  "id": number;
  "uuid": string;
  "journey_plan_day_id": number;
  "day_customer_sequence": number;
  "day_start_time": string;
  "day_end_time": string;
}

export interface JourneyPlanUser {
  id: number;
  firstname: string;
  lastname: string;
}

export interface JourneyPlanFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  no_end_date: boolean;
  start_time: string;
  end_time: string;
  route_id: number;
  merchandiser_id: number;
  merchandiser : any;
  plan_type: string;
  journey_type: number | string;
  is_enforce: number | string;
  start_day_of_the_week: string;
  weeks: {
    week1: boolean;
    week2: boolean;
    week3: boolean;
    week4: boolean;
    week5: boolean;
  };
  customers: JourneyFormsWeekPlanModel | JourneyFormsDayPlanModel;
}

export interface JourneyFormsWeekPlanModel {
  week1?: JourneyFormsDayPlanModel;
  week2?: JourneyFormsDayPlanModel;
  week3?: JourneyFormsDayPlanModel;
  week4?: JourneyFormsDayPlanModel;
  week5?: JourneyFormsDayPlanModel;
}

export interface JourneyFormsDayPlanModel {
  day1?: JourneyFormsDayModel;
  day2?: JourneyFormsDayModel;
  day3?: JourneyFormsDayModel;
  day4?: JourneyFormsDayModel;
  day5?: JourneyFormsDayModel;
  day6?: JourneyFormsDayModel;
  day7?: JourneyFormsDayModel;
}

export interface JourneyFormsDayModel {
  day_number: number;
  day_name: string;
  // week_number?: number;
  customers: JourneyFormsCustomerModel[];
}

export interface JourneyFormsCustomerModel {
  customer_id: number;
  customer_code: string;
  name: string;
  day_start_time: string;
  day_end_time: string;
  day_customer_sequence: number;
  route_id?: number;
  merchandiser_id?: number;
}
