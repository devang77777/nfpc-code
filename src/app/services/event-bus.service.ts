import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EmitEvent, Events } from '../models/events.model';

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private subject$ = new Subject();
  constructor() { }

  emit(event: EmitEvent) {
    this.subject$.next(event);
  }
  on(event: Events, callback: any) {
    return this.subject$.pipe(
      filter((e: EmitEvent) => e.name === event),
      map(item=>item.value)
    ).subscribe(callback)
  }
}
