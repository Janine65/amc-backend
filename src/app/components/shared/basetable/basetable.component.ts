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
  public isDefault: boolean;
  public disabledWhenEmpty: boolean;
  public disabledNoSelection: boolean;
  public clickfnc: ((selRec?: TableData, lstData?: TableData[]) => void);
  constructor(label: string, btnClass: string, icon: string, isDefault: boolean, 
      disabledWhenEmpty: boolean, disabledNoSelection: boolean,
      clickfnc: (selRec?: TableData | undefined, lstData?: TableData[] | undefined) => void) {
    this.label = label;
    this.btnClass = btnClass;
    this.icon = icon;
    this.isDefault = isDefault;
    this.disabledWhenEmpty = disabledWhenEmpty;
    this.disabledNoSelection = disabledNoSelection;
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
  @Input() tableData: TableData[] = [];
  @Input() formatFunction: ((field: string, value: string | number | boolean | null) => string | number | boolean | null) | undefined;
  @Input() tableToolbar?: TableToolbar[] = []

  selectedRecord?: TableData;
  filteredRows = this.tableData;

  ngOnInit(): void {
    return;

  }

  clear(table: Table) {
    table.clear();
  }
  checkSorting(): boolean {
    let retVal = false;

    retVal = this.tableOptions.find(opt => opt.filter) != undefined;

    return retVal;
  }

  retDefaultFunc() {
    const funcDefault = this.tableToolbar?.find(entry => entry.isDefault)
    if (funcDefault)
      return funcDefault.clickfnc

    return this.selectData
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterEvent(event: any) {
    this.filteredRows = event.filteredValue;
  }

  selectData(data: TableData) {
    console.log('selectData: ', data);
    this.selectedRecord = data;
    const funcDefault = this.retDefaultFunc()
    if (funcDefault && this.selectedRecord)
      funcDefault(this.selectedRecord)
  }

  isButtonDisabled(ind: number) : boolean {
    if (this.tableToolbar) {
      if (this.filteredRows.length == 0) 
        return this.tableToolbar[ind].disabledWhenEmpty;
      
      if (this.selectedRecord == undefined)
        return this.tableToolbar[ind].disabledNoSelection;
        
      return false;
    }

    return true;
  }

  clickOnToolbar(ind: number) {
    if (this.tableToolbar) {
      console.log(`Button ${this.tableToolbar[ind].label} pressed`)
      this.tableToolbar[ind].clickfnc((this.selectedRecord ? this.selectedRecord : undefined), this.filteredRows)
    }
  }
}
