import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { JourneyPlanFormData } from '../../journey-plan-model';
import { RouteMaster } from 'src/app/components/main/settings/location/route/route-master-dt/route-master-dt.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';

export const DEFAULT_DAYS = {
  week1: false,
  week2: false,
  week3: false,
  week4: false,
  week5: false
};

@Component({
  selector: 'app-journey-plan-form-schedule',
  templateUrl: './journey-plan-form-schedule.component.html',
  styleUrls: ['./journey-plan-form-schedule.component.scss']
})
export class JourneyPlanFormScheduleComponent implements OnInit, OnDestroy {
  @Input() public journeyPlanFormGroup: FormGroup;
  @Input() public isEditForm: boolean;
  @Output() public customerHandler: EventEmitter<any> = new EventEmitter<any>();
  public baseFormControl: FormControl;
  public journeyTypeFormControl: FormControl;
  public isEnforceFormControl: FormControl;
  public weeksFormControl: FormControl;
  public startDayFormControl: FormControl;
  public merchandiserIdFormControl: FormControl;
  public routesFormControl: FormControl;
  public merchandiserFormControl: FormControl;
  public routeId: number;
  public merchandiserId: number;
  public isWeekSelected = true;
  public routes: RouteMaster[] | any = [];
  public merchandiserList = [];
  public domain = window.location.host;

  public wkFormGroup: FormGroup;
  public weeksControlData = [
    { value: 'week1', label: 'Week 1' },
    { value: 'week2', label: 'Week 2' },
    { value: 'week3', label: 'Week 3' },
    { value: 'week4', label: 'Week 4' },
    { value: 'week5', label: 'Week 5' },
  ];
  public daysControlData = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];

  constructor(apiService: ApiService, dataEditor: DataEditor) {
    Object.assign(this, { apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.wkFormGroup = new FormGroup({
      week1: new FormControl(false),
      week2: new FormControl(false),
      week3: new FormControl(false),
      week4: new FormControl(false),
      week5: new FormControl(false)
    });
    this.merchandiserIdFormControl = new FormControl('');
    this.baseFormControl = new FormControl('day', [Validators.required]);
    this.journeyTypeFormControl = new FormControl(this.domain !== 'merchandising' && this.domain !== 'devmobiato.nfpc.net' ? 'route' : 'merchandiser', [Validators.required]);
    this.isEnforceFormControl = new FormControl('0');
    this.startDayFormControl = new FormControl('monday', [Validators.required]);
    this.weeksFormControl = new FormControl({});
    this.routesFormControl = new FormControl('', [Validators.required]);
    this.merchandiserFormControl = new FormControl('', [Validators.required]);
    // if(!this.isEditForm){
    //   this.changeJourneyType();
    // }
    this.wkFormGroup.disable();

    this.journeyPlanFormGroup.addControl('plan_type', this.baseFormControl);
    this.journeyPlanFormGroup.addControl('journey_type', this.journeyTypeFormControl);
    this.journeyPlanFormGroup.addControl('is_enforce', this.isEnforceFormControl);
    this.journeyPlanFormGroup.addControl('weeks', this.weeksFormControl);
    this.journeyPlanFormGroup.addControl('start_day_of_the_week', this.startDayFormControl);
    this.journeyPlanFormGroup.addControl('route_id', this.routesFormControl);
    this.journeyPlanFormGroup.addControl('merchandiser_id', this.merchandiserFormControl);

    this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
      if (result.type === CompDataServiceType.SETUP_JOURNEY_PLAN_EDIT_FORM) {
        this.setupEditForm(result.data);
      }
    }));

    this.subscriptions.push(this.baseFormControl.valueChanges.subscribe(value => {
      if (value === 'week') {
        this.isWeekSelected = true;
        this.wkFormGroup.reset(DEFAULT_DAYS);
        this.wkFormGroup.enable();
      } else {
        this.isWeekSelected = false;
        this.wkFormGroup.reset(DEFAULT_DAYS);
        this.wkFormGroup.disable();
      }
      this.updateWeekCheckbox();
      this.startDayFormControl.setValue('monday');
    }));

    this.subscriptions.push(this.wkFormGroup.valueChanges.subscribe(value => {
      // this.routesFormControl.reset();
    }));
    if (this.domain !== 'devmobiato.nfpc.net' && this.domain !== "merchandising") {
      this.subscriptions.push(this.apiService.getAllRoute().subscribe(result => {
        this.routes = result.data;
      }));
    }

    this.subscriptions.push(this.apiService.getAllMerchandisers().subscribe(result => {
      this.merchandiserList = result.data;
    }));
    this.routesFormControl.markAsTouched();
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public updateWeekCheckbox(): void {
    this.weeksFormControl.setValue(this.wkFormGroup.value);
  }

  public routeIdChanged(value, isEditForm?): void {
    this.routesFormControl.setValue(value);
    this.merchandiserFormControl.setValue('');
    this.merchandiserId = 0;
    if(!isEditForm){
      this.customerHandler.emit({ 'type': 'route', 'id': value, isEdit : isEditForm  });
    }
  }

  public merchandiserIdChanged(isEditForm = false): void {
    let value = this.merchandiserIdFormControl.value[0]?.id;
    this.merchandiserFormControl.setValue(value);
    this.routesFormControl.setValue('');
    this.routeId = 0;
    this.customerHandler.emit({ 'type': 'merchandiser', 'id': value, isEdit : isEditForm });
  }

  public changeJourneyType() {
    let type = this.journeyTypeFormControl.value;
    if (type == "route") {
      this.routesFormControl.markAsTouched();
      this.merchandiserFormControl.setValue('');
      this.merchandiserId = 0;
      this.customerHandler.emit({ 'type': 'route', 'id': undefined, isEdit : false  });
    } else {
      this.merchandiserFormControl.markAsTouched();
      this.routesFormControl.setValue('');
      this.routeId = 0;
      this.customerHandler.emit({ 'type': 'merchandiser', 'id': undefined, isEdit : false  });
    }
  }

  private setupEditForm(journey: JourneyPlanFormData): void {
    this.baseFormControl.setValue(journey.plan_type);
    this.startDayFormControl.setValue(journey.start_day_of_the_week);
    this.isEnforceFormControl.setValue(journey.is_enforce.toString());
    if (journey.merchandiser_id == 0) {
      this.journeyTypeFormControl.setValue('route');
      this.routeIdChanged(journey.route_id, this.isEditForm);
    } else {
      this.journeyTypeFormControl.setValue('merchandiser');
      setTimeout(() => {
        this.merchandiserIdFormControl.setValue([{id : journey.merchandiser_id, itemName : journey.merchandiser.firstname +" "+ journey.merchandiser.lastname }]);  
        this.merchandiserIdChanged(this.isEditForm);
      }, 1000);
      
    }
    this.routeId = journey.route_id;
    this.merchandiserId = journey.merchandiser_id;
    // this.routesFormControl.setValue(journey.route_id);
    // this.merchandiserFormControl.setValue(journey.merchandiser_id);
    this.wkFormGroup.setValue(journey.weeks);
    this.weeksFormControl.setValue(journey.weeks);
  }
}
