import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ReplaceService } from '../../replace.service';

@Component({
  selector: 'app-replace',
  templateUrl: './replace.component.html',
  styleUrls: ['./replace.component.scss']
})
export class ReplaceComponent extends BaseComponent implements OnInit {

  @ViewChild('formDrawer') formDrawer: MatDrawer;
  public isDetailVisible: boolean;
  public replaceList: any[];
  public salesmanList: any[];
  public newBankData = {};
  public type = "";

  constructor(
    private fds: FormDrawerService,
    public cts: CommonToasterService,
    private service: ReplaceService
  ) {
    super('Replace');
  }

  ngOnInit(): void {
    this.getReplace();
  }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.formDrawer);
  }
  getReplace() {
    this.service.getReplace().subscribe((result: any) => {
      this.replaceList = result.data;
    });
    this.service.salesmanList().subscribe((result: any) => {

      this.salesmanList = result.data.map(item => {
        if (item.user !== null) {
          item['user']['lastname'] = [item.user?.lastname, item.salesman_code].join(" - ")
          return item;
        }
        return item;
      });

    });
  }
  addReplace(type) {
    this.type = type;
    this.fds.setFormName('add-reason');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public updateTableData({ status, data }) {
    if (status === 'edit') {
      const index = this.replaceList.findIndex((x) => x.uuid == data.uuid);
      const array = [...this.replaceList];
      array[index] = data;
      this.replaceList = array;
    } else {
      const new_salesman = this.salesmanList.find(x => x.user_id == data.new_salesman_id);
      const old_salesman = this.salesmanList.find(x => x.user_id == data.old_salesman_id);
      this.replaceList = [...this.replaceList, { ...data, new_salesman: new_salesman.user, old_salesman: old_salesman.user }];
    }
  }
  public onRemove(uuid) {
    const index = this.replaceList.findIndex((x) => x.uuid == uuid);
    if (index > -1) {
      const array = [...this.replaceList];
      array.splice(index, 1);
      this.replaceList = [...array];
    }
  }

}
