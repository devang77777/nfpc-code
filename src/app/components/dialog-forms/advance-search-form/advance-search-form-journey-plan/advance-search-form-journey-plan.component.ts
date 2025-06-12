import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-advance-search-form-journey-plan',
  templateUrl: './advance-search-form-journey-plan.component.html',
  styleUrls: ['./advance-search-form-journey-plan.component.scss']
})
export class AdvanceSearchFormJourneyPlanComponent implements OnInit {
  form: FormGroup
  statusList: Array<any> = STATUS;
  @Input() routes: Array<any> = [];
  @Input() salesman: Array<any> = [];
  salesmansFormControl = new FormControl([]);
  routesFormControl = new FormControl([]);
  domain = window.location.host;
  constructor(private apiService: ApiService) {

  }
  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('journey_plan'),
      salesman: new FormControl(),
      route: new FormControl(),
      name: new FormControl(),
    })
  }

  selectionchangedSalesman() {
    let salesman = this.salesmansFormControl.value;
    this.form.patchValue({
      salesman: salesman[0].id
    });
  }
  selectionchangedRoute() {
    let route = this.routesFormControl.value;
    this.form.patchValue({
      route: route[0].id
    });
  }


}
