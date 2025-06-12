import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { MerchandisingService } from '../../main/merchandising/merchandising.service';
import { SelectionModel } from '@angular/cdk/collections';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators, FormArray
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-edit-modelstock-item-dialog',
  templateUrl: './edit-modelstock-item-dialog.component.html',
  styleUrls: ['./edit-modelstock-item-dialog.component.scss']
})
export class EditModelstockItemDialogComponent implements OnInit {

  constructor(
    public fb: FormBuilder,
    public merService: MerchandisingService,
    public cd: ChangeDetectorRef,
    public cts: CommonToasterService,
    public apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public itemData: any,
    public dialog: MatDialogRef<EditModelstockItemDialogComponent>
  ) { }

  itemFormGroup;
  itemUomLists;
  ngOnInit(): void {
    this.itemFormGroup = this.fb.group({
      item_id: [this.itemData.item_id],
      item_uom_id: [this.itemData.item_uom_id],
      capacity: [this.itemData.capacity],
      total_number_of_facing: [this.itemData.total_number_of_facing],
    })
    this.apiService.getAllItemUoms().subscribe((res) => {
      this.itemUomLists = res.data;
    })
  }

  close(closeType?: any) {
    this.dialog.close();
  }

  saveItem() {
    let form = this.itemFormGroup.value;
    this.merService.editModelStockItem(this.itemData.uuid, form).subscribe((res) => {
      this.close();
    })
  }
}
