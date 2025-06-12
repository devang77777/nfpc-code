import { Component, OnInit } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
//import { vatgroup } from 'src/app/components/datatables/taxdt/taxdt.component';

@Component({
  selector: 'app-taxmaster',
  templateUrl: './taxmaster.component.html',
  styleUrls: ['./taxmaster.component.scss']
})
export class TaxmasterComponent  {

  public isDetailVisible: boolean;
  //public brand:vatgroup;

  private fds: FormDrawerService;

  constructor(fds: FormDrawerService) {
    Object.assign(this, { fds });
  }

  public openItemGroup() {
    this.fds.setFormName('TAX-SETTINGS');
    this.fds.setFormType("Add");
    this.fds.open();
  }

  public itemClicked(data: any): void {
    if (data) {
      this.isDetailVisible = true;

    }
  }

  public closeClicked(): void {
    this.isDetailVisible = false;
  }
}
