import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-survey-preview',
  templateUrl: './survey-preview.component.html',
  styleUrls: ['./survey-preview.component.scss']
})
export class SurveyPreviewComponent implements OnInit {
  @Input() public surveyQAs: any;
  constructor() { }

  ngOnInit(): void {
  }

}
