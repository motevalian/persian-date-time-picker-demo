import {Component} from '@angular/core';
import {
  PersianDateTimePickerModule
} from '../../projects/persian-date-time-picker/src/lib/persian-date-time-picker.module';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {
  CalendarType,
  DatepickerMode,
  TimeValueType,
  ValueFormat
} from '../../projects/persian-date-time-picker/src/lib/utils/types';
import {RangeInputLabels} from '../../projects/persian-date-time-picker/src/lib/utils/models';
import {FormControl, FormGroup, FormsModule} from '@angular/forms';
import {GregorianDateAdapter, JalaliDateAdapter} from '../../projects/persian-date-time-picker/src/lib/date-adapter';
import {JsonPipe, NgIf} from '@angular/common';
import {CustomRender} from './samples/custom-render';
import {DisabledDates} from './samples/disabled/diabled-date';
import {DisabledTimes} from './samples/disabled/diabled-time';

@Component({
  selector: 'app-root',
  imports: [
    PersianDateTimePickerModule,
    FormsModule,
    JsonPipe,
    NgIf,
    CustomRender,
    DisabledDates,
    DisabledTimes
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('slideInOut', [
      state('in', style({
        width: '250px',
        opacity: 1,
      })),
      state('out', style({
        width: '0',
        display: 'none'
      })),
      transition('in => out', [
        animate('300ms ease-in-out')
      ]),
      transition('out => in', [
        animate('300ms ease-in-out')
      ]),
    ])
  ]
})
export class AppComponent {
  title = 'persian-date-time-picker-demo';
  Version = '0.0.5';
  isSidebarOpen = true;
  showPart = 'datepicker';

  // models
  selectedDate: any = '1403/02/11';
  selectedTime: any = new Date();

  // setting
  rtl: boolean = true;
  calendarType: CalendarType = 'jalali';
  mode: DatepickerMode = 'day';
  isRange: boolean = false;
  format: string = 'yyyy/MM/dd HH:mm';
  footerDescription: string = '';
  inputLabel: string = '';
  rangeInputLabel: RangeInputLabels = {
    start: '',
    end: ''
  };
  disabled: boolean = false;
  showSidebar: boolean = false;
  valueFormat: ValueFormat = 'jalali';
  showToday: boolean = false;
  isInline: boolean = false;
  maxDate?: Date | string;
  minDate?: Date | string;
  showIcon: boolean = true;
  allowEmpty: boolean = true;
  timeValueType: TimeValueType = 'string';
  timeDisplayFormat: string = 'HH:mm:ss';
  maxTime?: string;
  minTime?: string;
  readOnly: boolean = false;
  readOnlyInput: boolean = false;

  // examples
  demoCode?: string;

  form = new FormGroup({
    time: new FormControl('17:17'),
    date: new FormControl('2024-09-29T00:00:00')
  });

  /**
   *
   */
  constructor(
    private jalali: JalaliDateAdapter,
    private gregorian: GregorianDateAdapter
  ) {
  }

  ngOnInit(): void {
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleCode(elm: HTMLDivElement) {
    let display = elm.style.display;
    if (display != 'block') {
      elm.style.display = 'block';
      this.updateCode();
    } else {
      elm.style.display = 'none';
    }
  }

  onChangeCalendarType(event: Event) {
    this.calendarType = (<HTMLSelectElement>event.target).value as CalendarType;
    this.updateCode();
  }

  onChangeMode(event: Event) {
    this.mode = (<HTMLSelectElement>event.target).value as DatepickerMode;
    this.updateCode();
  }

  updateCode() {
    if (this.showPart == 'datepicker')
      this.updateDateCode();
    else
      this.updateTimeCode();
  }

  updateDateCode() {
    let settings = `rtl: boolean = ${this.rtl};
        calendarType: CalendarType = ${this.calendarType};
        mode: DatepickerMode = ${this.mode};
        isRange: boolean = ${this.isRange};
        format: string = ${this.format};
        footerDescription: string = ${this.footerDescription};
        inputLabel: string = ${this.inputLabel};
        rangeInputLabel: RangeInputLabels = ${this.rangeInputLabel};
        disabled: boolean = ${this.disabled};
        showSidebar: boolean = ${this.showSidebar};
        valueFormat: ValueFormat = ${this.valueFormat};
        showToday: boolean = ${this.showToday};
        isInline: boolean = ${this.isInline};
        minDate: Date | string = ${this.minDate};
        maxDate: Date | string = ${this.maxDate};
        allowEmpty: boolean = ${this.allowEmpty};
        readOnly: boolean = ${this.readOnly};
        readOnlyInput: boolean = ${this.readOnlyInput};
    `;

    this.demoCode = `
      @Component({
        selector: 'app-root',
        template: '
          <persian-date-picker
            [rtl]="rtl"
            [calendarType]="calendarType"
            [format]="format"
            [footerDescription]="footerDescription"
            [inputLabel]="inputLabel"
            [rangeInputLabels]="rangeInputLabel"
            [showSidebar]="showSidebar"
            [disabled]="disabled"
            [valueFormat]="valueFormat"
            [isRange]="isRange"
            [showToday]="showToday"
            [maxDate]="maxDate"
            [minDate]="minDate"
            [mode]="mode"
            [(ngModel)]="selectedDate"
            (ngModelChange)="onChangeDate($event)"></persian-date-picker>
          <code>Result:  {{ selectedDate | json }}</code>
        ',
        styleUrls: ['./app.component.scss'],
      })
      export class AppComponent{

        // Can accept both Date object and string
        selectedDate: Date | string = 1403/02/11;

        // setting
        ${settings}
        onChangeDate(event:Date | string) {
          console.log('event:',event);
        }
      }
    `;
  }

  updateTimeCode() {
    let settings = `rtl: boolean = ${this.rtl};
        showIcon: boolean = ${this.showIcon};
        timeValueType: TimeValueType = ${this.timeValueType};
        timeDisplayFormat: string = ${this.timeDisplayFormat};
        maxTime: string = ${this.maxTime};
        minTime: string = ${this.minTime};
        isInline: boolean = ${this.isInline};
    `;

    this.demoCode = `
      @Component({
        selector: 'app-root',
        template: '
          <persian-time-picker
            [rtl]="rtl"
            [showIcon]="showIcon"
            [displayFormat]="timeDisplayFormat"
            [valueType]="timeValueType"
            [minTime]="minTime"
            [maxTime]="maxTime"
            [inline]="isInline"
            [(ngModel)]="selectedTime"
            (ngModelChange)="onChange($event)"></persian-time-picker>
          <code>Result:  {{ selectedTime | json }}</code>
        ',
        styleUrls: ['./app.component.scss'],
      })
      export class AppComponent{

        // Can accept both Date object and string
        selectedTime: Date | string = ${this.selectedTime};

        // setting
        ${settings}
        onChangeDate(event:Date | string) {
          console.log('event:',event);
        }
      }
    `;
  }

  onChange(event: any) {
    console.log('event:', event);
  }
}
