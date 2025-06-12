import { SalesMan } from './../../../main/master/salesman/salesman-dt/salesman-dt.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { SalesPerson } from '../salesmandt/salesmandt.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';

@Component({
  selector: 'app-salesmanmaster',
  templateUrl: './salesmanmaster.component.html',
  styleUrls: ['./salesmanmaster.component.scss']
})
export class SalesmanmasterComponent implements OnInit {

  @ViewChild('formDrawer') BankFormDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public bank: SalesPerson;

  private fds: FormDrawerService;

  constructor(fds: FormDrawerService) {
    Object.assign(this, { fds });
  }
  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.BankFormDrawer);
  }
  openAddBank() {
    this.fds.setFormName('add-Salesperson');
    this.fds.setFormType("Add")
    this.fds.open();
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;
      this.bank = data;
    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }
}
