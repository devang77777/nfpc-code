import { Component, OnInit } from '@angular/core';
export interface PeriodicElement {
  Category: string;
  CustomerCode: string;
  ItemDescription: string;
  NetSalVal: number;
  NetSalvol:number;
  NetSalPcs:number;
  WStPcs:number;
  WSTLTR:number;
  WST:number;

}

@Component({
  selector: 'app-add-itemwise',
  templateUrl: './add-itemwise.component.html',
  styleUrls: ['./add-itemwise.component.scss']
})
export class AddItemwiseComponent implements OnInit {
  displayedColumns: string[] = ['Category', 'CustomerCode','NetSalVal','NetSalvol','NetSalPcs','WStPcs','WSTLTR',
  'WST'];
 ELEMENT_DATA: any = [
    {Category:"Tset", CustomerCode:"1",NetSalVal:2,  NetSalvol:23234,
    NetSalPcs:23,WStPcs:23,WSTLTR:23,WST:2}
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
