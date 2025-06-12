import { ReasonService } from './../../reason.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';

@Component({
  selector: 'app-reason',
  templateUrl: './reason.component.html',
  styleUrls: ['./reason.component.scss'],
})
export class ReasonComponent extends BaseComponent implements OnInit {
  @ViewChild('formDrawer') reasonDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public reasonList: any[];
  public newBankData = {};

  constructor(
    private fds: FormDrawerService,
    public cts: CommonToasterService,
    private service: ReasonService
  ) {
    super('Reason');
  }

  ngOnInit(): void {
    this.getReasons();
  }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.reasonDrawer);
  }
  getReasons() {
    this.service.getReasons().subscribe((result: any) => {
      this.reasonList = result.data;
    });
  }
  addReason() {
    this.fds.setFormName('add-reason');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public updateTableData({ status, data }) {
    if (status === 'edit') {
      const index = this.reasonList.findIndex((x) => x.uuid == data.uuid);
      const array = [...this.reasonList];
      array[index] = data;
      this.reasonList = array;
    } else this.reasonList = [...this.reasonList, data];
  }
  public onRemove(uuid) {
    const index = this.reasonList.findIndex((x) => x.uuid == uuid);
    if (index > -1) {
      const array = [...this.reasonList];
      array.splice(index, 1);
      this.reasonList = [...array];
    }
  }
}
