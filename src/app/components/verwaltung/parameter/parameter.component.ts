import { Component, OnInit } from '@angular/core';
import { ParamData } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-parameter',
  templateUrl: './parameter.component.html',
  styles: [
  ]
})
export class ParameterComponent implements OnInit {

  parameters: ParamData[] = [];
  loading = true;

  clonedParameters: { [s: string]: ParamData } = {};

  constructor(private backendService: BackendService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.backendService.getParameterData().subscribe({
      next: (result) => {
        this.parameters = result;
        console.log(this.parameters);
        this.loading = false;
      }
    })
  }
  onRowEditInit(parameter: ParamData) {
    this.clonedParameters[parameter.id] = { ...parameter };
  }

  onRowEditSave(parameter: ParamData) {
    this.backendService.updParameterData(parameter).subscribe({
      next: () => {
        delete this.clonedParameters[parameter.id];
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Parameter is updated' });
      }
    })
  }

  onRowEditCancel(parameter: ParamData, index: number) {
    this.parameters[index] = this.clonedParameters[parameter.id];
    delete this.clonedParameters[parameter.id];
  }

  onAddNewRow(){
    this.parameters.unshift({id: 0, key: '', value: ''});
    this.onRowEditInit(this.parameters[this.parameters.length-1]);
  }
}
