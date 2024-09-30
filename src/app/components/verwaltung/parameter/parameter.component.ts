import { Component, OnInit } from '@angular/core';
import { ParamData } from '@model/datatypes';
import { BackendService, RetData } from '@app/service';
import { MessageService } from 'primeng/api';
import { Observable, Subject, Subscription } from 'rxjs';

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
        this.parameters = result.data as ParamData[];
        console.log(this.parameters);
        this.loading = false;
      }
    })
  }
  onRowEditInit(parameter: ParamData) {
    this.clonedParameters[parameter.id] = { ...parameter };
  }

  onRowDelete(parameter: ParamData, index: number) {
      this.backendService.delParameterData(parameter)
        .subscribe({next: () => {
          delete this.parameters[index];
        }})
  }

  onRowEditSave(parameter: ParamData, index: number) {
    let sub: Observable<RetData>;
    if (parameter.id == 0)
      sub = this.backendService.addParameterData(parameter);
    else
      sub = this.backendService.updParameterData(parameter);
    sub.subscribe({
      next: (ret) => {
        delete this.clonedParameters[parameter.id];
        this.parameters[index] = ret.data as ParamData;
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
  }
}
