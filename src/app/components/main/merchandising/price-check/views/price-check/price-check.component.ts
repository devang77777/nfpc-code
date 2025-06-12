import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { ApiService } from 'src/app/services/api.service';
import { MerchandisingService } from '../../../merchandising.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-price-check',
  templateUrl: './price-check.component.html',
  styleUrls: ['./price-check.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class PriceCheckComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  public displayedColumns = ['date', 'merchandiser', 'customer_code', 'customer', 'brand'];
  public apiResponse = {
    pagination: {
      total_records: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  selectedColumnFilter: string;
  filterForm: FormGroup;
  expandedId: string = '';

  expandedElement: any | null;
  constructor(private _service: MerchandisingService, public fb: FormBuilder,
    private apiService: ApiService
  ) {
  }
  data = [];

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      customer_name: [''],
      customer_code: [''],
      salesman_name: [''],
      brand: [''],
      page: [this.page],
      page_size: [this.pageSize]
    })
    this.getData();
  }
  expandList(data) {
    this.expandedElement = this.expandedElement === data ? null : data;
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
    this.getData();
  }

  getData() {
    this._service.getPriceCheckList(this.filterForm.value).subscribe((res) => {
      this.apiResponse = res;
      this.updateTableData(res.data);
    })
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getData();
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
  updateTableData(data = []) {
    let newData = data.length > 0 ? data : this.data;
    this.itemSource = new MatTableDataSource<any>(newData);
  }
}
