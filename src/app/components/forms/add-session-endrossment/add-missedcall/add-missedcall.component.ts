import { Component, OnInit } from '@angular/core';

export interface PeriodicElement {
  CustomerName: string;
  CustomerCode: string;
  CategoryName: string;
  LastDay: number;
  Tot_Value:number;
  sal_value:number;
  Return:number;
  Returnvalue:number;
  Calls:number;

}


@Component({
  selector: 'app-add-missedcall',
  templateUrl: './add-missedcall.component.html',
  styleUrls: ['./add-missedcall.component.scss']
})
export class AddMissedcallComponent implements OnInit {
  displayedColumns: string[] = ['CustomerCode', 'CategoryName', 'CustomerName','LastDay','Tot_Value','sal_value','Return','Returnvalue',
  'Calls'];
  ELEMENT_DATA: any = [
    {CustomerName:"Tset", CustomerCode:"1", CategoryName: "qw",LastDay:2,  Tot_Value:23234,
    sal_value:23,Return:23,Returnvalue:23,Calls:2}

  ];
  constructor() { }

  ngOnInit(): void {
  }

}
