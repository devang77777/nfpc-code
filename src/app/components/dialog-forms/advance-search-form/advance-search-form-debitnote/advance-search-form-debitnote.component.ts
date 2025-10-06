import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS } from 'src/app/app.constant';
import { Subscription, Subject, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, mergeMap, delay } from 'rxjs/operators';
@Component({
  selector: 'app-advance-search-form-debitnote',
  templateUrl: './advance-search-form-debitnote.component.html',
  styles: [
  ]
})
export class AdvanceSearchFormDebitnoteComponent implements OnInit {
  salesmanList: any[] = [];
   SalesmanFormControl = new FormControl([]);
  salesmanSearchControl = new FormControl('');
  keyUp = new Subject<string>();
  // SalesmanFormControl = new FormControl([]);
filteredSalesmen: any[] = [];
  statusList:Array<any>=STATUS;
  @Input() salesman:Array<any>=[]
  form:FormGroup
  constructor() { }

  ngOnInit(): void {
   this.filteredSalesmen = this.salesman;

  this.salesmanSearchControl.valueChanges.subscribe((searchText: string) => {
    const value = (searchText || '').toLowerCase().trim();
    this.filteredSalesmen = this.salesman.filter(item =>
      (item.salesman_info?.salesman_code || '').toLowerCase().includes(value) ||
      (item.firstname || '').toLowerCase().includes(value) ||
      (item.lastname || '').toLowerCase().includes(value)
    );
  });
    this.form=new FormGroup({
      module:new FormControl('debit_note'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      debit_note_no: new FormControl(),
      customerName: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
      salesman: new FormControl(),
      current_stage: new FormControl(),
    })
      this.keyUp.pipe(
          map((event: any) => event.target.value),
          debounceTime(1000),
          distinctUntilChanged(),
          mergeMap(search => of(search).pipe(
            delay(100),
          )),
        ).subscribe(res => {
          if (!res) {
            res = '';
          }
          this.filterCustomers(res);
          
        });
  }

   filterCustomers(customerName: string) {
      // this.page = 1;
      // this.filterValue = customerName.toLowerCase().trim() || "";
      // // this.customers = [];
      // this.filterCustomer = this.customers
      //   .filter((x: any) =>
      //     x.customer_code?.toLowerCase().trim().indexOf(this.filterValue) > -1
      //     || x.name?.toLowerCase().trim().indexOf(this.filterValue) > -1)
  
  
      // this.filterCustomer = [];
      // this.isLoading = true
      // this.lookup$.next(this.page)
    }

      selectionchangedSalesman() {
    let user = this.SalesmanFormControl.value;

  // Extract the ids from the selected items
  const itemIds = user.map((item: any) => item.id);

  // Patch the form with the array of item IDs
  this.form.patchValue({
    salesman: itemIds
  });
    // this.form.patchValue({
    //   customerName: user[0].id
    //   // customerName: user[0].name
    // });
  }
}
