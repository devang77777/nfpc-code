import { Component, OnInit } from '@angular/core';
export interface PeriodicElement {
  Invoice: number;
  customerCode: string;
  customername: string;
  FOCPC5:number;
  FocVal:number;
}

@Component({
  selector: 'app-add-foc',
  templateUrl: './add-foc.component.html',
  styleUrls: ['./add-foc.component.scss']
})
export class AddFocComponent implements OnInit {
  displayedColumns: string[] = ['Invoice', 'customerCode', 'customername','FOCPC5','FocVal']
  ELEMENT_DATA: any = [
    {Invoice:12345, customerCode:"test", customername:"test",FOCPC5:1234,FocVal:1234}
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
