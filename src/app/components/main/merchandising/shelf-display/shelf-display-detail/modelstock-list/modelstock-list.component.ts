import { Component, OnInit, OnChanges, Input, ViewChild, SimpleChanges } from '@angular/core';
import { MerchandisingService } from '../../../merchandising.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ShelfDisplay } from '../../shelf-display-interface';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-modelstock-list',
  templateUrl: './modelstock-list.component.html',
  styleUrls: ['./modelstock-list.component.scss']
})
export class ModelstockListComponent implements OnInit {
  @Input() public stockData;
  @Input() public distribution_id;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['created_at', 'salesman', 'customerCode', 'customer', 'ItemCode', 'item', 'capacity', 'saleable', 'is_out_of_stock'];
  public dateFilterControl;
  selectedColumnFilter: string;
  filterForm: FormGroup;
  constructor(private merService: MerchandisingService, public fb: FormBuilder,) {
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
      today: [newdate],
      all: false
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.stockData) {
        let currentValue = changes.stockData.currentValue;
        this.stockData = currentValue;
        this.itemSource = new MatTableDataSource<any>(this.stockData);
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
  getStockItemList(filter, value) {
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
      this.merService.getStockItemList(this.filterForm.value).subscribe((res) => {
        this.itemSource = new MatTableDataSource<ShelfDisplay>(res.data);
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
