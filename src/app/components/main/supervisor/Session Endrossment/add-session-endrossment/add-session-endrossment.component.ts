import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-add-session-endrossment',
  templateUrl: './add-session-endrossment.component.html',
  styleUrls: ['./add-session-endrossment.component.scss']
})
export class AddSessionEndrossmentComponent implements OnInit {

  public SessionFormGroup: FormGroup;
  public dateFormControl: FormControl;
  public routeFormControl: FormControl;
  public storeRoute: any[] = [];
  public subscription: Subscription[] = []
  public showStepper: boolean = false;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.buildForm()
    this.subscription.push(this.apiService.getAllRoute().subscribe((res) => {
      this.storeRoute = res.data;
      //console.log(res);
    }))

  }

  public buildForm() {
    this.dateFormControl = new FormControl('', [Validators.required]);
    this.routeFormControl = new FormControl('', [Validators.required]);
    this.SessionFormGroup = new FormGroup({
      date: this.dateFormControl,
      route: this.routeFormControl
    })

  }
  checkChange(changeControl: FormControl) {
    //console.log(changeControl);
  }
  openStepper() {
    this.showStepper = true;
  }
  close() {
    this.showStepper = false;
  }
}
