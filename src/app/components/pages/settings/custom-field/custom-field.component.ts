import { FormGroup, FormArray, FormControl, ValidatorFn } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Component, OnInit } from '@angular/core';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
@Component({
  selector: 'app-custom-fields',
  templateUrl: './custom-field.component.html',
})
export class CustomFieldComponent implements OnInit {
  modulesArray = [];
  form: FormGroup;
  constructor(private apiService: ApiService, private cts:CommonToasterService,) {}

  ngOnInit() {
    this.form = new FormGroup({
      modules: new FormArray([],this.minSelectedCheckboxes(1)),
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
      this.modulesFormArray.push(new FormControl(data.custom_field_status==1 ? true : false))
    );
  }
  get modulesFormArray() {
    return this.form.controls.modules as FormArray;
  }
  submit() {
    
    const model = this.form.value.modules
      .map((checked, i) => (checked ? {module_name:this.modulesArray[i].module_name,custom_field_status:1} : null))
      .filter((v) => v !== null);
      this.apiService.enableCustomFieldsModules({modules:model}).subscribe(
        (response) => {
          this.cts.showSuccess("Success","Module enabled Successfully")
        },
        (error) => {}
      );
  }
   minSelectedCheckboxes(min = 1) {
    const validator: ValidatorFn = (formArray: FormArray) => {
      const totalSelected = formArray.controls
        // get a list of checkbox values (boolean)
        .map(control => control.value)
        // total up the number of checked checkboxes
        .reduce((prev, next) => next ? prev + next : prev, 0);
  
      // if the total is not greater than the minimum, return the error message
      return totalSelected >= min ? null : { required: true };
    };
  
    return validator;
  }
}
