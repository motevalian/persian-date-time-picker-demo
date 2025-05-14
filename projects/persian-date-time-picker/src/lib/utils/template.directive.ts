import {Directive, Input, TemplateRef} from "@angular/core";

@Directive({
  selector: '[Template]',
  standalone: true,
  host: {}
})
export class CustomTemplate {
  @Input() type: string | undefined;

  @Input('Template') name: string | undefined;

  constructor(public template: TemplateRef<any>) {
  }

  getType(): string {
    return this.name!;
  }
}
