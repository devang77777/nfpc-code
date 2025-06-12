import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { exists } from 'fs';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-pricing-detail-dt',
  templateUrl: './pricing-detail-dt.component.html',
  styleUrls: ['./pricing-detail-dt.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class PricingDetailDtComponent implements OnInit, OnChanges {
  @Input() public pricing: any[];

  dataSource = new MatTableDataSource();
  columnsToDisplay = ['name', 'description'];
  expandedElement: PeriodicElement | null;
  isPriceRangeActive: boolean = false;
  constructor(private apiService: ApiService) { }
  @ViewChild('selectedPrincingMatPaginator', { static: true }) selectedPrincingMatPaginator: MatPaginator;

  ngOnInit(): void {
  }
  ngOnChanges(): void {
    // let itemPricing: any[] = [];
    // let finalItemPricing: any[] = [];
    // this.pricing.forEach(item => {
    //   itemPricing.push({
    //     name: item.item.item_name,
    //     description: '',
    //     uoms: [{ name: item.item_uom.name, id: item.item_uom_id, price: item.price }]
    //   })
    // })
    // var output = [];

    // itemPricing.forEach(function (item) {
    //   var existing = output.filter(function (v, i) {
    //     return v.name == item.name;
    //   });
    //   if (existing.length) {
    //     var existingIndex = output.indexOf(existing[0]);
    //     output[existingIndex].uoms = output[existingIndex].uoms.concat(item.uoms);
    //   } else {
    //     // item.uoms = [item.uoms];
    //     output.push(item);
    //   }
    // });

    // console.dir(output);
    this.apiService.getOrganisationSettings(localStorage.getItem('organisationGeneralRangeuuId'))
      .subscribe(res => {
        this.isPriceRangeActive = res.data?.main_price_active == '1'
      });
    this.dataSource = new MatTableDataSource(this.pricing);
    this.dataSource.paginator = this.selectedPrincingMatPaginator;

  }

}
export interface PeriodicElement {
  name: string;
  description: string;
  uoms: any[]
}

