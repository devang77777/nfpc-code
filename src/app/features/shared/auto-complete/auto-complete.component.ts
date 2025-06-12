import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.scss'],
})
export class AutoCompleteComponent implements OnInit {
  @Input() data: any[];
  @Input() control: FormControl;
  @Input() text: string;
  @Input() placeholder: string;
  @Input() objectName: string;
  @Input() id: string;
  @Input() param1: string;
  @Input() param2: string;
  filteredData: any[];
  constructor() {}

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((value) => {
        if (typeof value != 'string') return;
        const filterValue = value?.toLowerCase();
        this.filteredData = [];
        if (value.length == 0) {
          this.filteredData = JSON.parse(JSON.stringify(this.data));
        } else {
          this.filteredData = this.data.filter((x) => {
            let value = '';
            if (this.objectName) {
              value = x[this.objectName][this.param1];
            } else if (this.objectName == 'root') {
              value = x[this.param1];
            } else {
              value = x[this.text];
            }
            const lowercase = value.toLowerCase();
            return lowercase.indexOf(filterValue) !== -1;
          });
        }
      });
  }
  displayFn = (id: string): string => {
    if (!id) {
      return;
    }
    const data = this.filteredData.find((item) => item[this.id] === id);
    let result;
    if (data && this.objectName) {
      if (this.objectName == 'root') {
        result = data[this.param1];
      } else
        result = `${data[this.objectName][this.param1]} ${
          data[this.objectName][this.param2]
        }`;
    } else {
      result = data[this.text];
    }
    return result;
  };
  onSelect(id?) {
    if (!id) {
      this.filteredData = JSON.parse(JSON.stringify(this.data));
    } else {
      this.control.setValue(id);
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data.currentValue != changes.data.previousValue) {
      this.filteredData = JSON.parse(JSON.stringify(this.data));
    }
  }
}
