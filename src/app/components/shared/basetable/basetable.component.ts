import { Component, Input, OnInit } from '@angular/core';

export class TableOptions {
  public header?: string;
  public field?: string;
  public format? = false;
  public sortable? = false;
  public sorting?: string;
  public filtering? = false;
  public filter?: string;
  
}

export class TableData {
  public id?: number;
  public createdAt?: Date;
  public updatedAt?: Date;

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


}
