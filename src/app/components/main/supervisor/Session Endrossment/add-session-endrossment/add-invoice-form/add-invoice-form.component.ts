import { Component, OnInit } from '@angular/core';
export interface PeriodicElement {
  customername: string;
  customerCode: string;
  Date: string;
  invoice: string;
  category:string;
}

@Component({
  selector: 'app-add-invoice-form',
  templateUrl: './add-invoice-form.component.html',
  styleUrls: ['./add-invoice-form.component.scss']
})
export class AddInvoiceFormComponent implements OnInit {
  displayedColumns: string[] = ['customername', 'customerCode', 'Date', 'invoice','category','Class','CategoryName','NetSal_Val','NetSal_tax','Netsal_vol','WST_VAL','WST'];
   ELEMENT_DATA:any = [
    {customername:"Tset", customerCode: 'Cus001', Date: "22/12/2020",invoice:"234asd",category:"major",Class:"major",CategoryName:"major",NetSal_Val:"major",NetSal_tax:"major"
    ,Netsal_vol:"major",WST_VAL:"major",WST:"major"}
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
