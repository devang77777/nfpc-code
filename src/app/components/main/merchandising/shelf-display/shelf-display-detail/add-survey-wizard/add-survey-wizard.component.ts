import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MerchandisingService } from '../../../merchandising.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatStepper } from '@angular/material/stepper';
import { MatDrawer } from '@angular/material/sidenav';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
@Component({
  selector: 'app-add-survey-wizard',
  templateUrl: './add-survey-wizard.component.html',
  styleUrls: ['./add-survey-wizard.component.scss']
})
export class AddSurveyWizardComponent implements OnInit {
  @Output() public closeSurveyWizard: EventEmitter<any> = new EventEmitter<any>();
  @Input() public distribution_id;
  @Input() public editSurveyData;
  public surveyFormGroup;
  private subscriptions: Subscription[] = [];
  public survey_id;
  public savedSurvey;
  @ViewChild('formDrawerQA') formDrawerQA: MatDrawer;
  private fds: FormDrawerService;
  public question_type: any;
  public surveyQAs = [];
  public optionList = [
    { id: 1, name: 'Text', action: 'text' },
    { id: 2, name: 'Textarea', action: 'textarea' },
    { id: 3, name: 'Checkbox', action: 'checkbox' },
    { id: 4, name: 'Radio', action: 'radio' },
    { id: 5, name: 'Select', action: 'select' },
  ]
  constructor(fds: FormDrawerService, apiService: ApiService, private fb: FormBuilder, public merService: MerchandisingService, dataEditor: DataEditor) {
    Object.assign(this, { fds, apiService, merService, dataEditor });
  }

  ngOnInit(): void {
    this.surveyFormGroup = this.fb.group({
      surveyName: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
    })
    if (this.editSurveyData !== undefined && this.editSurveyData.actionType == "edit") {
      this.surveyFormGroup.patchValue({
        surveyName: this.editSurveyData.name,
        fromDate: this.editSurveyData.start_date,
        toDate: this.editSurveyData.end_date
      })
      this.getSurveyQuestions();
    } else {
      this.surveyFormGroup.reset();
    }
  }

  getSurveyQuestions() {
    this.subscriptions.push(
      this.merService.getSurveyQuestionList(this.editSurveyData.id).subscribe(
        (res) => {
          this.surveyQAs = res.data;
        }
      )
    )
  }

  removeQA(data, index) {
    this.merService.deleteSurveyQuestion(data.uuid).subscribe(
      (res) => {
        this.surveyQAs.splice(index, 1);
      }
    )
  }

  surveyDrop(e: any) {
    this.openAddSurveyQA(e.dragData.action);
  }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.formDrawerQA);
  }

  openAddSurveyQA(qtype) {
    this.question_type = qtype;
    this.fds.setFormName('add-surveyQA');
    this.fds.setFormType("Add");
    this.fds.open();
  }

  saveSurveyForm(stepper) {

    let form = this.surveyFormGroup.value;
    let sForm = {
      survey_type_id: 1,
      name: form.surveyName,
      start_date: form.fromDate,
      end_date: form.toDate,
      distribution_id: this.distribution_id
    };

    if (this.editSurveyData !== undefined && this.editSurveyData.actionType == "edit") {
      this.udateSurveyForm(stepper, sForm);
    } else {
      this.postSurveyForm(stepper, sForm);
    }
  }

  postSurveyForm(stepper, sForm) {
    this.subscriptions.push(
      this.merService.addSurvey(sForm).subscribe(
        (res) => {
          this.survey_id = res.data.id;
          this.savedSurvey = res.data;
          this.goForward(stepper);
        }
      ));
  }

  udateSurveyForm(stepper, sForm) {
    this.subscriptions.push(
      this.merService.editSurvey(sForm, this.editSurveyData.uuid).subscribe(
        (res) => {
          this.survey_id = res.data.id;
          this.savedSurvey = res.data;
          this.goForward(stepper);
        }
      ));
  }

  goForward(stepper: MatStepper) {
    stepper.next();
  }

  close() {
    this.surveyFormGroup.reset();
    this.closeSurveyWizard.emit();
  }

  updateSurveyQAList(data) {
    this.surveyQAs.push(data);
  }
}
