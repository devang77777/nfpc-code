import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-load-request-form',
  templateUrl: './load-request-form.component.html',
  styleUrls: ['./load-request-form.component.scss']
})
export class LoadRequestFormComponent implements OnInit {

  // loadFormGroup: FormGroup;
  // submitted = false;

  ngOnInit(): void {
  }
}

  // public pageTitle: string;
  // private router: Router;


  // constructor(private formBuilder: FormBuilder,
  //   router: Router,
  //   route: ActivatedRoute) { }

  //     ngOnInit(): void {
  //       this.loadFormGroup = this.formBuilder.group({
  //         loadType: ['', Validators.required],
  //         first_name: ['', Validators.required],
  //         load_number: ['', Validators.required],
  //         load_type: ['', Validators.required],
  //         created_at: ['', Validators.required],
  //         route_name: ['', Validators.required]
  //     });
  //   }

 
  // get f() { return this.loadFormGroup.controls; }

  //     public goBackToOrdersList(): void {
  //       this.router.navigate(['target/load']);
  //     }



  //   if () {
  //     this.pageTitle = 'Edit Order';
      
  //   } else {
  //     this.pageTitle = 'Add Order';
      
  //   }
 


