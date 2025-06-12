import { Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-delivery-items-details',
  templateUrl: './delivery-items-details.component.html',
  styleUrls: ['./delivery-items-details.component.scss']
})
export class DeliveryItemsDetailsComponent implements OnInit,OnChanges {
  @ViewChild('formDrawer') fromDrawer: MatDrawer;

  constructor() {
    alert('hello1') 

   }

  ngOnInit(): void {
  }

  ngOnChanges(){
    alert('hello') 
  }
}
