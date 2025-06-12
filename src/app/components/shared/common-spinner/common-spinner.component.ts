import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Subject } from "rxjs";
import { map, startWith, delay, tap } from "rxjs/operators";
import { CommonSpinnerService } from './common-spinner.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-common-spinner',
  templateUrl: './common-spinner.component.html',
  styleUrls: ['./common-spinner.component.scss']
})
export class CommonSpinnerComponent implements OnInit, AfterViewInit {
  color = 'primary';
  mode = 'indeterminate';
  isLoading: Subject<boolean> = this.spinnerService.isLoading;

  constructor(private spinnerService: CommonSpinnerService, private ngxSpinnerService: NgxSpinnerService) { }

  ngOnInit(): void {
    this.spinnerService.isLoading.pipe(
      startWith(false),
      delay(10),
    ).subscribe(res => {
      if (res) {
        this.ngxSpinnerService.show();
      }
      else {
        this.ngxSpinnerService.hide();
      }
    });
  }

  ngAfterViewInit() {
    this.spinnerService.isLoading.pipe(
      startWith(false),
      delay(10),
    ).subscribe(res => {
      if (res) {
        this.ngxSpinnerService.show();
      }
      else {
        this.ngxSpinnerService.hide();
      }
    });
  }
}
