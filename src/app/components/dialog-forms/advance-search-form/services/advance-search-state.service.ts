import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SavedSearchValues {
  formValues: any;
  controlValues: any;
}

@Injectable({
  providedIn: 'root'
})
export class AdvanceSearchStateService {
  private savedStates: Map<string, SavedSearchValues> = new Map();

  constructor() { }

  /**
   * Save the current search form values for a specific module
   * @param module - The module type (order, delivery, invoice, credit_note)
   * @param formValues - The form values to save
   * @param controlValues - Additional control values (like selected items in dropdowns)
   */
  saveSearchState(module: string, formValues: any, controlValues: any = {}) {
    this.savedStates.set(module, {
      formValues: { ...formValues },
      controlValues: { ...controlValues }
    });
  }

  /**
   * Get the saved search form values for a specific module
   * @param module - The module type
   * @returns The saved search state or null if none exists
   */
  getSavedSearchState(module: string): SavedSearchValues | null {
    return this.savedStates.get(module) || null;
  }

  /**
   * Clear saved state for a specific module
   * @param module - The module type
   */
  clearSavedState(module: string) {
    this.savedStates.delete(module);
  }

  /**
   * Clear all saved states
   */
  clearAllSavedStates() {
    this.savedStates.clear();
  }

  /**
   * Check if there's a saved state for a module
   * @param module - The module type
   * @returns True if saved state exists
   */
  hasSavedState(module: string): boolean {
    return this.savedStates.has(module);
  }
}