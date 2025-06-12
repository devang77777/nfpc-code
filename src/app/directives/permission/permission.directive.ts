import { Directive, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appPermission]',
})
export class PermissionDirective implements OnInit {
  @Input('permissions') permissions: any;
  @Input('type') type: string;
  constructor(private elRef: ElementRef, private renderer: Renderer2) {}
  ngOnInit() {
    const el = this.elRef.nativeElement;
    if (!this.permissions) return;
    const isView = this.permissions.find((x) => x.name == 'list');
    const isEdit = this.permissions.find((x) => x.name == 'edit');
    const isCreate = this.permissions.find((x) => x.name == 'add');
    const isDelete = this.permissions.find((x) => x.name == 'delete');
    if (!isView) {
      this.renderer.setStyle(el, 'display', 'none');
    }
    if (!isEdit && this.type === 'edit') {
      this.renderer.setStyle(el, 'display', 'none');
    }
    if (!isCreate && this.type === 'create') {
      this.renderer.setStyle(el, 'display', 'none');
    }
    if (!isDelete && this.type === 'delete') {
      this.renderer.setStyle(el, 'display', 'none');
    }
  }
}
