import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  private permissionName = '';
  private hasView = false;

  @Input()
  set hasPermission(val: string) {
    this.permissionName = val;
    this.updateView();
  }

  constructor() {
    // Reactively update the template when permissions state changes
    effect(() => {
      // Read permissions signal to register dependency
      this.authService.permissions();
      this.updateView();
    });
  }

  private updateView() {
    if (!this.permissionName) {
      return;
    }

    const hasAccess = this.authService.hasPermission(this.permissionName);

    if (hasAccess && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasAccess && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
