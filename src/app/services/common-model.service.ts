import { Injectable } from '@angular/core';
import {
  NgbModal,
  NgbActiveModal,
  NgbModalRef,
  NgbModalOptions,
} from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root',
})
export class CommonModelService {
  modalRef: NgbModalRef;
  ModalConfig: NgbModalOptions = {};

  constructor(
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) {}

  openModal(componentName: any, param1?: any, param2?: any) {
    this.modalRef = this.modalService.open(componentName, {
      size: 'lg',
      backdrop: true,
      windowClass: 'foranimation',
    });
    this.modalRef.componentInstance.param1 = param1;
    this.modalRef.componentInstance.param2 = param2;
    return this.modalRef;
  }
}
