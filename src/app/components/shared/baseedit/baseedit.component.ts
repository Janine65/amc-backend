import { Component, Input } from '@angular/core';
import { TableData } from '../basetable/basetable.component';
import {DialogService} from 'primeng/dynamicdialog';

export class EditOptions {
  public title?: string;

}

export class EditFields {
  public label = '';
  public field = '';
  public format = '';
  public editable = false;
}

export class EditToolbar {
  public label: string;
  public btnClass: string;
  public icon: string;
  public isDefault: boolean;
  public clickfnc: ((selRec?: TableData, lstData?: TableData[]) => void);
  constructor(label: string, btnClass: string, icon: string, isDefault: boolean, clickfnc: (selRec?: TableData | undefined, lstData?: TableData[] | undefined) => void) {
    this.label = label;
    this.btnClass = btnClass;
    this.icon = icon;
    this.isDefault = isDefault;
    this.clickfnc = clickfnc;
  }
}

@Component({
  selector: 'app-baseedit',
  templateUrl: './baseedit.component.html',
  styleUrls: ['./baseedit.component.scss']
})

export class BaseeditComponent {
  @Input() editOptions: EditOptions = {};
  @Input() editFields: EditFields[] = [];
  @Input() editToolbar: EditToolbar[] = [];
  @Input() editData: TableData = {};
  
  constructor(public dialogService: DialogService) {}

  clickOnToolbar(ind: number) {      
    if (this.editToolbar) {
      console.log(`Button ${this.editToolbar[ind].label} pressed`);
      this.editToolbar[ind].clickfnc(this.editData);
    }
  }
}
