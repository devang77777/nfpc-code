import { FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { PreferenceService } from '../../preference.service';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
})
export class ThemeComponent implements OnInit {
  control: FormControl;
  themeList = [];
  constructor(private service: PreferenceService) {}

  ngOnInit(): void {
    this.control = new FormControl('');
    this.control.valueChanges.subscribe((item) => {
      this.saveTheme(item);
    });
    this.getTheme();
  }
  getTheme() {
    this.service.getTheme().subscribe((res) => {
      this.themeList = res.data;
      const selected = this.themeList.find((x) => x.selected_theme);
      if (selected) {
        const name = this.makeName(selected.name);
        this.updateTheme(name);
        this.control.patchValue(selected.id);
      }
    });
  }
  saveTheme(value) {
    this.service.saveTheme({ theme_id: value }).subscribe((res) => {
      const selected = this.themeList.find((x) => x.id == value);
      const name = this.makeName(selected.name);
      this.updateTheme(name);
    });
  }
  makeName(name) {
    let updated = name.replace(/ /g, '');
    updated = updated.charAt(0).toLowerCase() + updated.slice(1);
    return updated;
  }
  updateTheme(value) {
    localStorage.setItem('selected-theme', value);
    document.documentElement.setAttribute('data-theme', value);
  }
}
