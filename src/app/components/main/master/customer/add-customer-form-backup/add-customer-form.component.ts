import { MasterService } from 'src/app/components/main/master/master.service';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  NgZone,
  Input,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import {
  PaymentTerms,
  PayementtermsDialogComponent,
} from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { ChannelComponent } from 'src/app/components/dialog-forms/add-channel/channel.component';
import { SalesOrganisationFormComponent } from 'src/app/components/dialog-forms/sales-organisation-form/sales-organisation-form.component';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { APP } from 'src/app/app.constant';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { CustomerCategoryFormComponent } from '../customer-category-form/customer-category-form.component';
import { MapsAPILoader } from '@agm/core';
import { ReturnStatement } from '@angular/compiler';

interface Customertype {
  id: number;
  value: string;
}
@Component({
  selector: 'app-add-customer-form',
  templateUrl: './add-customer-form.component.html',
  styleUrls: ['./add-customer-form.component.scss'],
})
export class AddCustomerFormComponent extends BaseComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('officeSrch') public officeSrch: ElementRef;
  @ViewChild('homeSrch') public homeSrch: ElementRef;
  domain = window.location.host.split('.')[0];
  //domain = 'merchandising';
  customer: Customertype[] = [];
  public customerFormGroup: FormGroup;
  public imageFormControl: FormControl;
  public firstnameFormControl: FormControl;
  public lastnameFormControl: FormControl;
  public emailFormControl: FormControl;
  public phoneNumberFormControl: FormControl;
  public passwordFormControl: FormControl;
  public customerCodeFormControl: FormControl;
  public customertypeFormControl: FormControl;
  public officeAddressFormControl: FormControl;
  public homeAddressFormControl: FormControl;
  public customerCityFormControl: FormControl;
  public customerStateFormControl: FormControl;
  public customerZipCodeFormControl: FormControl;
  public customerPhoneFormControl: FormControl;
  public balanceFormControl: FormControl;
  public erpCodeFormControl: FormControl;
  public merchandiserFormControl: FormControl;
  public creditLimitFormControl: FormControl;
  public creditdaysFormControl: FormControl;
  public userTypeFormControl: FormControl;
  public parentIdFormControl: FormControl;
  public countryIdFormControl: FormControl;
  public roleIdFormControl: FormControl;
  public regionIdFormControl: FormControl;
  public salesOrganizationIdFormControl: FormControl;
  public customerGroupIdFormControl: FormControl;
  public shipToPartyFormControl: FormControl;
  public soldToPartyFormControl: FormControl;
  public payerFormControl: FormControl;
  public billToPartyFormControl: FormControl;
  public salesManRouteIdFormControl: FormControl;
  public channelFormControl: FormControl;
  public subchannelFormControl: FormControl;
  public customerCategoryFormControl: FormControl;
  private customerData: any;
  public countryList: any;
  public regionList: any;
  public salesOrganisationsList: any[] = [];
  public customerCategoryList: any;
  public depots: any;
  public formType: string;
  public customerID: any[] = [];
  public filterCustomerId: any[] = [];
  public shipToParty: string = '';
  public soldToParty: string = '';
  public payers: string = '';
  public bill: string = '';
  public channelData;
  private formPopulateData: any;
  public isEdit: boolean = false;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  public selectedIndex: FormControl = new FormControl(0);
  public isSelectedIndex: boolean = true;
  areas: any;
  public channels: any[] = [];
  subchannel: any;
  paymentOptions: PaymentTerms[] = [];
  filteredOptions: Observable<string[]>;
  nextCommingNumberofCustomerCode: string = '';
  public channelSubject: BehaviorSubject<any> = new BehaviorSubject<any>('');
  isCustomField = false;
  moduleId = APP.MODULE.CUSTOMER;
  customFields: Array<any> = [];
  editData = [];
  merchandiserList = [];
  nextCommingNumberofCustomerCodePrefix: any;
  office_lat = 0.0;
  office_lang = 0.0;
  home_lat = 0.0;
  home_lang = 0.0;
  public selectedFiles = [];
  public filechoosed = false;
  selectedPaymentTerm: PaymentTerms;
  constructor(
    fds: FormDrawerService,
    private route: ActivatedRoute,
    apiService: ApiService,
    dataEditor: DataEditor,
    private commonToasterService: CommonToasterService,
    public dialog: MatDialog,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    public masterService: MasterService
  ) {
    super('Customer');
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.initOfficeSearch();
    this.initHomeSearch();
    this.buildForm();
    this.formPopulateData = this.route.snapshot.data[
      'customer_resolve'
    ].customerAdd.data;
    this.customerCategoryList = this.formPopulateData.customer_category;
    this.customer = this.formPopulateData.customer_type;
    const customercode = this.formPopulateData.code;
    this.loadFormData();
    this.fds.formType.subscribe((s) => {
      this.getCustomerDataList();
      this.getCustomFieldStatus();
      this.formType = s;
      if (this.formType == 'Add') {
        this.customerFormGroup.reset();
        this.getNextComingCode();
        // this.setCustomerCode(customercode);
        this.isEdit = false;
      } else if (this.formType == 'Edit') {
        this.customerFormGroup.reset();
        this.isEdit = true;
      }
    });
    this.customerCodeFormControl.disable();

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((result) => {
        const data: any = result.data;
        if (data && data.uuid && this.isEdit) {
          let merchandiser = [];
          data?.customer_merchandiser?.forEach(element => {
            merchandiser.push({ id: element?.salesman?.id, itemName: `${element?.salesman?.firstname} ${element?.salesman?.lastname} ` });//- ${element?.salesman?.salesman_code}
          });
          this.editData = result.data.custom_field_value_save;
          this.firstnameFormControl.setValue(
            data.user ? data.user.firstname : ''
          );
          this.imageFormControl.setValue(
            data.profile_image ? data.profile_image : ''
          );
          if (data.profile_image !== '' && data.profile_image !== null) {
            this.selectedFiles.push(data.profile_image);
          }
          this.lastnameFormControl.setValue(
            data.user ? data.user.lastname : ''
          );
          this.emailFormControl.setValue(data.user ? data.user.email : '');
          this.phoneNumberFormControl.setValue(
            data.user ? data.user.mobile : ''
          );
          this.passwordFormControl.setValue(
            data.user ? data.user.password : ''
          );
          this.customerCodeFormControl.setValue(
            data.customer_code ? data.customer_code : ''
          );
          this.customertypeFormControl.setValue(
            data.customer_type_id ? data.customer_type_id : ''
          );
          this.officeAddressFormControl.setValue(
            data.customer_address_1 ? data.customer_address_1 : ''
          );
          this.office_lat = data.customer_address_1_lat
            ? data.customer_address_1_lat
            : 0.0;
          this.office_lang = data.customer_address_1_lang
            ? data.customer_address_1_lang
            : 0.0;
          this.homeAddressFormControl.setValue(
            data.customer_address_2 ? data.customer_address_2 : ''
          );
          this.home_lat = data.customer_address_2_lat
            ? data.customer_address_2_lat
            : 0.0;
          this.home_lang = data.customer_address_2_lang
            ? data.customer_address_2_lang
            : 0.0;
          this.customerCityFormControl.setValue(
            data.customer_city ? data.customer_city : ''
          );
          this.customerStateFormControl.setValue(
            data.customer_state ? data.customer_state : ''
          );
          this.customerZipCodeFormControl.setValue(
            data.customer_zipcode ? data.customer_zipcode : ''
          );
          this.customerPhoneFormControl.setValue(
            data.customer_phone ? data.customer_phone : ''
          );
          this.balanceFormControl.setValue(data.balance ? data.balance : '');
          this.merchandiserFormControl.setValue(
            merchandiser
          );
          this.creditLimitFormControl.setValue(
            data.credit_limit ? data.credit_limit : ''
          );
          this.creditdaysFormControl.setValue(
            data.payment_term_id ? data.payment_term_id : ''
          );
          //console.log(this.creditdaysFormControl.value);
          this.userTypeFormControl.setValue(
            data.user ? data.user.usertype : ''
          );
          this.parentIdFormControl.setValue(data.parentId ? data.parentId : '');
          this.countryIdFormControl.setValue(
            data.user ? data.user.country_id : ''
          );
          this.roleIdFormControl.setValue(data.route_id ? data.route_id : '');
          this.regionIdFormControl.setValue(
            data.region_id ? data.region_id : ''
          );
          this.salesOrganizationIdFormControl.setValue(
            data.sales_organisation_id ? data.sales_organisation_id : ''
          );
          this.customerGroupIdFormControl.setValue(
            data.customer_group_id ? data.customer_group_id : ''
          );
          //ship to party ,bill to party, payer,sold to party
          this.shipToPartyFormControl.setValue(
            data.ship_to_party ? data.customer_code : ''
          );
          this.soldToPartyFormControl.setValue(
            data.sold_to_party ? data.customer_code : ''
          );
          this.payerFormControl.setValue(data.payer ? data.customer_code : '');
          this.billToPartyFormControl.setValue(
            data.bill_to_payer?.id ? data.customer_code : ''
          );
          this.channelFormControl.setValue(
            data.channel_id ? data.channel_id : ''
          );
          this.subchannelFormControl.setValue(
            data.sub_channel_id ? data.sub_channel_id : ''
          );
          this.customerCategoryFormControl.setValue(
            data.customer_category_id ? data.customer_category_id : ''
          );
          this.customerData = data;
          this.isEdit = true;
          this.getthevalue(true);
        }
      })
    );

    this.filteredOptions = this.shipToPartyFormControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  getNextComingCode() {
    let nextNumber = {
      function_for: 'customer',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.setCustomerCode(res.data);
      }
    });
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

  initOfficeSearch() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(
        this.officeSrch.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          this.officeAddressFormControl.setValue(
            this.officeSrch.nativeElement.value
          );
          this.office_lat = place.geometry.location.lat();
          this.office_lang = place.geometry.location.lng();
        });
      });
    });
  }

  initHomeSearch() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(
        this.homeSrch.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          this.homeAddressFormControl.setValue(
            this.homeSrch.nativeElement.value
          );
          this.home_lat = place.geometry.location.lat();
          this.home_lang = place.geometry.location.lng();
        });
      });
    });
  }

  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }
  buildForm() {
    this.imageFormControl = new FormControl('');
    this.firstnameFormControl = new FormControl('', [Validators.required]);
    this.lastnameFormControl = new FormControl('', [Validators.required]);
    this.emailFormControl = new FormControl('', [Validators.required]);
    this.phoneNumberFormControl = new FormControl('');
    this.passwordFormControl = new FormControl('');
    this.customerCodeFormControl = new FormControl('', [Validators.required]);
    this.customertypeFormControl = new FormControl('');
    this.officeAddressFormControl = new FormControl('', [Validators.required]);
    this.homeAddressFormControl = new FormControl('', [Validators.required]);
    this.customerCityFormControl = new FormControl('');
    this.customerStateFormControl = new FormControl('');
    this.customerZipCodeFormControl = new FormControl('');
    this.customerPhoneFormControl = new FormControl('', [Validators.required]);
    this.balanceFormControl = new FormControl('');
    this.erpCodeFormControl = new FormControl('');
    this.merchandiserFormControl = new FormControl('');
    this.creditLimitFormControl = new FormControl('');
    this.creditdaysFormControl = new FormControl('');
    this.userTypeFormControl = new FormControl('');
    this.parentIdFormControl = new FormControl('');
    this.countryIdFormControl = new FormControl('');
    if (this.domain == 'vansales' || this.domain == 'presales') {
      this.roleIdFormControl = new FormControl('', [Validators.required]);
    } else {
      this.roleIdFormControl = new FormControl('');
    }
    this.regionIdFormControl = new FormControl('');
    this.salesOrganizationIdFormControl = new FormControl('', [
      Validators.required,
    ]);
    this.customerGroupIdFormControl = new FormControl('');
    this.shipToPartyFormControl = new FormControl('', [Validators.required]);
    this.soldToPartyFormControl = new FormControl('', [Validators.required]);
    this.payerFormControl = new FormControl('', [Validators.required]);
    this.billToPartyFormControl = new FormControl('', [Validators.required]);
    this.channelFormControl = new FormControl('', [Validators.required]);
    this.subchannelFormControl = new FormControl('');
    this.customerCategoryFormControl = new FormControl('', [
      Validators.required,
    ]);

    this.customerFormGroup = new FormGroup({
      image: this.imageFormControl,
      firstname: this.firstnameFormControl,
      lastname: this.lastnameFormControl,
      email: this.emailFormControl,
      phoneNumber: this.phoneNumberFormControl,
      password: this.passwordFormControl,
      customerCode: this.customerCodeFormControl,
      customertype: this.customertypeFormControl,
      officeAddress: this.officeAddressFormControl,
      homeAddress: this.homeAddressFormControl,
      customerCity: this.customerCityFormControl,
      customerState: this.customerStateFormControl,
      customerZipCode: this.customerZipCodeFormControl,
      customerPhone: this.customerPhoneFormControl,
      balance: this.balanceFormControl,
      merchandiserId: this.merchandiserFormControl,
      creditLimit: this.creditLimitFormControl,
      creditdays: this.creditdaysFormControl,
      userType: this.userTypeFormControl,
      parentId: this.parentIdFormControl,
      countryId: this.countryIdFormControl,
      roleId: this.roleIdFormControl,
      regionId: this.regionIdFormControl,
      salesOrganizationId: this.salesOrganizationIdFormControl,
      customerGroupId: this.customerGroupIdFormControl,
      shiptoParty: this.shipToPartyFormControl,
      soldtoParty: this.soldToPartyFormControl,
      payer: this.payerFormControl,
      billtoparty: this.billToPartyFormControl,
      channel: this.channelFormControl,
      subchnel: this.subchannelFormControl,
      customerCategory: this.customerCategoryFormControl,
    });
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
  loadFormData() {
    const formData = this.formPopulateData;
    //console.log(formData);
    this.areas = formData.route;
    this.channels = formData.channel;
    this.salesOrganisationsList = formData.sales_organisation;
    this.countryList = formData.country_master;
    //console.log(this.countryList);
    this.merchandiserList = formData.merchandiser.map(item => {
      if (item.user !== null) {
        item['user']['lastname'] = [item.user?.lastname, item.salesman_code].join(" - ")
        return item;
      }
      return item;
    });
    this.regionList = formData.region;
    this.paymentOptions = formData.payment_term;
    this.customerCategoryList = formData.customer_category;
    // this.customerID = this.route.snapshot.data[
    //   'customer_resolve'
    // ].customerList.data;
  }

  getCustomerDataList() {
    return this.masterService.customerDetailListTable({ page: 1, page_size: 10 }).subscribe((result) => {
      this.customerID = result.data;
      this.filterCustomerId = this.customerID;
    });
  }

  setCustomerCode(code: any) {
    if (code?.number_is !== null) {
      this.nextCommingNumberofCustomerCode = code.number_is;
      this.nextCommingNumberofCustomerCodePrefix = code.prefix_is;
      this.customerCodeFormControl.setValue(
        this.nextCommingNumberofCustomerCode
      );
      this.customerCodeFormControl.disable();
    } else {
      this.nextCommingNumberofCustomerCode = '';
      this.customerCodeFormControl.enable();
    }
  }

  public close() {
    this.fds.close();
    // this.customerFormGroup.reset();
    this.filechoosed = false;
    this.selectedFiles = [];
    this.nextCommingNumberofCustomerCode = '';
    this.customerData = {};
  }

  public saveCustomerData(): void {
    //console.log(this.customerFormGroup, this.customerFormGroup.invalid);
    if (this.customerFormGroup.invalid) {
      return;
    }
    if (this.isEdit) {
      this.editCustomer();
    } else {
      this.postCustomerData();
    }
  }

  public openChannel(): void {
    this.dialog
      .open(ChannelComponent, {
        width: '650px',
        position: {
          top: '0px',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        this.apiService
          .getAllChannels()
          .pipe(map((apiResult) => apiResult.data))
          .subscribe((channels) => {
            this.channels = channels;
          });
        if (!result) {
          return;
        }
        this.channelFormControl.setValue(result.id);
      });
  }

  public openSalesOrganisation(): void {
    this.dialog
      .open(SalesOrganisationFormComponent, {
        width: '650px',
        position: {
          top: '0px',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        this.apiService
          .getAllSalesOrganisations()
          .pipe(map((apiResult) => apiResult.data))
          .subscribe((salesOrganisations) => {
            this.salesOrganisationsList = salesOrganisations;
          });
        if (!result) {
          return;
        }
        this.salesOrganizationIdFormControl.setValue(result.id);
      });
  }
  public openCustomerCategory(): void {
    this.dialog
      .open(CustomerCategoryFormComponent, {
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
        this.customerCategoryFormControl.setValue(result.id);
      });
  }
  public channelProvider(): Observable<any[]> {
    return this.apiService.getAllChannels().pipe(map((result) => result.data));
  }

  public channelSelected(data: any): void {
    this.channelFormControl.setValue(data.id);
  }
  public salesOrganisationProvider(): Observable<any[]> {
    return this.apiService
      .getAllSalesOrganisations()
      .pipe(map((result) => result.data));
  }
  public customerCategoryProvider(): Observable<any[]> {
    return this.apiService
      .getAllCustomerCategory()
      .pipe(map((result) => result.data));
  }

  public salesOrganisationSelected(data: any): void {
    this.salesOrganizationIdFormControl.setValue(data.id);
  }
  public customerCategorySelected(data: any): void {
    this.customerCategoryFormControl.setValue(data.id);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  setCodeData(formControl: FormControl) {
    // //console.log(formControl.value, this.customerCodeFormControl.value)
    if (
      this.customerCodeFormControl.value &&
      formControl.value == this.customerCodeFormControl.value
    ) {
      if (this.nextCommingNumberofCustomerCode !== '') {
        formControl.setValue(this.nextCommingNumberofCustomerCode);
      } else if (this.nextCommingNumberofCustomerCode == '') {
        if (this.customerCodeFormControl.value) {
          formControl.setValue(this.customerCodeFormControl.value);
        }
      }
    }
  }

  private postCustomerData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;

    this.setCodeData(this.payerFormControl);
    this.setCodeData(this.soldToPartyFormControl);
    this.setCodeData(this.shipToPartyFormControl);
    this.setCodeData(this.billToPartyFormControl);

    // if (
    //   this.creditLimitFormControl.value &&
    //   !this.creditdaysFormControl.value
    // ) {
    //   this.commonToasterService.showSuccess(
    //     'Validation',
    //     'Credit days field is required.'
    //   );
    //   return;
    // } else if (
    //   !this.creditLimitFormControl.value &&
    //   this.creditdaysFormControl.value
    // ) {
    //   this.commonToasterService.showSuccess(
    //     'Validation',
    //     'Credit limit field is required.'
    //   );
    //   return;
    // }

    //console.log(this.customerFormGroup.value);
    let merchandisers = [];
    let merch = this.merchandiserFormControl.value;
    if (merch && merch.length > 0) {
      merch.forEach((el) => {
        merchandisers.push(el.id);
      });
    }

    this.apiService
      .addCustomers({
        usertype: '10',
        parent_id: '3',
        firstname: this.firstnameFormControl.value,
        lastname: this.lastnameFormControl.value,
        email: this.emailFormControl.value,
        // password: 'asdfgh',
        mobile: this.customerPhoneFormControl.value,
        country_id: this.countryIdFormControl.value,
        route_id: this.roleIdFormControl.value || 0,
        is_approved_by_admin: '1',
        status: '1',
        region_id: this.regionIdFormControl.value,
        sales_organisation_id: this.salesOrganizationIdFormControl.value,
        customer_code: this.customerCodeFormControl.value,
        customer_type_id: this.customertypeFormControl.value,
        customer_address_1: this.officeAddressFormControl.value,
        customer_address_1_lat: this.office_lat,
        customer_address_1_lang: this.office_lang,
        customer_address_2: this.homeAddressFormControl.value,
        customer_address_2_lat: this.home_lat,
        customer_address_2_lang: this.home_lang,
        customer_city: this.customerCityFormControl.value,
        customer_state: this.customerStateFormControl.value,
        customer_zipcode: this.customerZipCodeFormControl.value,
        customer_phone: this.customerPhoneFormControl.value,
        balance: this.balanceFormControl.value || 0,
        merchandiser_id: merchandisers,
        credit_limit: this.creditLimitFormControl.value,
        credit_days: this.selectedPaymentTerm?.number_of_days,
        customer_group_id: 1,
        role_id: 1,
        payer: this.payerFormControl.value,
        sold_to_party: this.soldToPartyFormControl.value,
        ship_to_party: this.shipToPartyFormControl.value,
        bill_to_payer: this.billToPartyFormControl.value,
        channel_id: this.channelFormControl.value,
        sub_channel_id: this.subchannelFormControl.value,
        erp_code: this.erpCodeFormControl.value,
        customer_category_id: this.customerCategoryFormControl.value,
        payment_term_id: this.creditdaysFormControl.value || null,
        customer_profile:
          this.filechoosed == true ? this.selectedFiles[0] : undefined,
        modules,
      })
      .subscribe(
        (result: any) => {
          this.commonToasterService.showSuccess(
            'Customer Saved',
            'Customer has been saved successfully'
          );
          let data = result.data;
          data.edit = false;
          this.updateTableData.emit(data);
          this.close();
        },
        (error) => {
          console.error(error.errors);
        }
      );
  }

  private editCustomer(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;


    this.setCodeData(this.payerFormControl);
    this.setCodeData(this.soldToPartyFormControl);
    this.setCodeData(this.shipToPartyFormControl);
    this.setCodeData(this.billToPartyFormControl);
    let merchandisers = [];
    let merch = this.merchandiserFormControl.value;
    merch.forEach((el) => {
      merchandisers.push(el.id);
    });
    this.apiService
      .editCustomers(this.customerData.uuid, {
        usertype: '10',
        parent_id: '3',
        firstname: this.firstnameFormControl.value,
        lastname: this.lastnameFormControl.value,
        email: this.emailFormControl.value,
        // password: this.passwordFormControl.value,
        mobile: this.customerPhoneFormControl.value,
        country_id: this.countryIdFormControl.value,
        is_approved_by_admin: '1',
        status: '1',
        route_id: this.roleIdFormControl.value || 0,
        region_id: this.regionIdFormControl.value,
        sales_organisation_id: this.salesOrganizationIdFormControl.value,
        customer_code: this.customerCodeFormControl.value,
        customer_type_id: this.customertypeFormControl.value,
        customer_address_1: this.officeAddressFormControl.value,
        customer_address_1_lat: this.office_lat,
        customer_address_1_lang: this.office_lang,
        customer_address_2: this.homeAddressFormControl.value,
        customer_address_2_lat: this.home_lat,
        customer_address_2_lang: this.home_lang,
        customer_city: this.customerCityFormControl.value,
        customer_state: this.customerStateFormControl.value,
        customer_zipcode: this.customerZipCodeFormControl.value,
        customer_phone: this.customerPhoneFormControl.value,
        erp_code: this.erpCodeFormControl.value,
        balance: this.balanceFormControl.value || 0,
        merchandiser_id: merchandisers,
        credit_limit: this.creditLimitFormControl.value,
        credit_days: this.selectedPaymentTerm?.number_of_days,
        channel_id: this.channelFormControl.value,
        payer: this.payerFormControl.value,
        sold_to_party: this.soldToPartyFormControl.value,
        ship_to_party: this.shipToPartyFormControl.value,
        bill_to_payer: this.billToPartyFormControl.value,
        sub_channel_id: this.subchannelFormControl.value,
        payment_term_id: this.creditdaysFormControl.value || null,
        customer_category_id: this.customerCategoryFormControl.value,
        customer_profile:
          this.filechoosed == true ? this.selectedFiles[0] : undefined,
        modules,
      })
      .subscribe((result: any) => {
        this.commonToasterService.showSuccess(
          'Customer Updated',
          'Customer has been updated successfully'
        );
        this.isEdit = false;
        let data = result.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.close();
      });
  }

  openDialog() {
    this.dialog
      .open(PayementtermsDialogComponent, {
        width: '650px',
        height: 'auto',
        data: this.paymentOptions,
      })
      .componentInstance.addPaymentTerms.subscribe((res: any) => {
        this.paymentOptions = res;
      });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.customerID.filter((customer) =>
      customer.toLowerCase().includes(filterValue)
    );
  }

  getSearchData() {
    let store = this.shipToParty;
    let store1 = this.soldToParty;
    let store2 = this.payers;
    let store3 = this.bill;
    //console.log(this.customerID);
    if (store.length && store1.length && store2.length && store3.length) {
      this.filterCustomerId = [];
      this.filterCustomerId = this.customerID.filter((item, i) => {
        return store.toLowerCase().includes(item.customer_code.toLowerCase());
      });
    }
    if (store1.length) {
      this.filterCustomerId = [];
      this.filterCustomerId = this.customerID.filter((item, i) => {
        return store1.toLowerCase().includes(item.customer_code.toLowerCase());
      });
    }
    if (store2.length) {
      this.filterCustomerId = [];
      this.filterCustomerId = this.customerID.filter((item, i) => {
        return store2.toLowerCase().includes(item.customer_code.toLowerCase());
      });
    }
    if (store3.length) {
      this.filterCustomerId = [];
      this.filterCustomerId = this.customerID.filter((item, i) => {
        return store3.toLowerCase().includes(item.customer_code.toLowerCase());
      });
    }
  }

  open() {
    let response: any;
    let data = {
      title: 'Customer Code',
      functionFor: 'customer',
      code: this.nextCommingNumberofCustomerCode,
      prefix: this.nextCommingNumberofCustomerCodePrefix,
      key: this.nextCommingNumberofCustomerCode.length
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
          this.customerCodeFormControl.setValue('');
          this.nextCommingNumberofCustomerCode = '';
          this.customerCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.customerCodeFormControl.setValue(
            res.data.next_coming_number_customer
          );
          this.nextCommingNumberofCustomerCode =
            res.data.next_coming_number_customer;
          this.nextCommingNumberofCustomerCodePrefix = res.reqData.prefix_code;
          this.customerCodeFormControl.disable();
        }
      });
  }

  getthevalue(edit?: boolean) {
    if (
      !this.creditLimitFormControl.value ||
      !this.creditdaysFormControl.value
    ) {
      return;
    }
    //console.log(this.creditdaysFormControl.value);
    this.selectedPaymentTerm = this.paymentOptions.filter(
      (item) => item.id == this.creditdaysFormControl.value
    )[0];
    //console.log(this.selectedPaymentTerm);
    this.isSelectedIndex = false;
    if (!edit) {
      this.selectedIndex.setValue(1);
    }
  }
}
