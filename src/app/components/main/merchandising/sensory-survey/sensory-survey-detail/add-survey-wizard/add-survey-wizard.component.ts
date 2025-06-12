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
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-add-survey-wizard',
  templateUrl: './add-survey-wizard.component.html',
  styleUrls: ['./add-survey-wizard.component.scss']
})
export class AddSurveyWizardComponent implements OnInit {
  @Output() public closeSurveyWizard: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('stepper') private myStepper: MatStepper;
  @Input() public distribution_id;
  @Input() public editSurveyData;
  public surveyFormGroup;
  private subscriptions: Subscription[] = [];
  public survey_id;
  public savedSurvey;
  private drawerNameSubject = new BehaviorSubject('');
  public formName = this.drawerNameSubject.asObservable();
  private drawerTypeSubject = new BehaviorSubject('');
  public formType = this.drawerTypeSubject.asObservable();
  private apiService: ApiService;
  private drawer: MatDrawer;
  @ViewChild('formDrawerQA') formDrawerQA: MatDrawer;
  private fds: FormDrawerService;
  public question_type: any;
  public WformType: string;
  private isEdit: boolean;
  public surveyQAs = [];
  public optionList = [
    { id: 1, name: 'Text', action: 'text' },
    { id: 2, name: 'Textarea', action: 'textarea' },
    { id: 3, name: 'Checkbox', action: 'checkbox' },
    { id: 4, name: 'Radio', action: 'radio' },
    { id: 5, name: 'Select', action: 'select' },
  ]
  constructor(fds: FormDrawerService, apiService: ApiService, private fb: FormBuilder, public merService: MerchandisingService, private dataEditor: DataEditor) {
    Object.assign(this, { fds, apiService, merService, dataEditor });
  }

  ngOnInit(): void {
    this.fds.formType.subscribe((s) => (this.WformType = s));
    this.surveyFormGroup = this.fb.group({
      surveyName: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
    })

    this.fds.formType.subscribe((s) => {
      this.WformType = s;
      this.surveyFormGroup?.reset();
      if (this.WformType != 'Edit') {
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          this.editSurveyData = result.data;

          if (this.editSurveyData && this.editSurveyData.uuid && this.isEdit) {
            this.survey_id = this.editSurveyData.id;
            let customerObj = [];
            this.editSurveyData.survey_customer.forEach(element => {
              customerObj.push({ id: element.customer_id, itemName: `${element.customer?.firstname} ${element.customer?.lastname}` });
            });
            this.surveyFormGroup.patchValue({
              surveyName: this.editSurveyData.name,
              fromDate: this.editSurveyData.start_date,
              toDate: this.editSurveyData.end_date,
              customers: customerObj,
            })
            this.getSurveyQuestions();
          } else {
            this.surveyFormGroup.reset();
          }

          return;
        })
      );
    });
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
    this.drawer = this.formDrawerQA;
  }

  openAddSurveyQA(qtype) {
    this.question_type = qtype;
    this.drawerNameSubject.next('add-surveyQA');
    this.drawerTypeSubject.next("Add");
    this.drawer.open();
  }

  saveSurveyForm(stepper) {

    let form = this.surveyFormGroup.value;
    let sForm = {
      survey_type_id: 3,
      name: form.surveyName,
      start_date: form.fromDate,
      end_date: form.toDate,
    };

    if (this.editSurveyData !== undefined && this.isEdit == true) {
      this.udateSurveyForm(stepper, sForm);
    } else {
      this.postSurveyForm(stepper, sForm);
    }
  }

  postSurveyForm(stepper, sForm) {
    let customers = [];
    if (sForm.customer_id && sForm.customer_id.length > 0) {
      customers = sForm.customer_id.map(x => x.id);
    }

    sForm.customer_id = customers;
    this.subscriptions.push(
      this.merService.addSurvey(sForm).subscribe(
        (res) => {
          this.survey_id = res.data.id;
          this.savedSurvey = res.data;
          let data = res.data;
          data.edit = false;
          this.updateTableData.emit(data);
          this.goForward(stepper);
        }
      ));
  }

  udateSurveyForm(stepper, sForm) {
    let customers = [];
    if (sForm.customer_id && sForm.customer_id.length > 0) {
      customers = sForm.customer_id.map(x => x.id);
    }

    sForm.customer_id = customers;
    sForm.survey_id = this.survey_id;
    this.subscriptions.push(
      this.merService.editSurvey(sForm, this.editSurveyData.uuid).subscribe(
        (res) => {
          this.survey_id = res.data.id;
          this.savedSurvey = res.data;
          let data = res.data;
          data.edit = true;
          this.updateTableData.emit(data);
          this.goForward(stepper);
        }
      ));
  }

  goForward(stepper: MatStepper) {
    stepper.next();
  }

  close() {
    let data = {};
    data['close'] = !this.isEdit;
    this.updateTableData.emit(data);
    this.myStepper.reset();
    this.surveyFormGroup.reset();
    this.fds.close();
  }

  closeQADrawer() {
    this.drawer.close();
  }

  updateSurveyQAList(data) {
    this.surveyQAs.push(data);
  }
}
