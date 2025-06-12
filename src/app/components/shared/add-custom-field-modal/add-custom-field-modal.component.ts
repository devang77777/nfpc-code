import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-custom-field-modal',
  templateUrl: './add-custom-field-modal.component.html',
  styleUrls: ['./add-custom-field-modal.component.scss']
})
export class AddCustomFieldModalComponent implements OnInit {
  addCustomFieldFromGroup: FormGroup;
  dropdownOptions: FormArray;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddCustomFieldModalComponent>
  ) { }

  ngOnInit(): void {
    this.addCustomFieldFromGroup = this.fb.group({
      dataType: ['',Validators.required],
      labelName: ['',Validators.required],
      checkboxDefaultValue: '',
      textboxDefaultValue: '',
      dateDefaultValue: '',
      dropdownOptions: this.fb.array([])
    })
  }
  get dataType(){
    return this.addCustomFieldFromGroup.value.dataType;
  }
  createOption(): FormGroup {
    return this.fb.group({
      option: ''
    })
  }
  addOption() {
    this.dropdownOptions = this.addCustomFieldFromGroup.get('dropdownOptions') as FormArray;
    this.dropdownOptions.push(this.createOption());
  }
  removeOption(i){
    this.dropdownOptions.removeAt(i);
  }
  get ddOptionControls(){
    return this.addCustomFieldFromGroup.get('dropdownOptions')['controls'];
  }
  addCustomField(){
    if(this.addCustomFieldFromGroup.valid){
      this.data = this.addCustomFieldFromGroup.value;
      this.dialogRef.close({ data: this.addCustomFieldFromGroup.value })
    }   
  }
}
