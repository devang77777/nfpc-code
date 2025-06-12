import { STATUS } from './../../../../app.constant';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-advance-search-form-customer',
  templateUrl: './advance-search-form-customer.component.html',
  styleUrls: ['./advance-search-form-customer.component.scss']
})
export class AdvanceSearchFormCustomerComponent implements OnInit {
  form: FormGroup
  @Input() channels: Array<any> = []
  @Input() routes: Array<any> = []
  @Input() regions: Array<any> = []
  @Input() organizations: Array<any> = []
  statusList: Array<any> = STATUS
  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('customer'),
      firstname: new FormControl(),
      lastname: new FormControl(),
      customer_code: new FormControl(),
      email: new FormControl(),
      route: new FormControl(),
      region: new FormControl(),
      sales_organisation: new FormControl(),
      channel: new FormControl(),
      current_stage: new FormControl(),
    })
  }
  constructor(private apiService: ApiService) {

  }
  channelSelected(item) {
    this.form.get('channel').patchValue(item.id)
  }
  salesOrganisationSelected(item) {
    this.form.get('sales_organisation').patchValue(item.id)
  }

  public salesOrganisationProvider(): Observable<any[]> {
    return this.apiService.getAllSalesOrganisations().pipe(map((result) => result.data));
  }
  public channelProvider(): Observable<any[]> {
    return this.apiService.getAllChannels().pipe(map((result) => result.data));
  }
}
