import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-advance-search-form-salesman-load',
  templateUrl: './advance-search-form-salesman-load.component.html',
  styleUrls: ['./advance-search-form-salesman-load.component.scss']
})
export class AdvanceSearchFormSalesmanLoadComponent implements OnInit {

  form: FormGroup
  statusList: Array<any> = STATUS;
  @Input() routes: Array<any> = []
  @Input() roles: Array<any> = []
  @Input() types: Array<any> = [];
  domain = window.location.host;
  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('saleman'),
      salesman_code: new FormControl(),
      firstname: new FormControl(),
      lastname: new FormControl(),
      email: new FormControl(),
      role_id: new FormControl(),
      route: new FormControl(),
      mobile: new FormControl(),
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
