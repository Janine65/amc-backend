/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injector, Pipe, PipeTransform, Type } from '@angular/core';

@Pipe({
  name: 'dynamicPipe',
})
export class DynamicPipe implements PipeTransform {
  public constructor(private injector: Injector) {}

  transform(value: any, requiredPipe: Type<any>, pipeArgs: any): any {
    const injector = Injector.create({
      name: 'DynamicPipe',
      parent: this.injector,
      providers: [
        { provide: requiredPipe }
      ]
    })
    const pipe = injector.get(requiredPipe)
    return pipe.transform(value, pipeArgs);
  }

}
