import {Directive, Input, TemplateRef} from "@angular/core";

@Directive({
  selector: '[dtp-template]',
  standalone: true,
  host: {}
})
export class CustomTemplate {

  @Input() type: string | undefined;
  @Input('dtp-template') name: string | undefined;

  constructor(public templateRef: TemplateRef<any>) {
  }

  getType(): string {
    return this.name!;
  }
}
