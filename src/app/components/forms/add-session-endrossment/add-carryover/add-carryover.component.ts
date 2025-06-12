import { Component, OnInit } from '@angular/core';
export interface PeriodicElement {
  ItemCode: string;
  ItemDescription: string;
  Carryover: number;
}



@Component({
  selector: 'app-add-carryover',
  templateUrl: './add-carryover.component.html',
  styleUrls: ['./add-carryover.component.scss']
})
export class AddCarryoverComponent implements OnInit {
  displayedColumns: string[] = ['ItemCode', 'ItemDescription', 'Carryover']
 ELEMENT_DATA: any = [
    {ItemCode:"Tset", ItemDescription:"test", Carryover:1}

  ];
  constructor() { }

  ngOnInit(): void {
  }

}
