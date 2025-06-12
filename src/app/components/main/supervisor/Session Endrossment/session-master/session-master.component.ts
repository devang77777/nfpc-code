import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Session } from '../session-endrossmentdt/session-endrossmentdt.component';
import { BaseComponent } from '../../../../../features/shared/base/base.component';

@Component({
  selector: 'app-session-master',
  templateUrl: './session-master.component.html',
  styleUrls: ['./session-master.component.scss'],
})
export class SessionMasterComponent extends BaseComponent implements OnInit {
  public isDetailVisible: boolean;
  public bank: Session;

  private fds: FormDrawerService;

  constructor(fds: FormDrawerService, private route: Router) {
    super('Session Endorsement');
    Object.assign(this, { fds });
  }
  ngOnInit(): void { }
  openAddBank() {
    this.route.navigate(['supervisor/session/add']);
  }

  public itemClicked(data: any): void {
    // if (data) {
    //   this.isDetailVisible = true;
    //   this.bank = data;
    // }
  }

  public closeClicked(): void {
    // this.isDetailVisible = false;
  }
}
