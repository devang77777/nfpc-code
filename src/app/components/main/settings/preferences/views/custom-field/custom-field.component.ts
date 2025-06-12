import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormControl, ValidatorFn } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-custom-field',
  templateUrl: './custom-field.component.html',
  styleUrls: ['./custom-field.component.scss'],
})
export class CustomFieldComponent implements OnInit {
  modulesArray = [];
  form: FormGroup;
  constructor(
    private apiService: ApiService,
    private cts: CommonToasterService
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      modules: new FormArray([], this.minSelectedCheckboxes(1)),
    });
    this.apiService.getAllModules().subscribe(
      (response) => {
        this.modulesArray = response.data;
        this.addCheckboxes();
      },
      (error) => {}
    );
  }
  private addCheckboxes() {
    this.modulesArray.forEach((data) =>
      this.modulesFormArray.push(
        new FormControl(data.custom_field_status == 1 ? true : false)
      )
    );
  }
  get modulesFormArray() {
    return this.form.controls.modules as FormArray;
  }
  submit() {
    
    const modules = this.form.value.modules
      .map((checked, i) =>
      {
        if(checked && this.modulesArray[i].module_master_id){
          return this.modulesArray[i].module_master_id
        }else if(checked ){
          return this.modulesArray[i].id;
        }else {
          return null
        }
      }
      )
      .filter((v) => v !== null);
    const model = {
      module_id: modules,
      custom_field_status: 1,
    };
    this.apiService.enableCustomFieldsModules(model).subscribe(
      (response) => {
        this.cts.showSuccess('Success', 'Module enabled Successfully');
      },
      (error) => {}
    );
  }
  minSelectedCheckboxes(min = 1) {
    const validator: ValidatorFn = (formArray: FormArray) => {
      const totalSelected = formArray.controls
        // get a list of checkbox values (boolean)
        .map((control) => control.value)
        // total up the number of checked checkboxes
        .reduce((prev, next) => (next ? prev + next : prev), 0);

      // if the total is not greater than the minimum, return the error message
      return totalSelected >= min ? null : { required: true };
    };

    return validator;
  }
}
