import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { ApiService } from '../../../services/api.service';
import { Utils } from '../../../services/utils';
import { MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-reason-form',
  templateUrl: './reason-form.component.html',
  styleUrls: ['./reason-form.component.scss']
})
export class ReasonFormComponent implements OnInit, OnDestroy {

  public showForm: boolean;
  public isEditForm: boolean;
  public reasonData: Array<any> = [];
  public isLoaded: boolean = false;
  public reasonForm: FormGroup;
  public reasonFormControl: FormControl;
  public parentFormControl: FormControl;
  public nodeLevelFormControl: FormControl;
  public statusFormControl: FormControl;

  private subscriptions: Subscription[] = [];
  private apiService: ApiService;
  private dialogRef: MatDialogRef<ReasonFormComponent>;
  private uuid: string;

  constructor(apiService: ApiService, dialogRef: MatDialogRef<ReasonFormComponent>) {
    Object.assign(this, { apiService, dialogRef });
  }

  public ngOnInit(): void {
    this.reasonFormControl = new FormControl('', Validators.required);
    this.parentFormControl = new FormControl();
    this.nodeLevelFormControl = new FormControl(0);
    this.statusFormControl = new FormControl(1);

    this.reasonForm = new FormGroup({
      name: this.reasonFormControl,
      parent_id: this.parentFormControl,
      node_level: this.nodeLevelFormControl,
      status: this.statusFormControl
    });

    this.subscriptions.push(this.apiService.getReasonlist().subscribe(result => {
      this.reasonData = result.data;
      this.isLoaded = true;
    }));
  }

  public reasonProvider(): Observable<any[]> {
    return this.apiService.getReasonlist().pipe(map(result => result.data));
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public reasonSelected(data: any): void {
    this.parentFormControl.setValue(data.id);
    this.nodeLevelFormControl.setValue(Number(data.node_level) + 1);
  }

  public editReason(data: any): void {
    this.reasonFormControl.setValue(data.name);
    this.parentFormControl.setValue(data.parent_id);
    this.nodeLevelFormControl.setValue(data.node_level);
    this.statusFormControl.setValue(data.status);
    this.uuid = data.uuid;
    this.isEditForm = true;
    this.showForm = true;
  }

  public addNewReason(): void {
    this.showForm = true;
    this.isEditForm = false;
    this.reasonForm.reset({
      name: '',
      parent_id: null,
      node_level: 0,
      status: 1
    });
  }

  public applyReason(data: any): void {
    this.dialogRef.close(data);
  }

  public deleteReason(data: any): void {
    this.subscriptions.push(this.apiService.deleteMajor(data.uuid)
      .subscribe(() => {
        this.apiService.getReasonlist().subscribe(result => {
          this.reasonData = result.data;
        });
      }));
  }

  public saveReasonData(): void {
    if (this.reasonForm.invalid) {
      Object.keys(this.reasonForm.controls).forEach(key => {
        this.reasonForm.controls[key].markAsDirty();
      });
      return;
    }

    if (this.isEditForm) {
      this.editReasonData();

      return;
    }

    this.postReasonData();
  }

  private postReasonData(): void {
    this.subscriptions.push(this.apiService.addReasonItem(this.reasonForm.value)
      .subscribe(() => {
        this.showForm = false;
        this.isLoaded = false;
        this.apiService.getReasonlist().subscribe(result => {
          this.reasonData = result.data;
          this.isLoaded = true;
        });
      }));
  }

  private editReasonData(): void {
    this.subscriptions.push(this.apiService.editReasonItem(this.uuid, this.reasonForm.value)
      .subscribe(() => {
        this.isEditForm = false;
        this.showForm = false;
        this.fetchApiCategories();
      }));
  }

  private fetchApiCategories(): void {
    this.subscriptions.push(this.apiService.getReasonlist().subscribe(result => {
      this.reasonData = result.data;
    }));
  }
}
