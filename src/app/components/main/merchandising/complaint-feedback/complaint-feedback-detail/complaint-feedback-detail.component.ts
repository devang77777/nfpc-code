import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Complaint } from '../complaint-interface';
import { Lightbox } from 'ngx-lightbox';
import { MerchandisingService } from '../../merchandising.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-complaint-feedback-detail',
  templateUrl: './complaint-feedback-detail.component.html',
  styleUrls: ['./complaint-feedback-detail.component.scss']
})
export class ComplaintFeedbackDetailComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public complaints: Complaint | any;
  @Input() public isDetailVisible: boolean;
  private dataService: DataEditor;
  private deleteDialog: MatDialog;
  private formDrawer: FormDrawerService;
  private subscriptions: Subscription[] = [];
  constructor(private _lightbox: Lightbox, public merService: MerchandisingService, deleteDialog: MatDialog, private cts: CommonToasterService, dataService: DataEditor, formDrawer: FormDrawerService) {
    super('Complaint Feedback');
    Object.assign(this, { merService, deleteDialog, dataService, formDrawer });
  }
  images = [];
  ngOnInit(): void {
  }

  public openEditComplaintFeedback(): void {
    this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.complaints });
    this.formDrawer.setFormName('add-complaintfeedback');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }

  public openDeleteBox(): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete Complaint Feedback ${this.complaints.title}` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteBank();
      }
    });
  }

  public deleteBank(): void {
    let delObj = { uuid: this.complaints.uuid, delete: true };
    this.merService.deleteComplaintFeedback(this.complaints.uuid).subscribe(result => {
      this.closeDetailView();
      this.updateTableData.emit(delObj);
      this.cts.showSuccess("", "Deleted Successfully");

    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.complaints) {
        let currentValue = changes.complaints.currentValue;
        this.complaints = currentValue;
        let images = [];
        if (this.complaints !== undefined && this.complaints.complaint_feedback_image.length > 0) {
          this.complaints.complaint_feedback_image.forEach(element => {
            images.push({
              src: element?.image_string,
              caption: '',
              thumb: element?.image_string
            });
          });
          this.images = images;
        }
      }
    }
  }

  open(index: number): void {
    this._lightbox.open(this.images, index);
  }

  close(): void {
    this._lightbox.close();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public downloadFile(file) {
    this.merService.downloadFile(file);
  }

}
