import { Component, OnInit } from '@angular/core';
export interface PeriodicElement {
  CGname: string;
  DSalesLtr: number;
  DsalesVal: string;
  DWST: number;
  WsalesLtr:number;
  WSalesVal:number;
  WWat:number;
  mSalesltr:number;
  msalesval:number;
  mwat:number;
  Ysalesltr:number;
  YsalesVal:number;
  Ywat:number;

}


@Component({
  selector: 'app-add-item-group',
  templateUrl: './add-item-group.component.html',
  styleUrls: ['./add-item-group.component.scss']
})
export class AddItemGroupComponent implements OnInit {
  displayedColumns: string[] = ['CGname', 'DSalesLtr', 'DsalesVal', 'DWST','WsalesLtr','WSalesVal','WWat','mSalesltr','msalesval',
  'mwat','Ysalesltr','YsalesVal','Ywat'];
ELEMENT_DATA: any = [
    {CGname:"Tset", DSalesLtr:1, DsalesVal: "test",DWST:23,WsalesLtr:23,WSalesVal:23,WWat:23,mSalesltr:2,msalesval:2,
  mwat:23,Ysalesltr:23,YsalesVal:23,Ywat:23}

  ];
  constructor() { }

  ngOnInit(): void {
  }

}
