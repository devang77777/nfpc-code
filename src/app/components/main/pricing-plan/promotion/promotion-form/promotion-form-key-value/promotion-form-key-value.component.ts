import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ApiKeySelectionService } from 'src/app/services/api-key-selection.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-promotion-form-key-value',
  templateUrl: './promotion-form-key-value.component.html',
  styleUrls: ['./promotion-form-key-value.component.scss'],
})
export class PromotionFormKeyValueComponent implements OnInit, OnChanges {
  @Input() public overviewFormGroup: FormGroup;
  @Input() public editData: any;
  @Input() public showFormError: boolean;

  countries;
  regions;
  areas;
  routes;
  salesOrganisations;
  channels;
  customerCategories;
  customers;
  majorCategories;
  itemGroups;
  items;
  flatAreaData;
  flatChannelData;
  flatSalesOrganisationData;
  flatCategoryData;
  keySequence: string[] = [];

  valuesArray: any[] = [];

  selectedCountries: any[] = [];
  selectedRegions: any[] = [];
  selectedAreas: any[] = [];
  selectedRoutes: any[] = [];
  selectedSalesOrganisations: any[] = [];
  selectedChannels: any[] = [];
  selectedCustomerCategories: any[] = [];
  selectedCustomers: any[] = [];
  selectedCategories: any[] = [];
  selectedItemGroups: any[] = [];
  selectedItems: any[] = [];

  public keySequenceFromControl: FormControl;

  public countryFormControl: FormControl;
  public regionFormControl: FormControl;
  public areaFormControl: FormControl;
  public routeFormControl: FormControl;

  public salesOrganisationFormControl: FormControl;
  public channelFormControl: FormControl;
  public customerCategoryFormControl: FormControl;
  public customerFormControl: FormControl;

  public majorCategoryFormControl: FormControl;
  public itemGroupFormControl: FormControl;
  public itemsFormControl: FormControl;

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
    this.updateCustomers();
    this.updateItems();

    this.keySequenceFromControl = new FormControl();
    this.countryFormControl = new FormControl([]);
    this.regionFormControl = new FormControl([]);
    this.areaFormControl = new FormControl([]);
    this.routeFormControl = new FormControl([]);
    this.salesOrganisationFormControl = new FormControl([]);
    this.channelFormControl = new FormControl([]);
    this.customerCategoryFormControl = new FormControl([]);
    this.customerFormControl = new FormControl([]);
    this.majorCategoryFormControl = new FormControl([]);
    this.itemGroupFormControl = new FormControl([]);

