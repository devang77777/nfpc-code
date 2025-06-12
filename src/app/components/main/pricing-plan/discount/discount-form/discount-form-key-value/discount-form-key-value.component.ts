import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ApiKeySelectionService } from 'src/app/services/api-key-selection.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { PricingPlanService } from '../../../pricing-plan.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-discount-form-key-value',
  templateUrl: './discount-form-key-value.component.html',
  styleUrls: ['./discount-form-key-value.component.scss'],
})
export class DiscountFormKeyValueComponent implements OnInit, OnChanges {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() public overviewFormGroup: FormGroup;
  @Input() public showFormError: boolean;
  @Input() public editData;

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

  private apiService: ApiService;
  private ks: ApiKeySelectionService;
  private router: Router;
  private subscriptions: Subscription[] = [];
  public itemData: any[] = [];
  public itemUomData: any[] = [];
  public uomFilter: any[] = [];
  ItemUomCodeFormControl: FormControl;

  updateItemCode: { index: number; isEdit: boolean };
  ItemCodeFormControl: FormControl;
  public displayedColumns = ['itemName', 'itemUom', 'actions'];
  public itemSource: any;
  private itemCodeList: {
    item_id: number;
    item_uom_id: number;
  }[] = [];

  constructor(
    private planService: PricingPlanService,
    apiService: ApiService,
    ks: ApiKeySelectionService,
    router: Router
  ) {
    Object.assign(this, { apiService, ks, router });
    this.itemSource = new MatTableDataSource<any>();
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
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.itemData = result.data.items;
        this.itemUomData = result.data.item_uom;
        console.log(this.itemUomData);
      })
      // this.planService.getItmesLists().subscribe((res: any) => {
      //   this.itemData = res.items.data;
      //   this.itemUomData = res.uoms.data;
      // })
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
    this.ItemCodeFormControl = new FormControl([]);
    this.ItemUomCodeFormControl = new FormControl([]);

    this.buildForm();
  }
  public ngOnChanges(): void {
    if (this.editData) {
      this.updateCustomers();
      this.updateItems();
      let keySequence: string[] = this.overviewFormGroup.get('keySequence')
        .value;
      //console.log(keySequence);
      keySequence.forEach((key) => {
        if (key == 'country') {
          let countries: any[] = this.editData.p_d_p_countries;
          this.selectedCountries = [];
          countries.forEach((country) => {
            this.selectedCountries.push(country.country.id);
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
            this.subscriptions.push(
              // this.apiService.getAllRoute().subscribe((res) => {
              //   this.valuesArray[this.keySequence.indexOf('area')] = res.data;
              //   this.updateData();
              // })
              // this.subscriptions.push(
              this.apiService.getMasterDataLists().subscribe((result: any) => {
                this.valuesArray[this.keySequence.indexOf('area')] = result.data.routes;
                this.updateData();
              })
              // );
            );
          }
          this.areasFromControl.setValue(this.selectedAreas);
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
            this.selectedChannels.push(channel.channel.id);
          });
          this.channelFormControl.setValue(this.selectedChannels);
        }
        if (key == 'customerCategory') {
          let customerCategories: any[] = this.editData
            .p_d_p_customer_categories;
          this.selectedCustomerCategories = [];
          customerCategories.forEach((customerCategory) => {
            this.selectedCustomerCategories.push(
              customerCategory.customer_category.id
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
            this.selectedCustomers.push(customer.customer_info.id);
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
          let itemGroups: any[] = this.editData.p_d_p_item_groups;
          this.selectedItemGroups = [];
          itemGroups.forEach((itemGroup) => {
            this.selectedItemGroups.push(itemGroup.item_group.id);
          });
          this.itemGroupFormControl.setValue(this.selectedItemGroups);
        }
        if (key == 'item') {
          // let items: any[] = this.editData.p_d_p_items;
          // this.selectedItems = [];
          // items.forEach((item) => {
          //   if (!this.selectedItems.includes(item.item.id)) {
          //     this.selectedItems.push(item.item.id);
          //   }
          // });
          let itemUomObj = [];
          this.editData.p_d_p_items.forEach((element) => {
            itemUomObj.push({
              item_id: element.item?.id,
              item_name: element.item?.item_name,
              item_uom_id: element.item_uom?.id,
              item_uom_name: element.item_uom?.name,
            });
          });
          this.updateItemSource(itemUomObj);
          this.itemsFormControl.setValue(itemUomObj);
        }
      });
      this.editData = undefined;
      //
      //
      // in progress
      //
      //
      //
      //
      //       keySequence.forEach(key => {
      // //console.log(key);

      //       })
    } else {
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
    this.countriesFromControl.setValue(this.selectedCountries);
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
      // this.ks.getCountries(data).subscribe(res => {
      //   this.valuesArray[this.keySequence.indexOf('country')] = res.data;
      //   this.updateData();
      // })
      this.subscriptions.push(
        // this.apiService.getAllRoute().subscribe((res) => {
        //   this.valuesArray[this.keySequence.indexOf('country')] = res.data;
        //   this.updateData();
        // })
        // this.subscriptions.push(
        this.apiService.getMasterDataLists().subscribe((result: any) => {
          this.valuesArray[this.keySequence.indexOf('country')] = result.data.routes;
          this.updateData();
        })
        // );
      );
    }
  }
  onRegionChange(event) {
    this.regionsFormControl.setValue(this.selectedRegions);
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
      // this.ks.getRegions(data).subscribe(res => {
      //   this.valuesArray[this.keySequence.indexOf('regions')] = res.data;
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
            this.keySequence.indexOf('regions')
          ] = this.flatAreaData;
          this.updateData();
        })
      );
    } else if (nextSelection == 'route') {
      let data = { region_id: this.selectedRegions, param: 'routes' };
      // this.ks.getRegions(data).subscribe(res => {
      //   this.valuesArray[this.keySequence.indexOf('regions')] = res.data;
      //   this.updateData();
      // })
      this.subscriptions.push(
        // this.apiService.getAllRoute().subscribe((res) => {
        //   this.valuesArray[this.keySequence.indexOf('regions')] = res.data;
        //   this.updateData();
        // })
        // this.subscriptions.push(
        this.apiService.getMasterDataLists().subscribe((result: any) => {
          this.valuesArray[this.keySequence.indexOf('regions')] = result.data.routes;
          this.updateData();
        })
        // );
      );
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

    this.areasFromControl.setValue(this.selectedAreas);
    let index = this.keySequence.indexOf('area');
    this.valuesArray = this.valuesArray.slice(0, index);
    //console.log(this.selectedAreas);
    let nextSelection = this.keySequence[this.keySequence.indexOf('area') + 1];
    //console.log(this.valuesArray);

    if (nextSelection == 'route') {
      let data = { area_id: this.selectedAreas, param: 'routes' };
      // this.ks.getAreas(data).subscribe(res => {
      //   this.valuesArray[this.keySequence.indexOf('area')] = res.data;
      //   this.updateData();
      // })
      this.subscriptions.push(
        // this.apiService.getAllRoute().subscribe((res) => {
        //   this.valuesArray[this.keySequence.indexOf('area')] = res.data;
        //   this.updateData();
        // })
        this.apiService.getMasterDataLists().subscribe((result: any) => {
          this.valuesArray[this.keySequence.indexOf('area')] = result.data.routes;
          this.updateData();
        })
      );
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
  onItemChange() {
    //console.log(this.selectedItems);
    this.itemsFormControl.setValue(this.selectedItems);
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
          this.apiService.getMasterDataLists().subscribe((result: any) => {
            this.routes = result.data.routes;
          })
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
      // this.apiService.getCustomers().subscribe((result: any) => {
      //   this.customers = result.data;
      // })
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.customers = result.data.customers;
      })
    );
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
    this.subscriptions.push(
      // this.apiService.getAllItems().subscribe((result: any) => {
      //   this.items = result.data;
      // })
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.items = result.data.items;
      })
    );
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

  getUomListByItem(selectedItemId) {
    let itemFilter = this.itemData.filter(
      (item) => item.id == parseInt(selectedItemId)
    )[0];

    let uomFilter = this.itemUomData.filter(
      (item) => item.id == parseInt(itemFilter['lower_unit_uom_id'])
    );

    let secondaryUomFilterIds = [];
    let secondaryUomFilter = [];
    let itemArray: any[] = [];
    if (itemFilter.item_main_price && itemFilter.item_main_price.length) {
      itemFilter.item_main_price.forEach((item) => {
        secondaryUomFilterIds.push(item.item_uom_id);
      });
      this.itemUomData.forEach((item) => {
        if (secondaryUomFilterIds.includes(item.id)) {
          secondaryUomFilter.push(item);
        }
      });
    }

    if (uomFilter.length && secondaryUomFilter.length) {
      itemArray = [...uomFilter, ...secondaryUomFilter];
    } else if (uomFilter.length) {
      itemArray = [...uomFilter];
    } else if (secondaryUomFilter.length) {
      itemArray = [...secondaryUomFilter];
    }

    this.uomFilter = itemArray;
  }

  public editItemCode(num: number, itemCodeData: any): void {
    this.ItemCodeFormControl.setValue(itemCodeData.item_id);
    this.ItemUomCodeFormControl.setValue(itemCodeData.item_uom_id);
    this.updateItemCode = {
      index: num,
      isEdit: true,
    };
  }

  public deleteItemCode(index: number): void {
    let ItemFormControl = this.itemsFormControl.value;
    ItemFormControl.splice(index, 1);
    this.updateItemSource(ItemFormControl);
  }

  public addItemCode(): void {
    if (this.updateItemCode && this.updateItemCode.isEdit) {
      this.updateExistingItemCode(
        this.updateItemCode && this.updateItemCode.index
      );
    }
    let ItemFormControl =
      this.itemsFormControl.value == null ? [] : this.itemsFormControl.value;
    if (
      this.ItemCodeFormControl.value == '' ||
      this.ItemUomCodeFormControl.value == ''
    ) {
      return;
    }
    let check1 = undefined;
    check1 = ItemFormControl.filter(
      (x) => x['item_id'] === this.ItemCodeFormControl.value
    );
    if (check1 !== undefined && check1.length > 0) {
      return;
    }

    let itemName = '';
    let itemUom = '';
    this.itemData.forEach((item, i) => {
      if (item.id == this.ItemCodeFormControl.value) {
        itemName = item.item_name;
      }
    });
    this.itemUomData.forEach((item, i) => {
      if (item.id == this.ItemUomCodeFormControl.value) {
        itemUom = item.name;
      }
    });
    const itemCode = {
      item_id: this.ItemCodeFormControl.value,
      item_name: itemName,
      item_uom_id: this.ItemUomCodeFormControl.value,
      item_uom_name: itemUom,
    };
    this.itemCodeList.push(itemCode);
    ItemFormControl.push(itemCode);
    this.itemsFormControl.setValue(ItemFormControl);
    //console.log(this.itemsFormControl.value);
    this.updateItemSource(ItemFormControl);
  }

  public updateExistingItemCode(index: number): void {
    let itemName = '';
    let itemUom = '';
    this.itemData.forEach((item, i) => {
      if (item.id == this.ItemCodeFormControl.value) {
        itemName = item.item_name;
      }
    });
    this.itemUomData.forEach((item, i) => {
      if (item.id == this.ItemUomCodeFormControl.value) {
        itemUom = item.name;
      }
    });
    let ItemFormControl = this.itemsFormControl.value;
    ItemFormControl.splice(index, 1, {
      item_id: this.ItemCodeFormControl.value,
      item_name: itemName,
      item_uom_id: this.ItemUomCodeFormControl.value,
      item_uom_name: itemUom,
    });
    this.updateItemCode = undefined;
    this.updateItemSource(ItemFormControl);
  }

  private updateItemSource(ItemFormControl): void {
    this.itemSource = new MatTableDataSource<any>(ItemFormControl);
    this.itemSource.paginator = this.paginator;
    this.ItemCodeFormControl.setValue('');
    this.ItemUomCodeFormControl.setValue('');
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }
}
