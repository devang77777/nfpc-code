import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
declare var moment: any;

export class ValidatorService extends Validators {
  // constructor() { super() }
  // ValidateUrl(control: AbstractControl) {
  static ValidateUrl(control: FormControl) {
    if (!control.value.startsWith('https') || !control.value.includes('.io')) {
      return { validUrl: true };
    }
    return null;
  }
  static validateIsMax(group: FormGroup) {
    const minField = group.controls['marks'],
      maxField = group.controls['totalMarks'];
    if (parseInt(minField.value, 10) > parseInt(maxField.value, 10)) {
      return minField.setErrors({ isMax: true });
    } else {
      return minField.setErrors(null);
    }
  }
  static validateDateDifference(group: FormGroup) {
    const joiningDate = new Date(group.controls['joiningDate'].value);
    const leavingDate = new Date(group.controls['leavingDate'].value);
    if (!joiningDate || !leavingDate) return;
    if (joiningDate.getTime() > leavingDate.getTime()) {
      return group.controls['joiningDate'].setErrors({ invalidMinDate: true });
    } else {
      return group.controls['joiningDate'].setErrors(null);
    }
  }
  static NoWhitespaceValidator(control: FormControl) {
    const str = control.value.toString();
    if (!str.replace(/\s/g, '').length && str.length > 0) {
      return { whitespace: true };
    } else {
      return null;
    }
  }
  static validateCharacters(control: FormControl) {
    const validCharacters = /[^\s\w,.:&\/()+%'`@-]/;
    // first check if the control has a value
    if (control.value && control.value.length > 0) {
      // match the control value against the regular expression
      const matches = control.value.match(validCharacters);
      // if there are matches return an object, else return null.
      return matches && matches.length ? { invalid_characters: matches } : null;
    } else {
      return null;
    }
  }
  static validateEmail(control: FormControl) {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (control.value && control.value.length > 0) {
      const matches = control.value.match(regex);
      return matches && matches.length ? null : { emailValidate: true };
    } else {
      return null;
    }
  }
  static numbersOnly(control: FormControl) {
    const regex = '^[0-9]*$';
    if (control.value && control.value.length > 0) {
      const matches = control.value.match(regex);
      return matches && matches.length ? null : { numbers_only: true };
    } else {
      return null;
    }
  }
  static numberAndDecimal(control: FormControl) {
    const regex = /^[-+]?[0-9]+(\.[0-9]+)?$/;
    if (control.value && control.value.length > 0) {
      const matches = control.value.match(regex);
      return matches && matches.length ? null : { numbers_decimal_only: true };
    } else {
      return null;
    }
  }

  static validateCNIC(control: FormControl) {
    const regex = '^[0-9+]{5}-[0-9+]{7}-[0-9]{1}$';
    if (control.value && control.value.length > 0) {
      const matches = control.value.match(regex);
      return matches && matches.length ? null : { invalid_cnic: true };
    } else {
      return null;
    }
  }
  static setCNICMask(event, value): any {}
  static alphabetsOnly(control: FormControl) {
    const validInput = /^[a-zA-Z]*$/;
    if (control.value && control.value.length > 0) {
      const match = control.value.match(validInput);

      return match && match.length ? null : { alphabets_only: true };
    } else {
      return null;
    }
  }
  static positiveOnly(control: FormControl) {
    if (control.value < 0) {
      return { positiveOnly: true };
    } else {
      return null;
    }
  }
  static validYear(control: FormControl) {
    const currentYear = moment().year();
    const val = control.value;
    if (val) {
      return null;
    } else {
      return null;
    }
  }
  static notFutureDate(control: FormControl) {
    const date = new Date(control.value).getTime();
    return new Date().getTime() > date ? null : { isFutureDate: true };
  }

  static dropdownValidator(control: FormControl) {
    if (parseInt(control.value, 10) > 0) {
      return null;
    } else {
      return { notValid: true };
    }
  }
  static dropdownRequired(control: FormControl) {
    return control.value ? null : { dropdownRequired: true };
  }

  static FileSize(control: FormControl) {
    if (control.value) {
      if (typeof control.value === 'string' || control.value.size < 5000000) {
        return null;
      } else {
        return { fileSizeLimit: true };
      }
    }
  }
  static validateImg(c: FormControl): { [key: string]: any } {
    if (c.value && c.value instanceof File) {
      return ValidatorService.checkExtension(c);
    }
  }

  private static checkExtension(c: FormControl) {
    const valToLower = c.value.name.toLowerCase();
    const regex = new RegExp('(.*?).(jpg|JPG|GIF|PNG|JPEG|png|gif|jpeg)$'); // add or remove required extensions here
    const regexTest = regex.test(valToLower);
    return !regexTest ? { notSupportedFileType: true } : null;
  }

  static validateDocs(c: FormControl): { [key: string]: any } {
    if (c.value && c.value instanceof File) {
      return ValidatorService.checkExtensionDocs(c);
    }
  }
  private static checkExtensionDocs(c: FormControl) {
    const valToLower = c.value.name.toLowerCase();
    const regex = new RegExp('(.*?).(jpg|JPG|GIF|PNG|JPEG|png|gif|jpeg|doc|DOC|pdf|PDF|docx|DOCX)$'); // add or remove required extensions here
    const regexTest = regex.test(valToLower);
    return !regexTest ? { notSupportedFileType: true } : null;
  }
}
