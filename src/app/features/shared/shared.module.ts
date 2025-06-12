import { HistoryComponent } from './history/history.component';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClickOutsideModule } from 'ng-click-outside';
import { CommonModule } from '@angular/common';

import { MaterialImportModule } from '../../imports/material-import/material-import.module';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { RadioButtonComponent } from './radio-button/radio-button.component';
import { TreeDropdownComponent } from './tree-dropdown/tree-dropdown.component';
import { TreeNodeContainerComponent } from './tree-view/tree-node-container/tree-node-container.component';
import { TreeContainerComponent } from './tree-view/tree-container/tree-container.component';
import { CustomFieldFormComponent } from './custom-field-form/custom-field-form.component';
import { ValidationMessageComponent } from './validation-message/validation-message.component';
import { MatErrorComponent } from './mat-error/mat-error.component';
import { BaseComponent } from './base/base.component';
import { PermissionDirective } from 'src/app/directives/permission/permission.directive';
import { ImportFormComponent } from './import-form/import-form.component';
import { ExportFormComponent } from './export-form/export-form.component';
import { SendEmailComponent } from './send-email/send-email.component';
import { DefaultMessageComponent } from './default-message/default-message.component';
import { AutoCompleteComponent } from './auto-complete/auto-complete.component';
import { SearchCriteriaComponent } from './search-criteria/search-criteria.component';
import { MultiautocompleteComponent } from './multiautocomplete/multiautocomplete.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { ColumnFilterComponent } from './column-filter/column-filter.component';
import { BulkItemModalComponent } from 'src/app/components/main/transaction/bulk-item-modal/bulk-item-modal.component';
import { CustomPaggingComponent } from './custom-pagging/custom-pagging.component';
@NgModule({
  imports: [
    CommonModule,
    MaterialImportModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMultiSelectModule,
    ClickOutsideModule,
  ],
  exports: [
    AngularMultiSelectModule,
    CheckboxComponent,
    RadioButtonComponent,
    TreeDropdownComponent,
    TreeNodeContainerComponent,
    HistoryComponent,
    TreeContainerComponent,
    ValidationMessageComponent,
    MatErrorComponent,
    CustomFieldFormComponent,
    BaseComponent,
    SearchCriteriaComponent,
    PermissionDirective,
    ImportFormComponent,
    ExportFormComponent,
    SendEmailComponent,
    AutoCompleteComponent,
    MultiautocompleteComponent,
    DefaultMessageComponent,
    ColumnFilterComponent,
    CustomPaggingComponent,
    BulkItemModalComponent
  ],
  declarations: [
    CheckboxComponent,
    RadioButtonComponent,
    HistoryComponent,
    TreeDropdownComponent,
    TreeNodeContainerComponent,
    TreeContainerComponent,
    CustomFieldFormComponent,
    ValidationMessageComponent,
    MatErrorComponent,
    BaseComponent,
    PermissionDirective,
    ImportFormComponent,
    ExportFormComponent,
    SendEmailComponent,
    DefaultMessageComponent,
    AutoCompleteComponent,
    MultiautocompleteComponent,
    SearchCriteriaComponent,
    ColumnFilterComponent,
    CustomPaggingComponent,
    BulkItemModalComponent
  ],
})
export class SharedModule { }
