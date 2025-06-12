import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { DataEditor } from 'src/app/services/data-editor.service';


@Component({
  selector: 'app-edit-preference',
  templateUrl: './edit-preference.component.html',
  styleUrls: ['./edit-preference.component.scss']
})
export class EditPreferenceComponent implements OnInit {

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
  model: any = '';
  preferenceGroups: any[] = [];



  firstFormGroup: FormGroup;
  firstFormCompleted: boolean = false;
  secondFormCompleted: boolean = false;
  secondFormGroup: FormGroup;
  workFlowNameFormControl: FormControl;
  moduleNameFormControl: FormControl;
  descriptionFormControl: FormControl;
  whenInvoiceIsFormControl: FormControl;
  roleFormcontrol: FormControl;
  userFomcontrol: FormControl;
  public detailEditData: any;
  public visibledata: any[] = []
  addPaymentTermsForm: FormGroup;
  netTermFormControl: FormControl;
  netDaysFormControl: FormControl;
  uselist: any[] = [];
  rolelist: any[] = [];
  sub: boolean;
  public roleData: any[] = [];
  public userdat: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private dataService: DataEditor,
    private route: Router) { }

  ngOnInit() {

    this.buildForm();
    this.apiService.getWorkFlowModuleList().subscribe((res: any) => {
      if (res.status) {
        this.preferenceGroups = res.data;
      }
    });

    this.apiService.getAllOrganisationRoles().subscribe((res) => {
      this.rolelist = res.data;
    });

    this.apiService.getAllOrganizationUsers().subscribe((res) => {
      this.uselist = res.data;
    });

    this.dataService.newData.subscribe((res) => {
      if (JSON.stringify(res) != "{}") {
        //console.log("datafor", res);
        this.roleData = res.work_flow_rule_approval_roles
        if (this.roleData && this.roleData.length) {
          this.roleData.forEach((item, i) => {
            this.payment.push(this.formBuilder.group({
              id: '',
              role: item.organisation_role.id,
              users: item.work_flow_rule_approval_users[0].user_id
            }))
          });
        }

        this.detailEditData = res;
        this.visibledata = res;
        this.workFlowNameFormControl.setValue(res.work_flow_rule_name);
        this.moduleNameFormControl.setValue(res.work_flow_rule_module ? res.work_flow_rule_module.id : 1);
        this.model = res.work_flow_rule_module ? res.work_flow_rule_module.name : '';
        this.descriptionFormControl.setValue(res.description);
        this.whenInvoiceIsFormControl.setValue(res.event_trigger);

        this.options.forEach((item, i) => {
          if (item.name == res.event_trigger) {
            item.isSelected = true;
          }
        });
        this.firstFormCompleted = true;
        this.secondFormCompleted = true;
      }
      else {
        //console.log("No data found");
      }
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
    ////console.log(this.moduleNameFormControl);
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
    this.apiService.editWorkFlow(this.detailEditData.uuid, {
      "work_flow_rule_name": this.workFlowNameFormControl.value,
      "description": this.descriptionFormControl.value,
      "event_trigger": this.whenInvoiceIsFormControl.value,
      "work_flow_rule_module_id": this.moduleNameFormControl.value,
      "status": 1,
      "approval_roles": approvalRolesData
    }).subscribe((res: any) => {
      if (res.status) {
        ////console.log(res);
        this.cancel();
      }
    });
    this.route.navigate(['settings/preference'])
  }

  cancel() {
    this.route.navigate(['settings/preference'])
  }
}
