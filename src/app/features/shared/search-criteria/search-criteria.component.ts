import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-search-criteria',
    templateUrl: './search-criteria.component.html',
})
export class SearchCriteriaComponent implements OnInit {
    @Input() data: any[] = []
    @Input() showExportButton: boolean = false;
    @Output() close: EventEmitter<any> = new EventEmitter()
    @Output() change: EventEmitter<any> = new EventEmitter()
    @Output() export: EventEmitter<any> = new EventEmitter()
    constructor() { }

    ngOnInit(): void {
         

     }

    onClose() {
        this.close.emit()
    }
    changCriterial() {
        this.change.emit()
    }
    exportData() {
        this.export.emit()
    }
    
}
