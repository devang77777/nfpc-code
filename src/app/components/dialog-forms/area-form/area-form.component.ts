import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { ApiService } from '../../../services/api.service';
import { Utils } from '../../../services/utils';
import { MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { BaseComponent } from 'src/app/features/shared/base/base.component';

@Component({
  selector: 'app-area-form',
  templateUrl: './area-form.component.html',
  styleUrls: ['./area-form.component.scss'],
})
export class AreaFormComponent extends BaseComponent
  implements OnInit, OnDestroy {
  public showForm: boolean;
  public isEditForm: boolean;
  public areaData: Array<any> = [];
  public isLoaded: boolean = false;
  public areaForm: FormGroup;
  public areaFormControl: FormControl;
  public parentFormControl: FormControl;
  public nodeLevelFormControl: FormControl;
  public statusFormControl: FormControl;

  private subscriptions: Subscription[] = [];
  private apiService: ApiService;
  private dialogRef: MatDialogRef<AreaFormComponent>;
  private uuid: string;

  constructor(
    apiService: ApiService,
    dialogRef: MatDialogRef<AreaFormComponent>
  ) {
    super('areas');
    Object.assign(this, { apiService, dialogRef });
  }

  public ngOnInit(): void {
    this.areaFormControl = new FormControl('', Validators.required);
    this.parentFormControl = new FormControl();
    this.nodeLevelFormControl = new FormControl(0);
    this.statusFormControl = new FormControl(1);

    this.areaForm = new FormGroup({
      area_name: this.areaFormControl,
      parent_id: this.parentFormControl,
      node_level: this.nodeLevelFormControl,
      status: this.statusFormControl,
    });

    this.subscriptions.push(
      this.apiService.getAllAreas().subscribe((result) => {
        this.areaData = result.data;
        this.isLoaded = true;
      })
    );
  }

  public areaProvider(): Observable<any[]> {
    return this.apiService.getAllAreas().pipe(map((result) => result.data));
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public areaSelected(data: any): void {
    this.parentFormControl.setValue(data.id);
    this.nodeLevelFormControl.setValue(Number(data.node_level) + 1);
  }

  public editArea(data: any): void {
    this.areaFormControl.setValue(data.area_name);
    this.parentFormControl.setValue(data.parent_id);
    this.nodeLevelFormControl.setValue(data.node_level);
    this.statusFormControl.setValue(data.status);
    this.uuid = data.uuid;
    this.isEditForm = true;
    this.showForm = true;
  }

  public addNewArea(): void {
    this.showForm = true;
    this.isEditForm = false;
    this.areaForm.reset({
      area_name: '',
      parent_id: null,
      node_level: 0,
      status: 1,
    });
  }

  public applyArea(data: any): void {
    this.dialogRef.close(data);
  }

  public deleteArea(data: any): void {
    this.subscriptions.push(
      this.apiService.deleteArea(data.uuid).subscribe(() => {
        this.apiService.getAllAreas().subscribe((result) => {
          this.areaData = result.data;
        });
      })
    );
  }

  public saveAreaData(): void {
    if (this.areaForm.invalid) {
      Object.keys(this.areaForm.controls).forEach((key) => {
        this.areaForm.controls[key].markAsDirty();
      });
      return;
    }

    if (this.isEditForm) {
      this.editAreaData();

      return;
    }

    this.postAreaData();
  }

  private postAreaData(): void {
    this.subscriptions.push(
      this.apiService.addArea(this.areaForm.value).subscribe(() => {
        this.showForm = false;
        this.isLoaded = false;
        this.apiService.getAllAreas().subscribe((result) => {
          this.areaData = result.data;
          this.isLoaded = true;
        });
      })
    );
  }

  private editAreaData(): void {
    this.subscriptions.push(
      this.apiService.editArea(this.uuid, this.areaForm.value).subscribe(() => {
        this.isEditForm = false;
        this.showForm = false;
        this.fetchApiAreas();
      })
    );
  }

  private fetchApiAreas(): void {
    this.subscriptions.push(
      this.apiService.getAllAreas().subscribe((result) => {
        this.areaData = result.data;
      })
    );
  }
}
