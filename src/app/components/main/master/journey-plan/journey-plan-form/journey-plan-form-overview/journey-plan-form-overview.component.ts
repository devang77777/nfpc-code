import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { JourneyPlanFormData } from '../../journey-plan-model';

@Component({
  selector: 'app-journey-plan-form-overview',
  templateUrl: './journey-plan-form-overview.component.html',
  styleUrls: ['./journey-plan-form-overview.component.scss']
})
export class JourneyPlanFormOverviewComponent implements OnInit, OnDestroy {
  @Input() public journeyPlanFormGroup: FormGroup;
  @Input() public isEditForm: boolean;

  public nameFormControl: FormControl;
  public descFormControl: FormControl;
  public sdateFormControl: FormControl;
  public edateFormControl: FormControl;
  public checkFormControl: FormControl;
  public stimeFormControl: FormControl;
  public etimeFormControl: FormControl;

  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];

  constructor(apiService: ApiService, dataEditor: DataEditor) {
    Object.assign(this, { apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.nameFormControl = new FormControl('', [ Validators.required ]);
    this.descFormControl = new FormControl('', [ Validators.required ]);
    this.sdateFormControl = new FormControl('', [ Validators.required ]);
    this.checkFormControl = new FormControl(false);
    this.edateFormControl = new FormControl('');
    this.stimeFormControl = new FormControl('');
    this.etimeFormControl = new FormControl('');

    this.journeyPlanFormGroup.addControl('name', this.nameFormControl);
    this.journeyPlanFormGroup.addControl('description', this.descFormControl);
    this.journeyPlanFormGroup.addControl('start_date', this.sdateFormControl);
    this.journeyPlanFormGroup.addControl('no_end_date', this.checkFormControl);
    this.journeyPlanFormGroup.addControl('end_date', this.edateFormControl);
    this.journeyPlanFormGroup.addControl('start_time', this.stimeFormControl);
    this.journeyPlanFormGroup.addControl('end_time', this.etimeFormControl);

    this.subscriptions.push(this.checkFormControl.valueChanges.subscribe(value => {
      if (value) {
        this.edateFormControl.reset();
        this.edateFormControl.disable();
      } else {
        this.edateFormControl.enable();
      }
    }));

    this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
      if (result.type === CompDataServiceType.SETUP_JOURNEY_PLAN_EDIT_FORM) {
        this.setupEditForm(result.data);
      }
    }));
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private setupEditForm(journey: JourneyPlanFormData): void {
    if (this.isEditForm) {
      this.nameFormControl.setValue(journey.name);
      this.descFormControl.setValue(journey.description);
      this.sdateFormControl.setValue(journey.start_date);
      this.checkFormControl.setValue(journey.no_end_date);
      this.stimeFormControl.setValue(journey.start_time);
      this.etimeFormControl.setValue(journey.end_time);

      if (!journey.no_end_date) {
        this.edateFormControl.setValue(journey.end_date);
      }
    }
  }
}
