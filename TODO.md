# Advance Search Form for Order Transactions - Verification and Testing Plan

## Overview
This document outlines the comprehensive verification and testing plan for the advance search functionality in order transactions. The goal is to ensure that the form properly initializes with default values, pre-fills multi-select fields from initial criteria, handles date ranges correctly, and integrates seamlessly with data tables, navbar, and export functionality.

## Key Files to Verify
- `src/app/components/dialog-forms/advance-search-form/advance-search-form-order/advance-search-form-order.component.ts`
- `src/app/components/dialog-forms/advance-search-form/advance-search-form-order/advance-search-form-order.component.html`
- `src/app/components/main/transaction/orders/order-data-table/order-data-table.component.ts`
- `src/app/components/navbar/navbar.component.ts`
- `src/app/services/event-bus.service.ts`

## Key Methods to Test
- `populateFormWithInitialCriteria()` - Pre-fills form with criteria
- `onChangeCriteria()` - Emits CHANGE_CRITERIA event
- `setFormValues()` - Patches form controls
- `ensureArray()` - Helper for array normalization

## Verification Steps

### 1. Form Initialization
- [ ] Verify form initializes with current month date range (start: first day, end: last day)
- [ ] Confirm default startdate is first day of current month
- [ ] Confirm default enddate is last day of current month
- [ ] Test that enddate defaults to startdate when only startdate is provided

### 2. Multi-Select Pre-filling
- [ ] Test customer field pre-fills from initialCriteria.customer_id
- [ ] Test branch plant (storage_location_id) pre-fills correctly
- [ ] Test service channel (channel_name) pre-fills correctly
- [ ] Verify FormControls are patched with selected objects, not just IDs
- [ ] Test array normalization with ensureArray() helper

### 3. Form Patching
- [ ] Verify setFormValues() patches all form controls correctly
- [ ] Test patching of single values vs arrays
- [ ] Confirm multi-select FormControls are updated with filtered objects
- [ ] Test edge cases: null/undefined criteria, empty arrays

### 4. Data Table Integration
- [ ] Verify onChangeCriteria() emits CHANGE_CRITERIA event with currentSearchCriteria
- [ ] Test event payload includes route and currentSearchCriteria
- [ ] Confirm data table refreshes based on applied criteria
- [ ] Test pagination works with applied filters

### 5. Navbar Integration
- [ ] Verify navbar listens for CHANGE_CRITERIA event
- [ ] Test navbar updates search criteria display
- [ ] Confirm criteria display shows applied filters correctly

### 6. Export Integration
- [ ] Test export includes current criteria
- [ ] Verify exported data matches filtered results
- [ ] Confirm export functionality works with applied search criteria

## Testing Checklist

### Unit Tests
- [ ] Form initialization with default dates
- [ ] populateFormWithInitialCriteria() with various criteria
- [ ] setFormValues() patching logic
- [ ] ensureArray() helper function
- [ ] Multi-select FormControl patching
- [ ] Date range defaulting logic

### Integration Tests
- [ ] Form to data table communication via events
- [ ] Event emission and handling
- [ ] Navbar update on criteria change
- [ ] Export with current criteria
- [ ] Form reset functionality

### E2E Tests
- [ ] Complete advance search workflow
- [ ] Filter application and data refresh
- [ ] Multi-select field interactions
- [ ] Date range selection and validation
- [ ] Export with applied filters
- [ ] Clear/reset functionality

### Edge Cases
- [ ] Empty initial criteria
- [ ] Partial criteria (some fields missing)
- [ ] Invalid date ranges
- [ ] Large datasets in multi-selects
- [ ] Network errors during data loading
- [ ] Form validation with invalid inputs

### Performance Tests
- [ ] Form initialization time
- [ ] Multi-select rendering with large datasets
- [ ] Search/filter response time
- [ ] Memory usage during form interactions
- [ ] Event handling performance

### Browser Compatibility
- [ ] Chrome latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Edge latest

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast
- [ ] Form labels and ARIA attributes

## Acceptance Criteria
- [ ] All verification steps completed successfully
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] No performance issues detected
- [ ] Browser compatibility confirmed
- [ ] Accessibility requirements met
- [ ] No console errors or warnings
- [ ] Code review completed and approved

## Known Issues
- Form file appears corrupted - setFormValues method is incomplete
- Need to verify multi-select component implementations
- Date formatting may need adjustment for consistency

## Next Steps
1. Fix any identified issues in the code
2. Implement missing test cases
3. Run verification steps
4. Address any failing tests
5. Perform code review
6. Deploy and monitor in production
