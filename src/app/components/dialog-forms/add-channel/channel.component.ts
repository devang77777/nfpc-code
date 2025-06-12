import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { ApiService } from '../../../services/api.service';
import { Utils } from '../../../services/utils';
import { MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { BaseComponent } from 'src/app/features/shared/base/base.component';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss'],
})
export class ChannelComponent extends BaseComponent
  implements OnInit, OnDestroy {
  public showForm: boolean;
  public isEditForm: boolean;
  public channelData: Array<any> = [];
  public isLoaded: boolean = false;
  public channelForm: FormGroup;
  public channelFormControl: FormControl;
  public parentFormControl: FormControl;
  public nodeLevelFormControl: FormControl;
  public statusFormControl: FormControl;

  private subscriptions: Subscription[] = [];
  private apiService: ApiService;
  private dialogRef: MatDialogRef<ChannelComponent>;
  private uuid: string;

  constructor(
    apiService: ApiService,
    dialogRef: MatDialogRef<ChannelComponent>
  ) {
    super('channel');
    Object.assign(this, { apiService, dialogRef });
  }

  public ngOnInit(): void {
    this.channelFormControl = new FormControl('', Validators.required);
    this.parentFormControl = new FormControl();
    this.nodeLevelFormControl = new FormControl(0);
    this.statusFormControl = new FormControl(1);

    this.channelForm = new FormGroup({
      name: this.channelFormControl,
      parent_id: this.parentFormControl,
      node_level: this.nodeLevelFormControl,
      status: this.statusFormControl,
    });

    this.subscriptions.push(
      this.apiService.getAllChannels().subscribe((result) => {
        this.channelData = result.data;
        this.isLoaded = true;
      })
    );
  }

  public channelProvider(): Observable<any[]> {
    return this.apiService.getAllChannels().pipe(map((result) => result.data));
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public channelSelected(data: any): void {
    this.parentFormControl.setValue(data.id);
    this.nodeLevelFormControl.setValue(Number(data.node_level) + 1);
  }

  public editChannel(data: any): void {
    this.channelFormControl.setValue(data.name);
    this.parentFormControl.setValue(data.parent_id);
    this.nodeLevelFormControl.setValue(data.node_level);
    this.statusFormControl.setValue(data.status);
    this.uuid = data.uuid;
    this.isEditForm = true;
    this.showForm = true;
  }

  public addNewChannel(): void {
    this.showForm = true;
    this.isEditForm = false;
    this.channelForm.reset({
      name: '',
      parent_id: null,
      node_level: 0,
      status: 1,
    });
  }

  public applyChannel(data: any): void {
    this.dialogRef.close(data);
  }

  public deleteChannel(data: any): void {
    this.subscriptions.push(
      this.apiService.deleteChannel(data.uuid).subscribe(() => {
        this.apiService.getAllChannels().subscribe((result) => {
          this.channelData = result.data;
        });
      })
    );
  }

  public saveChannelData(): void {
    if (this.channelForm.invalid) {
      Object.keys(this.channelForm.controls).forEach((key) => {
        this.channelForm.controls[key].markAsDirty();
      });
      return;
    }

    if (this.isEditForm) {
      this.editChannelData();

      return;
    }

    this.postChannelData();
  }

  private postChannelData(): void {
    this.subscriptions.push(
      this.apiService.addChannel(this.channelForm.value).subscribe(() => {
        this.showForm = false;
        this.isLoaded = false;
        this.apiService.getAllChannels().subscribe((result) => {
          this.channelData = result.data;
          this.isLoaded = true;
        });
      })
    );
  }

  private editChannelData(): void {
    this.subscriptions.push(
      this.apiService
        .editChannel(this.uuid, this.channelForm.value)
        .subscribe(() => {
          this.isEditForm = false;
          this.showForm = false;
          this.fetchApiChannels();
        })
    );
  }

  private fetchApiChannels(): void {
    this.subscriptions.push(
      this.apiService.getAllChannels().subscribe((result) => {
        this.channelData = result.data;
      })
    );
  }
}
