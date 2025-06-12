import { Component, OnInit } from '@angular/core';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';

import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators, FormArray
} from '@angular/forms';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-add-activity-profile',
  templateUrl: './add-activity-profile.component.html',
  styleUrls: ['./add-activity-profile.component.scss']
})
export class AddActivityProfileComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  public customers = [];
  public merchandisers = [];
  public priorities = [];
  public selctedPriorities = [];
  public activityFormGroup;
  public activityDetailsFormGroup;
  public customerTypeFromControl;
  public modules = [
    { module_name: 'Stock In Store', status: 0, priority: 0 },
    { module_name: 'Shelf Display', status: 0, priority: 0 },
    { module_name: 'Planogram', status: 0, priority: 0 },
    { module_name: 'Asset Tracking', status: 0, priority: 0 },
    { module_name: 'Campaign Picture', status: 0, priority: 0 },
    { module_name: 'Complain Feedback', status: 0, priority: 0 },
    { module_name: 'Consumer Survey', status: 0, priority: 0 },
  ];
  activityProfiledata: any;
  isEdit: boolean = false;
  constructor(
    private router: Router,
    public fb: FormBuilder,
    public apiService: ApiService,
    public cts: CommonToasterService,
    public dataEditor: DataEditor

  ) { }

  ngOnInit(): void {
    this.customerTypeFromControl = new FormControl('customer');
    this.activityFormGroup = this.fb.group({
      activityName: ['', Validators.required],
      validFrom: ['', Validators.required],
      validTo: ['', Validators.required],
    });
    this.activityDetailsFormGroup = this.fb.group({
      customer: [''],
      merchandiser: [''],
      modules: this.fb.array([])
    });
    this.activityFormGroup.reset();
    this.activityDetailsFormGroup.reset();
    this.subscriptions.push(this.dataEditor.newData.subscribe(res => {
      const data: any = res;
      if (data && data.uuid && data.isEdit) {
        this.activityFormGroup.patchValue({
          activityName: data.activity_name,
          merchandiser: data.merchandiser_id,
          customer: data.customer_id,
          validFrom: data.valid_from,
          validTo: data.valid_to,
        })
        let type = data.merchandiser_id == null ? "customer" : "merchandiser";
        this.customerTypeFromControl.setValue(type);
        this.activityDetailsFormGroup.patchValue({
          merchandiser: data.merchandiser_id,
          customer: data.customer_id,
        })

        this.modules.forEach((element, i) => {
          let cntrol = data.salesman_activity_profile_detail[i] !== undefined ? data.salesman_activity_profile_detail[i] : element;
          this.getActivityDetailsForm.push(this.addControl(cntrol));
          this.enablePriority(i, cntrol.status);
          if (cntrol.status == '1') {
            this.changePriority(i, cntrol.priority, false);
          }
          this.priorities.push(i + 1);
        });
        this.activityProfiledata = data;
        this.isEdit = true;
      } else {
        this.modules.forEach((element, i) => {
          this.getActivityDetailsForm.push(this.addControl(element));
          this.enablePriority(i, element.status);
          this.priorities.push(i + 1);
        });
      }
      this.changeCustomerType(false);
      return;
    }));

    this.subscriptions.push(
      this.apiService.activityProfileLists().subscribe(
        (res) => {
          this.customers = res.data.customers;
          this.merchandisers = res.data.merchandiser.map(item => {
            if (item.user !== null) {
              item['user']['lastname'] = [item.user?.lastname, item.salesman_code].join(" - ")
              return item;
            }
            return item;
          });
        })
    );
  }

  addControl(obj) {
    let fGroup = this.fb.group({
      module_name: [obj.module_name],
      status: ['' + obj.status],
      priority: [obj.priority],
    })
    return fGroup;
  }

  changeCustomerType(empty = true) {
    let type = this.customerTypeFromControl.value;
    if (empty == true) {
      this.activityDetailsFormGroup.controls['customer'].setValue('');
      this.activityDetailsFormGroup.controls['merchandiser'].setValue('');
    }
    if (type == "customer") {
      this.activityDetailsFormGroup.controls['customer'].markAsTouched();
      this.activityDetailsFormGroup.controls['customer'].setErrors({ required: true });
      this.activityDetailsFormGroup.controls['merchandiser'].setErrors(null);
    } else {
      this.activityDetailsFormGroup.controls['merchandiser'].markAsTouched();
      this.activityDetailsFormGroup.controls['merchandiser'].setErrors({ required: true });
      this.activityDetailsFormGroup.controls['customer'].setErrors(null);
    }

  }

  enablePriority(controlIndex, value) {
    if (value == '1') {
      this.activityDetailsFormGroup.controls.modules.controls[controlIndex].controls['priority'].enable();
      this.activityDetailsFormGroup.controls.modules.controls[controlIndex].controls['priority'].markAsTouched();
      this.activityDetailsFormGroup.controls.modules.controls[controlIndex].controls['priority'].setErrors({ required: true });
    } else {
      this.activityDetailsFormGroup.controls.modules.controls[controlIndex].controls['priority'].disable();
      this.activityDetailsFormGroup.controls.modules.controls[controlIndex].controls['priority'].setValue(0);
      this.activityDetailsFormGroup.controls.modules.controls[controlIndex].controls['priority'].setErrors(null);
    }
  }

  get getActivityDetailsForm() {
    return this.activityDetailsFormGroup.get('modules') as FormArray;
  }

  changePriority(controlIndex, value, showError) {
    let form = this.activityDetailsFormGroup.value;
    let obj = form.modules.filter(
      (x) => {
        return x.priority == value
      });
    if (obj.length > 1) {
      if (showError == true) {
        this.cts.showError('Error', 'Please choose another Priority. This Prioriy is already set.');
      }
      this.activityDetailsFormGroup.controls.modules.controls[controlIndex].controls['priority'].setValue('');
      this.activityDetailsFormGroup.controls.modules.controls[controlIndex].controls['priority'].markAsTouched();
      this.activityDetailsFormGroup.controls.modules.controls[controlIndex].controls['priority'].setErrors({ required: true });
      return false;
    }
  }

  close() {
    this.activityFormGroup.reset();
    this.activityDetailsFormGroup.reset();
    this.router.navigate(['settings/preference/activity-profile']);
  }

  saveActivityForm() {
    let form1 = this.activityFormGroup.value;
    let form2 = this.activityDetailsFormGroup.getRawValue();
    let modules = form2.modules;
    // modules.forEach(element => {

    // });
    let sForm = {
      activity_name: form1.activityName,
      valid_from: form1.validFrom,
      valid_to: form1.validTo,
      merchandiser_id: this.customerTypeFromControl.value == 'merchandiser' ? form2.merchandiser : null,
      customer_id: this.customerTypeFromControl.value == 'customer' ? form2.customer : null,
      details: form2.modules
    };
    if (this.isEdit == true) {
      this.updateActivityProfile(sForm);
      return;
    }
    this.postActivityProfile(sForm);
  }

  postActivityProfile(sForm) {
    this.subscriptions.push(
      this.apiService.addActivityProfile(sForm).subscribe(
        (res) => {
          this.close();
        })
    );
  }

  updateActivityProfile(sForm) {
    this.subscriptions.push(
      this.apiService.updateActivityProfile(sForm, this.activityProfiledata?.uuid).subscribe(
        (res) => {
          this.close();
        })
    );
  }

  goForward(stepper: MatStepper) {
    let form = this.activityFormGroup.value;
    if (form.validTo <= form.validFrom) {
      this.cts.showError('Error', 'Valid TO Date must be greater than Valid From Date!');
      return false;
    }
    stepper.next();
  }
  goBackward(stepper: MatStepper) {
    stepper.previous();
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
