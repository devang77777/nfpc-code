import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-survey-qa-preview',
  templateUrl: './survey-qa-preview.component.html',
  styleUrls: ['./survey-qa-preview.component.scss']
})
export class SurveyQaPreviewComponent implements OnInit {
  @Input() public surveyQAs: any;
  constructor() { }

  ngOnInit(): void {
  }

}
