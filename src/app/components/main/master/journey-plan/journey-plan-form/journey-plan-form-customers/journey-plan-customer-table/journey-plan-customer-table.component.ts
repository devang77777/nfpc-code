
import { AddJpCustomerDialogComponent } from './../../../../../../dialogs/add-jp-customer-dialog/add-jp-customer-dialog.component';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { JourneyFormsCustomerModel, JourneyFormsDayModel, JourneyFormsDayPlanModel, JourneyPlanFormData } from '../../../journey-plan-model';
import { Customer } from 'src/app/components/main/master/customer/customer-dt/customer-dt.component';
import { JourneyDaysConfig, JourneyCustomerData } from 'src/app/features/shared/shared-interfaces';
import { DataEditor } from 'src/app/services/data-editor.service';
import { ApiService } from 'src/app/services/api.service';
import { MasterService } from 'src/app/components/main/master/master.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-journey-plan-customer-table',
  templateUrl: './journey-plan-customer-table.component.html',
  styleUrls: ['./journey-plan-customer-table.component.scss']
})
export class JourneyPlanCustomerTableComponent implements OnInit, OnDestroy {
  @Output() public setAllDays: EventEmitter<any> = new EventEmitter<any>();
  @Output() public setAllweeks: EventEmitter<any> = new EventEmitter<any>();
  @Input() public journeyPlanFormGroup: FormGroup;
  @Input() public tableFormControl: FormControl;
  @Input() public customers: Customer[];
  @Input() public dayConfig: JourneyDaysConfig;
  @Input() public weekNumber: number;
  @Input() public isWeekly: any;
  @Input() public getCustomersByObj;
  public users: JourneyCustomerData[] = [];
  public usersSource: MatTableDataSource<JourneyCustomerData>;
  public tableHeaders = [
    'sequence',
    'customerCode',
    'customer',
    'startTime',
    'endTime',
    'action'
  ];

  // private allCustomers: Customer[] = [];
  private subscriptions: Subscription[] = [];
  private dataService: DataEditor;
  private filteredCustomers: Customer[] = [];
  private routeId: number;
  private isEditedBefore: boolean;
  private deleteDialog: MatDialog;
  filterForm: FormGroup;
  selectedColumnFilter: string;
  constructor(private apiService: ApiService, public masterService: MasterService, dataService: DataEditor, deleteDialog: MatDialog,) {
    Object.assign(this, { apiService, dataService, deleteDialog });
  }

