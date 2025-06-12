import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataEditor {

  private dataSource: BehaviorSubject<any> = new BehaviorSubject<any>({});

  public newData: Observable<any> = this.dataSource.asObservable();
  private subject = new Subject<any>();

  public nextSubjectData = new Subject<any>();
  public nextSubjectDataObj = this.nextSubjectData.asObservable();
  private notificationCountSource: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  notificationCount = this.notificationCountSource.asObservable();

  private depotIdSource: BehaviorSubject<any> = new BehaviorSubject<any>(0);
  depotId = this.depotIdSource.asObservable();

  constructor() { }

  public sendData(newData: any): void {
    this.dataSource.next(newData);
  }

  public nextSourceData(data: any): void {
    this.nextSubjectData.next(data);
  }
  public updateNotificationCount(count: number): void {
    this.notificationCountSource.next(count);
  }

  public updateDepotId(id: any): void {
    this.depotIdSource.next(id);
  }
  public sendMessage(message: object) {
    this.subject.next(message);
  }

  public clearMessages() {
    this.subject.next();
  }

  public getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
