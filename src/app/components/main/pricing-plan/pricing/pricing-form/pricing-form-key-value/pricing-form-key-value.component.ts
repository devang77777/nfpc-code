import { filter } from 'rxjs/operators';
import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ApiKeySelectionService } from 'src/app/services/api-key-selection.service';
import { Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-pricing-form-key-value',
  templateUrl: './pricing-form-key-value.component.html',
  styleUrls: ['./pricing-form-key-value.component.scss'],
})
export class PricingFormKeyValueComponent
  implements OnInit, OnChanges, OnDestroy {
  @Input() public overviewFormGroup: FormGroup;
  @Input() public selectedIndex: number;
  @Input() public editData: any;
  @Input() public showFormError: boolean;

  countries = [];
  regions = [];
  areas = [];
  routes = [];
  salesOrganisations = [];
  channels = [];
  customerCategories = [];
  customers = [];
  customersVal = [];
  customersCopy: any[] = [];
  majorCategories = [];
  itemGroups = [];
  items = [];
  itemsVal = [];
  flatAreaData = [];
  flatChannelData = [];
  flatSalesOrganisationData = [];
  flatCategoryData = [];
  keySequence: string[] = [];

  valuesArray: any[] = [];

  selectedCountries: FormControl;
  selectedRegions: FormControl;
  selectedAreas: FormControl;
  selectedRoutes: FormControl;
  selectedSalesOrganisations: FormControl;
  selectedChannels: FormControl;
  selectedCustomerCategories: FormControl;
  selectedCustomers: FormControl;
  selectedCategories: FormControl;
  selectedItemGroups: FormControl;
  selectedItems: FormControl;

  public keySequenceFromControl: FormControl;

  public countriesFromControl: FormControl;
  public regionsFormControl: FormControl;
  public areasFromControl: FormControl;
  public routeFormControl: FormControl;

  public salesOrganisationFormControl: FormControl;
  public channelFormControl: FormControl;
  public customerCategoryFormControl: FormControl;
  public customerFormControl: FormControl;

  public majorCategoryFormControl: FormControl;
  public itemGroupFormControl: FormControl;
  public itemsFormControl: FormControl;

  public lookup$: Subject<any> = new Subject();
  public page = 1;
  public isLoading: boolean;
  public total_pages = 0;

  private apiService: ApiService;
  private ks: ApiKeySelectionService;
  private router: Router;
  private subscriptions: Subscription[] = [];

  constructor(
    apiService: ApiService,
    ks: ApiKeySelectionService,
    router: Router
  ) {
    Object.assign(this, { apiService, ks, router });
  }

  ngOnInit(): void {
    let location = [];
    let customer = [];
    let item = [];
    this.subscriptions.push(
      this.overviewFormGroup
        .get('keyCombination')
        .get('locations')
        .valueChanges.subscribe((x) => {
          location = Object.keys(x).filter((id) => {
            return x[id];
          });
        })
    );
    this.subscriptions.push(
      this.overviewFormGroup
        .get('keyCombination')
        .get('customers')
        .valueChanges.subscribe((x) => {
          customer = Object.keys(x).filter((id) => {
            return x[id];
          });
        })
    );
    this.subscriptions.push(
      this.overviewFormGroup
        .get('keyCombination')
        .get('items')
        .valueChanges.subscribe((x) => {
          item = Object.keys(x).filter((id) => {
            return x[id];
          });
        })
    );
    this.subscriptions.push(
      this.overviewFormGroup
        .get('keyCombination')
        .valueChanges.subscribe((x) => {
          //console.log([...location, ...customer, ...item]);
          this.keySequence = [...location, ...customer, ...item];
          this.updateValues(this.keySequence[0]);
          this.keySequenceFromControl.setValue(this.keySequence);
        })
    );
    this.subscriptions.push(
      this.itemsControl.valueChanges.subscribe((res) => {
        this.selectedItems.setValue([]);
        this.selectedCategories.setValue([]);
        this.selectedItemGroups.setValue([]);
        this.majorCategoryFormControl.setValue([]);
        this.itemGroupFormControl.setValue([]);
        this.itemsFormControl.setValue([]);
      })
    );
    this.subscriptions.push(
      this.locationsControl.valueChanges.subscribe((res) => {
        this.selectedCountries.setValue([]);
        this.selectedRegions.setValue([]);
        this.selectedAreas.setValue([]);
        this.selectedRoutes.setValue([]);
        this.countriesFromControl.setValue([]);
        this.regionsFormControl.setValue([]);
        this.areasFromControl.setValue([]);
        this.routeFormControl.setValue([]);
      })
    );
    this.subscriptions.push(
      this.customerControl.valueChanges.subscribe((res) => {
        this.selectedSalesOrganisations.setValue([]);
        this.selectedChannels.setValue([]);
        this.selectedCustomerCategories.setValue([]);
        this.selectedCustomers.setValue([]);
        this.salesOrganisationFormControl.setValue([]);
        this.channelFormControl.setValue([]);
        this.customerCategoryFormControl.setValue([]);
        this.customerFormControl.setValue([]);
      })
    );
    this.updateCustomers();
    this.updateItems();

    this.keySequenceFromControl = new FormControl();

    this.countriesFromControl = new FormControl([]);
    this.regionsFormControl = new FormControl([]);
    this.areasFromControl = new FormControl([]);
    this.routeFormControl = new FormControl([]);
    this.salesOrganisationFormControl = new FormControl([]);
    this.channelFormControl = new FormControl([]);
    this.customerCategoryFormControl = new FormControl([]);
    this.customerFormControl = new FormControl([]);
    this.majorCategoryFormControl = new FormControl([]);
    this.itemGroupFormControl = new FormControl([]);
    this.itemsFormControl = new FormControl([]);
    this.selectedCountries = new FormControl([]);
    this.selectedRegions = new FormControl([]);
    this.selectedRoutes = new FormControl([]);
    this.selectedAreas = new FormControl([]);
    this.selectedSalesOrganisations = new FormControl([]);
    this.selectedChannels = new FormControl([])
    this.selectedCustomerCategories = new FormControl([]);
    this.selectedCustomers = new FormControl([]);
    this.selectedCategories = new FormControl([]);
    this.selectedItemGroups = new FormControl([]);
    this.selectedItems = new FormControl([]);
    this.buildForm();
  }

  buildForm() {
    this.overviewFormGroup.addControl(
      'keySequence',
      this.keySequenceFromControl
    );
    this.overviewFormGroup.addControl('country_ids', this.countriesFromControl);
    this.overviewFormGroup.addControl('region_ids', this.regionsFormControl);
    this.overviewFormGroup.addControl('area_ids', this.areasFromControl);
    this.overviewFormGroup.addControl('route_ids', this.routeFormControl);
    this.overviewFormGroup.addControl(
      'sales_organisation_ids',
      this.salesOrganisationFormControl
    );
    this.overviewFormGroup.addControl('channel_ids', this.channelFormControl);
    this.overviewFormGroup.addControl(
      'customer_category_ids',
      this.customerCategoryFormControl
    );
    this.overviewFormGroup.addControl('customer_ids', this.customerFormControl);
    this.overviewFormGroup.addControl(
      'item_major_category_ids',
      this.majorCategoryFormControl
    );
    this.overviewFormGroup.addControl(
      'item_group_ids',
      this.itemGroupFormControl
    );
    this.overviewFormGroup.addControl('item_ids', this.itemsFormControl);
  }

  // public ngOnChanges(): void {
  //   if (this.editData) {
  //     this.updateCustomers();
  //     this.updateItems();
  //     let keySequence: string[] = this.overviewFormGroup.get('keySequence')
  //       .value;
  //     //console.log(keySequence);
  //     keySequence.forEach((key) => {
  //       if (key == 'country') {
  //         let countries: any[] = this.editData.p_d_p_countries;
  //         this.selectedCountries = [];
  //         countries.forEach((country) => {
  //           this.selectedCountries.push(country.country.id);
  //         });
  //         this.onCountryChange(event);
  //       }
  //       if (key == 'regions') {
  //         let regions: any[] = this.editData.p_d_p_regions;
  //         this.selectedRegions = [];
  //         regions.forEach((region) => {
  //           this.selectedRegions.push(region.region.id);
  //         });
  //         this.onRegionChange(event);
  //       }
  //       if (key == 'area') {
  //         let areas: any[] = this.editData.p_d_p_areas;
  //         this.selectedAreas = [];
  //         areas.forEach((area) => {
  //           this.selectedAreas.push(area.area.id);
  //         });
  //         if (keySequence.includes('route')) {
  //           this.subscriptions.push(
  //             // this.apiService.getAllRoute().subscribe((res) => {
  //             //   this.valuesArray[this.keySequence.indexOf('area')] = res.data;
  //             //   this.updateData();
  //             // })
  //             // this.subscriptions.push(
  //             this.apiService.getMasterDataLists().subscribe((result: any) => {
  //               this.valuesArray[this.keySequence.indexOf('area')] = result.data.route;
  //               this.updateData();
  //             })
  //             // );
  //           );
  //         }
  //         this.areasFromControl.setValue(this.selectedAreas);
  //       }
  //       if (key == 'route') {
  //         let routes: any[] = this.editData.p_d_p_routes;
  //         this.selectedRoutes = [];
  //         routes.forEach((route) => {
  //           this.selectedRoutes.push(route.route.id);
  //         });
  //         this.routeFormControl.setValue(this.selectedRoutes);
  //       }
  //       if (key == 'salesOrganisation') {
  //         let salesOrgs: any[] = this.editData.p_d_p_sales_organisations;
  //         this.selectedSalesOrganisations = [];
  //         salesOrgs.forEach((salesOrg) => {
  //           this.selectedSalesOrganisations.push(
  //             salesOrg.sales_organisation.id
  //           );
  //         });
  //         this.salesOrganisationFormControl.setValue(
  //           this.selectedSalesOrganisations
  //         );
  //       }
  //       if (key == 'channel') {
  //         let channels: any[] = this.editData.p_d_p_channels;
  //         this.selectedChannels = [];
  //         channels.forEach((channel) => {
  //           this.selectedChannels.push(channel.channel.id);
  //         });
  //         this.channelFormControl.setValue(this.selectedChannels);
  //       }
  //       if (key == 'customerCategory') {
  //         let customerCategories: any[] = this.editData
  //           .p_d_p_customer_categories;
  //         this.selectedCustomerCategories = [];
  //         customerCategories.forEach((customerCategory) => {
  //           this.selectedCustomerCategories.push(
  //             customerCategory.customer_category.id
  //           );
  //         });
  //         this.customerCategoryFormControl.setValue(
  //           this.selectedCustomerCategories
  //         );
  //       }
  //       if (key == 'customer') {
  //         let customers: any[] = this.editData.p_d_p_customers;
  //         this.selectedCustomers = [];
  //         customers.forEach((customer) => {
  //           this.selectedCustomers.push(customer.customer_id);
  //         });
  //         this.customerFormControl.setValue(this.selectedCustomers);
  //       }
  //       if (key == 'majorCategory') {
  //         let categories: any[] = this.editData.p_d_p_item_major_categories;
  //         this.selectedCategories = [];
  //         categories.forEach((category) => {
  //           this.selectedCategories.push(category.item_major_category.id);
  //         });
  //         this.majorCategoryFormControl.setValue(this.selectedCategories);
  //       }
  //       if (key == 'itemGroup') {
  //         let itemGroups: any[] = this.editData.p_d_p_item_groups;
  //         this.selectedItemGroups = [];
  //         itemGroups.forEach((itemGroup) => {
  //           this.selectedItemGroups.push(itemGroup.item_group.id);
  //         });
  //         this.itemGroupFormControl.setValue(this.selectedItemGroups);
  //       }
  //       if (key == 'item') {
  //         let items: any[] = this.editData.p_d_p_items;
  //         this.selectedItems = [];
  //         items.forEach((item) => {
  //           if (!this.selectedItems.includes(item.item.id)) {
  //             this.selectedItems.push(item.item.id);
  //           }
  //         });
  //         this.itemsFormControl.setValue(this.selectedItems);
  //       }
  //     });
  //   } else {
  //   }
  // }

  public ngOnChanges(): void {
    if (this.editData) {
      let keySequence: string[] = this.overviewFormGroup.get('keySequence')
        .value;
      //console.log(keySequence);
      keySequence.forEach((key) => {
        if (key == 'country') {
          let countries: any[] = this.editData.p_d_p_countries;
          let selectCountry = [];
          countries.forEach((country) => {
            selectCountry.push({
              id: country.country_id,
              itemName: country.country.name
            })
          });
          setTimeout(() => {
            this.selectedCountries.setValue(selectCountry)
            this.onCountryChange(event);
          }, 500);

        }
        if (key == 'regions') {
          let regions: any[] = this.editData.p_d_p_regions;
          let selectedRegion = [];
          regions.forEach((region) => {
            selectedRegion.push({
              id: region.region.id,
              itemName: region.region?.region_name
            })

          });
          setTimeout(() => {
            this.selectedRegions.setValue(selectedRegion)
            this.onRegionChange(event);
          }, 500);

        }
        if (key == 'area') {
          let areas: any[] = this.editData.p_d_p_areas;
          let selectAreas = [];
          areas.forEach((area) => {
            selectAreas.push({
              id: area.area.id,
              itemName: area.area?.area_name
            })

          });
          setTimeout(() => {
            this.selectedAreas.setValue(selectAreas)
            this.onAreaChange(event);
          }, 500);
          if (keySequence.includes('route')) {
            // this.subscriptions.push(
            //   this.apiService.getAllRoute().subscribe((res) => {
            //     this.valuesArray[this.keySequence.indexOf('area')] = res.data;
            //     this.updateData();
            //   })
            // );
            this.subscriptions.push(
              this.apiService.getMasterDataLists().subscribe((result: any) => {
                this.valuesArray[this.keySequence.indexOf('area')] = result.data.route;
                this.updateData();
              }));
          }
        }
        if (key == 'route') {
          let routes: any[] = this.editData.p_d_p_routes;
          let selectRoute = [];
          routes.forEach((route) => {
            selectRoute.push({
              id: route.route.id,
              itemName: route.route?.route_name
            })
          });
          setTimeout(() => {
            this.selectedRoutes.setValue(selectRoute);
            this.onRouteChange(event);
          }, 500);

        }
        if (key == 'salesOrganisation') {
          let salesOrgs: any[] = this.editData.p_d_p_sales_organisations;
          let selectSalesOrganisation = [];
          salesOrgs.forEach((salesOrg) => {
            selectSalesOrganisation.push({
              id: salesOrg.sales_organisation_id,
              itemName: salesOrg.sales_organisation?.name
            })
          });
          setTimeout(() => {
            this.selectedSalesOrganisations.setValue(selectSalesOrganisation)
            this.onSalesOrganisationChange()
          }, 500);

        }
        if (key == 'channel') {
          let channels: any[] = this.editData.p_d_p_channels;
          let selectChannel = [];
          channels.forEach((channel) => {
            selectChannel.push({
              id: channel.channel_id,
              itemName: channel.channel?.name
            })
          });
          setTimeout(() => {
            this.selectedChannels.setValue(selectChannel)
            this.onChannelChange()
          }, 500);

        }
        if (key == 'customerCategory') {
          let customerCategories: any[] = this.editData
            .p_d_p_customer_categories;
          let selectCustomerCategory = []
          customerCategories.forEach((customerCategory) => {
            selectCustomerCategory.push({
              id: customerCategory.customer_category?.id,
              itemName: customerCategory.customer_category?.customer_category_name
            })
          });
          setTimeout(() => {
            this.selectedCustomerCategories.setValue(selectCustomerCategory)
            this.onCustomerCategoryChange()
          }, 500);

        }
        if (key == 'customer') {
          let customers: any[] = this.editData.p_d_p_customers;
          let selectCustomer = [];
          customers.forEach((customer) => {
            selectCustomer.push({
              id: customer.customer_id,
              itemName: customer.customer_info?.user?.firstname + ' ' + customer.customer_info?.user?.lastname
            })
          });
          setTimeout(() => {
            this.selectedCustomers.setValue(selectCustomer);
            this.onCustomerChange();
          }, 500);

        }
        if (key == 'majorCategory') {
          let categories: any[] = this.editData.p_d_p_item_major_categories;
          let selectCategories = [];
          categories.forEach((category) => {
            selectCategories.push({
              id: category.item_major_category.id,
              itemName: category.item_major_category.name
            })

          });
          setTimeout(() => {
            this.selectedCategories.setValue(selectCategories)
            this.onCategoryChange()
          }, 500);

        }
        if (key == 'itemGroup') {
          let itemGroup: any[] = this.editData.p_d_p_item_groups;
          let selectItemGroup = [];
          itemGroup.forEach((item) => {
            selectItemGroup.push({
              id: item.item_group.id,
              itemName: item.item_group.name
            });
          })
          setTimeout(() => {
            this.selectedItemGroups.setValue(selectItemGroup);
            this.onItemGroupChange()
          }, 500);

        }
        if (key == 'item') {
          let items: any[] = this.editData.p_d_p_items;
          let selectedItems = [];
          items.forEach((item) => {
            if (!selectedItems.find((x) => x.id === item.item.id)) {
              selectedItems.push({
                id: item.item.id,
                itemName: item.item.item_name + " - " + item.item.item_code
              });
            }
          });
          setTimeout(() => {
            this.selectedItems.setValue(selectedItems);
            this.onItemChange()
          }, 500);

        }
      });
    }
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  counter(i: number) {
    return new Array(i);
  }

  public flatAreaArray(item) {
    this.flatAreaData.push(item);
    if (item.children.length) {
      for (const child of item.children) {
        this.flatAreaArray(child);
      }
    } else {
      return;
    }
  }

  public flatChannelArray(item) {
    this.flatChannelData.push(item);
    if (item.children.length) {
      for (const child of item.children) {
        this.flatChannelArray(child);
      }
    } else {
      return;
    }
  }
  public flatSalesOrganisationArray(item) {
    this.flatSalesOrganisationData.push(item);
    if (item.children.length) {
      for (const child of item.children) {
        this.flatSalesOrganisationArray(child);
      }
    } else {
      return;
    }
  }
  public flatCategoryArray(item) {
    this.flatCategoryData.push(item);
    if (item.children.length) {
      for (const child of item.children) {
        this.flatCategoryArray(child);
      }
    } else {
      return;
    }
  }

  //updates select options for the next selection.
  updateData() {
    this.keySequence.forEach((key) => {
      if (key == 'regions') {
        let index = this.keySequence.indexOf('regions');
        if (index != 0) {
          this.regions = this.valuesArray[index - 1];
        }
      } else if (key == 'area') {
        let index = this.keySequence.indexOf('area');
        if (index != 0) {
          this.areas = this.valuesArray[index - 1];
        }
      } else if (key == 'route') {
        let index = this.keySequence.indexOf('route');
        if (index != 0) {
          this.routes = this.valuesArray[index - 1];
        }
      }
    });
  }

  onCountryChange(event) {
    let selecteCountry = [];
    this.selectedCountries.value.forEach(element => {
      selecteCountry.push(element.id)
    });
    this.countriesFromControl.setValue(selecteCountry);
    let index = this.keySequence.indexOf('country');
    this.valuesArray = this.valuesArray.slice(0, index);
    let nextSelection = this.keySequence[
      this.keySequence.indexOf('country') + 1
    ];
    //console.log(this.valuesArray);
    if (nextSelection == 'regions') {
      let data = { country_id: this.countriesFromControl.value, param: 'regions' };
      // this.ks.getCountries(data).subscribe(res => {
      //   this.valuesArray[this.keySequence.indexOf('country')] = res.data;
      //   this.updateData();
      // })
      this.subscriptions.push(
        this.apiService.getAllRegions().subscribe((res) => {
          this.valuesArray[this.keySequence.indexOf('country')] = res.data;
          this.updateData();
        })
      );
    } else if (nextSelection == 'area') {
      let data = { country_id: this.countriesFromControl.value, param: 'area' };
      // this.ks.getCountries(data).subscribe(res => {
      //   this.valuesArray[this.keySequence.indexOf('country')] = res.data;
      //   this.updateData();
      // })
      this.subscriptions.push(
        this.apiService.getAllAreas().subscribe((res) => {
          this.flatAreaData = [];
          this.areas = res.data;
          this.areas.forEach((data) => {
            this.flatAreaArray(data);
          });
          this.valuesArray[
            this.keySequence.indexOf('country')
          ] = this.flatAreaData;
          this.updateData();
        })
      );
    } else if (nextSelection == 'route') {
      let data = { country_id: this.countriesFromControl.value, param: 'routes' };

      // this.subscriptions.push(
      //   this.apiService.getAllRoute().subscribe((res) => {
      //     this.valuesArray[this.keySequence.indexOf('country')] = res.data;
      //     this.updateData();
      //   })
      // );
      this.subscriptions.push(
        this.apiService.getMasterDataLists().subscribe((result: any) => {
          this.valuesArray[this.keySequence.indexOf('country')] = result.data.route;
          this.updateData();
        }));
    }
  }
  onScroll() {
    if (this.total_pages < this.page) return;
    this.isLoading = true;
    this.lookup$.next(this.page);
  }
  onRegionChange(event) {
    let selecteRegion = [];
    this.selectedRegions.value.forEach(element => {
      selecteRegion.push(element.id)
    });
    this.regionsFormControl.setValue(selecteRegion);
    let index = this.keySequence.indexOf('regions');
    this.valuesArray = this.valuesArray.slice(0, index);
    //console.log(this.selectedRegions);
    let nextSelection = this.keySequence[
      this.keySequence.indexOf('regions') + 1
    ];
    //console.log(nextSelection);

    //console.log(this.valuesArray);

    if (nextSelection == 'area') {
      let data = { region_id: this.selectedRegions, param: 'area' };

      this.subscriptions.push(
        this.apiService.getAllAreas().subscribe((res) => {
          this.flatAreaData = [];
          this.areas = res.data;
          this.areas.forEach((data) => {
            this.flatAreaArray(data);
          });
          this.valuesArray[
            this.keySequence.indexOf('regions')
          ] = this.flatAreaData;
          this.updateData();
        })
      );
    } else if (nextSelection == 'route') {
      let data = { region_id: this.selectedRegions, param: 'routes' };

      // this.subscriptions.push(
      //   this.apiService.getAllRoute().subscribe((res) => {
      //     this.valuesArray[this.keySequence.indexOf('regions')] = res.data;
      //     this.updateData();
      //   })
      // );
      this.subscriptions.push(
        this.apiService.getMasterDataLists().subscribe((result: any) => {
          this.valuesArray[this.keySequence.indexOf('regions')] = result.data.route;
          this.updateData();
        }));

    }
  }
  onAreaChange(event) {
    // for (let i = 0; i < 6; i++) {
    //   this.selectedAreas.forEach((selectedArea) => {
    //     this.flatAreaData.forEach((area) => {
    //       if (selectedArea === area.parent_id) {
    //         if (!this.selectedAreas.includes(area.id)) {
    //           this.selectedAreas = [...this.selectedAreas, area.id];
    //         }
    //       }
    //     });
    //   });
    // }

    let selecteArea = [];
    this.selectedAreas.value.forEach(element => {
      selecteArea.push(element.id)
    });

    this.areasFromControl.setValue(selecteArea);
    let index = this.keySequence.indexOf('area');
    this.valuesArray = this.valuesArray.slice(0, index);
    //console.log(this.selectedAreas);
    let nextSelection = this.keySequence[this.keySequence.indexOf('area') + 1];
    //console.log(this.valuesArray);

    if (nextSelection == 'route') {
      let data = { area_id: this.selectedAreas, param: 'routes' };

      // this.subscriptions.push(
      //   this.apiService.getAllRoute().subscribe((res) => {
      //     this.valuesArray[this.keySequence.indexOf('area')] = res.data;
      //     this.updateData();
      //   })
      // );
      this.subscriptions.push(
        this.apiService.getMasterDataLists().subscribe((result: any) => {
          this.valuesArray[this.keySequence.indexOf('area')] = result.data.route;
          this.updateData();
        }));
    }
  }

  onRouteChange(event) {
    let selecteRoute = [];
    this.customers = [];
    this.selectedRoutes.value.forEach(element => {
      selecteRoute.push(element.id)
    });

    this.routeFormControl.setValue(selecteRoute);
    var array = [];
    if (selecteRoute.length > 0) {
      this.apiService.getCustomersByRouteIds(selecteRoute).subscribe(res => {
        if (res.data.length > 0) {
          res.data.forEach(element => {
            this.customers.push({
              id: element.id,
              itemName: element.user.firstname + ' ' + element.user.lastname + ' - ' + element.customer_code,
            });
          });
        }
        setTimeout(() => {
          this.setCustomersList();

        }, 500);
      });
    }
    else {
      this.customers = this.customersCopy;
      setTimeout(() => {
        this.setCustomersList();

      }, 500);
    }
  }
  onSalesOrganisationChange() {
    // for (let i = 0; i < 6; i++) {
    //   this.selectedSalesOrganisations.forEach((selectedSalesOrganisation) => {
    //     this.flatSalesOrganisationData.forEach((salesOrg) => {
    //       if (selectedSalesOrganisation === salesOrg.parent_id) {
    //         if (!this.selectedSalesOrganisations.includes(salesOrg.id)) {
    //           this.selectedSalesOrganisations = [
    //             ...this.selectedSalesOrganisations,
    //             salesOrg.id,
    //           ];
    //         }
    //       }
    //     });
    //   });
    // }
    let selecteSalesOrg = [];
    this.selectedSalesOrganisations.value.forEach(element => {
      selecteSalesOrg.push(element.id)
    });
    this.salesOrganisationFormControl.setValue(selecteSalesOrg);
  }
  onChannelChange() {
    // for (let i = 0; i < 6; i++) {
    //   this.selectedChannels.forEach((selectedChannel) => {
    //     this.flatChannelData.forEach((channel) => {
    //       if (selectedChannel === channel.parent_id) {
    //         if (!this.selectedChannels.includes(channel.id)) {
    //           this.selectedChannels = [...this.selectedChannels, channel.id];
    //         }
    //       }
    //     });
    //   });
    // }
    let selectChannel = [];
    this.selectedChannels.value[0].forEach(element => {
      selectChannel.push(element.id)
    });
    this.channelFormControl.setValue(selectChannel);
  }
  onCustomerCategoryChange() {
    let selectCustomerCategory = [];
    this.selectedCustomerCategories.value.forEach(element => {
      selectCustomerCategory.push(element.id)
    });
    this.customerCategoryFormControl.setValue(selectCustomerCategory);
  }
  onCustomerChange() {
    let selectCustomer = [];
    this.selectedCustomers.value.forEach(element => {
      selectCustomer.push(element.id)
    });
    this.customerFormControl.setValue(selectCustomer);
  }

  onCategoryChange() {
    // for (let i = 0; i < 6; i++) {
    //   this.selectedCategories.forEach((selectedCategory) => {
    //     this.flatCategoryData.forEach((category) => {
    //       if (selectedCategory === category.parent_id) {
    //         if (!this.selectedCategories.includes(category.id)) {
    //           this.selectedCategories = [
    //             ...this.selectedCategories,
    //             category.id,
    //           ];
    //         }
    //       }
    //     });
    //   });
    // }
    let selectMajorCategory = [];
    this.selectedCategories.value.forEach(element => {
      selectMajorCategory.push(element.id)
    });
    this.majorCategoryFormControl.setValue(selectMajorCategory);
  }
  onItemGroupChange() {
    let selectItemGroup = [];
    this.selectedItemGroups.value.forEach(element => {
      selectItemGroup.push(element.id)
    });
    this.itemGroupFormControl.setValue(selectItemGroup);
  }

  onItemChange() {
    let selectedItems = [];
    this.selectedItems.value.forEach(element => {
      if (!selectedItems.find((x) => x.id === element.id)) {
        selectedItems.push(element.id)
      }
    });
    this.itemsFormControl.setValue(selectedItems);
  }

  updateValues(option) {
    switch (option) {
      case 'country':
        {
          this.subscriptions.push(
            this.apiService.getCountriesList().subscribe((result: any) => {
              this.countries = result.data;
            })
          );
        }
        break;

      case 'regions':
        this.subscriptions.push(
          this.apiService.getAllRegions().subscribe((result: any) => {
            this.regions = result.data;
          })
        );
        break;

      case 'area':
        this.subscriptions.push(
          this.apiService.getAllAreas().subscribe((result: any) => {
            this.flatAreaData = [];
            this.areas = result.data;
            this.areas.forEach((data) => {
              this.flatAreaArray(data);
            });
          })
        );
        break;
      case 'route':
        this.subscriptions.push(
          // this.apiService.getAllRoute().subscribe((result: any) => {
          //   this.routes = result.data;
          // })
          // this.subscriptions.push(
          this.apiService.getMasterDataLists().subscribe((result: any) => {
            this.routes = result.data.route;
          })
          // );
        );
        break;
    }
  }

  updateCustomers() {
    this.subscriptions.push(
      this.apiService.getAllSalesOrganisations().subscribe((result: any) => {
        this.salesOrganisations = result.data;
        this.flatSalesOrganisationData = [];
        this.salesOrganisations.forEach((data) => {
          this.flatSalesOrganisationArray(data);
        });
      })
    );
    this.subscriptions.push(
      this.apiService.getAllChannels().subscribe((result: any) => {
        this.channels = result.data;
        this.flatChannelData = [];
        this.channels.forEach((data) => {
          this.flatChannelArray(data);
        });
      })
    );
    this.subscriptions.push(
      this.apiService.getAllCustomerCategory().subscribe((result: any) => {
        this.customerCategories = result.data;
      })
    );
    this.subscriptions.push(
      this.apiService.getMasterDataListsByItem('customer').subscribe((result: any) => {
        if (!this.selectedRoutes.value || this.selectedRoutes.value.length == 0) {
          result.data.customers.forEach(element => {
            this.customers.push({
              id: element.customer_info.id,
              itemName: element.firstname + ' ' + element.lastname + ' - ' + element.customer_info.customer_code,
              route_id: element.customer_info.route_id
            });
          });
          // this.customers = result.data.customers;
          this.customersCopy = this.customers;

          setTimeout(() => {
            this.setCustomersList();
          }, 500);
        } else {
          result.data.customers.forEach(element => {
            this.customersCopy.push({
              id: element.customer_info.id,
              itemName: element.firstname + ' ' + element.lastname + ' - ' + element.customer_info.customer_code,
            });
          });
        }
      }));
    // this.subscriptions.push(

    //   // this.apiService.getCustomers().subscribe((result: any) => {
    //   //   this.customers = result.data;
    //   // })
    //   // this.subscriptions.push(
    //   this.apiService.getMasterDataLists().subscribe((result: any) => {
    //     this.customers = result.data.customers;
    //     this.customersCopy = this.customers;
    //     this.getCustomerList();
    //   })
    //   // );
    // );
  }
  getCustomerList() {
    this.customers.forEach(element => {
      this.customersVal.push({ id: element.id, itemName: element.firstname + element.lastname + " - " + element?.customer_info?.customer_code });
    });
  }
  getItemList() {

    for (let element of this.items) {
      this.itemsVal.push({ id: element.id, itemName: element.item_name + " - " + element.item_code });
    }
  }

  updateItems() {
    this.subscriptions.push(
      this.apiService.getAllMajorCategorires().subscribe((result: any) => {
        this.majorCategories = result.data;
        this.flatCategoryData = [];
        this.majorCategories.forEach((data) => {
          this.flatCategoryArray(data);
        });
      })
    );
    this.subscriptions.push(
      this.apiService.getAllItemGroups().subscribe((result: any) => {
        this.itemGroups = result.data;
      })
    );
    if (
      !this.keySequence.includes('majorCategory') &&
      !this.keySequence.includes('itemGroup')
    ) {
      this.subscriptions.push(
        this.apiService.getAllItems().subscribe((result: any) => {
          for (let element of result.data) {
            this.items.push({ id: element.id, itemName: element.item_name + " - " + element.item_code });

          }

          let items: any[] = this.editData.p_d_p_items;
          let selectedItems = [];
          items.forEach((item) => {
            if (!selectedItems.find((x) => x.id === item.item.id)) {
              selectedItems.push({
                id: item.item.id,
                itemName: item.item.item_name + " - " + item.item.item_code
              });
            }
          });
          setTimeout(() => {
            this.selectedItems.setValue(selectedItems);
            this.onItemChange()
          }, 500);
          // this.items = ;
          // this.getItemList();
        })
        // this.subscriptions.push(
        // this.apiService.getMasterDataLists().subscribe((result: any) => {
        //   this.items = result.data.items;
        // })
        // );
      );
    }
  }

  showLocations() {
    let locations: any = this.overviewFormGroup.value.keyCombination.locations;
    if (
      locations.area === true ||
      locations.country === true ||
      locations.regions === true ||
      locations.route === true ||
      locations.subArea === true
    ) {
      return true;
    } else {
      return false;
    }
  }
  showCustomers() {
    let customers: any = this.overviewFormGroup.value.keyCombination.customers;
    if (
      customers.salesOrganisation === true ||
      customers.channel === true ||
      customers.subChannel === true ||
      customers.customerCategory === true ||
      customers.customer === true
    ) {
      return true;
    } else {
      return false;
    }
  }
  showItems() {
    let items: any = this.overviewFormGroup.value.keyCombination.items;
    if (
      items.majorCategory === true ||
      items.subCategory === true ||
      items.itemGroup === true ||
      items.item == true
    ) {
      return true;
    } else {
      return false;
    }
  }
  get locationsControl(): FormControl {
    return this.overviewFormGroup
      .get('keyCombination')
      .get('locations') as FormControl;
  }
  get customerControl(): FormControl {
    return this.overviewFormGroup
      .get('keyCombination')
      .get('customers') as FormControl;
  }
  get itemsControl(): FormControl {
    return this.overviewFormGroup
      .get('keyCombination')
      .get('items') as FormControl;
  }

  setCustomersList() {
    var selectCustomer = [];
    this.editData.p_d_p_customers.forEach((customer) => {
      selectCustomer.push({
        id: customer.customer_info.id,
        itemName: customer.customer_info?.user?.firstname + ' ' + customer.customer_info?.user?.lastname + ' - ' + customer.customer_info.customer_code
      });
    });
    this.selectedCustomers.setValue(selectCustomer);
    this.onCustomerChange();
  }
}
