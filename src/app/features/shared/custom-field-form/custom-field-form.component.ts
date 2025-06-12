import { FormControl, FormGroup, FormArray } from '@angular/forms';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddCustomFieldModalComponent } from 'src/app/components/shared/add-custom-field-modal/add-custom-field-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
// import { AddCustomFieldModalComponent } from '../../shared/add-custom-field-modal/add-custom-field-modal.component';

export interface CustomFormData {
  id: string;
  checkboxDefaultValue: string;
  dataType: string;
  dateDefaultValue: string;
  dropdownOptions: string[];
  labelName: string;
  textboxDefaultValue: string;
}

@Component({
  selector: 'app-custom-field-form',
  templateUrl: './custom-field-form.component.html',
  styleUrls: ['./custom-field-form.component.scss'],
})
export class CustomFieldFormComponent implements OnInit {
  data;
  @Input() module: string;
  @Input() editData: Array<any>;
  @Output() change = new EventEmitter();
 customFields=[];
  public formArray: FormArray;
  customFieldForm: FormGroup;
  constructor(
    private matDialog: MatDialog,
    private apiService: ApiService,
    private deleteDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getCustomField();
    this.customFieldForm = new FormGroup({
      fields: new FormArray([]),
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.editData.currentValue != changes.editData.previousValue) {
      if (this.editData && this.editData.length > 0) {
        const array = this.customFieldForm.get('fields') as FormArray;
        array.controls.length = 0;
        const data = this.editData.map((item) => {
          const type = item.custom_field.field_type;
          let value,options;
          if (type === 'multi_select' || type === 'dropdown') {
            let fields=this.customFields.find((field) =>field.id== item.custom_field_id);
            if(fields){
              options= fields.custom_field_value;
            }
            value = item.custom_field_value.split(',')
          } else {
            value = [item.custom_field_value];
          }
          return {
            uuid: item.custom_field.uuid,
            id: item.custom_field_id,
            field_label: item.custom_field.field_label,
            field_type: item.custom_field.field_type,
            custom_field_value: value ,
            options:  options,
          };
        });
        data.forEach((item) => {
          this.bindField(item,false);
        });
        this.emitData();
      }
    }
  }
  public addCustomFields() {
    let dialogRef = this.matDialog.open(AddCustomFieldModalComponent, {
      width: '500px',
      data: this.data,
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res.data) {
        const model = this.createModel(res.data);
        this.saveCustomField(model, res.data);
      }
    });
  }

  createModel(data) {
    const model: any = {
      field_label: data.labelName,
      field_type: data.dataType,
      module_id: this.module,
    };
    if (data.dataType == 'dropdown' || data.dataType == 'multiSelect') {
      model.field_value = data.dropdownOptions.map((item) => item.option);
    } else if (data.dataType == 'checkBox') {
      model.field_value = data.checkboxDefaultValue;
    } else if (data.dataType == 'textBox') {
      model.field_value = data.textboxDefaultValue;
    } else if (data.dataType == 'date') {
      model.field_value = data.dateDefaultValue;
    }
    model.field_type = this.camelToSnakeCaseText(model.field_type);
    return model;
  }
  saveCustomField(model, data) {
    this.apiService.saveCustomField(model).subscribe((result: any) => {
      let customFormGroup = new FormGroup({
        id: new FormControl(''),
        uuid: new FormControl(''),
        moduleId: new FormControl(this.module),
        fieldType: new FormControl(''),
        fieldValue: new FormControl(''),
        fieldLabel: new FormControl(''),
        fieldOptions: new FormControl(''),
      });
      model.uuid = result.data.uuid;
      model.id = result.data.id;
      model = this.snakeToCamelObject(model);
      if (model.fieldType == 'dropdown' || model.fieldType == 'multi_select') {
        model.fieldOptions = model.fieldValue.map((value) => {
          return value;
        });
        model.fieldValue = [];
      } else model.fieldValue = model.fieldValue;

      customFormGroup.patchValue(model);
      const array = this.customFieldForm.get('fields') as FormArray;
      array.controls.push(customFormGroup);
      this.emitData();
      this.registerEvent(customFormGroup);
    });
  }
  registerEvent(form: FormGroup) {
    form.valueChanges.subscribe((changes) => {
      const array = (this.customFieldForm.get('fields') as FormArray).value;
      const index = array.findIndex((x) => x.uuid === changes.uuid);
      if (index > -1) {
        array[index] = changes;
      }
      this.change.emit(array);
    });
  }
  bindField(data,isCreate) {
    let customFormGroup = new FormGroup({
      id: new FormControl(''),
      uuid: new FormControl(''),
      moduleId: new FormControl(this.module),
      fieldType: new FormControl(''),
      fieldValue: new FormControl(''),
      fieldLabel: new FormControl(''),
      fieldOptions: new FormControl(''),
    });
    const model: any = this.snakeToCamelObject(data);
    if (model.fieldType == 'dropdown' || model.fieldType == 'multi_select') {
      const options= model.options? model.options : model.customFieldValue;
      model.fieldOptions = options.map((value) => {
        return value.field_value;
      });
      model.fieldValue =  isCreate ? null : model.customFieldValue;
    } else if (model.fieldType == 'check_box') {
      let value;
      if(model.customFieldValue[0] && model.customFieldValue[0]=='1'){
        model.fieldValue =true;
      }else{
        model.fieldValue =false;
      }
      
    } else model.fieldValue =model.customFieldValue[0];
    this.registerEvent(customFormGroup);
    customFormGroup.patchValue(model);
    const array = this.customFieldForm.get('fields') as FormArray;
    array.controls.push(customFormGroup);
  }
  getCustomField() {
    this.apiService.getCustomField(this.module).subscribe((result: any) => {
      this.customFields=result.data;
      const array = this.customFieldForm.get('fields') as FormArray;
      array.controls.length = 0;
      result.data.forEach((item) => {
        this.bindField(item,true);
      });
      this.emitData();
    });
  }
  public openDeleteBox(item, index): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: { title: `Are you sure want to delete ?` },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data?.hasConfirmed) {
          this.deleteCustomField(item, index);
        }
      });
  }
  deleteCustomField(item: FormGroup, i) {
    const id = item.get('uuid').value;
    this.apiService.deleteCustomField(id).subscribe((result: any) => {
      const array = this.customFieldForm.get('fields') as FormArray;
      array.controls.splice(i, 1);
      array.value.splice(i, 1);
      this.emitData();
    });
  }
  emitData(){
    setTimeout(() => {
      const array1 = (this.customFieldForm.get('fields') as FormArray).value;
      this.change.emit(array1);
    }, 1000);
  }
  camelToSnakeCaseText = (text) => {
    return text.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  };
  snakeToCamel = (key) => {
    return key.replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );
  };
  snakeToCamelObject = (data) => {
    let mapped = {};
    Object.keys(data).forEach((key, index) => {
      const converted = key.replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
      );
      mapped[converted] = data[key];
    });
    return mapped;
  };
}
