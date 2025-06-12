import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';

@Component({
  selector: 'app-odometer-van-edit',
  templateUrl: './odometer-van-edit.component.html',
  styleUrls: ['./odometer-van-edit.component.scss']
})
export class OdometerVanEditComponent implements OnInit {
  public editForm: FormGroup;
  constructor(
    private apiService: ApiService,
    private dataEditorService: DataEditor,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  ngOnInit(): void {
    this.editForm = new FormGroup({
      start_fuel: new FormControl(''),
      end_fuel: new FormControl(''),
      diesel: new FormControl(''),
    });
    if (this.data) {
      this.setEditForm();
    }
  }
  setEditForm() {
    this.editForm.get('start_fuel')?.setValue(+this.data?.start_fuel);
    this.editForm.get('end_fuel')?.setValue(+this.data?.end_fuel);
    this.editForm.get('diesel')?.setValue(+this.data?.diesel);
  }
  save() {
    this.dataEditorService.sendMessage({ export: 'export' });
    this.apiService.editOdometerDetails(this.data.id, this.editForm.value)
      .subscribe(
        (result: any) => {
          if (result.status) {
            this.dataEditorService.sendMessage({ export: '' });
          }
        }
      );
  }
}
