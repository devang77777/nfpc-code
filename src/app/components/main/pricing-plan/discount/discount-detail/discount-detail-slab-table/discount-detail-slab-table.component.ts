import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Discount } from '../../discount-dt/discount-dt.component';

@Component({
  selector: 'app-discount-detail-slab-table',
  templateUrl: './discount-detail-slab-table.component.html',
  styleUrls: ['./discount-detail-slab-table.component.scss']
})
export class DiscountDetailSlabTableComponent implements OnInit, OnChanges {
  @Input() editData;
  dataSource = new MatTableDataSource<any>();
  displayColumns = ['minSlab', 'filler', 'maxSlab', 'value', 'percentage'];
  discountType;
  constructor() { }

  ngOnInit(): void {
    // this.dataSource = new MatTableDataSource<any>(this.editData?.p_d_p_discount_slabs);
  }
  ngOnChanges(): void {
    this.discountType = this.editData.discount_type;
    if (this.discountType == "1") {
      this.displayColumns = ['minSlab', 'filler', 'maxSlab', 'value'];

      this.dataSource = new MatTableDataSource<any>(this.editData?.p_d_p_discount_slabs);
    }
    else {
      this.displayColumns = ['minSlab', 'filler', 'maxSlab', 'percentage'];
      this.dataSource = new MatTableDataSource<any>(this.editData?.p_d_p_discount_slabs);
    }

  }


}
// const slab = [
//   {
//     min_slab: "0",
//     max_slab: "50",
//     percentage: "",
//     value: "10"
//   },
//   {
//     min_slab: "51",
//     max_slab: "100",
//     percentage: "",
//     value: "5"
//   },
//   {
//     min_slab: "101",
//     max_slab: "251",
//     percentage: "",
//     value: "2"
//   }
// ]