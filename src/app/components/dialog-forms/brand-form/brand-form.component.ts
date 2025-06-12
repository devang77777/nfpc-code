import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { ApiService } from '../../../services/api.service';
import { Utils } from '../../../services/utils';
import { MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { BaseComponent } from 'src/app/features/shared/base/base.component';

@Component({
  selector: 'app-brand-form',
  templateUrl: './brand-form.component.html',
  styleUrls: ['./brand-form.component.scss'],
})
export class BrandFormComponent extends BaseComponent
  implements OnInit, OnDestroy {
  public showForm: boolean;
  public isEditForm: boolean;
  public brandData: Array<any> = [];
  public isLoaded: boolean = false;
  public brandForm: FormGroup;
  public brandFormControl: FormControl;
  public parentFormControl: FormControl;
  public nodeLevelFormControl: FormControl;
  public statusFormControl: FormControl;

  private subscriptions: Subscription[] = [];
  private apiService: ApiService;
  private dialogRef: MatDialogRef<BrandFormComponent>;
  private uuid: string;

  constructor(
    apiService: ApiService,
    dialogRef: MatDialogRef<BrandFormComponent>
  ) {
    super('brands');
    Object.assign(this, { apiService, dialogRef });
  }

  public ngOnInit(): void {
    this.brandFormControl = new FormControl('', Validators.required);
    this.parentFormControl = new FormControl();
    this.nodeLevelFormControl = new FormControl(0);
    this.statusFormControl = new FormControl(1);

    this.brandForm = new FormGroup({
      brand_name: this.brandFormControl,
      parent_id: this.parentFormControl,
      node_level: this.nodeLevelFormControl,
      status: this.statusFormControl,
    });

    this.subscriptions.push(
      this.apiService.getAllBrands().subscribe((result) => {
        this.brandData = result.data;
        this.isLoaded = true;
      })
    );
  }

  public brandProvider(): Observable<any[]> {
    return this.apiService.getAllBrands().pipe(map((result) => result.data));
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public brandSelected(data: any): void {
    this.parentFormControl.setValue(data.id);
    this.nodeLevelFormControl.setValue(Number(data.node_level) + 1);
  }

  public editBrand(data: any): void {
    this.brandFormControl.setValue(data.brand_name);
    this.parentFormControl.setValue(data.parent_id);
    this.nodeLevelFormControl.setValue(data.node_level);
    this.statusFormControl.setValue(data.status);
    this.uuid = data.uuid;
    this.isEditForm = true;
    this.showForm = true;
  }

  public addNewBrand(): void {
    this.showForm = true;
    this.isEditForm = false;
    this.brandForm.reset({
      name: '',
      parent_id: null,
      node_level: 0,
      status: 1,
    });
  }

  public applyBrand(data: any): void {
    this.dialogRef.close(data);
  }

  public deleteBrand(data: any): void {
    this.subscriptions.push(
      this.apiService.deleteBrandItem(data.uuid).subscribe(() => {
        this.apiService.getAllBrands().subscribe((result) => {
          this.brandData = result.data;
        });
      })
    );
  }

  public saveBrandData(): void {
    if (this.brandForm.invalid) {
      Object.keys(this.brandForm.controls).forEach((key) => {
        this.brandForm.controls[key].markAsDirty();
      });
      return;
    }

    if (this.isEditForm) {
      this.editBrandData();

      return;
    }

    this.postBrandData();
  }

  private postBrandData(): void {
    this.subscriptions.push(
      this.apiService.addBrandItem(this.brandForm.value).subscribe(() => {
        this.showForm = false;
        this.isLoaded = false;
        this.apiService.getAllBrands().subscribe((result) => {
          this.brandData = result.data;
          this.isLoaded = true;
        });
      })
    );
  }

  private editBrandData(): void {
    this.subscriptions.push(
      this.apiService
        .editBrandItem(this.uuid, this.brandForm.value)
        .subscribe(() => {
          this.isEditForm = false;
          this.showForm = false;
          this.fetchApiBrands();
        })
    );
  }

  private fetchApiBrands(): void {
    this.subscriptions.push(
      this.apiService.getAllBrands().subscribe((result) => {
        this.brandData = result.data;
      })
    );
  }
}
