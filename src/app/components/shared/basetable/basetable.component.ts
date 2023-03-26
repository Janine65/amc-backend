import { Component, Input, OnInit } from '@angular/core';
import { Table } from 'primeng/table';

export class TableOptions {
  public header?: string;
  public field?: string;
  public format = false;
  public sortable = false;
  public sorting?: string;
  public filtering = false;
  public filter?: string;
  
}

export class TableData {
  public id?: number;
  public createdAt?: Date;
  public updatedAt?: Date;

}

export class TableToolbar {
  public label: string;
  public btnClass: string;
  public icon: string;
  public clickfnc: ((selRec?: TableData, lstData?: TableData[]) => void);
  constructor(label: string, btnClass: string, icon: string, clickfnc: (selRec?: TableData | undefined, lstData?: TableData[] | undefined) => void) {
    this.label = label;
    this.btnClass = btnClass;
    this.icon = icon;
    this.clickfnc = clickfnc;
  }
}

@Component({
    selector: 'app-basetable',
    templateUrl: './basetable.component.html',
    styleUrls: ['./basetable.component.scss']
})

export class BaseTableComponent implements OnInit {
  @Input() tableOptions: TableOptions[] = [];
  @Input() tableData : TableData[] = [];
  @Input() formatFunction: ((field: string, value: string | number | boolean | null) => string | number | boolean | null) | undefined;
  @Input() tableToolbar?: TableToolbar[] = []

  selectedRecord?: TableData;
  filteredRows = this.tableData;

  ngOnInit(): void {
    return;

  }

  buildHeader() : string {
    let allHeader = ''
    this.tableOptions.forEach(col => {
      let header = '<th '
      if (col.sortable)
        header += 'pSortableColumn="' + col.field + '"'
      header += ">" + col.header
      if (col.sortable)
        header += '<p-sortIcon field="' + col.field + '"></p-sortIcon>'
      
      header += '</th> '
      allHeader += header
    })
    
    return allHeader
  }

  clear(table: Table) {
    table.clear();
    }
    checkSorting(): boolean {
      let retVal = false;

      retVal = this.tableOptions.find(opt => opt.filter) != undefined;

      return retVal;
    }
    
    filterEvent(event: any) {
      this.filteredRows = event.filteredValue;
    }

    selectData(data: TableData) {
      console.log(data)
    }
    rowSelect(data: TableData) {
      console.log(data)
    }

    clickOnToolbar(ind: number) {      
      if (this.tableToolbar) {
        console.log(`Button ${this.tableToolbar[ind].label} pressed`)
        this.tableToolbar[ind].clickfnc((this.selectedRecord ? this.selectedRecord: undefined), this.filteredRows)
      }
    }
}
