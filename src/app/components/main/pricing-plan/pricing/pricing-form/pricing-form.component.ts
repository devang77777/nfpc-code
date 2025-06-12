import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pricing-form',
  templateUrl: './pricing-form.component.html',
  styleUrls: ['./pricing-form.component.scss'],
})
export class PricingFormComponent implements OnInit {
  public pageTitle: string;
  public isEditForm: boolean;
  public parentFormGroup: FormGroup;
  public selectedIndex = 0;
  public editData;
  public showError: boolean;
  public showFormError: boolean;
  isKeyValueTab = false;
  isPricingTab = false;
  private router: Router;
  private route: ActivatedRoute;
  private apiService: ApiService;
  // private dataEditor: DataEditor; // no need for dataEditor
  private subscriptions: Subscription[] = [];
  constructor(router: Router, route: ActivatedRoute, apiService: ApiService) {
    Object.assign(this, { router, route, apiService });
  }

  public ngOnInit(): void {
    this.parentFormGroup = new FormGroup({
      pricing: new FormControl(''),
    });

    if (this.router.url.includes('pricing/edit')) {
      let uuid: string;
      this.isEditForm = true;
      this.isKeyValueTab = true;
      this.isPricingTab = true;
      this.pageTitle = 'Edit Pricing';
      this.route.paramMap.subscribe((params) => {
        var param = params.get('uuid');
        if (param) {
          uuid = param.split('?')[0];
          if (param.split('?').length > 1) {
            if (param.split('?')[1].indexOf('copy')) {
              this.isEditForm = false;
              this.pageTitle = 'Add Pricing';

            }
          }
        }
        // uuid = params.get('uuid');
        this.apiService.getPricingPlan(uuid).subscribe((res) => {
          this.editData = res.data;
        });
      });
    } else {
      this.pageTitle = 'Add Pricing';
    }
  }
  iskeyCombination() {
    let keySequence: any[] = this.parentFormGroup.get('keySequence').value;
    if (keySequence) {
      if (
        keySequence.includes('majorCategory') ||
        keySequence.includes('itemGroup') ||
        keySequence.includes('item')
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
  convertData() {
    // convert nested array to single array
    let pricing = [];
    let newPricing = [];
    let selectedItems = this.parentFormGroup.get('item_ids').value;
    let itemPriceArray: any[] = this.parentFormGroup
      .get('pricing_unformated')
      .get('itemPriceFormArray').value;
    itemPriceArray.forEach((x) => {
      x.forEach((y) => {
        if (selectedItems.includes(y.item_id)) {
          pricing.push(y);
        }
      });
    });
    //console.log('here', pricing);
    if (pricing.length) {
      newPricing = pricing.reduce((unique, o) => {
        if (
          !unique.some(
            (obj) =>
              obj.item_id === o.item_id && obj.item_uom_id === o.item_uom_id
          )
        ) {
          unique.push(o);
        }
        return unique;
      }, []);
    }
    //console.log(newPricing);

    this.parentFormGroup.get('pricing').setValue(newPricing);

    // to change the value of key sequence as per api
    let keySequence = [
      { value: 'country', label: 'Country' },
      { value: 'regions', label: 'Region' },
      { value: 'area', label: 'Area' },
      { value: 'subArea', label: 'Sub Area' },
      { value: 'route', label: 'Route' },
      { value: 'salesOrganisation', label: 'Sales Organisation' },
      { value: 'channel', label: 'Channel' },
      { value: 'subChannel', label: 'Sub Channel' },
      { value: 'customerCategory', label: 'Customer Category' },
      { value: 'customer', label: 'Customer' },
      { value: 'majorCategory', label: 'Major Category' },
      { value: 'subCategory', label: 'Sub Category' },
      { value: 'itemGroup', label: 'Item Group' },
      { value: 'item', label: 'Material' },
    ];
    let newKeySequence = [];
    this.parentFormGroup.value.keySequence.forEach((element: string) => {
      keySequence.forEach((x) => {
        if (element == x.value) {
          newKeySequence.push(x.label);
        }
      });
    });
    //console.log(newKeySequence);
    this.parentFormGroup.get('keySequence').setValue(newKeySequence);
    //console.log(this.parentFormGroup.value);
  }
  validSelections(): boolean {
    // condition to check if all the key selections has selected values > 0
    const ks: any[] = this.parentFormGroup.get('keySequence').value;
    const pfg = this.parentFormGroup.value;
    let counter = 0;
    ks.forEach((key) => {
      if (key == 'country' && pfg.country_ids.length) {
        counter++;
      } else if (key == 'regions' && pfg.region_ids.length) {
        counter++;
      } else if (key == 'area' && pfg.area_ids.length) {
        counter++;
      } else if (key == 'route' && pfg.route_ids.length) {
        counter++;
      } else if (
        key == 'salesOrganisation' &&
        pfg.sales_organisation_ids.length
      ) {
        counter++;
      } else if (key == 'channel' && pfg.channel_ids.length) {
        counter++;
      } else if (
        key == 'customerCategory' &&
        pfg.customer_category_ids.length
      ) {
        counter++;
      } else if (key == 'customer' && pfg.customer_ids.length) {
        counter++;
      } else if (key == 'majorCategory' && pfg.item_major_category_ids.length) {
        counter++;
      } else if (key == 'itemGroup' && pfg.item_group_ids.length) {
        counter++;
      } else if (key == 'item' && pfg.item_ids.length) {
        counter++;
      }
    });
    if (counter == ks.length) {
      return true;
    } else {
      return false;
    }
  }
  public next(): void {
    if (this.iskeyCombination() && this.selectedIndex == 0) {
      this.isKeyValueTab = true;
      this.selectedIndex = 1;
      this.showError = false;
    } else if (this.isEditForm) {
      this.selectedIndex++;
    } else if (this.selectedIndex == 1) {
      this.showError = false;
      if (this.validSelections()) {
        this.showFormError = false;
        this.selectedIndex = 2;
      } else {
        this.showFormError = true;
      }
    } else {
      this.showError = true;
    }
  }

  public previous(): void {
    this.selectedIndex--;
  }

  public savePromotion(): void {
    this.convertData();
    let fg = this.parentFormGroup.value;

    let data = {
      combination_plan_key_id: fg.combinationKeyPlan,
      use_for: 'Pricing',
      name: fg.name,
      start_date: fg.start_date,
      end_date: fg.end_date,
      combination_key_value: fg.keySequence,
      priority_sequence: 1,
      status: 1,
      country_ids: fg.country_ids,
      region_ids: fg.region_ids,
      area_ids: fg.area_ids,
      sub_area_ids: null,
      route_ids: fg.route_ids,
      sales_organisation_ids: fg.sales_organisation_ids,
      channel_ids: fg.channel_ids,
      sub_channel_ids: null,
      customer_category_ids: fg.customer_category_ids,
      customer_ids: fg.customer_ids,
      item_major_category_ids: fg.item_major_category_ids,
      item_sub_category_ids: null,
      item_group_ids: fg.item_group_ids,
      item_ids: fg.pricing,
      lob_id: fg.keyCombination.lob.length > 0 ? fg.keyCombination.lob[0].id : '',
    };
    //console.log('final data = ', JSON.stringify(data));
    if (this.isEditForm) {
      const uuid = this.editData.uuid;
      this.apiService.editPricingPlan(uuid, data).subscribe((res) => {
        this.router.navigate(['pricing-plan/pricing']);
      });
    } else {
      this.apiService.addPricingPlan(data).subscribe((res) => {
        this.router.navigate(['pricing-plan/pricing']);
        // //console.log(res);
      });
    }
  }
}
