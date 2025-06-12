import { Component, OnInit } from '@angular/core';
export interface PeriodicElement {
  id: number;
  question: string;
  answer: string;

}


@Component({
  selector: 'app-add-pretripinspection',
  templateUrl: './add-pretripinspection.component.html',
  styleUrls: ['./add-pretripinspection.component.scss']
})
export class AddPretripinspectionComponent implements OnInit {
  displayedColumns: string[] = ['id', 'question', 'answer']
   ELEMENT_DATA: any = [
    {id:12345, question:"test", answer:"test"}

  ];
  constructor() { }

  ngOnInit(): void {
  }

}
