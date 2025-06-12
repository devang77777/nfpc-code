import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { MasterService } from 'src/app/components/main/master/master.service';

@Injectable({ providedIn: 'root' })
export class AdvanceSearchService {
  obj = {
    "list_data": ["country", "region", "sales_organisation", "area",
      "channel", "customer_category", "route", "salesman", "customer", "merchandiser", "item", "brand", "brand_list", "major_category", "major_category_list", "customer_type", "payment_term", "promotional_item",'storage_location','order_users'],
    "function_for": "customer"
  }
  constructor(private masterService: MasterService) { }

  getCustomerMasterData() {
    return this.masterService.masterList(this.obj).pipe(map(result => result));
  }

}