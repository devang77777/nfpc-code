import { Component, OnInit } from '@angular/core';
export interface PeriodicElement {
  itemcode: number;
  itemdescription: string;
  CGname: string;
}

@Component({
  selector: 'app-add-routetransfer',
  templateUrl: './add-routetransfer.component.html',
  styleUrls: ['./add-routetransfer.component.scss']
})
export class AddRoutetransferComponent implements OnInit {
  displayedColumns: string[] = ['itemcode', 'itemdescription', 'CGname']
ELEMENT_DATA: any = [
    {itemcode:12345, itemdescription:"test", CGname:"test"}

  ];
  constructor() { }

  ngOnInit(): void {
  }

}
