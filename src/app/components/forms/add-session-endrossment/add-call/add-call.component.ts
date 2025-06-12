import { Component, OnInit } from '@angular/core';
export interface PeriodicElement {
  categoryname: string;
  Scheduled: number;
  Visited: number;
  ScheduledSale: number;
  ScheduledNosale:number;
  UnscheduledNoSale:number;
  UnscannedCost:number;
  RoutetimeSendedInminute:number;
  cashSale:number;
  Creditsale:number;
}


@Component({
  selector: 'app-add-call',
  templateUrl: './add-call.component.html',
  styleUrls: ['./add-call.component.scss']
})
export class AddCallComponent implements OnInit {
  displayedColumns: string[] = ['categoryname', 'Scheduled', 'Visited', 'ScheduledSale','ScheduledNosale','UnscheduledNoSale','UnscannedCost','RoutetimeSendedInminute','cashSale',
  'Creditsale'];
   ELEMENT_DATA: any = [
    {categoryname:"Tset", Scheduled:1, Visited: 1,UnscheduledNoSale:2,ScheduledSale:23,
    ScheduledNosale:23,UnscannedCost:23,RoutetimeSendedInminute:23,cashSale:2,Creditsale:2}

  ];
  constructor() { }

  ngOnInit(): void {
  }

}
