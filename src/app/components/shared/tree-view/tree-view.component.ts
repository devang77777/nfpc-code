import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { Utils } from '../../../services/utils';
@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss'],
})
export class TreeViewComponent implements OnInit, OnDestroy, OnChanges {
  @Output() public whenItemSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() public manageClicked: EventEmitter<any> = new EventEmitter<any>();
  @Input() public placeHolder = 'Search an item';
  @Input() public dataSource: Array<any>;
  @Input() public dataService: Observable<any>;
  @Input() public buttonLabel = 'Manage Items';
  @Input() public formControl: FormControl;
  @Input() public selectedItemNumber: number;
  @Input() public isManageable = true;
  @Input() public selectedItem: any;
  @Input() public selectedItems = [];

  public filteredData: Array<any> = [];
  public flattenData: Array<any> = [];
  public searchControl: FormControl;
  public toggle = false;

  private subscriptions: Subscription[] = [];
  private elementRef: ElementRef;

  constructor(elementRef: ElementRef) {
    Object.assign(this, { elementRef });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.dataSource && changes.dataSource.currentValue) {
      this.refreshData();
    }
  }

  public ngOnInit(): void {
    this.searchControl = new FormControl();

    this.dataSource.forEach(x => this.flatArray(x));

    this.resetFiltered();

    if (!this.dataSource.length) {
      this.refreshData();
    }

    this.subscriptions.push(this.searchControl.valueChanges.subscribe(value => {
      if (value) {
        this.filteredData = this.filterData(value) ? this.filterData(value) : this.flattenData.slice(0);
      } else {
        this.filteredData = this.flattenData.slice(0);
      }
    }));

    this.subscriptions.push(this.formControl.valueChanges.subscribe(result => {
      this.selectedItemNumber = result;
      this.selectedItem = this.flattenData.find(item => item.id === result);

      if (!this.selectedItem) {
        this.refreshData(result);
      }

      this.toggle = false;
    }));
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public refreshData(setId?: number): void {
    this.subscriptions.push(this.dataService.subscribe(result => {
      this.dataSource = result;
      this.flattenData = [];
      this.dataSource.forEach(x => this.flatArray(x));
      this.resetFiltered();

      if (setId) {
        this.selectedItem = this.flattenData.find(item => item.id === setId);
      }

    }));
  }

  public clearSearch(): void {
    if (this.searchControl.value === '' || this.searchControl.value === null) {
      this.toggleDropdown();
    }
    this.searchControl.setValue('');
    this.selectedItemNumber = undefined;
    this.selectedItem = undefined;

    if (this.formControl) {
      this.formControl.setValue(undefined);
    }
  }

  public resetFiltered(): void {
    this.filteredData = [...this.flattenData];
  }

  public filterData(keyword: string): any {
    return [...this.flattenData].filter(item => item.name.toLowerCase().includes(keyword.toLowerCase()));
  }

  public getArrayOf(num: number): Array<any> {
    if (num) {
      return new Array(num);
    }

    return [];
  }

  public flatArray(item) {
    this.flattenData.push(item);

    if (item.children?.length) {
      for (const child of item.children) {
        this.flatArray(child);
      }
    } else {
      return;
    }
  }

  public toggleDropdown(): void {
    this.toggle = !this.toggle;

    if (this.toggle) {
      setTimeout(() => {
        const searchEl = this.elementRef.nativeElement.querySelector('#searchField');
        searchEl.blur();
        searchEl.focus();
      }, 50);
    }
  }

  public closeDropdown(): void {
    this.toggle = false;
  }

  public itemSelected(item: any): void {
    this.selectedItemNumber = item.id;
    this.selectedItem = item;
    // changes
    if (this.selectedItems.includes(item.id)) {
      this.selectedItems.splice(this.selectedItems.indexOf(item.id), 1);
    } else {
      this.selectedItems.push(item.id);
      this.flattenData.forEach(x => {
        if (this.selectedItems.includes(x.parent_id)) {
          this.selectedItems.push(x.id)
        }
      });
    }
    // 
    // this.toggleDropdown();
    this.whenItemSelected.emit(item);

    if (this.formControl) {
      this.formControl.setValue(this.selectedItems);
    }
  }

  public clickOnManage(): void {
    this.manageClicked.emit();
  }
}

export const TEMP_DATA = [
  {
    "id": 2,
    "uuid": "6fd82840-b141-11ea-94e3-b5eaec67bfbf",
    "organisation_id": 1,
    "name": "Dairy",
    "parent_id": null,
    "status": 1,
    "node_level": 0,
    "children": [
      {
        "id": 3,
        "uuid": "7f2b2340-b141-11ea-8832-bdc12a0f4876",
        "organisation_id": 1,
        "parent_id": 2,
        "name": "Bread",
        "status": 1,
        "node_level": 1,
        "children": []
      },
      {
        "id": 6,
        "uuid": "7f2b2340-b141-11ea-8832-bdc12a0f4876",
        "organisation_id": 1,
        "parent_id": 2,
        "name": "Cheese",
        "status": 1,
        "node_level": 1,
        "children": [
          {
            "id": 8,
            "uuid": "7f2b2340-b141-11ea-8832-bdc12a0f4876",
            "organisation_id": 1,
            "parent_id": 6,
            "name": "Cheddar Cheese",
            "status": 1,
            "node_level": 2,
            "children": []
          },
          {
            "id": 9,
            "uuid": "7f2b2340-b141-11ea-8832-bdc12a0f4876",
            "organisation_id": 1,
            "parent_id": 6,
            "name": "Swiss Cheese",
            "status": 1,
            "node_level": 2,
            "children": []
          }
        ]
      }
    ]
  },
  {
    "id": 4,
    "uuid": "6fd82840-b141-11ea-94e3-b5eaec67bfbf",
    "organisation_id": 1,
    "name": "Soda",
    "parent_id": null,
    "status": 1,
    "node_level": 0,
    "children": [
      {
        "id": 5,
        "uuid": "7f2b2340-b141-11ea-8832-bdc12a0f4876",
        "organisation_id": 1,
        "parent_id": 4,
        "name": "Pepsi",
        "status": 1,
        "node_level": 1,
        "children": [
          {
            "id": 7,
            "uuid": "7f2b2340-b141-11ea-8832-bdc12a0f4876",
            "organisation_id": 1,
            "parent_id": 5,
            "name": "Pepsi Diet",
            "status": 1,
            "node_level": 2,
            "children": []
          }
        ]
      },
      {
        "id": 10,
        "uuid": "7f2b2340-b141-11ea-8832-bdc12a0f4876",
        "organisation_id": 1,
        "parent_id": 4,
        "name": "Coke",
        "status": 1,
        "node_level": 1,
        "children": []
      }
    ]
  },
  {
    "id": 11,
    "uuid": "7f2b2340-b141-11ea-8832-bdc12a0f4876",
    "organisation_id": 1,
    "parent_id": null,
    "name": "Grocery",
    "status": 1,
    "node_level": 0,
    "children": []
  }
];
