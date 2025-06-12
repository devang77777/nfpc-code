import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-advance-search-form-sos',
  templateUrl: './advance-search-form-sos.component.html',
  styleUrls: ['./advance-search-form-sos.component.scss']
})
export class AdvanceSearchFormSosComponent implements OnInit {

  statusList: Array<any> = STATUS;
  @Input() customer: Array<any> = []
  @Input() items: Array<any> = []
  @Input() brands: Array<any> = []
  @Input() categories: Array<any> = []
  @Input() merchandisers: Array<any> = []
  form: FormGroup;
  selectedIndex = 0;
  constructor(private router: Router, private route: ActivatedRoute) {
    if (this.router.url == '/merchandising/sos/share-of-shelf') {
      this.selectedIndex = 0;
    } else if (this.router.url == '/merchandising/sos/share-of-assortment') {
      this.selectedIndex = 1;
    } else if (this.router.url == '/merchandising/sos/share-of-display') {
      this.selectedIndex = 2;
    }
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('sos'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      customer: new FormControl(),
      merchandiser: new FormControl(),
      brand: new FormControl(),
      category: new FormControl(),
      item: new FormControl(),
    })
    this.selectedTabChange(this.selectedIndex);
  }

  selectedTabChange(index) {
    this.selectedIndex = index;
    let module = '';
    if (index == 0) {
      module = 'sos';
      this.router.navigate(['/merchandising/sos/share-of-shelf']);
    } else if (index == 1) {
      module = 'soa';
      this.router.navigate(['/merchandising/sos/share-of-assortment']);
    } else if (index == 2) {
      module = 'sod';
      this.router.navigate(['/merchandising/sos/share-of-display']);
    }
    this.form.patchValue({
      module: module
    })
  }



}
