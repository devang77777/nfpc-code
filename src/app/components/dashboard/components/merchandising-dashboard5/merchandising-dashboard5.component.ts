import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-merchandising-dashboard5',
  templateUrl: './merchandising-dashboard5.component.html',
  styleUrls: ['./merchandising-dashboard5.component.scss']
})
export class MerchandisingDashboard5Component implements OnInit {
  dimensions: any[] = [];
  time: any[] = [];
  metrics: any[] = [];
  constructor() { }

  ngOnInit(): void {
    this.dimensions = ['Outlet', 'REs', 'Channel', 'Customer', 'Brand', 'Category', 'Sub Category', 'Segment', 'SKU', 'Region Manager', 'Area Manager', 'Supervisor', 'Sales Rep']
    this.time = ['Survey Week', 'Month Name']
    this.metrics = ['Coverage', 'Execution', 'Active Outlet', 'Visits Per Day', 'Strike Rat']
  }

}
