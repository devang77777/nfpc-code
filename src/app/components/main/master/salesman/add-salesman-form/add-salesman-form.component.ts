import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { MatDialog } from '@angular/material/dialog';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { SalesMan, temp } from '../salesman-dt/salesman-dt.component';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { APP } from 'src/app/app.constant';
import { SalesClass } from './add-salesman.modal';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SalesmanLobComponent } from '../salesman-lob/salesman-lob.component';
import { SalesmanSupervisorFormComponent } from 'src/app/components/dialog-forms/salesman-supervisor-form/salesman-supervisor-form.component';

@Component({
  selector: 'app-add-salesman-form',
  templateUrl: './add-salesman-form.component.html',
  styleUrls: ['./add-salesman-form.component.scss'],
})
export class AddSalesmanFormComponent implements OnInit {
  form: FormGroup
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  domain = window.location.host.split('.')[0];
  public salesManFormGroup: FormGroup;
  public imageFormControl: FormControl;
  public salesManCatrgoryList: any[] = [];
  public salesManCodeFormControl: FormControl;
  public salesmanSupervisorCategory: FormControl;
  public salesManFirstNameFormControl: FormControl;
  public salesManLastNameFormControl: FormControl;
  public salesManTypeFormControl: FormControl;
  public salesManRouteIdFormControl: FormControl;
  nextCommingNumberofsalesmanCode: string = '';
  // public userTypeFormControl: FormControl;
  //public salesManParentIdFormControl: FormControl;
  public salesManEmailFormControl: FormControl;
  public salesManPasswordFormControl: FormControl;
  //public salesManCountryIdFormControl: FormControl;
  //public isApprovedByAdminFormControl: FormControl;
  // public roleIdFormControl: FormControl;
  public salesManRoleFormControl: FormControl;
  public HelperFormControl: FormControl;
  public salesmanlobFormControl: FormControl;
  public salesManSupervisorFormControl: FormControl;
  public salesManMobileFormControl: FormControl;
  public salesManCategoryFormControl: FormControl;
  public salesManRegionFormControl: FormControl;
  public isBlockFormControl: FormControl;
  public oderFromFormControl: FormControl;
  public orderToFormControl: FormControl;
  public customerFromFormControl: FormControl;
  public customerToFormControl: FormControl;
  public validFormControl: FormControl;
  public validToControl: FormControl;
  public invoiceFromFormControl: FormControl;
  public invoiceToFormControl: FormControl;
  public returnFromFormControl: FormControl;
  public returnToFormControl: FormControl;
  public collectionFromFormControl: FormControl;
  public collectionToFormControl: FormControl;
  public unloadFromFormControl: FormControl;
  public unloadToFormControl: FormControl;
  public salesmanSupCatFormControl: FormControl;
  public salesManData: SalesMan;
  public tempData: temp;
  public salesmanRoles: any[];
  public salesmanRolesByType = [];
  public helper: any = [];
  public helperShow: boolean = false;
  public formType: string;
  public togglePassword: boolean = true;
  private isEdit: boolean = false;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  areas: any[] = [];
  public customerID: any[] = [];
  formPopulateData: any;
  salesmanCategorise = [
    "Salesman",
    "Salesman cum driver",
    "Helper",
    "driver cum helper",
  ];
  public regionList: any;

  isCustomField = false;
  moduleId = APP.MODULE.SALESMAN;
  customFields: Array<any> = [];
  editData = [];
  salesmanList: any = [];
  public selectedFiles = [];
  public filechoosed = false;
  nextCommingNumberofsalesmanCodePrefix: any;
  supervisorList: any[] = [];
  lobs: any[] = [];
  lob1: any = [{}];
  lob_id: Number;
  tempD: SalesClass = new SalesClass();
  public salesmanLobList: any;
  public name: any[] = [];
  isSubmitted: boolean;



