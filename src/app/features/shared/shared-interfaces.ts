import { FormControl } from '@angular/forms';

export interface FormControlConfig {
  value?: string;
  id?: string;
  name?: string;
  label?: string;
  control?: FormControl;
}

export interface JourneyCustomerData {
  customer_id: number;
  customer_code: string;
  day_customer_sequence: number;
  name: string;
  day_start_time: string;
  day_end_time: string;
  route_id?: number;
}

export interface JourneyWeeklyConfig {
  tabLabel: string;
  number: number;
}

export interface JourneyDaysConfig {
  label: string;
  number?: number;
}

export const DAYS_CONFIG = [
  { label: 'Monday' },
  { label: 'Tuesday' },
  { label: 'Wednesday' },
  { label: 'Thursday' },
  { label: 'Friday' },
  { label: 'Saturday' },
  { label: 'Sunday' }
];
