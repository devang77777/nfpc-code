import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-wastage',
  templateUrl: './add-wastage.component.html',
  styleUrls: ['./add-wastage.component.scss']
})
export class AddWastageComponent implements OnInit {
  displayedColumns: string[] = ['Difference', 'Variance', 'RouteCode','RouteName','TransferlocationCode','ActualItemCode','ItemshortDescription',
'Transoutqntotiy','Transoutamount']
ELEMENT_DATA: any = [
    {Difference:"12345", Variance:"test", RouteCode:"test001",RouteName:"test001",TransferlocationCode:"test001",ActualItemCode:"test001"
  ,ItemshortDescription:"test001",Transoutqntotiy:"test001",Transoutamount:"test001"}

  ];
  constructor() { }

  ngOnInit(): void {
  }

}
