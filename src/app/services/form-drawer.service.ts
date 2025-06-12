import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDrawer } from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root',
})
export class FormDrawerService {
  private navDrawer: MatDrawer;
  private drawer: MatDrawer;
  private drawerNameSubject = new BehaviorSubject('');
  public formName = this.drawerNameSubject.asObservable();
  private drawerTypeSubject = new BehaviorSubject('');
  public formType = this.drawerTypeSubject.asObservable();
  public setDrawer(drawer: MatDrawer) {
    this.drawer = drawer;
  }
  public setNavDrawer(drawer: MatDrawer) {
    this.navDrawer = drawer;
  }
  public setFormName(s: string) {
    this.drawerNameSubject.next(s);
  }
  public setFormType(s: string) {
    this.drawerTypeSubject.next(s);
  }
  public openNav() {
    this.close();
    return this.navDrawer.open();
  }
  public open() {
    this.closeNav();
    return this.drawer.open();
  }
  public closeNav() {
    return this.navDrawer?.close();
  }
  public close() {
    return this.drawer?.close();
  }

  public toggle(): void {
    this.drawer.toggle();
  }
}
