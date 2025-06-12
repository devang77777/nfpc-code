import { Subscription } from 'rxjs';
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Utils } from 'src/app/services/utils';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit, OnChanges {
  historyForm: FormGroup;
  today: Date = new Date();
  @Input() module;
  @Output() close = new EventEmitter();
  private subscriptions: Subscription[] = [];
  comments: any[] = [];
  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.createContactForm();
  }
  getHistory() {
    this.subscriptions.push(
      this.apiService.getHistory(this.module).subscribe((result) => {
        this.comments = result.data;
      })
    );
  }
  createContactForm() {
    this.historyForm = this.formBuilder.group({
      comment: ['', [Validators.required]],
    });
  }
  onClose() {
    this.close.emit(true);
  }
  onSubmit() {
    this.module.comment = this.historyForm.get('comment').value;
    this.module.action = 'custom';
    this.subscriptions.push(
      this.apiService.addHistory(this.module).subscribe((result) => {
        this.historyForm.get('comment').setValue('');
        this.comments.unshift(result.data);
      })
    );
  }
  deleteComment(index, Id) {
    this.subscriptions.push(
      this.apiService.deleteHistory(Id).subscribe((result) => {
        this.comments.splice(index, 1);
      })
    );
  }

  deleteComent(index: any, id: number) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.module?.firstChange != changes.module?.currentValue) {
      if (this.module.module_id) {
        this.getHistory();
      }
    }
  }
  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }
}
