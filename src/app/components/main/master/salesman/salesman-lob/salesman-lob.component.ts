import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { Lob } from '../../../settings/customer/credit-limits/credit';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-salesman-lob',
  templateUrl: './salesman-lob.component.html',
  styleUrls: ['./salesman-lob.component.scss']
})
export class SalesmanLobComponent implements OnInit {

  addLobForm: FormGroup;


  lobList: Lob[] = [];

  public lob: Lob;

  public showForm: boolean;
  public isEditForm: boolean;
  public name: FormControl;
  private uuid: string;

  constructor(private apiService: ApiService,
    private cts: CommonToasterService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<SalesmanLobComponent>) { }

  ngOnInit(): void {

    this.addLobForm = new FormGroup({
      name: new FormControl('', Validators.required),
    });

    this.getLob();
  }

  public editLob(data: any): void {
    this.addLobForm.get('name').setValue(data.name);
    this.uuid = data.uuid;
    this.isEditForm = true;
    this.showForm = true;
  }


  saveLob() {
    if (this.isEditForm) {
      this.updateLob();

      return;
    }

    this.addLob();
  }


  addLob() {
    this.apiService.addLob(this.addLobForm.value).subscribe(response => {
      this.cts.showSuccess("", "LOB Saved Successfully");
      this.reset();
      this.getLob();
    });
    this.showForm = false;
  }

  updateLob() {
    this.apiService.updateLob(this.uuid, this.addLobForm.value).subscribe(response => {
      this.cts.showSuccess("", "LOB Updated Successfully");
      this.reset();
      this.getLob();
    });
    this.showForm = false;
  }

  addNewLob() {
    this.showForm = true;
    this.isEditForm = false;
    this.reset();
  }

  reset() {

    this.addLobForm.reset();
  }

  getLob() {

    this.apiService.getLobs().subscribe(lobs => {
      this.lobList = lobs.data;
    })

  }


  // public delete(data: any): void {
  //   this.subscriptions.push(
  //     this.apiService.deleteCustomerCategory(data.uuid).subscribe(() => {
  //       this.getCategory();
  //     })
  //   );
  // }

  public delete(data: any): void {
    this.apiService.deleteLob(data.uuid).subscribe(res => {
      this.cts.showInfo(
        'Deleted',
        'Sucessfully Deleted Lob'
      );
      this.getLob();
    })
  }

  public applyLob(data: any): void {
    this.dialogRef.close(data);
  }

}
