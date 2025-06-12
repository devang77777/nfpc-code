import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-workflow',
  templateUrl: './add-workflow.component.html',
  styleUrls: ['./add-workflow.component.scss']
})
export class AddWorkflowComponent implements OnInit {

  submitted: boolean = false;
  submittesEdited: boolean = false;
  hideoption: boolean = true;
  hideSecondoption: boolean = true;
  Selectedoption: string;
  public selection: string;
  options = [
    {
      type: 'radio',
      name: 'Created',
      isSelected: false
    },
    {
      type: 'radio',
      name: 'Edited',
      isSelected: false
    },
    {
      type: 'radio',
      name: 'Created or Edited',
      isSelected: false
    },
    {
      type: 'radio',
      name: 'Deleted',
      isSelected: false
    },
  ];
  model = { option: 'Created' };
  preferenceGroups: any[] = [];

  foods: any[] = [
    { id: 1, viewValue: 'When any field is updated' },
    { id: 2, viewValue: 'When all field is updated' },
    { id: 3, viewValue: 'when field are statistically updated' }
  ];

  firstFormGroup: FormGroup;
  firstFormCompleted: boolean = false;
  secondFormCompleted: boolean = false;
  secondFormGroup: FormGroup;
  workFlowNameFormControl: FormControl;
  moduleNameFormControl: FormControl;
  descriptionFormControl: FormControl;
  whenInvoiceIsFormControl: FormControl;


  addPaymentTermsForm: FormGroup;
  netTermFormControl: FormControl;
  netDaysFormControl: FormControl;
  uselist: any[] = [];
  rolelist: any[] = [];
  sub: boolean;

  constructor(private formBuilder: FormBuilder, private apiService: ApiService, private router: Router) { }

  ngOnInit() {
    this.buildForm();
    this.apiService.getWorkFlowModuleList().subscribe((res: any) => {
      if (res.status) {
        this.preferenceGroups = res.data;
      }
      //console.log("Module list : ", res);
    });
    this.apiService.getAllOrganisationRoles().subscribe((res) => {
      //console.log("Organisation roles : ",res);
      this.rolelist = res.data;
    });
  }

  buildForm() {
    this.workFlowNameFormControl = new FormControl('', [Validators.required]);
    this.moduleNameFormControl = new FormControl('', [Validators.required]);
    this.descriptionFormControl = new FormControl('', [Validators.required]);
    this.whenInvoiceIsFormControl = new FormControl('', [Validators.required]);

    this.firstFormGroup = new FormGroup({
      workflowname: this.workFlowNameFormControl,
      moduleName: this.moduleNameFormControl,
      description: this.descriptionFormControl
    });

    this.secondFormGroup = new FormGroup({
      whenInvoiceis: this.whenInvoiceIsFormControl
    });

    this.addPaymentTermsForm = this.formBuilder.group({
      paymentTerms: new FormArray([])
    });
    this.addnewrow();
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
      users: ['', [Validators.required]],
      role: ['', [Validators.required]]
    });
  }

  addnewrow() {
    this.payment.push(this.addcontrol())
  }

  open() {
    this.firstFormCompleted = true;
  }

  deleteRow(index: number) {
    this.payment.removeAt(index);
  }

  opensecond() {
    this.secondFormCompleted = true;
  }

  get Check() {
    return this.f.paymentTerms['controls'].length > 0 ? true : false;
  }

  findUsersForUsers(index: number) {
    //console.log("payment form first : ",this.addPaymentTermsForm);
    this.uselist = [];
    let controls: any = this.f.paymentTerms['controls'];
    controls.forEach((item, i) => {
      if (i == index) {
        item.controls.users.value = '';
      }
    });
    //console.log("payment form after : ",this.addPaymentTermsForm);
    this.apiService.getAllOrganizationUsers().subscribe((res) => {
      //console.log("Organisation users : ",res);
      this.uselist = res.data;
    });
  }

  savePreference() {
    let approvalRolesData: any[] = [];
    let payment: any = this.addPaymentTermsForm.value.paymentTerms;
    payment.forEach((item, i) => {
      let data = {
        "organisation_role_id": item.role,
        "users": [item.users]
      };
      approvalRolesData.push(data);
    });
    this.apiService.addWorkFlow({
      "work_flow_rule_name": this.workFlowNameFormControl.value,
      "description": this.descriptionFormControl.value,
      "event_trigger": this.whenInvoiceIsFormControl.value,
      "work_flow_rule_module_id": this.moduleNameFormControl.value,
      "status": 1,
      "approval_roles": approvalRolesData
    }).subscribe((res: any) => {
      if (res.status) {
        //console.log(res);
        this.cancel();
      }
    });
  }

  cancel() {
    this.router.navigateByUrl('settings/preference')
  }

}
