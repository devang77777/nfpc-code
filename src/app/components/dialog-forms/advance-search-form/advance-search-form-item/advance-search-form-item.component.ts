import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';
import { MasterService } from 'src/app/components/main/master/master.service';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-advance-search-form-item',
  templateUrl: './advance-search-form-item.component.html',
  styleUrls: ['./advance-search-form-item.component.scss']
})
export class AdvanceSearchFormItemComponent implements OnInit {
  statusList: Array<any> = STATUS;
  form: FormGroup
  public majorCategories: any[] = [];
  public subCategories;
  public itemGroups = [];
  public brands: any[] = [];
  constructor(private masterService: MasterService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('item'),
      item_name: new FormControl(),
      current_stage: new FormControl(),
      price: new FormControl(),
      item_code: new FormControl(),
      brand_id: new FormControl(),
      item_major_category_id: new FormControl(),
      erp_code: new FormControl(),
      item_group_id: new FormControl(),
    })
    this.loadFormData();
  }
  public categoryProvider(): Observable<any[]> {
    return this.apiService
      .getAllMajorCategorires()
      .pipe(map((result) => result.data));
  }
  public brandProvider(): Observable<any[]> {
    return this.apiService.getAllBrands().pipe(map((result) => result.data));
  }
  public categorySelected(data: any): void {
    this.form.get('item_major_category_id').setValue(data.id);
  }
  public brandSelected(data: any): void {
    this.form.get('brand_id').setValue(data.id);
  }
  loadFormData() {

    const obj = {
      list_data: ['major_category', 'brand', 'item_group'],
    };
    this.masterService
      .masterList(obj).subscribe(response => {
        this.majorCategories = response.data.item_major_category;
        this.brands = response.data.brand;
        this.itemGroups = response.data.item_group;
      })
  }
}
