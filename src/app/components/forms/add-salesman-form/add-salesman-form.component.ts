import { Component, OnInit } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { SalesMan } from '../../datatables/salesman-dt/salesman-dt.component';
import { MatDialog } from '@angular/material/dialog';
import { CodeDialogComponent } from '../../dialogs/code-dialog/code-dialog.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-add-salesman-form',
  templateUrl: './add-salesman-form.component.html',
  styleUrls: ['./add-salesman-form.component.scss']
})
export class AddSalesmanFormComponent implements OnInit {
  public salesManFormGroup: FormGroup;
  public salesManCodeFormControl: FormControl;
  public salesManFirstNameFormControl: FormControl;
  public salesManLastNameFormControl: FormControl;
  public salesManTypeFormControl: FormControl;
  public salesManRouteIdFormControl: FormControl;
  nextCommingNumberofsalesmanCode: string = ''
  // public userTypeFormControl: FormControl;
  //public salesManParentIdFormControl: FormControl;
  public salesManEmailFormControl: FormControl;
  public salesManPasswordFormControl: FormControl;
  //public salesManCountryIdFormControl: FormControl;
  //public isApprovedByAdminFormControl: FormControl;
  // public roleIdFormControl: FormControl;
  public salesManRoleFormControl: FormControl;
  public salesManSupervisorFormControl: FormControl;
  public salesManMobileFormControl: FormControl;
  public oderFromFormControl: FormControl;
  public orderToFormControl: FormControl;
  public invoiceFromFormControl: FormControl;
  public invoiceToFormControl: FormControl;
  public returnFromFormControl: FormControl;
  public returnToFormControl: FormControl;
  public collectionFromFormControl: FormControl;
  public collectionToFormControl: FormControl;
  public unloadFromFormControl: FormControl;
  public unloadToFormControl: FormControl;
  public salesManData: SalesMan;
  public salesmanRoles: any[];
  public formType: string;
  public togglePassword: boolean = true;
  private isEdit: boolean;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  areas: any[] = [];
  public customerID: any[] = []
  constructor(fds: FormDrawerService, apiService: ApiService, dataEditor: DataEditor, public dialog: MatDialog, private commonToasterService: CommonToasterService) {
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.fds.formType.subscribe(s => {
      this.formType = s
      this.salesManFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.getsalesmanCode();
        this.isEdit = false;
      }
      else {
        this.isEdit = true;
      }
    });
    this.salesManCodeFormControl = new FormControl('', [Validators.required]);
    this.salesManFirstNameFormControl = new FormControl('', [Validators.required]);
    this.salesManLastNameFormControl = new FormControl('', [Validators.required]);
    this.salesManTypeFormControl = new FormControl('', [Validators.required]);
    // this.userTypeFormControl = new FormControl('', [Validators.required]);
    // this.salesManParentIdFormControl = new FormControl('', [Validators.required]);
    this.salesManEmailFormControl = new FormControl('', [Validators.required, Validators.email]);
    this.salesManPasswordFormControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
    //this.salesManCountryIdFormControl = new FormControl('', [Validators.required]);
    //this.isApprovedByAdminFormControl = new FormControl('', [Validators.required]);
    // this.roleIdFormControl = new FormControl('', [Validators.required]);
    this.salesManRouteIdFormControl = new FormControl('', [Validators.required]);
    this.salesManRoleFormControl = new FormControl('', [Validators.required]);
    this.salesManSupervisorFormControl = new FormControl('');
    this.salesManMobileFormControl = new FormControl('', [Validators.maxLength(10)]);
    this.oderFromFormControl = new FormControl('');
    this.orderToFormControl = new FormControl('');
    this.invoiceFromFormControl = new FormControl('');
    this.invoiceToFormControl = new FormControl('');
    this.returnFromFormControl = new FormControl('');
    this.returnToFormControl = new FormControl('');
    this.collectionFromFormControl = new FormControl('');
    this.collectionToFormControl = new FormControl('');
    this.unloadFromFormControl = new FormControl('');
    this.unloadToFormControl = new FormControl('');


    this.salesManFormGroup = new FormGroup({
      salesManFirstName: this.salesManFirstNameFormControl,
      salesManLastName: this.salesManLastNameFormControl,
      salesManType: this.salesManTypeFormControl,
      salesManCode: this.salesManCodeFormControl,
      // userType: this.userTypeFormControl,
      //salesManParentId: this.salesManParentIdFormControl,
      salesManEmail: this.salesManEmailFormControl,
      salesManPassword: this.salesManPasswordFormControl,
      //salesManCountryId: this.salesManCountryIdFormControl,
      // isApprovedByAdmin: this.isApprovedByAdminFormControl,
      //roleId: this.roleIdFormControl,
      salesManRouteId: this.salesManRouteIdFormControl,
      salesManRole: this.salesManRoleFormControl,
      salesManSupervisor: this.salesManSupervisorFormControl,
      mobile: this.salesManMobileFormControl
    });
    this.salesManCodeFormControl.disable();
    // this.subscriptions.push(this.apiService.getSalesMan().subscribe((result: any) => {
    //   this.salesManData = result.data;
    //   //console.log(this.salesManData);
    //   })
    // );



