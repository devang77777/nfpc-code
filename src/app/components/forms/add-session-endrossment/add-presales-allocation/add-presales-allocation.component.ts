import { Component, OnInit } from '@angular/core';
export interface PeriodicElement {
  itemdescrpition: number;
  itemcode: string;
  Pc: string;
  CSPC:number;

}


@Component({
  selector: 'app-add-presales-allocation',
  templateUrl: './add-presales-allocation.component.html',
  styleUrls: ['./add-presales-allocation.component.scss']
})

export class AddPresalesAllocationComponent implements OnInit {
  displayedColumns: string[] = ['itemdescrpition', 'itemcode', 'Pc','CSPC']
  ELEMENT_DATA:any = [
    {itemdescrpition:12345, itemcode:"test", Pc:"test",CSPC:1234}

  ];
  constructor() { }

  ngOnInit(): void {
  }

}
