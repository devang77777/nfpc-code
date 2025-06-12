import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { ApiService } from '../../../services/api.service';
import { Utils } from '../../../services/utils';
import { MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { BaseComponent } from 'src/app/features/shared/base/base.component';

@Component({
  selector: 'app-salesman-supervisor-form',
  templateUrl: './salesman-supervisor-form.component.html',
  styleUrls: ['./salesman-supervisor-form.component.scss']
})
export class SalesmanSupervisorFormComponent extends BaseComponent
  implements OnInit, OnDestroy {
  public showForm: boolean;
  public isEditForm: boolean;
  public salesOrganisationData: Array<any> = [];
  public isLoaded: boolean = false;
  public salesOrganisationForm: FormGroup;
  public salesOrganisationFormControl: FormControl;
  public parentFormControl: FormControl;
  public nodeLevelFormControl: FormControl;
  public statusFormControl: FormControl;

  private subscriptions: Subscription[] = [];
  private apiService: ApiService;
  private dialogRef: MatDialogRef<SalesmanSupervisorFormComponent>;
  private uuid: string;
  constructor(
    apiService: ApiService,
    dialogRef: MatDialogRef<SalesmanSupervisorFormComponent>) {
    super('salesman supervisor');
    Object.assign(this, { apiService, dialogRef });
  }

  public ngOnInit(): void {
    this.salesOrganisationFormControl = new FormControl(
      '',
      Validators.required
    );
    this.statusFormControl = new FormControl(1);

    this.salesOrganisationForm = new FormGroup({
      name: this.salesOrganisationFormControl,
      status: this.statusFormControl,
    });

    this.subscriptions.push(
      this.apiService.getSalesmanSuperviourCategory().subscribe((result) => {
        this.salesOrganisationData = result.data;
        this.isLoaded = true;
      })
    );
  }

  public salesOrganisationProvider(): Observable<any[]> {
    return this.apiService
      .getSalesmanSuperviourCategory()
      .pipe(map((result) => result.data));
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public salesOrganisationSelected(data: any): void {
    this.parentFormControl.setValue(data.id);
    this.nodeLevelFormControl.setValue(Number(data.node_level) + 1);
  }

  public editSalesOrganisation(data: any): void {
    this.salesOrganisationFormControl.setValue(data.name);
    this.statusFormControl.setValue(data.status);
    this.uuid = data.uuid;
    this.isEditForm = true;
    this.showForm = true;
  }

  public addNewSalesOrganisation(): void {
    this.showForm = true;
    this.isEditForm = false;
    this.salesOrganisationForm.reset({
      name: '',
      status: 1,
    });
  }

  public applySalesOrganisation(data: any): void {
    this.dialogRef.close(data);
  }

  public deleteSalesOrganisation(data: any): void {
    this.subscriptions.push(
      this.apiService.deleteSalesmanSupervisorCategory(data.uuid).subscribe(() => {
        this.apiService.getSalesmanSuperviourCategory().subscribe((result) => {
          this.salesOrganisationData = result.data;
        });
      })
    );
  }

  public saveSalesOrganisationData(): void {
    if (this.salesOrganisationForm.invalid) {
      Object.keys(this.salesOrganisationForm.controls).forEach((key) => {
        this.salesOrganisationForm.controls[key].markAsDirty();
      });
      return;
    }

    if (this.isEditForm) {
      this.editSalesOrganisationData();

      return;
    }

    this.postSalesOrganisationData();
  }

  private postSalesOrganisationData(): void {
    this.subscriptions.push(
      this.apiService
        .addSalesmanSupervisorCategory(this.salesOrganisationForm.value)
        .subscribe(() => {
          this.showForm = false;
          this.isLoaded = false;
          this.apiService.getSalesmanSuperviourCategory().subscribe((result) => {
            this.salesOrganisationData = result.data;
            this.isLoaded = true;
          });
        })
    );
  }

  private editSalesOrganisationData(): void {
    this.subscriptions.push(
      this.apiService
        .updateSalesmanSupervisorCategory(this.uuid, this.salesOrganisationForm.value)
        .subscribe(() => {
          this.isEditForm = false;
          this.showForm = false;
          this.fetchApiSalesOrganisations();
        })
    );
  }

  private fetchApiSalesOrganisations(): void {
    this.subscriptions.push(
      this.apiService.getSalesmanSuperviourCategory().subscribe((result) => {
        this.salesOrganisationData = result.data;
      })
    );
  }
}