    this.buildForm();
  }
  public ngOnChanges(): void {
    if (this.editData) {
      let keySequence: string[] = this.overviewFormGroup.get('keySequence')
        .value;
      //console.log(keySequence);
      keySequence.forEach((key) => {
        if (key == 'country') {
          let countries: any[] = this.editData.p_d_p_countries;
          this.selectedCountries = [];
          countries.forEach((country) => {
            this.selectedCountries.push(country.country_id);
          });
          this.onCountryChange(event);
        }
        if (key == 'regions') {
          let regions: any[] = this.editData.p_d_p_regions;
          this.selectedRegions = [];
          regions.forEach((region) => {
            this.selectedRegions.push(region.region.id);
          });
          this.onRegionChange(event);
        }
        if (key == 'area') {
          let areas: any[] = this.editData.p_d_p_areas;
          this.selectedAreas = [];
          areas.forEach((area) => {
            this.selectedAreas.push(area.area.id);
          });
          if (keySequence.includes('route')) {
            // this.subscriptions.push(
            //   this.apiService.getAllRoute().subscribe((res) => {
            //     this.valuesArray[this.keySequence.indexOf('area')] = res.data;
            //     this.updateData();
            //   })
            // );
            this.subscriptions.push(
              this.apiService.getMasterDataLists().subscribe((result: any) => {
                this.valuesArray[this.keySequence.indexOf('area')] = result.data.routes;
                this.updateData();
              }));
          }
        }
        if (key == 'route') {
          let routes: any[] = this.editData.p_d_p_routes;
          this.selectedRoutes = [];
          routes.forEach((route) => {
            this.selectedRoutes.push(route.route.id);
          });
          this.routeFormControl.setValue(this.selectedRoutes);
        }
        if (key == 'salesOrganisation') {
          let salesOrgs: any[] = this.editData.p_d_p_sales_organisations;
          this.selectedSalesOrganisations = [];
          salesOrgs.forEach((salesOrg) => {
            this.selectedSalesOrganisations.push(
              salesOrg.sales_organisation_id
            );
          });
          this.salesOrganisationFormControl.setValue(
            this.selectedSalesOrganisations
          );
        }
        if (key == 'channel') {
          let channels: any[] = this.editData.p_d_p_channels;
          this.selectedChannels = [];
          channels.forEach((channel) => {
            this.selectedChannels.push(channel.channel_id);
          });
          this.channelFormControl.patchValue(this.selectedChannels);
        }
        if (key == 'customerCategory') {
          let customerCategories: any[] = this.editData
            .p_d_p_customer_categories;
          this.selectedCustomerCategories = [];
          customerCategories.forEach((customerCategory) => {
            this.selectedCustomerCategories.push(
              customerCategory.customer_category_id
            );
          });
          this.customerCategoryFormControl.setValue(
            this.selectedCustomerCategories
          );
        }
        if (key == 'customer') {
          let customers: any[] = this.editData.p_d_p_customers;
          this.selectedCustomers = [];
          customers.forEach((customer) => {
            this.selectedCustomers.push(customer.customer_id);
          });
          this.customerFormControl.setValue(this.selectedCustomers);
        }
        if (key == 'majorCategory') {
          let categories: any[] = this.editData.p_d_p_item_major_categories;
          this.selectedCategories = [];
          categories.forEach((category) => {
            this.selectedCategories.push(category.item_major_category.id);
          });
          this.majorCategoryFormControl.setValue(this.selectedCategories);
        }
        if (key == 'itemGroup') {
          let itemGroup: any[] = this.editData.p_d_p_item_groups;
          this.selectedItemGroups = [];
          itemGroup.forEach((item) => {
            this.selectedItemGroups.push(item.item_group.id);
          });
          this.itemGroupFormControl.setValue(this.selectedItemGroups);
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
  buildForm() {
    this.overviewFormGroup.addControl(
      'keySequence',
      this.keySequenceFromControl
    );
    this.overviewFormGroup.addControl('country', this.countryFormControl);
    this.overviewFormGroup.addControl('region', this.regionFormControl);
    this.overviewFormGroup.addControl('area', this.areaFormControl);
    this.overviewFormGroup.addControl('route', this.routeFormControl);
    this.overviewFormGroup.addControl(
      'salesOrganisation',
      this.salesOrganisationFormControl
    );
    this.overviewFormGroup.addControl('channel', this.channelFormControl);
    this.overviewFormGroup.addControl(
      'customerCategory',
      this.customerCategoryFormControl
    );
    this.overviewFormGroup.addControl('customer', this.customerFormControl);
    this.overviewFormGroup.addControl(
      'majorCategory',
      this.majorCategoryFormControl
    );
    this.overviewFormGroup.addControl('itemGroup', this.itemGroupFormControl);
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
    this.countryFormControl.setValue(this.selectedCountries);
    let index = this.keySequence.indexOf('country');
    this.valuesArray = this.valuesArray.slice(0, index);
    //console.log(this.selectedCountries);
    let nextSelection = this.keySequence[
      this.keySequence.indexOf('country') + 1
    ];
    //console.log(this.valuesArray);
    if (nextSelection == 'regions') {
      let data = { country_id: this.selectedCountries, param: 'regions' };
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
      let data = { country_id: this.selectedCountries, param: 'area' };
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
      let data = { country_id: this.selectedCountries, param: 'routes' };

      // this.subscriptions.push(
      //   this.apiService.getAllRoute().subscribe((res) => {
      //     this.valuesArray[this.keySequence.indexOf('country')] = res.data;
      //     this.updateData();
      //   })
      // );
      this.subscriptions.push(
        this.apiService.getMasterDataLists().subscribe((result: any) => {
          this.valuesArray[this.keySequence.indexOf('country')] = result.data.routes;
          this.updateData();
        }));
    }
  }
  onRegionChange(event) {
    this.regionFormControl.setValue(this.selectedRegions);
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
          this.valuesArray[this.keySequence.indexOf('regions')] = result.data.routes;
          this.updateData();
        }));

    }
  }
  onAreaChange(event) {
    for (let i = 0; i < 6; i++) {
      this.selectedAreas.forEach((selectedArea) => {
        this.flatAreaData.forEach((area) => {
          if (selectedArea === area.parent_id) {
            if (!this.selectedAreas.includes(area.id)) {
              this.selectedAreas = [...this.selectedAreas, area.id];
            }
          }
        });
      });
    }

    this.areaFormControl.setValue(this.selectedAreas);
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
          this.valuesArray[this.keySequence.indexOf('area')] = result.data.routes;
          this.updateData();
        }));
    }
  }

  onRouteChange(event) {
    this.routeFormControl.setValue(this.selectedRoutes);
  }
  onSalesOrganisationChange() {
    for (let i = 0; i < 6; i++) {
      this.selectedSalesOrganisations.forEach((selectedSalesOrganisation) => {
        this.flatSalesOrganisationData.forEach((salesOrg) => {
          if (selectedSalesOrganisation === salesOrg.parent_id) {
            if (!this.selectedSalesOrganisations.includes(salesOrg.id)) {
              this.selectedSalesOrganisations = [
                ...this.selectedSalesOrganisations,
                salesOrg.id,
              ];
            }
          }
        });
      });
    }
    this.salesOrganisationFormControl.setValue(this.selectedSalesOrganisations);
  }
  onChannelChange() {
    for (let i = 0; i < 6; i++) {
      this.selectedChannels.forEach((selectedChannel) => {
        this.flatChannelData.forEach((channel) => {
          if (selectedChannel === channel.parent_id) {
            if (!this.selectedChannels.includes(channel.id)) {
              this.selectedChannels = [...this.selectedChannels, channel.id];
            }
          }
        });
      });
    }
    this.channelFormControl.setValue(this.selectedChannels);
  }
  onCustomerCategoryChange() {
    this.customerCategoryFormControl.setValue(this.selectedCustomerCategories);
  }
  onCustomerChange() {
    this.customerFormControl.setValue(this.selectedCustomers);
  }

  onCategoryChange() {
    for (let i = 0; i < 6; i++) {
      this.selectedCategories.forEach((selectedCategory) => {
        this.flatCategoryData.forEach((category) => {
          if (selectedCategory === category.parent_id) {
            if (!this.selectedCategories.includes(category.id)) {
              this.selectedCategories = [
                ...this.selectedCategories,
                category.id,
              ];
            }
          }
        });
      });
    }
    this.majorCategoryFormControl.setValue(this.selectedCategories);
  }
  onItemGroupChange() {
    this.itemGroupFormControl.setValue(this.selectedItemGroups);
  }
  showLocations() {
    let locations: any = this.overviewFormGroup.value.keyCombination.locations;
    if (
      locations.area === true ||
      locations.country === true ||
      locations.region === true ||
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
        // this.subscriptions.push(
        //   this.apiService.getAllRoute().subscribe((result: any) => {
        //     this.routes = result.data;
        //   })
        // );
        this.subscriptions.push(
          this.apiService.getMasterDataLists().subscribe((result: any) => {
            this.routes = result.data.routes;
          }));
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
    // this.subscriptions.push(
    //   this.apiService.getCustomers().subscribe((result: any) => {
    //     this.customers = result.data;
    //   })
    // );
    this.subscriptions.push(
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.customers = result.data.customers;
      }));
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
    // this.subscriptions.push(
    //   this.apiService.getAllItems().subscribe((result: any) => {
    //     this.items = result.data;
    //   })
    // );
    this.subscriptions.push(
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.items = result.data.items;
      }));
  }
}
