import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormDataService {

  private dataSource = new BehaviorSubject('');
  data = this.dataSource.asObservable();


  constructor() { }
  setData(data) {
    this.dataSource.next(data);
  }
  getData() {
    return this.data;
  }
}
