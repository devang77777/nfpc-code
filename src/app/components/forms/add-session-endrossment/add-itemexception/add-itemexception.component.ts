import { Component, OnInit } from '@angular/core';
export interface PeriodicElement {
  CustomerCode: string;
  CustomerName: string;
  CategoryName: string;
  Lastday: number;
  Toatlvalue:number;
  ReturnValue:number;
  Return:number;
  Cost:number;
  Salevalue:number;

}

@Component({
  selector: 'app-add-itemexception',
  templateUrl: './add-itemexception.component.html',
  styleUrls: ['./add-itemexception.component.scss']
})
export class AddItemexceptionComponent implements OnInit {
  displayedColumns: string[] = ['CustomerCode', 'CustomerName', 'CategoryName', 'CategoryName','Lastday','Toatlvalue','ReturnValue','Return','Cost',
  'Salevalue'];
   ELEMENT_DATA: any = [
    {CustomerCode:"Tset", CustomerName:"1", CategoryName: "qw",Lastday:2,  Toatlvalue:23234,
    ReturnValue:23,Return:23,Cost:23,Salevalue:2}

  ];
  constructor() { }

  ngOnInit(): void {
  }

}
