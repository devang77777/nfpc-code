import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { NgxSpinnerService } from "ngx-spinner";

@Injectable({
    providedIn: 'root'
})

export class CommonSpinnerService {

    public isLoading = new Subject<boolean>();
    // Show the spinner
    show() {
      this.isLoading.next(true);
    }
    // Hide the spinner
    hide() {
      this.isLoading.next(false);
    }
}