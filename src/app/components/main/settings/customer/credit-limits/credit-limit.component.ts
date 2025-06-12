import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator} from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { Credit, Lob } from './credit';

@Component({
  selector: 'app-credit-limit',
  templateUrl: './credit-limit.component.html',
  styleUrls: ['./credit-limit.component.scss']
})
export class CreditLimitComponent implements AfterViewInit, OnInit {

  // @ViewChild(MatSort) sort: MatSort;
  // @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
   
  creditform : FormGroup;
  addLobForm : FormGroup;
  addCreditLimits:any;
  customerBasedLimit: any;

  credits: Credit[] = [];

  lobList: Lob[] =[];
  data: any;
  credit_limit_type: any;

  public selected : Boolean  = false;
  public selected1 : Boolean  = false;

  public addlob: Boolean = false;
  public showLobs: Boolean = false;

  

  public displayedColumns = ['Name','actions'];
  // dataSource = new MatTableDataSource(this.lobList);
  dataSource: MatTableDataSource<any>;
  // dataSource: any;
   
 

  constructor(private apiService: ApiService,
    private cts: CommonToasterService) { 
      this.creditform = new FormGroup({
        credit_limit_type: new FormControl('', Validators.required),
      });

      // this.dataSource = new MatTableDataSource<any>();
    };

    
    

  ngOnInit(): void {
   
    this.getCredit();
    this.creditform.reset();
    this.getLob();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
   }
 
  get f(){
    return this.creditform.controls;
  }

  addLobForm = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  

  addLob(){
      this.apiService.addLob(this.addLobForm.value).subscribe(response => {
        console.log("LOB", response);
      this.cts.showSuccess("", "LOB Saved Successfully");
      this.addLobForm.reset();
      this.showLobs=true;
      });
      this.getLob();
  }

  getLob(){
    
    this.apiService.getLobs().subscribe(lobs => {
      console.log("resonseLobs", lobs.data);
       this.dataSource = lobs.data;
    })
    
  }

  postCreditLimits(){
    this.apiService.addCreditLimits(this.creditform.value).subscribe(result  => {
      console.log("result", result);
      this.cts.showSuccess("", "Saved Successfully");
      console.log('Post created successfully!');
    })       
  }

  getCredit() {
    this.apiService.getCreditLimits().subscribe(data => {
      console.log('getCredits', data.data.credit_limit_type)
      this.credit_limit_type = data.data.credit_limit_type;
      console.log('formGroup', this.creditform);
      if(this.credit_limit_type == 1){
        this.selected = true;
      }
      else if(this.credit_limit_type == 2){
        this.selected1 = true;
      }
    });
  }

  changeCreditLimit(e) {
    console.log(e.target.value);
    if(e.target.value == 2){
      this.addlob = true;
    }
  }

  public editItemCode(num: number, itemCodeData: any): void {

  }

  

//  public deleteLob(id) {
//     this.apiService.deleteLob(id).subscribe(res => {
//       this.lobList.splice(id, 1);
//     });
// }
   

}