  constructor(
    private route: ActivatedRoute,
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    private commonToasterService: CommonToasterService
  ) {
    Object.assign(this, { fds, apiService, dataEditor });
  }
  salesmanCreditLimit;
  public ngOnInit(): void {
    this.buildForm();

    this.fds.formType.subscribe((s) => {
      this.formType = s;
      if (this.formType) {
        this.isBlockFormControl.valueChanges.subscribe(item => {
          this.validFormControl.setValue('')
          this.validToControl.setValue('')
        })
        this.getCustomFieldStatus();
        this.formPopulateData = this.route.snapshot.data[
          'salesman_resolve'
        ].salesmanAdd.data;
        this.salesmanCreditLimit = this.route.snapshot.data[
          'salesman_resolve'
        ].creditLimit.data;
        console.log(this.salesmanCreditLimit);
        this.salesmanList = this.route.snapshot.data['salesman_resolve'].salesmanList.data;
        this.salesmanLobList = this.formPopulateData.salesman_lob;
        // this.sales = this.formPopulateData.sales_type;
        // const salescode = this.formPopulateData.code;
        this.getUser();
        this.loadFormData();
        this.getLob();
      }
      if (this.formType == 'Add') {
        this.salesManFormGroup.reset();
        this.getNextComingCode();
        this.initializeNumberRange();
        this.isEdit = false;
      } else if (this.formType == 'Edit') {
        this.salesManFormGroup.reset();
        this.initializeNumberRange();
        this.isEdit = true;
      }
    });

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((result) => {
        const data: any = result.data;
        if (data && data.uuid && this.isEdit) {
          this.editData = result.data.custom_field_value_save;
          this.salesManCodeFormControl.setValue(
            data.salesman_code ? data.salesman_code : ''
          );
          this.salesManCodeFormControl.disable();
          this.salesManFirstNameFormControl.setValue(
            data.user ? data.user.firstname : ''
          );
          this.isBlockFormControl.setValue(data['is_block'] == 1 ? true : false)
          this.validFormControl.setValue(data['block_start_date'])
          this.validToControl.setValue(data['block_end_date'])
          this.salesManLastNameFormControl.setValue(
            data.user ? data.user.lastname : ''
          );
          this.imageFormControl.setValue(
            data.profile_image ? data.profile_image : ''
          );
          if (data.profile_image !== "" && data.profile_image !== null) {
            this.selectedFiles = [];
            this.selectedFiles.push(data.profile_image);
          }
          this.salesManTypeFormControl.setValue(data.salesman_type_id);
          this.onChangeSalesmanType(data.salesman_type_id);


          this.salesManEmailFormControl.setValue(
            data.user ? data.user.email : ''
          );
          if (this.salesManEmailFormControl.value != '') {
            this.salesManEmailFormControl.disable();
          } else {
            this.salesManEmailFormControl.enable();
          }


          // this.salesManPasswordFormControl.setValue(data.password ? data.password : '');
          this.salesManPasswordFormControl.setErrors(null);
          this.salesManRouteIdFormControl.setValue(
            data.route ? data.route.id : 0
          );

          this.salesManRoleFormControl.setValue(data.salesman_role_id);

          // this.salesmanlobFormControl.setValue(
          //   data.salesman_lob ? data.salesman_lob : ''
          // );

          let salesmanLobs = data?.salesmanlob?.map(element => (
            { id: element?.lob_id, itemName: element?.lob?.name }
          ));
          this.salesmanlobFormControl.setValue(salesmanLobs)
          let supervisor = data.supervisor_user ? [{ id: data?.supervisor_user?.id, itemName: `${data?.supervisor_user?.firstname} ${data?.supervisor_user?.lastname} ` }] : [{}];
          this.salesManSupervisorFormControl.setValue(
            supervisor
          );

          this.salesManMobileFormControl.setValue(
            data.user ? data.user.mobile : ''
          );
          this.salesManCategoryFormControl.setValue(
            data ? data.category_id : ''
          );
          this.salesManRegionFormControl.setValue(
            data ? data.region_id : ''
          );
          this.customerToFormControl.setValue(
            data.salesman_range?.customer_to
              ? data.salesman_range?.customer_to
              : ''
          );
          this.customerFromFormControl.setValue(
            data.salesman_range?.customer_from
              ? data.salesman_range?.customer_from
              : ''
          );
          this.orderToFormControl.setValue(
            data.salesman_range?.order_to ? data.salesman_range?.order_to : ''
          );
          this.oderFromFormControl.setValue(
            data.salesman_range?.order_from ? data.salesman_range?.order_from : ''
          );
          this.invoiceToFormControl.setValue(
            data.salesman_range?.invoice_to ? data.salesman_range?.invoice_to : ''
          );
          this.invoiceFromFormControl.setValue(
            data.salesman_range?.invoice_from
              ? data.salesman_range?.invoice_from
              : ''
          );
          this.unloadFromFormControl.setValue(
            data.salesman_range?.unload_from
              ? data.salesman_range?.unload_from
              : ''
          );
          this.unloadToFormControl.setValue(
            data.salesman_range?.unload_to ? data.salesman_range?.unload_to : ''
          );
          this.collectionFromFormControl.setValue(
            data.salesman_range?.collection_from
              ? data.salesman_range?.collection_from
              : ''
          );
          this.collectionToFormControl.setValue(
            data.salesman_range?.collection_from
              ? data.salesman_range?.collection_from
              : ''
          );
          this.returnFromFormControl.setValue(
            data.salesman_range?.credit_note_from
              ? data.salesman_range?.credit_note_from
              : ''
          );
          this.returnToFormControl.setValue(
            data.salesman_range?.credit_note_to
              ? data.salesman_range?.credit_note_to
              : ''
          );
          this.salesManData = data;
          this.isEdit = true;
        }
        return;
      })
    );

  }

  getLob() {
    this.apiService.getLobs().subscribe(lobs => {
      this.lobs = lobs.data;
      this.name = lobs.data.name;
    })
  }
  getUser() {
    // this.apiService.getSalesMan().subscribe(res => {
    this.salesmanList.filter((helper) => {
      if (helper.salesman_type.id == 1) {
        this.helper.push(helper);
      }
    });
    // })
  }


  manageLobClicked() {
    let lob = this.salesmanlobFormControl.value[0];
    if (lob?.id == 111000) {
      this.salesmanlobFormControl.setValue("");
    }
    this.openSalesmanLob();
  }

  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  fileChosen(event) {
    let files = [];
    if (event.target.files && event.target.files[0]) {
      let filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          files.push(event.target.result);
        };

        reader.readAsDataURL(event.target.files[i]);
      }
      this.selectedFiles = files;
      this.filechoosed = true;
    }
  }

  buildForm() {
    this.imageFormControl = new FormControl('');
    this.salesManCodeFormControl = new FormControl('', [Validators.required]);
    this.salesManFirstNameFormControl = new FormControl('', [
      Validators.required,
    ]);
    this.salesManLastNameFormControl = new FormControl('', [
      Validators.required,
    ]);
    this.salesManTypeFormControl = new FormControl('', [Validators.required]);
    this.salesManEmailFormControl = new FormControl('');
    this.salesManPasswordFormControl = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]);
    if (this.domain == "merchandising" || this.domain == "nfpc") {
      this.salesManRouteIdFormControl = new FormControl('');
    } else {
      this.salesManRouteIdFormControl = new FormControl('');
    }

    this.salesManRoleFormControl = new FormControl('', [Validators.required]);
    this.HelperFormControl = new FormControl('');
    this.salesManSupervisorFormControl = new FormControl('');
    this.salesManMobileFormControl = new FormControl('', [
      Validators.maxLength(13),
    ]);
    this.salesManCategoryFormControl = new FormControl('');
    this.salesmanSupCatFormControl = new FormControl('');
    this.salesManRegionFormControl = new FormControl('');
    this.salesmanlobFormControl = new FormControl('')
    this.isBlockFormControl = new FormControl('');
    this.validFormControl = new FormControl('');
    this.validToControl = new FormControl('');
    this.customerFromFormControl = new FormControl('');
    this.customerToFormControl = new FormControl('');
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
      salesManEmail: this.salesManEmailFormControl,
      salesManPassword: this.salesManPasswordFormControl,
      salesManRouteId: this.salesManRouteIdFormControl,
      salesManRole: this.salesManRoleFormControl,
      helper: this.HelperFormControl,
      salesManSupervisor: this.salesManSupervisorFormControl,
      mobile: this.salesManMobileFormControl,
      category_id: this.salesManCategoryFormControl,
      salesman_supervisor_category: this.salesmanSupCatFormControl,
      region_id: this.salesManRegionFormControl,
      salesmanlob: this.salesmanlobFormControl,
      orderTo: this.orderToFormControl,
      orderFrom: this.oderFromFormControl,
      invoiceTo: this.invoiceToFormControl,
      invoiceFrom: this.invoiceFromFormControl,
      retrunTo: this.returnToFormControl,
      returnFrom: this.returnFromFormControl,
      collectionTo: this.collectionToFormControl,
      collectionForm: this.collectionFromFormControl,
      unloadTo: this.unloadToFormControl,
      unloadFrom: this.unloadFromFormControl
    });
    this.salesManCodeFormControl.disable();
  }
  getNextComingCode() {
    let nextNumber = {
      function_for: 'salesman',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.setItemCode(res.data);
      }
    });
  }
  setItemCode(code: any) {
    if (code.number_is !== null) {
      this.nextCommingNumberofsalesmanCode = code.number_is;
      this.nextCommingNumberofsalesmanCodePrefix = code.prefix_is;
      this.salesManCodeFormControl.setValue(
        this.nextCommingNumberofsalesmanCode
      );
      this.salesManCodeFormControl.disable();
    } else {
      this.nextCommingNumberofsalesmanCode = '';
      this.salesManCodeFormControl.enable();
    }
  }

  loadFormData() {
    const formData = this.formPopulateData;
    this.areas = formData.route;
    this.salesmanRoles = formData.salesman_role;
    this.customerID = formData.salesman_type;
    this.salesmanLobList = formData.salesman_lob;
    this.supervisorList = formData.salesman_supervisor;
    this.regionList = formData.region;
    this.salesManCatrgoryList = formData.salesman_supervisor;
  }

  public close() {
    this.fds.close();
    this.filechoosed = false;
    this.selectedFiles = [];
    this.isEdit = false;
  }

  get isCustomerRange(): boolean {
    if (
      this.customerToFormControl.value?.length &&
      this.customerFromFormControl.value?.length
    ) {
      return true;
    } else {
      return false;
    }
  }

  get isOrderRange(): boolean {
    if (
      this.orderToFormControl.value?.length &&
      this.oderFromFormControl.value?.length
    ) {
      return true;
    } else {
      return false;
    }
  }
  get isInvoiceRange(): boolean {
    if (
      this.invoiceToFormControl.value?.length &&
      this.invoiceFromFormControl.value?.length
    ) {
      return true;
    } else {
      return false;
    }
  }
  get isCollectionRange(): boolean {
    if (
      this.collectionToFormControl.value?.length &&
      this.collectionFromFormControl.value?.length
    ) {
      return true;
    } else {
      return false;
    }
  }
  get isReturnRange(): boolean {
    if (
      this.returnToFormControl.value?.length &&
      this.returnFromFormControl.value?.length
    ) {
      return true;
    } else {
      return false;
    }
  }
  get isUnloadRange(): boolean {
    if (
      this.unloadToFormControl.value?.length &&
      this.unloadFromFormControl.value?.length
    ) {
      return true;
    } else {
      return false;
    }
  }

  onChangeSalesmanType(value) {
    if (value == 1) {
      this.helperShow = true;
    }
    if (value == 2) {
      this.helperShow = false;
      this.salesmanRolesByType = [];
      this.salesmanRolesByType = this.salesmanRoles.filter((role) =>
        role?.name.toLowerCase().includes('merchandiser')
      );
      this.salesManRouteIdFormControl.setErrors(null);
    } else if (value == 3) {
      this.helperShow = false;
      this.salesManRouteIdFormControl.setErrors(null);
      this.salesManRoleFormControl.setErrors(null);
    } else {
      this.salesmanRolesByType = [];
      this.salesmanRolesByType = this.salesmanRoles.filter(
        (role) => !role?.name.toLowerCase().includes('merchandiser')
      );
      if (this.domain == "merchandising" || this.domain == "nfpc") {
        this.salesManRouteIdFormControl.setErrors(null);
      } else {
        this.salesManRouteIdFormControl.setErrors(null);
        this.salesManRoleFormControl.setErrors(null);
      }

    }
    //console.log(this.salesManFormGroup, this.salesManRouteIdFormControl);
  }

  private initializeNumberRange() {
    this.customerToFormControl.reset();
    this.customerFromFormControl.reset();
    this.orderToFormControl.reset();
    this.oderFromFormControl.reset();
    this.invoiceFromFormControl.reset();
    this.invoiceToFormControl.reset();
    this.collectionToFormControl.reset();
    this.collectionFromFormControl.reset();
    this.returnFromFormControl.reset();
    this.returnToFormControl.reset();
    this.unloadToFormControl.reset();
    this.unloadFromFormControl.reset();
  }

  onCustomFieldUpdated(item) {
    if (Array.isArray(item)) {
      this.customFields = item;
    }
  }
  getCustomFieldStatus() {
    this.apiService
      .checkCustomFieldStatus({
        organisation_id: APP.ORGANIZATION,
        module_id: this.moduleId,
      })
      .subscribe((response) => {
        this.isCustomField =
          response.data.custom_field_status == 0 ? false : true;
      });
  }
  validateCustomFields() {
    let isValid;
    const modules = this.customFields.map((item) => {
      const value =
        item.fieldType == 'multi_select'
          ? item.fieldValue.toString()
          : item.fieldValue;
      return {
        module_id: item.moduleId,
        custom_field_id: item.id,
        custom_field_value: value,
      };
    });
    isValid = modules.find(
      (module) =>
        module.custom_field_value === undefined ||
        module.custom_field_value === ''
    );
    if (isValid) {
      this.commonToasterService.showWarning(
        'Warning',
        'Please fill all custom fields.'
      );
      return false;
    }
    return modules;
  }

  public saveSalesManData(): void {
    this.isSubmitted = false;
    if (this.salesManFormGroup.invalid) {
      this.isSubmitted = true;
      return;
    } else {
      if (this.isEdit) {
        this.editSalesManData();
      } else {
        this.postSalesManData();
      }
    }
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postSalesManData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;

    this.apiService
      .addSalesMan({
        usertype: '1',
        parent_id: '299',
        firstname: this.salesManFirstNameFormControl.value,
        lastname: this.salesManLastNameFormControl.value,
        email: this.salesManEmailFormControl.value,
        password: this.salesManPasswordFormControl.value,
        mobile: this.salesManMobileFormControl.value,
        category_id: this.salesManCategoryFormControl.value,
        region_id: this.salesManRegionFormControl.value,
        country_id: 1,
        is_approved_by_admin: '1',
        role_id: 1,
        status: '1',
        route_id: this.salesManRouteIdFormControl.value || 0,
        // lob_id: this.salesmanlobFormControl.value[0]?.id,
        salesman_lob: this.salesmanlobFormControl.value ? this.salesmanlobFormControl.value.map(x => ({ lob_id: x.id })) : 0,
        is_lob: this.salesmanCreditLimit?.credit_limit_type == 2 ? 1 : 0,
        salesman_code: this.salesManCodeFormControl.value,
        salesman_supervisor: this.salesManSupervisorFormControl.value ? this.salesManSupervisorFormControl.value[0]?.id : "",
        salesman_role_id: this.salesManRoleFormControl.value,

        ssalesman_helper_id: this.HelperFormControl.value,
        salesman_type_id: this.salesManTypeFormControl.value,
        customer_from: this.customerFromFormControl.value,
        customer_to: this.customerToFormControl.value,
        order_from: this.oderFromFormControl.value,
        order_to: this.orderToFormControl.value,
        invoice_from: this.invoiceFromFormControl.value,
        invoice_to: this.invoiceToFormControl.value,
        collection_from: this.collectionFromFormControl.value,
        collection_to: this.collectionToFormControl.value,
        credit_note_from: this.returnFromFormControl.value,
        credit_note_to: this.returnToFormControl.value,
        unload_from: this.unloadFromFormControl.value,
        unload_to: this.unloadToFormControl.value,
        salesman_profile: this.filechoosed == true ? this.selectedFiles[0] : undefined,
        modules,
        is_block: this.isBlockFormControl.value || 0,
        block_start_date: this.validFormControl.value,
        block_end_date: this.validToControl.value,
      })
      .subscribe(
        (result: any) => {
          this.commonToasterService.showSuccess(
            'Added',
            'Salesman Added Successfully'
          );
          let data = result.data;

          data.edit = false;
          this.updateTableData.emit(data);
          this.fds.close();
        },
        (err) => {
          if (err.error?.errors?.email) {
            this.commonToasterService.showError(
              'Error:',
              err.error?.errors?.email[0]
            );
          }
        }
      );
  }

  private editSalesManData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;
    this.apiService
      .editSalesMan(this.salesManData.user?.uuid, {
        usertype: '1',
        parent_id: '',
        firstname: this.salesManFirstNameFormControl.value,
        lastname: this.salesManLastNameFormControl.value,
        email: this.salesManEmailFormControl.value,
        password: this.salesManPasswordFormControl.value,
        mobile: this.salesManMobileFormControl.value,
        category_id: this.salesManCategoryFormControl.value,
        region_id: this.salesManRegionFormControl.value,
        // lob_id: this.salesmanlobFormControl.value[0]?.id,
        salesman_lob: this.salesmanlobFormControl.value.map(x => ({ lob_id: x.id })) || 0,
        is_lob: this.salesmanCreditLimit?.credit_limit_type == 2 ? 1 : 0,
        route_id: this.salesManRouteIdFormControl.value || 0,
        country_id: 1,
        is_approved_by_admin: '1',
        role_id: 1,
        status: '1',
        route_name: this.salesManRouteIdFormControl.value,
        salesman_code: this.salesManCodeFormControl.value,
        salesman_supervisor: this.salesManSupervisorFormControl.value ? this.salesManSupervisorFormControl.value[0]?.id : "",
        salesman_role_id: this.salesManRoleFormControl.value,
        salesman_type_id: this.salesManTypeFormControl.value,
        customer_from: this.customerFromFormControl.value,
        customer_to: this.customerToFormControl.value,
        order_from: this.oderFromFormControl.value,
        order_to: this.orderToFormControl.value,
        invoice_from: this.invoiceFromFormControl.value,
        invoice_to: this.invoiceToFormControl.value,
        collection_from: this.collectionFromFormControl.value,
        collection_to: this.collectionToFormControl.value,
        credit_note_from: this.returnFromFormControl.value,
        credit_note_to: this.returnToFormControl.value,
        unload_from: this.unloadFromFormControl.value,
        unload_to: this.unloadToFormControl.value,
        salesman_profile: this.filechoosed == true ? this.selectedFiles[0] : undefined,
        modules,
        is_block: this.isBlockFormControl.value || 0,
        block_start_date: this.validFormControl.value,
        block_end_date: this.validToControl.value,
      })
      .subscribe(
        (result: any) => {
          this.isEdit = false;
          this.commonToasterService.showSuccess(
            'Updated',
            'Salesman Updated Successfully'
          );
          let data = result.data;
          data.edit = true;
          this.updateTableData.emit(data);
          this.fds.close();
        },
        (err) => {
          if (err.error?.errors?.email) {
            this.commonToasterService.showError(
              'Error:',
              err.error?.errors?.email[0]
            );
          }
        }
      );
  }
  public salesmanSupervisorSelected(data: any): void {
    // let formArray = this.getLobCustomerInfo;
    // let formGroup = formArray.at(index);
    // formGroup.get('salesOrganizationId').setValue(data.id);
    // this.salesOrganizationIdFormControl.setValue(data.id);
  }
  public salesManCategoryProvider(): Observable<any[]> {
    return this.apiService
      .getSalesmanSuperviourCategory()
      .pipe(map((result) => result.data));
  }
  public openSalesOrganisation(index): void {
    this.dialog
      .open(SalesmanSupervisorFormComponent, {
        width: '650px',
        position: {
          top: '0px',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        this.apiService
          .getSalesmanSuperviourCategory()
          .pipe(map((apiResult) => apiResult.data))
          .subscribe((salesOrganisations) => {
            this.salesManCatrgoryList = salesOrganisations;
          });
        if (!result) {
          return;
        }
        // let customerInfo = this.getLobCustomerInfo;
        // customerInfo.at(index).get('salesOrganizationId').setValue(result.id);
      });
  }
  open() {
    let response: any;
    let data = {
      title: 'Salesman Code',
      functionFor: 'salesman',
      code: this.nextCommingNumberofsalesmanCode,
      prefix: this.nextCommingNumberofsalesmanCodePrefix,
      key: this.nextCommingNumberofsalesmanCode.length
        ? 'autogenerate'
        : 'manual',
    };
    this.dialog
      .open(CodeDialogComponent, {
        width: '500px',
        height: 'auto',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.salesManCodeFormControl.setValue('');
          this.nextCommingNumberofsalesmanCode = '';
          this.salesManCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.salesManCodeFormControl.setValue(
            res.data.next_coming_number_salesman
          );
          this.nextCommingNumberofsalesmanCode =
            res.data.next_coming_number_salesman;
          this.nextCommingNumberofsalesmanCodePrefix = res.reqData.prefix_code;
          this.salesManCodeFormControl.disable();
        }
      });
  }

  selectionchangedSalesman() {

    // let name = this.salesmanlobFormControl.value;
    // console.log(name);
    // this.salesmanlobFormControl.setValue(name[0].id)

    // this.lob = this.salesmanlobFormControl.value;

    // this.lob1.push(this.salesmanlobFormControl.value);
    // this.lob1.splice(0,1);
    //  console.log('length ', this.lob1.length);
    // this.lob1.splice(0,1);
    // this.tempD.lob_id = this.lob1[0].id;
    // console.log('temp data.... ', this.tempD);
    // this.lob1.forEach(element => {
    //   this.tempData.lob_id = element.id
    //   this.lob1.push(this.tempData);
    // });
    // for (let index = 0; index <= this.lob1.length; index++) {
    //   // this.tempD = new SalesClass();
    //   this.tempD.lob_id = this.lob1[index];
    //   console.log('temp data.... ', this.tempD);
    //   this.lob1.push(this.tempD);
    // }
    //  console.log('length ', this.lob1.length);
    // //  this.sales
    // console.log(this.lob1);
    // // this.form.patchValue({
    // //   lobs: lobs[0].id
    // console.log(this.form);
  }

  public salesmanLobProvider(): Observable<any[]> {
    return this.apiService
      .getLobs()
      .pipe(map((result) => result.data));
  }

  public openSalesmanLob(): void {
    this.dialog
      .open(SalesmanLobComponent, {
        width: '650px',
        position: {
          top: '0px',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.salesmanlobFormControl.setValue([{ id: result.id, itemName: result.name }]);
      });
  }


}
