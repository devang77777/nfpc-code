import { CodeDialogComponent } from './../../dialogs/code-dialog/code-dialog.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { MatDialog } from '@angular/material/dialog';
import {
  PayementtermsDialogComponent,
  PaymentTerms,
} from '../../dialogs/payementterms-dialog/payementterms-dialog.component';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ChannelComponent } from '../../dialog-forms/add-channel/channel.component';
import { SalesOrganisationFormComponent } from '../../dialog-forms/sales-organisation-form/sales-organisation-form.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

interface Customertype {
  id: number;
  value: string;
}
@Component({
  selector: 'app-add-customer-form',
  templateUrl: './add-customer-form.component.html',
  styleUrls: ['./add-customer-form.component.scss'],
})
export class AddCustomerFormComponent implements OnInit {
  customer: Customertype[] = [
    { id: 1, value: 'Normal' },
    { id: 2, value: 'Head Office' },
    { id: 3, value: 'Branch' },
  ];
  public customerFormGroup: FormGroup;
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
  private customerData: any;
  public countryList: any;
  public regionList: any;
  public salesOrganisationsList: any[] = [];
  public depots: any;
  public formType: string;
  public customerID: any[] = [];
  public filterCustomerId: any[] = [];
  public shipToParty: string = '';
  public soldToParty: string = '';
  public payers: string = '';
  public bill: string = '';
  public channelData;
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

  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    private commonToasterService: CommonToasterService,
    public dialog: MatDialog
  ) {
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.buildForm();
    this.customerFormGroup.reset();
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      // this.customerFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.getCustomerCode();
        this.isEdit = false;
      }
      else {
        this.isEdit = true;
      }
    });
    this.customerCodeFormControl.disable();
    // this.subscriptions.push(this.dataEditor.newData.subscribe(result => {
    //   const data: any = result.data;
    //   setTimeout(() => {
    //     if (data && data.uuid) {
    //       this.firstnameFormControl.setValue(data.user ? data.user.firstname : '');
    //       this.lastnameFormControl.setValue(data.user ? data.user.lastname : '');
    //       this.emailFormControl.setValue(data.user ? data.user.email : '');
    //       this.phoneNumberFormControl.setValue(data.user ? data.user.mobile : '');
    //       this.passwordFormControl.setValue(data.user ? data.user.password : '');
    //       this.customerCodeFormControl.setValue(data.customer_code ? data.customer_code : '');
    //       this.customertypeFormControl.setValue(data.customer_type_id ? data.customer_type_id : '');
    //       this.officeAddressFormControl.setValue(data.customer_address_1 ? data.customer_address_1 : '');
    //       this.homeAddressFormControl.setValue(data.customer_address_2 ? data.customer_address_2 : '');
    //       this.customerCityFormControl.setValue(data.customer_city ? data.customer_city : '');
    //       this.customerStateFormControl.setValue(data.customer_state ? data.customer_state : '');
    //       this.customerZipCodeFormControl.setValue(data.customer_zipcode ? data.customer_zipcode : '');
    //       this.customerPhoneFormControl.setValue(data.customer_phone ? data.customer_phone : '');
    //       this.balanceFormControl.setValue(data.balance ? data.balance : '');
    //       this.creditLimitFormControl.setValue(data.credit_limit ? data.credit_limit : '');
    //       this.creditdaysFormControl.setValue(data.credit_days ? data.credit_days : '');
    //       this.userTypeFormControl.setValue(data.user ? data.user.usertype : '');
    //       this.parentIdFormControl.setValue(data.parentId ? data.parentId : '');
    //       this.countryIdFormControl.setValue(data.user ? data.user.country_id : '');
    //       this.roleIdFormControl.setValue(data.route_id ? data.route_id : '');
    //       this.regionIdFormControl.setValue(data.region_id ? data.region_id : '');
    //       this.salesOrganizationIdFormControl.setValue(data.sales_organisation_id ? data.sales_organisation_id : '');
    //       this.customerGroupIdFormControl.setValue(data.customer_group_id ? data.customer_group_id : '');
    //       //ship to party ,bill to party, payer,sold to party
    //       this.shipToPartyFormControl.setValue(data.ship_to_party ? data.ship_to_party.id : '')
    //       this.soldToPartyFormControl.setValue(data.sold_to_party ? data.sold_to_party.id : '')
    //       this.payerFormControl.setValue(data.payer ? data.payer.id : '');
    //       this.billToPartyFormControl.setValue(data.bill_to_payer.id ? data.bill_to_payer.id : '')
    //       this.channelFormControl.setValue(data.channel_id ? data.channel_id : '')
    //       this.subchannelFormControl.setValue(data.sub_channel_id ? data.sub_channel_id : '')
    //       this.customerData = data;
    //       this.isEdit = true;
    //     }
    //   }, 50)


    // }));
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((result) => {
        const data: any = result.data;
        this.subscriptions.push(
          this.apiService.getAllChannels().subscribe((result: any) => {
            this.channels = result.data;
            this.subscriptions.push(
              this.apiService.getAllRoute().subscribe((result: any) => {
                this.areas = result.data;
                if (data && data.uuid && this.isEdit) {
                  this.firstnameFormControl.setValue(
                    data.user ? data.user.firstname : ''
                  );
                  this.lastnameFormControl.setValue(
                    data.user ? data.user.lastname : ''
                  );
                  this.emailFormControl.setValue(
                    data.user ? data.user.email : ''
                  );
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
                  this.homeAddressFormControl.setValue(
                    data.customer_address_2 ? data.customer_address_2 : ''
                  );
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
                  this.balanceFormControl.setValue(
                    data.balance ? data.balance : ''
                  );
                  this.creditLimitFormControl.setValue(
                    data.credit_limit ? data.credit_limit : ''
                  );
                  this.creditdaysFormControl.setValue(
                    data.credit_days ? data.credit_days : ''
                  );
                  this.userTypeFormControl.setValue(
                    data.user ? data.user.usertype : ''
                  );
                  this.parentIdFormControl.setValue(
                    data.parentId ? data.parentId : ''
                  );
                  this.countryIdFormControl.setValue(
                    data.user ? data.user.country_id : ''
                  );
                  this.roleIdFormControl.setValue(
                    data.route_id ? data.route_id : ''
                  );
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
                  this.payerFormControl.setValue(
                    data.payer ? data.customer_code : ''
                  );
                  this.billToPartyFormControl.setValue(
                    data.bill_to_payer.id ? data.customer_code : ''
                  );
                  this.channelFormControl.setValue(
                    data.channel_id ? data.channel_id : ''
                  );
                  this.subchannelFormControl.setValue(
                    data.sub_channel_id ? data.sub_channel_id : ''
                  );
                  this.customerData = data;
                  this.isEdit = true;
                  this.getthevalue(true);
                }
              })
            );
          })
        );
      })
    );
    this.getCountryList();
    this.subscriptions.push(
      this.apiService.getAllRoute().subscribe((result: any) => {
        //console.log('areas : ', result.data);
        this.areas = result.data;
      })
    );
    this.subscriptions.push(
      this.apiService.getAllChannels().subscribe((result: any) => {
        this.channels = result.data;
      })
    );
    // this.subscriptions.push(this.apiService.getAllSubChannels().subscribe((result: any) => {
    //   this.subchannel = result.data;
    // }));
    this.subscriptions.push(
      this.apiService.getCustomers().subscribe((result: any) => {
        this.customerID = result.data;
        this.filterCustomerId = this.customerID;
      })
    );
    this.getPaymentOptions();

    this.filteredOptions = this.shipToPartyFormControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  buildForm() {
    this.firstnameFormControl = new FormControl('', [Validators.required]);
    this.lastnameFormControl = new FormControl('', [Validators.required]);
    this.emailFormControl = new FormControl('', [Validators.required]);
    this.phoneNumberFormControl = new FormControl('', [Validators.required]);
    this.passwordFormControl = new FormControl('');
    this.customerCodeFormControl = new FormControl('', [Validators.required]);
    this.customertypeFormControl = new FormControl('');
    this.officeAddressFormControl = new FormControl('', [Validators.required]);
    this.homeAddressFormControl = new FormControl('', [Validators.required]);
    this.customerCityFormControl = new FormControl('');
    this.customerStateFormControl = new FormControl('');
    this.customerZipCodeFormControl = new FormControl('');
    this.customerPhoneFormControl = new FormControl('');
    this.balanceFormControl = new FormControl('');
    this.creditLimitFormControl = new FormControl('');
    this.creditdaysFormControl = new FormControl('');
    this.userTypeFormControl = new FormControl('');
    this.parentIdFormControl = new FormControl('');
    this.countryIdFormControl = new FormControl('');
    this.roleIdFormControl = new FormControl('');
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

    this.customerFormGroup = new FormGroup({
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
    });
  }

  getCustomerCode() {
    let nextNumber = {
      function_for: 'customer',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofCustomerCode = res.data.number_is;
        if (this.nextCommingNumberofCustomerCode) {
          this.customerCodeFormControl.setValue(
            this.nextCommingNumberofCustomerCode
          );
          this.customerCodeFormControl.disable();
        } else if (this.nextCommingNumberofCustomerCode == null) {
          this.nextCommingNumberofCustomerCode = '';
          this.customerCodeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofCustomerCode = '';
        this.customerCodeFormControl.enable();
      }
      //console.log('Res : ', res);
    });
  }

  public close() {
    this.fds.close();
    this.customerFormGroup.reset();
    // this.isEdit = false;
    this.customerData = {};
  }

  getCountryList() {
    this.apiService.getCountriesList().subscribe((res: any) => {
      this.countryList = res.data;
    });
    this.getRegionList();
  }

  getRegionList() {
    this.apiService.getRegion().subscribe((res: any) => {
      this.regionList = res.data;
    });
    this.getSalesOrganisationList();
  }

  getSalesOrganisationList() {
    this.apiService.getAllSalesOrganisations().subscribe((res: any) => {
      this.salesOrganisationsList = res.data;
    });
  }

  public saveCustomerData(): void {
    // if (this.customerFormGroup.invalid) {
    //   //console.log(this.customerFormGroup.value);

    //   return;
    // }
    if (this.isEdit) {
      this.editCustomer();
    } else {
      this.postCustomerData();
    }
  }

  getPaymentOptions() {
    this.apiService.getPaymenterms().subscribe((res) => {
      this.paymentOptions = res.data;
    });
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
        this.subscriptions.push(
          this.apiService
            .getAllChannels()
            .pipe(map((apiResult) => apiResult.data))
            .subscribe((channels) => {
              this.channels = channels;
            })
        );

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
        this.subscriptions.push(
          this.apiService
            .getAllSalesOrganisations()
            .pipe(map((apiResult) => apiResult.data))
            .subscribe((salesOrganisations) => {
              this.salesOrganisationsList = salesOrganisations;
            })
        );

        if (!result) {
          return;
        }

        this.salesOrganizationIdFormControl.setValue(result.id);
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

  public salesOrganisationSelected(data: any): void {
    this.salesOrganizationIdFormControl.setValue(data.id);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  setCodeData(formControl: FormControl) {
    if (this.customerCodeFormControl.value && formControl.value == this.customerCodeFormControl.value) {
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
    this.setCodeData(this.payerFormControl);
    this.setCodeData(this.soldToPartyFormControl);
    this.setCodeData(this.shipToPartyFormControl);
    this.setCodeData(this.billToPartyFormControl);

    //console.log(this.customerFormGroup.value);
    this.apiService.addCustomers({
      usertype: '10',
      parent_id: '3',
      firstname: this.firstnameFormControl.value,
      lastname: this.lastnameFormControl.value,
      email: this.emailFormControl.value,
      // password: 'asdfgh',
      mobile: this.customerPhoneFormControl.value,
      country_id: this.countryIdFormControl.value,
      route_id: this.roleIdFormControl.value,
      is_approved_by_admin: '1',
      status: '1',
      region_id: this.regionIdFormControl.value,
      sales_organisation_id: this.salesOrganizationIdFormControl.value,
      customer_code: this.customerCodeFormControl.value,
      customer_type_id: this.customertypeFormControl.value,
      customer_address_1: this.officeAddressFormControl.value,
      customer_address_2: this.homeAddressFormControl.value,
      customer_city: this.customerCityFormControl.value,
      customer_state: this.customerStateFormControl.value,
      customer_zipcode: this.customerZipCodeFormControl.value,
      customer_phone: this.customerPhoneFormControl.value,
      balance: this.balanceFormControl.value,
      credit_limit: this.creditLimitFormControl.value,
      credit_days: this.creditdaysFormControl.value,
      customer_group_id: 1,
      role_id: 1,
      payer: this.payerFormControl.value,
      sold_to_party: this.soldToPartyFormControl.value,
      ship_to_party: this.shipToPartyFormControl.value,
      bill_to_payer: this.billToPartyFormControl.value,
      channel_id: this.channelFormControl.value,
      sub_channel_id: this.subchannelFormControl.value,
      customer_category_id: 1,
    })
      .subscribe((result: any) => {
        this.commonToasterService.showSuccess("Customer Saved", "Customer has been saved successfully");
        this.fds.close().then((success) => {
          window.location.reload();
        });
      },
        (error) => {
          console.error(error.errors)
        });
  }

  private editCustomer(): void {
    this.setCodeData(this.payerFormControl);
    this.setCodeData(this.soldToPartyFormControl);
    this.setCodeData(this.shipToPartyFormControl);
    this.setCodeData(this.billToPartyFormControl);

    this.apiService.editCustomers(this.customerData.uuid, {
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
      route_id: this.roleIdFormControl.value,
      region_id: this.regionIdFormControl.value,
      sales_organisation_id: this.salesOrganizationIdFormControl.value,
      customer_code: this.customerCodeFormControl.value,
      customer_type_id: this.customertypeFormControl.value,
      customer_address_1: this.officeAddressFormControl.value,
      customer_address_2: this.homeAddressFormControl.value,
      customer_city: this.customerCityFormControl.value,
      customer_state: this.customerStateFormControl.value,
      customer_zipcode: this.customerZipCodeFormControl.value,
      customer_phone: this.customerPhoneFormControl.value,
      balance: this.balanceFormControl.value,
      credit_limit: this.creditLimitFormControl.value,
      credit_days: this.creditdaysFormControl.value,
      channel_id: this.channelFormControl.value,
      payer: this.payerFormControl.value,
      sold_to_party: this.soldToPartyFormControl.value,
      ship_to_party: this.shipToPartyFormControl.value,
      bill_to_payer: this.billToPartyFormControl.value
    })
      .subscribe((result: any) => {
        this.commonToasterService.showSuccess("Customer Updated", "Customer has been updated successfully");
        this.isEdit = false;
        this.fds.close().then((success) => {
          window.location.reload();
        });
      });
  }

  openDialog() {
    this.dialog
      .open(PayementtermsDialogComponent, {
        width: '650px',
        height: '650px',
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
      code: this.customerCodeFormControl.value,
      key: this.nextCommingNumberofCustomerCode.length
        ? 'autogenerate'
        : 'manual',
    };
    //console.log('data', data);
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
          this.customerCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.customerCodeFormControl.setValue(
            res.data.next_coming_number_customer
          );
          this.nextCommingNumberofCustomerCode = res.reqData.prefix_code;
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
    this.isSelectedIndex = false;
    if (!edit) {
      this.selectedIndex.setValue(1);
    }
  }
}
