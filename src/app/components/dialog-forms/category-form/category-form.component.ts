import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { ApiService } from '../../../services/api.service';
import { Utils } from '../../../services/utils';
import { MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit, OnDestroy {

  public showForm: boolean;
  public isEditForm: boolean;
  public categoryData: Array<any> = [];
  public isLoaded: boolean = false;
  public categoryForm: FormGroup;
  public categoryFormControl: FormControl;
  public parentFormControl: FormControl;
  public nodeLevelFormControl: FormControl;
  public statusFormControl: FormControl;

  private subscriptions: Subscription[] = [];
  private apiService: ApiService;
  private dialogRef: MatDialogRef<CategoryFormComponent>;
  private uuid: string;

  constructor(apiService: ApiService, dialogRef: MatDialogRef<CategoryFormComponent>) {
    Object.assign(this, { apiService, dialogRef });
  }

  public ngOnInit(): void {
    this.categoryFormControl = new FormControl('', Validators.required);
    this.parentFormControl = new FormControl();
    this.nodeLevelFormControl = new FormControl(0);
    this.statusFormControl = new FormControl(1);

    this.categoryForm = new FormGroup({
      name: this.categoryFormControl,
      parent_id: this.parentFormControl,
      node_level: this.nodeLevelFormControl,
      status: this.statusFormControl
    });

    this.subscriptions.push(this.apiService.getAllMajorCategorires().subscribe(result => {
      this.categoryData = result.data;
      this.isLoaded = true;
    }));
  }

  public categoryProvider(): Observable<any[]> {
    return this.apiService.getAllMajorCategorires().pipe(map(result => result.data));
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public categorySelected(data: any): void {
    this.parentFormControl.setValue(data.id);
    this.nodeLevelFormControl.setValue(Number(data.node_level) + 1);
  }

  public editCategory(data: any): void {
    this.categoryFormControl.setValue(data.name);
    this.parentFormControl.setValue(data.parent_id);
    this.nodeLevelFormControl.setValue(data.node_level);
    this.statusFormControl.setValue(data.status);
    this.uuid = data.uuid;
    this.isEditForm = true;
    this.showForm = true;
  }

  public addNewCategory(): void {
    this.showForm = true;
    this.isEditForm = false;
    this.categoryForm.reset({
      name: '',
      parent_id: null,
      node_level: 0,
      status: 1
    });
  }

  public applyCategory(data: any): void {
    this.dialogRef.close(data);
  }

  public deleteCategory(data: any): void {
    this.subscriptions.push(this.apiService.deleteMajor(data.uuid)
      .subscribe(() => {
        this.apiService.getAllMajorCategorires().subscribe(result => {
          this.categoryData = result.data;
        });
      }));
  }

  public saveCategoryData(): void {
    if (this.categoryForm.invalid) {
      Object.keys(this.categoryForm.controls).forEach(key => {
        this.categoryForm.controls[key].markAsDirty();
      });
      return;
    }

    if (this.isEditForm) {
      this.editCategoryData();

      return;
    }

    this.postCategoryData();
  }

  private postCategoryData(): void {
    this.subscriptions.push(this.apiService.addMajor(this.categoryForm.value)
      .subscribe(() => {
        this.showForm = false;
        this.isLoaded = false;
        this.apiService.getAllMajorCategorires().subscribe(result => {
          this.categoryData = result.data;
          this.isLoaded = true;
        });
      }));
  }

  private editCategoryData(): void {
    this.subscriptions.push(this.apiService.editMajor(this.uuid, this.categoryForm.value)
      .subscribe(() => {
        this.isEditForm = false;
        this.showForm = false;
        this.fetchApiCategories();
      }));
  }

  private fetchApiCategories(): void {
    this.subscriptions.push(this.apiService.getAllMajorCategorires().subscribe(result => {
      this.categoryData = result.data;
    }));
  }
}