    this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
      const data: SalesMan = result.data;
      if (data && data.uuid && this.isEdit) {
        this.salesManFormGroup.reset()
        this.salesManCodeFormControl.setValue(data.salesman_code ? data.salesman_code : '');
        this.salesManCodeFormControl.disable()
        this.salesManFirstNameFormControl.setValue(data.user ? data.user.firstname : '');
        this.salesManLastNameFormControl.setValue(data.user ? data.user.lastname : '');
        this.salesManTypeFormControl.setValue(data.salesman_type_id);
        // this.userTypeFormControl.setValue(data.usertype ? data.usertype : '');
        // this.salesManParentIdFormControl.setValue(data.parent_id ? data.parent_id : '');
        this.salesManEmailFormControl.setValue(data.user ? data.user.email : '');
        this.salesManPasswordFormControl.setValue(data.password ? data.password : '********');
        // this.salesManCountryIdFormControl.setValue(data.country_id ? data.country_id : '');
        // this.isApprovedByAdminFormControl.setValue(data.is_approved_by_admin ? data.is_approved_by_admin : '');
        // this.roleIdFormControl.setValue(data.role_id ? data.role_id : '');
        this.salesManRouteIdFormControl.setValue(data.route ? data.route.id : '');
        this.salesManRoleFormControl.setValue(data.salesman_role_id);
        this.salesManSupervisorFormControl.setValue(data.salesman_supervisor ? data.salesman_supervisor : '');
        this.salesManMobileFormControl.setValue(data.user ? data.user.mobile : '');
        this.salesManData = data;
        //console.log("Edit data : ", this.salesManData);
        this.isEdit = true;
      }
      return;
    }));
    this.subscriptions.push(this.apiService.getAllRoute().subscribe((result: any) => {
      this.areas = result.data;
    }));
    this.subscriptions.push(this.apiService.getSalesmanType().subscribe((result: any) => {
      this.customerID = result.data;
      //console.log('salesman', this.customerID)
    }));
    this.subscriptions.push(this.apiService.getSalesmanRoles().subscribe((result: any) => {
      this.salesmanRoles = result.data;
    }));

  }
  getsalesmanCode() {
    let nextNumber = {
      "function_for": "salesman"
    }
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofsalesmanCode = res.data.number_is;
        if (this.nextCommingNumberofsalesmanCode) {
          this.salesManCodeFormControl.setValue(this.nextCommingNumberofsalesmanCode);
          this.salesManCodeFormControl.disable();
        }
        else if (this.nextCommingNumberofsalesmanCode == null) {
          this.nextCommingNumberofsalesmanCode = '';
          this.salesManCodeFormControl.enable();
        }
      }
      else {
        this.nextCommingNumberofsalesmanCode = '';
        this.salesManCodeFormControl.enable();
      }
      //console.log("Res : ", res);
    });
  }
  public close() {
    this.fds.close();
    this.salesManFormGroup.reset();
    this.isEdit = false;
  }

  public saveSalesManData(): void {
    if (this.salesManFormGroup.invalid) {
      return;
    }
    if (this.isEdit) {
      this.editSalesManData();
    }
    else {
      this.postSalesManData();
    }
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postSalesManData(): void {

    this.apiService.addSalesMan({
      "usertype": "1",
      "parent_id": "",
      "firstname": this.salesManFirstNameFormControl.value,
      "lastname": this.salesManLastNameFormControl.value,
      "email": this.salesManEmailFormControl.value,
      "password": this.salesManPasswordFormControl.value,
      "mobile": this.salesManMobileFormControl.value,
      "country_id": 1,
      "is_approved_by_admin": "1",
      "role_id": 1,
      "status": "1",
      "route_id": this.salesManRouteIdFormControl.value,
      "salesman_code": this.salesManCodeFormControl.value,
      "salesman_supervisor": this.salesManSupervisorFormControl.value,
      "salesman_role_id": this.salesManRoleFormControl.value,
      "salesman_type_id": this.salesManTypeFormControl.value


    }).subscribe((result: any) => {
      this.fds.close().then(success => {
        window.location.reload();
      });
    }, err => {
      if (err.error?.errors?.email) {
        this.commonToasterService.showError("Error:", err.error?.errors?.email[0]);
      }

    });
  }

  private editSalesManData(): void {

    this.apiService.editSalesMan(this.salesManData.user?.uuid, {
      "usertype": "1",
      "parent_id": "",
      "firstname": this.salesManFirstNameFormControl.value,
      "lastname": this.salesManLastNameFormControl.value,
      "email": this.salesManEmailFormControl.value,
      "password": this.salesManPasswordFormControl.value,
      "mobile": this.salesManMobileFormControl.value,
      "route_id": this.salesManRouteIdFormControl.value,
      "country_id": 1,
      "is_approved_by_admin": "1",
      "role_id": 1,
      "status": "1",
      "route_name": this.salesManRouteIdFormControl.value,
      "salesman_code": this.salesManCodeFormControl.value,
      "salesman_supervisor": this.salesManSupervisorFormControl.value,
      "salesman_role_id": this.salesManRoleFormControl.value,
      "salesman_type_id": this.salesManTypeFormControl.value
    }).subscribe((result: any) => {
      this.isEdit = false;
      this.fds.close().then(success => {
        window.location.reload();
      });
    }, err => {
      if (err.error?.errors?.email) {
        this.commonToasterService.showError("Error:", err.error?.errors?.email[0]);
      }
    });
    //console.log(this.salesManFormGroup)
  }
  open() {
    let response: any;
    let data = {
      title: 'Salesman Code',
      functionFor: 'salesman',
      code: this.salesManCodeFormControl.value,
      key: this.nextCommingNumberofsalesmanCode.length ? 'autogenerate' : 'manual'
    };

    this.dialog.open(CodeDialogComponent, {
      width: '500px',
      height: 'auto',
      data: data,
    }).componentInstance
      .sendResponse.subscribe((res: any) => {

        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.salesManCodeFormControl.setValue('');
          this.salesManCodeFormControl.enable();
        }
        else if (res.type == 'autogenerate' && !res.enableButton) {
          this.salesManCodeFormControl.setValue(res.data.next_coming_number_salesman);
          this.nextCommingNumberofsalesmanCode = res.reqData.prefix_code;
          this.salesManCodeFormControl.disable();
        }
      })
  }
}
