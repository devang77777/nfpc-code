import { Component, OnInit, OnChanges, Input, ViewChild, SimpleChanges } from '@angular/core';
import { MerchandisingService } from '../../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-demage-list',
  templateUrl: './demage-list.component.html',
  styleUrls: ['./demage-list.component.scss']
})
export class DemageListComponent implements OnInit {
  @Input() public damageData;
  @Input() public distribution_id;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  selectedColumnFilter: string;
  filterForm: FormGroup;

  private subscriptions: Subscription[] = [];
  public displayedColumns = ['created_at', 'salesman', 'customerCode', 'customer', 'distribution_name', 'itemCode', 'item', 'damage_item_qty', 'expire_item_qty', 'saleable_item_qty'];
  public dateFilterControl;
  constructor(public fb: FormBuilder, private merService: MerchandisingService) {
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    let today = new Date();
    let month = '' + (today.getMonth() + 1);
    let date = '' + (today.getDate());
    if ((today.getMonth() + 1) < 10) {
      month = '0' + (today.getMonth() + 1);
    }
    if ((today.getDate()) < 10) {
      date = '0' + (today.getDate());
    }
    let newdate = today.getFullYear() + '-' + month + '-' + date;
    this.dateFilterControl = new FormControl(newdate);
    this.filterForm = this.fb.group({
      distribution_id: [this.distribution_id],
      date: [''],
      salesman_name: [''],
      item_name: [''],
      item_code: [''],
      customer_name: [''],
      customer_code: [''],
      distribution_name: [''],
      today: [newdate],
      all: false
    })
    this.itemSource = new MatTableDataSource<any>(this.damageData);
    this.itemSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.damageData) {
        let currentValue = changes.damageData.currentValue;
        this.damageData = currentValue;
        this.itemSource = new MatTableDataSource<any>(this.damageData);
        this.itemSource.paginator = this.paginator;
      }
    }
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    }
    this.filterData();
  }
  getDamageItemList(filter, value) {

    if (filter == "date") {
      value = this.dateFilterControl.value;
      this.filterForm.get('all').setValue(false);
    }
    if (value == "") return false;
    this.filterForm.get(filter).setValue(value);
    this.filterForm.get('distribution_id').setValue(this.distribution_id);
    this.filterData();
  }

  filterData() {
    this.subscriptions.push(
      this.merService.getDamageItemList(this.filterForm.value).subscribe((res) => {
        this.itemSource = new MatTableDataSource<any>(res.data);
        this.itemSource.paginator = this.paginator;
      })
    )
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

}