  public ngOnInit(): void {
    this.routeId = this.journeyPlanFormGroup.controls['route_id'].value;
    this.buildUsers(true);

    if (this.routeId) {
      this.buildUsersWithFilteredCustomer(this.routeId);
    }

    this.subscriptions.push(this.dataService.newData.subscribe(result => {
      //console.log(result);
      if (result.type === CompDataServiceType.SETUP_JOURNEY_INITIAL_USERS_TABLE) {
        if (!this.isEditedBefore) {
          if (!this.routeId) {
            this.buildUsers(true);
          }
        }

      } else if (result.type === CompDataServiceType.UPDATE_JOURNEY_CUSTOMER_DATA) {
        if (result.data.weekNumber !== this.weekNumber) {

          return;
        }

        const newData = result.data.newData;
        this.users = newData[`day${this.dayConfig.number}`].customers;
        this.buildUsers();

      } else if ((result.type === CompDataServiceType.SETUP_JOURNEY_PLAN_EDIT_FORM) && result.isEdit) {
        this.setupEditFormCustomers(result.data);
        this.isEditedBefore = true;
      }
    }));

    this.subscriptions.push(this.journeyPlanFormGroup.controls['start_day_of_the_week'].valueChanges.subscribe(() => {
      this.updateFormControl();
    }));

    this.subscriptions.push(this.journeyPlanFormGroup.controls['route_id'].valueChanges.subscribe(value => {
      if (!value) {
        return;
      }

      if (this.customers.length === 0) {
        return;
      }

      this.buildUsersWithFilteredCustomer(value);
    }));
    this.filterForm = new FormGroup({
      customer: new FormControl(''),
      customer_code: new FormControl(''),
    })
  }

  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue("");
      // return;
    }
    //Filter only if he click on yes button
    //add the validation here if selected control has the value 
    this.filterData();
  }
  filterData() {
    let form = this.filterForm.value;
    if (form.customer_code == "" && form.customer == "") {
      this.usersSource = new MatTableDataSource<JourneyCustomerData>(this.users);
      return false;
    }
    let users = [];
    if (form.customer_code !== "" && form.customer !== "") {
      users = this.users.filter((x) => { console.log(x.name.toLowerCase().includes(form.customer)); return ((x.customer_code.includes(form.customer_code)) && (x.name.toLowerCase().includes(form.customer))) });
    } else if (form.customer_code !== "") {
      users = this.users.filter((x) => { return x.customer_code.includes(form.customer_code) });
    } else if (form.customer !== "") {
      users = this.users.filter((x) => { console.log(x.name.toLowerCase().includes(form.customer)); return x.name.toLowerCase().includes(form.customer) });
    }
    // users = this.users.filter((x) => { console.log(x.name.toLowerCase().includes(form.customer)); return (form.customer_code !== "" && (x.customer_code.includes(form.customer_code)) || ((form.customer !== "") && x.name.toLowerCase().includes(form.customer))) });
    this.usersSource = new MatTableDataSource<JourneyCustomerData>(users);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.customers) {
      // console.log(changes.customers);
      let values = changes.customers.currentValue;
      this.customers = values;
      this.buildUsers(true);
    }
  }


  addJpCustomer() {
    let allcustomers = [];
    let unselectedCustomers = [];
    this.subscriptions.push(this.masterService.customerDetailListTable({ page: 1, page_size: 10, all : true }).subscribe(result => {
      allcustomers = result;
      // unselectedCustomers = allcustomers.filter((el) => !this.users.some((s_el) => el['id'] === s_el['customer_id']));
      this.deleteDialog
        .open(AddJpCustomerDialogComponent, {
          width: '1000px',
          height: 'auto',
          hasBackdrop: true,
          position: {
            top: '5px',
          },
          data: allcustomers,
        })
        .afterClosed()
        .subscribe((data) => {
          if (data && data.length > 0) {
            //console.log(data);
            unselectedCustomers = data.filter((el) => !this.users.some((s_el) => el['id'] === s_el['customer_id']));
            unselectedCustomers.map((customer: Customer, index: number) => {
              //console.log(customer);
              this.users.push({
                customer_id: customer.id,
                customer_code: customer.customer_code,
                name: `${customer.user.firstname} ${customer.user.lastname}`,
                day_customer_sequence: this.users.length + 1,
                route_id: customer.route_id,
                day_start_time: '',
                day_end_time: ''
              });
              this.usersSource = new MatTableDataSource<JourneyCustomerData>(this.users);
              this.updateFormControl();
            });
          }
        });
    }));
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public elementDropped(data: CdkDragDrop<JourneyCustomerData[]>): void {
    moveItemInArray(this.users, data.previousIndex, data.currentIndex);
    this.buildUsers();
  }

  public deleteUser(data: any): void {
    this.users.splice(data.day_customer_sequence - 1, 1);
    this.buildUsers();
  }

  public updateStartTime(index: number, data: any): void {
    const element = data.target;
    const user = this.users[index];

    this.users.splice(index, 1, {
      customer_id: user.customer_id,
      customer_code: user.customer_code,
      day_customer_sequence: user.day_customer_sequence,
      name: user.name,
      day_start_time: element.value,
      day_end_time: user.day_end_time,
      route_id: user.route_id
    });
    this.updateFormControl();
  }

  public updateEndTime(index: number, data: any): void {
    const element = data.target;
    const user = this.users[index];

    this.users.splice(index, 1, {
      customer_id: user.customer_id,
      customer_code: user.customer_code,
      day_customer_sequence: user.day_customer_sequence,
      name: user.name,
      day_start_time: user.day_start_time,
      day_end_time: element.value,
      route_id: user.route_id
    });
    this.updateFormControl();
  }

  public copyToAllDays(): void {
    this.setAllDays.emit(this.dayConfig);
  }

  public copyToAllWeeks(): void {
    this.setAllweeks.emit(this.dayConfig);
  }

  private buildUsersWithFilteredCustomer(routeId: number): void {
    this.filteredCustomers = this.customers.filter((cust: Customer) => {
      return routeId === cust.route_id;
    });
    this.buildUsers(true, true);
  }

  private buildUsers(isInit?: boolean, isFiltered?: boolean): void {
    if (!isInit) {
      this.users = this.users.map((user: JourneyCustomerData, index: number) => {
        return {
          customer_id: user.customer_id,
          customer_code: user.customer_code,
          name: user.name,
          day_start_time: user.day_start_time,
          day_end_time: user.day_end_time,
          day_customer_sequence: index + 1,
          route_id: user.route_id
        };
      });
    } else if (isInit && isFiltered) {
      this.users = this.filteredCustomers.map((customer: Customer, index: number) => {
        return {
          customer_id: customer.id,
          customer_code: customer.customer_code,
          name: `${customer.user.firstname} ${customer.user.lastname}`,
          day_customer_sequence: index + 1,
          route_id: customer.route_id,
          day_start_time: '',
          day_end_time: ''
        };
      });
    } else {
      //console.log(this.customers);
      this.users = this.customers.map((customer: Customer, index: number) => {
        return {
          customer_id: customer.id,
          customer_code: customer.customer_code,
          name: `${customer.user.firstname} ${customer.user.lastname}`,
          day_customer_sequence: index + 1,
          route_id: customer.route_id,
          day_start_time: '',
          day_end_time: ''
        };
      });
    }

    this.usersSource = new MatTableDataSource<JourneyCustomerData>(this.users);
    this.updateFormControl();
  }

  private updateFormControl(): void {
    this.tableFormControl.setValue({
      day_number: this.dayConfig.number,
      day_name: this.dayConfig.label,
      customers: this.users,
      week_number: this.weekNumber
    });
  }

  private setupEditFormCustomers(journey: JourneyPlanFormData): void {
    const isWeekly = journey.plan_type === "week";
    this.routeId = journey.route_id;
    let day: JourneyFormsDayModel;
    if (isWeekly) {
      const week: JourneyFormsDayPlanModel = journey.customers[`week${this.weekNumber}`];
     var dayName = Object.keys(week).find(x=>week[x].day_name == this.dayConfig.label);
      day = week[dayName];
    } else {
      day = journey.customers[`day${this.dayConfig.number}`];
    }
    if(day){
      this.users = day?.customers?.map((user: JourneyFormsCustomerModel) => {
        return {
          customer_id: user.customer_id,
          customer_code: user.customer_code,
          name: user.name,
          day_start_time: user.day_start_time,
          day_end_time: user.day_end_time,
          day_customer_sequence: user.day_customer_sequence,
          route_id: this.routeId
        };
      });
      this.buildUsers();
    }
  }
}
