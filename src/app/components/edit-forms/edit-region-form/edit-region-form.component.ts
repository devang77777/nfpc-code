import { Component, OnInit } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { FormDataService } from 'src/app/services/form-data.service';

@Component({
  selector: 'app-edit-region-form',
  templateUrl: './edit-region-form.component.html',
  styleUrls: ['./edit-region-form.component.scss']
})
export class EditRegionFormComponent implements OnInit {
  regionEditForm: FormGroup;
  countries: any[];
  constructor(
    private fds: FormDrawerService,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private ds: FormDataService
  ) { }
  ngOnInit(): void {
    this.regionEditForm = this.formBuilder.group({
      // organisation_id: [],
      country_id: [''],
      region_code: [''],
      region_name: [''],
      region_status: ['1']
    })
    this.getCountries();
    this.getData();
  }
  getCountries() {
    this.apiService.getAllCountries().subscribe((res: any) => {
      this.countries = res.data;
    })
  }
  getData() {
    this.ds.getData().subscribe(data => {
      this.apiService.getRegion().subscribe(res => {
        data = res.data;
        this.regionEditForm.patchValue(res.data)
      });
    })

  }
  onSubmit() {
    this.apiService.editRegion(this.ds.getData(), JSON.stringify(this.regionEditForm.value)).subscribe(res => {
      //console.log(res);
      window.location.reload();
    })
  }
  close() {
    this.fds.close()
  }

}
