import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-cancel-modal',
  templateUrl: './delete-confirmation-modal.component.html',
  styleUrls: ['./delete-confirmation-modal.component.scss']
})
export class DeleteConfirmModalComponent {
  showReason = false;
  reasonsList: any = [];
  public deleteConfirmReasonForm: FormGroup;

  public matDialogRef: MatDialogRef<DeleteConfirmModalComponent>;
  public customData: {
    title: string;
    btnText: string;
    description: string;
    hasConfirmed: boolean;
    isReason?: boolean,
    reason_id?: number
  };

  constructor(
    private apiService: ApiService,
    matDialogRef: MatDialogRef<DeleteConfirmModalComponent>,
    @Inject(MAT_DIALOG_DATA) customData: any) {
    Object.assign(this, { matDialogRef, customData });
    this.deleteConfirmReasonForm = new FormGroup({
      reason_id: new FormControl(''),
    });
    if (customData.isReason) {
      this.apiService.getReturnAllReasonsType().subscribe(res => {
        customData.reason_id = 0;
        this.reasonsList = res.data;
      });
    }
  }

  public cancel(): void {
    this.customData.hasConfirmed = false;
    this.matDialogRef.close();
  }

  public confirm(): void {
    this.customData.hasConfirmed = true;
    if (this.customData.isReason) {
      this.showReason = true;
    } else {
      this.matDialogRef.close(this.customData);
    }
  }
  public submitReason(): void {
    this.customData.hasConfirmed = true;
    this.customData.reason_id=this.deleteConfirmReasonForm.value.reason_id[0].id;
    this.matDialogRef.close(this.customData);
  }
}
