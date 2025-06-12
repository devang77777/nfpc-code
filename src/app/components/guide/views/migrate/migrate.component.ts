import { Component, Inject, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-migrate',
  templateUrl: './migrate.component.html',
  styleUrls: ['./migrate.component.scss']
})
export class MigrateComponent implements OnInit {
  step: string;
  constructor(private router: Router,) {
  }
  ngOnInit(): void {
    this.step = 'step1'
  }
}
