import { Component, OnInit } from '@angular/core';
import { CreditNoteService } from '../credit-note.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-credit-note-import',
  templateUrl: './credit-note-import.component.html',
  styleUrls: ['./credit-note-import.component.scss']
})
export class CreditNoteImportComponent implements OnInit {

  public data: any = [];

  constructor(private router: Router,
    private creditNoteService: CreditNoteService) { }

  ngOnInit(): void {
  }


  backToCreditNote() {
    this.router.navigate(['transaction/credit-note']).then();
  }

  selectedFile(data) {
    this.data = data;
    //console.log(data);
  }




}
