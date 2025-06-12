import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MerchandisingService } from '../../../../merchandising.service';
@Component({
  selector: 'app-sruvey-qa',
  templateUrl: './sruvey-qa.component.html',
  styleUrls: ['./sruvey-qa.component.scss']
})
export class SruveyQaComponent implements OnInit {
  @Input() public survey_id;
  @Input() public question_type;
  @Input() public customers;
  @Output() public updateSurveyQAList: EventEmitter<any> = new EventEmitter<any>();
  @Output() public closeQADrawer: EventEmitter<any> = new EventEmitter<any>();
  public surveyTextFormGroup;
  private fds: FormDrawerService;
  public surveyOptionsFormGroup: any;
  isEdit: boolean;
  public formType: string;
  private subscriptions: Subscription[] = [];
  constructor(private fb: FormBuilder, fds: FormDrawerService, private router: Router, public merService: MerchandisingService) {
    Object.assign(this, { fds });
  }

  ngOnInit(): void {
    this.surveyTextFormGroup = this.fb.group({
      question: ['', Validators.required],
      questionType: [''],
      questionValue: [''],
    })
    this.surveyOptionsFormGroup = this.fb.group({
      question: ['', Validators.required],
      questionType: [''],
      questionValue: this.fb.array([])
    });
    this.addControl();
    this.fds.formType.subscribe(s => this.formType = s);
    this.fds.formType.subscribe(s => {
      this.formType = s
      this.surveyTextFormGroup?.reset();
      this.surveyOptionsFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.isEdit = false;
      }
      else {
        this.isEdit = true;
      }
    });
  }

  addControl() {
    let questionValue = this.surveyOptionsFormGroup.get('questionValue') as FormArray;
    let fGroup = this.fb.group({
      qValue: ['', Validators.required],
    })
    questionValue.push(fGroup);
  }

  removeControl(i) {
    let questionValue = this.surveyOptionsFormGroup.get('questionValue') as FormArray;
    questionValue.removeAt(i);
  }

  public close() {
    this.closeQADrawer.emit();
    this.surveyTextFormGroup.reset();
    this.surveyOptionsFormGroup.reset();
    let questionValue = this.surveyOptionsFormGroup.get('questionValue') as FormArray;
    while (questionValue.length !== 1) {
      questionValue.removeAt(0);
    }
  }

  saveSurveyQAData(form) {
    let question_value;
    if (this.question_type == "checkbox" || this.question_type == "radio" || this.question_type == "select") {
      question_value = [];
      form.questionValue.forEach(element => {
        question_value.push(element.qValue);
      });
    } else {
      question_value = "";
    }
    let sForm = {
      survey_id: this.survey_id,
      question: form.question,
      question_type: this.question_type,
      question_value: question_value,
    }
    this.subscriptions.push(
      this.merService.addSurveyQA(sForm).subscribe(
        (res) => {
          res.data.survey_question_value = sForm.question_value;
          this.close();
          this.updateSurveyQAList.emit(res.data);
        }
      ));
  }



}
