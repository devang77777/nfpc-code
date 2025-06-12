import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-discount-form',
  templateUrl: './discount-form.component.html',
  styleUrls: ['./discount-form.component.scss'],
})
export class DiscountFormComponent implements OnInit {
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
  constructor(
    private cts: CommonToasterService,
    router: Router,
    route: ActivatedRoute,
    apiService: ApiService
  ) {
    Object.assign(this, { router, route, apiService });
  }

  public ngOnInit(): void {
    this.parentFormGroup = new FormGroup({});

    if (this.router.url.includes('discount/edit')) {
      let uuid: string;
      this.isEditForm = true;
      this.isKeyValueTab = true;
      this.isPricingTab = true;
      this.pageTitle = 'Edit Discount';
      this.route.paramMap.subscribe((params) => {
        uuid = params.get('uuid');
        this.apiService.getPricingPlan(uuid).subscribe((res) => {
          this.editData = res.data;
        });
      });
    } else {
      this.pageTitle = 'Add Discount';
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
  keyCombination: string[] = [];
  public convertData() {
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
          this.keyCombination.push(x.label);
        }
      });
    });
    this.parentFormGroup.get('keySequence').setValue(newKeySequence);
  }
  public next(): void {
    if (this.iskeyCombination() && this.selectedIndex == 0) {
      this.isKeyValueTab = true;
      this.selectedIndex = 1;
      this.showError = false;
    } else if (this.selectedIndex == 1) {
      this.showError = false;
      if (this.validSelections()) {
        this.showFormError = false;
        this.selectedIndex = 2;
      } else {
        this.showFormError = true;
      }
    } else if (this.isEditForm) {
      this.selectedIndex++;
    } else {
      this.showError = true;
    }
  }
  public previous(): void {
    this.selectedIndex--;
  }

  public saveDiscount(): void {
    this.convertData();
    let data = this.parentFormGroup.value;
    if (data.sdate >= data.edate) {
      this.cts.showError('', 'End Date must greater than Start Date');
      return;
    }
    let finalData = {
      combination_plan_key_id: data.combinationKeyPlan,
      use_for: 'Discount',
      name: data.name,
      start_date: data.sdate,
      end_date: data.edate,
      combination_key_value: this.keyCombination,
      discount_type: data.discountType,
      discount_apply_on: data.discountApplyOn,
      type: data.type,
      qty_to: data.discountQuantity
        ? data.discountQuantity
        : data.discountApplyOnValue,
      discount_value: data.discountValue,
      discount_percentage: data.discountPercentage,
      priority_sequence: 1,
      status: 1,
      country_ids: data.country_ids,
      region_ids: data.region_ids,
      area_ids: data.area_ids,
      route_ids: data.route_ids,
      sales_organisation_ids: data.sales_organisation_ids,
      channel_ids: data.channel_ids,
      item_major_category_ids: data.item_major_category_ids,
      item_group_ids: data.item_group_ids,
      item_ids: data.item_ids,
      customer_category_ids: data.customer_category_ids,
      customer_ids: data.customer_ids,
      slabs: data.slab?.orderItemFormArray,
    };
    if (this.editData) {
      this.apiService
        .editDiscount(this.editData.uuid, finalData)
        .subscribe((res) => {
          this.router.navigate(['pricing-plan/discount']).then(() => {
            // window.location.reload();
          });
        });
    } else {
      this.apiService.addDiscount(finalData).subscribe((res) => {
        //console.log(res);
        this.router.navigate(['pricing-plan/discount']).then(() => {
          // window.location.reload();
        });
      });
    }
  }
}
