import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetailsService {
private dataSource = new BehaviorSubject('');
details = this.dataSource.asObservable();

  constructor() { }
  setDetails(data){
    this.dataSource.next(data);
  }
}
