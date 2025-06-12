import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-promotion-form',
  templateUrl: './promotion-form.component.html',
  styleUrls: ['./promotion-form.component.scss'],
})
export class PromotionFormComponent implements OnInit {
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
  constructor(router: Router, route: ActivatedRoute, apiService: ApiService) {
    Object.assign(this, { router, route, apiService });
  }

  public ngOnInit(): void {
    this.parentFormGroup = new FormGroup({});
    if (this.router.url.includes('promotion/edit')) {
      let uuid: string;
      this.isEditForm = true;
      this.isKeyValueTab = true;
      this.isPricingTab = true;
      this.pageTitle = 'Edit Promotion';
      this.route.paramMap.subscribe((params) => {
        uuid = params.get('uuid');
        this.apiService.getPromotion(uuid).subscribe((res) => {
          this.editData = res.data;
        });
      });
    } else {
      this.pageTitle = 'Add Promotion';
    }
  }

  iskeyCombination() {
    let keySequence: any[] = this.parentFormGroup.get('keySequence').value;
    if (keySequence) {
      if (
        keySequence.includes('majorCategory') ||
        keySequence.includes('itemGroup')
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
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
          newKeySequence.push(x.label);
        }
      });
    });
    this.parentFormGroup.get('keySequence').setValue(newKeySequence);
  }
  validSelections(): boolean {
    // condition to check if all the key selections has selected values > 0
    const ks: any[] = this.parentFormGroup.get('keySequence').value;
    const pfg = this.parentFormGroup.value;
    let counter = 0;
    ks.forEach((key) => {
      if (key == 'country' && pfg.country.length) {
        counter++;
      } else if (key == 'regions' && pfg.region.length) {
        counter++;
      } else if (key == 'area' && pfg.area.length) {
        counter++;
      } else if (key == 'route' && pfg.route.length) {
        counter++;
      } else if (key == 'salesOrganisation' && pfg.salesOrganisation.length) {
        counter++;
      } else if (key == 'channel' && pfg.channel.length) {
        counter++;
      } else if (key == 'customerCategory' && pfg.customerCategory.length) {
        counter++;
      } else if (key == 'customer' && pfg.customer.length) {
        counter++;
      } else if (key == 'majorCategory' && pfg.majorCategory.length) {
        counter++;
      } else if (key == 'itemGroup' && pfg.itemGroup.length) {
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
    //console.log(this.isEditForm);
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
    let fd = this.parentFormGroup.value;
    if (this.isEditForm) {
      let payload = {
        combination_plan_key_id: fd.combinationKeyPlan,
        use_for: 'Promotion',
        name: fd.name,
        start_date: fd.startDate,
        end_date: fd.endDate,
        combination_key_value: fd.keySequence,
        priority_sequence: 1,
        order_item_type: fd.orderType,
        offer_item_type: fd.offerType,
        status: 1,
        country_ids: fd.country,
        region_ids: fd.region,
        area_ids: fd.area,
        promotion_items: fd.orderItems,
        promotion_offer_items: fd.offerItems,
        sub_area_ids: null,
        route_ids: fd.route,
        sales_organisation_ids: fd.salesOrganisation,
        channel_ids: fd.channel,
        sub_channel_ids: null,
        customer_category_ids: fd.customerCategory,
        customer_ids: fd.customer,
        item_major_category_ids: fd.majorCategory,
        item_sub_category_ids: null,
        item_group_ids: fd.itemGroup,
      };

      //console.log(JSON.stringify(payload));

      this.apiService
        .editPromotion(this.editData.uuid, payload)
        .subscribe((res) => {
          this.router.navigate(['pricing-plan/promotion']);
        });
    } else {
      let payload = {
        combination_plan_key_id: 1,
        use_for: 'Promotion',
        name: fd.name,
        start_date: fd.startDate,
        end_date: fd.endDate,
        combination_key_value: fd.keySequence,
        priority_sequence: 1,
        order_item_type: fd.orderType,
        offer_item_type: fd.offerType,
        status: 1,
        country_ids: fd.country,
        region_ids: fd.region,
        area_ids: fd.area,
        promotion_items: fd.orderItems,
        promotion_offer_items: fd.offerItems,
        sub_area_ids: null,
        route_ids: fd.route,
        sales_organisation_ids: fd.salesOrganisation,
        channel_ids: fd.channel,
        sub_channel_ids: null,
        customer_category_ids: fd.customerCategory,
        customer_ids: fd.customer,
        item_major_category_ids: fd.majorCategory,
        item_sub_category_ids: null,
        item_group_ids: fd.itemGroup,
      };

      //console.log(JSON.stringify(payload));

      this.apiService.addPromotion(payload).subscribe((res) => {
        this.router.navigate(['pricing-plan/promotion']);
      });
    }
  }
}
