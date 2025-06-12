import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { FormArray, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-salesman-dialog',
  templateUrl: './salesman-dialog.component.html',
  styleUrls: ['./salesman-dialog.component.scss']
})
export class SalesmanDialogComponent {
  addPaymentTermsForm: FormGroup;
  netTermFormControl: FormControl;
  netDaysFormControl: FormControl;
  @Output() readonly addPaymentTerms: EventEmitter<any> = new EventEmitter<any>();

  constructor(private dialog: MatDialogRef<any>,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public paymentTermData: any[] = [],
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.buildForm();

    // if(this.paymentTermData.length) {
    //   this.addPaymentTermsForm.reset();
    //   this.paymentTermData.forEach((item,i) => {
    //     this.payment.push(this.formBuilder.group({
    //       id: [item.uuid, [Validators.required]],
    //       number_of_days: [item.number_of_days, [Validators.required]],
    //       name: [item.name, [Validators.required]]
    //     }));
    //   });
    // }
    //console.log(this.addPaymentTermsForm);
  }

  buildForm() {
    this.addPaymentTermsForm = this.formBuilder.group({
      paymentTerms: new FormArray([])
    });
  }

  get payment() {
    return this.addPaymentTermsForm.get('paymentTerms') as FormArray;
  }

  get f() {
    return this.addPaymentTermsForm.controls;
  }

  addcontrol() {
    return this.formBuilder.group({
      id: ['', [Validators.required]],
      number_of_days: ['', [Validators.required]],
      name: ['', [Validators.required]]
    });
  }

  addnewrow() {
    this.payment.push(this.addcontrol())
  }

  onSubmit() {
    // let form = [];
    // let responseData = [];
    // this.paymentTermData.forEach((item, i) => {
    //   form.push({
    //     id: item.uuid,
    //     number_of_days: item.number_of_days,
    //     name: item.name
    //   });
    //   responseData.push(item);
    // });
    // let difference = _.differenceWith(this.addPaymentTermsForm.value.paymentTerms, form, _.isEqual);
    // let totalLen = responseData.length + difference.length;
    // let counter = 0;
    // difference.forEach((item, i) => {
    //   this.apiService.addPaymentTerm({
    //     "name" : item.name,
    //     "number_of_days": parseInt(item.number_of_days),
    //     "status": 1
    //   }).subscribe((res: any) => {
    //     counter++;
    //     responseData.push(res.data);
    //   })
    // });
    // this.addPaymentTerms.emit(responseData);
    // //console.log(this.addPaymentTermsForm);
    // let interval = setInterval(() => {
    //   if(counter == difference.length) {
    //     this.dialog.close();
    //     clearInterval(interval);
    //   }
    // },500);
    this.dialog.close();
  }
  close() {
    this.dialog.close();
  }
}
