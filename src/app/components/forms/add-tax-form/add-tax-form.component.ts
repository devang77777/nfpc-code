

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';


@Component({
  selector: 'app-add-tax-form',
  templateUrl: './add-tax-form.component.html',
  styleUrls: ['./add-tax-form.component.scss']
})
export class AddTaxFormComponent implements OnInit {

   public radioTitle: string;
  public radioItems: Array<string>;
  public model   = {option: 'NO'};
  public vatFormGroup: FormGroup;
  public vatregisteronFormControl: FormControl;
  //public subCategoryIdFormControl: FormControl;
  public vatnumberFormControl: FormControl;

  public formType: string

  private isEdit: boolean;
  private brandGroupData: any;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];

  constructor(fds: FormDrawerService, apiService: ApiService, dataEditor: DataEditor) {
    Object.assign(this, { fds, apiService, dataEditor }


      );

    this.radioTitle = 'Is your business registered for VAT?';
    this.radioItems = ['YES', 'NO'];
  }

  public ngOnInit(): void {
    this.fds.formType.subscribe(s=> this.formType = s);
    this.vatnumberFormControl = new FormControl('', [ Validators.required ]);
    this.vatregisteronFormControl = new FormControl('', [ Validators.required ]);
    //this.subCategoryIdFormControl = new FormControl('', [ Validators.required ]);

    this.vatFormGroup = new FormGroup({
      vatregisteron: this.vatregisteronFormControl,
      vatdate: this.vatnumberFormControl,
    });

    // this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
    //   const data: any = result.data
    //   if(data && data.uuid){
    //     this.NameFormControl.setValue(data.brand_name);
    //     this.CodeFormControl.setValue(data.brand_code);
    //     this.brandGroupData = data;
    //     this.isEdit = true;
    //   }
    // }));
  }

  public close() {
    this.fds.close();
    this.vatFormGroup.reset();
    this.isEdit = false;
  }

  // public saveItemData(): void {
  //   if (this.vatFormGroup.invalid) {
  //     return;
  //   }
  //   if (this.isEdit) {
  //     this.editItemGroupData();
  //   }
  //   else {
  //     this.postItemGroupData();
  //   }
  // }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  // private postItemGroupData(): void {
  //   this.apiService.addBrandItem({
  //     "brand_code" : this.CodeFormControl.value,
  //     "brand_name": this.NameFormControl.value,
  //     "status" : "1"
  //   }).subscribe((result: any) => {
  //     this.fds.close().then(success => {
  //       window.location.reload();
  //     });
  //   });
  // }

  // private editItemGroupData(): void {
  //   this.apiService.editBrandItem(this.brandGroupData.uuid, {
  //     "brand_code" : this.CodeFormControl.value,
  //     "brand_name": this.NameFormControl.value,
  //     "status" : "1"
  //   }).subscribe((result: any) => {
  //     this.isEdit = false;
  //     this.fds.close().then(success => {
  //       window.location.reload();
  //     });
  //   });
  // }


}
