# Persian Date Time Picker for Angular

[![npm](https://img.shields.io/npm/v/persian-date-time-picker.svg)](https://www.npmjs.com/package/persian-date-time-picker)
[![downloads](https://img.shields.io/npm/dm/persian-date-time-picker.svg)](https://www.npmjs.com/package/persian-date-time-picker)
[![license](https://img.shields.io/npm/l/persian-date-time-picker.svg)](https://github.com/motevalian/persian-date-time-picker-demo)

A lightweight, responsive Angular date picker and time picker for Jalali (Persian/Shamsi) and Gregorian calendars. It supports RTL, ranges, disabled dates and times, custom templates, inline mode, and Angular forms.

**[Live demo](https://motevalian.com/dtp/)** · **[npm package](https://www.npmjs.com/package/persian-date-time-picker)** · **[Report an issue](https://github.com/motevalian/persian-date-time-picker-demo/issues)**

## Features

- Jalali (Persian/Shamsi) and Gregorian calendars
- Date, time, date-time, month, year, and date-range selection
- Responsive popup and inline layouts
- RTL and customizable Persian/English labels
- Template-driven and reactive forms support
- Min/max values, disabled dates, and filter callbacks
- Custom day, month, and year templates
- String, Jalali, Gregorian, or native `Date` output
- Read-only, disabled, input-mask, and placement options

## Compatibility

Package `0.2.x` supports Angular 14 through 22. Install the CDK major that matches your Angular major. Angular, Angular CDK, RxJS, and animations remain peer dependencies because the application must use one compatible copy of each framework package.

## Installation

```bash
npm install persian-date-time-picker @angular/cdk@YOUR_ANGULAR_MAJOR
```

`date-fns` and `date-fns-jalali` are normal package dependencies and install automatically. Consumers do not need to install them separately.

Add the CDK overlay styles to your global stylesheet:

```css
@import '@angular/cdk/overlay-prebuilt.css';
```

Ensure Angular animations are enabled with `provideAnimations()` for standalone configuration or `BrowserAnimationsModule` for NgModules.

## Quick start

```ts
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {PersianDateTimePickerModule} from 'persian-date-time-picker';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [FormsModule, PersianDateTimePickerModule],
  template: `
    <persian-date-picker
      [(ngModel)]="date"
      calendarType="jalali"
      valueFormat="jalali"
      format="yyyy/MM/dd"
      [rtl]="true" />
  `
})
export class ExampleComponent {
  date: Date | string = '1405/01/01';
}
```

### Date range

```html

<persian-date-picker
  [(ngModel)]="range"
  [isRange]="true"
  [rangeInputLabels]="{start: 'From', end: 'To'}"
  calendarType="jalali"/>
```

### Date and time

Time selection is enabled when the date format contains time tokens:

```html

<persian-date-picker
  [(ngModel)]="dateTime"
  format="yyyy/MM/dd HH:mm:ss"
  [showToday]="true"/>
```

### Standalone time picker

```html

<persian-time-picker
  [(ngModel)]="time"
  displayFormat="HH:mm:ss"
  minTime="09:00"
  maxTime="17:00"
  [rtl]="true"/>
```

## Common inputs

| Component | Input                          | Type                                | Purpose                    |
|-----------|--------------------------------|-------------------------------------|----------------------------|
| Date      | `calendarType`                 | `'jalali' \| 'gregorian'`           | Calendar system            |
| Date      | `valueFormat`                  | `'jalali' \| 'gregorian' \| 'date'` | Emitted value              |
| Date      | `mode`                         | `'day' \| 'month' \| 'year'`        | Selection granularity      |
| Date      | `format`                       | `string`                            | Display and parsing format |
| Date      | `isRange` / `isInline` / `rtl` | `boolean`                           | Layout and behavior        |
| Date      | `minDate` / `maxDate`          | `Date \| string`                    | Selection bounds           |
| Date      | `disabledDatesFilter`          | `(date: Date) => boolean`           | Dynamic date disabling     |
| Time      | `displayFormat`                | `string`                            | Time format                |
| Time      | `valueType`                    | `'string' \| 'date'`                | Emitted value              |
| Time      | `minTime` / `maxTime`          | `string`                            | Allowed time range         |
| Time      | `disabledTimesFilter`          | `(date: Date) => boolean`           | Dynamic time disabling     |

+## Customizing colors

The picker exposes CSS custom properties, so you can change its colors without editing library files or using `::ng-deep`.

### Change every picker

Add the variables to your global `styles.scss`:

```css
:root {
  --pdtp-primary: #0f9d76;
  --pdtp-primary-hover: #087f5b;
  --pdtp-primary-soft: #e6f7f1;
  --pdtp-primary-medium: #c8eee2;
  --pdtp-heading: #16332b;
  --pdtp-surface: #ffffff;
}
```

### Theme one picker

Give the component and its popup the same theme class:

```html
<persian-date-picker
  class="ocean-picker"
  cssClass="ocean-picker"
  [(ngModel)]="date" />

<persian-time-picker
  class="ocean-picker"
  cssClass="ocean-picker"
  [(ngModel)]="time" />
```

Then define the colors in the application's global stylesheet:

```css
.ocean-picker {
  --pdtp-primary: #0284c7;
  --pdtp-primary-hover: #0369a1;
  --pdtp-primary-soft: #e0f2fe;
  --pdtp-primary-medium: #bae6fd;
  --pdtp-heading: #0c4a6e;
  --pdtp-surface: #ffffff;
}
```

Use a global stylesheet for the theme class because popup mode renders through the Angular CDK overlay outside the component's local DOM tree. The `class` themes the input, while `cssClass` applies the same theme to the popup.

## Development

```bash
npm install
npm start
npm run build
```

`npm run build` builds the library first and then the demo, ensuring the demo consumes the latest local package output.

## Contributing

Issues and pull requests are welcome. Include the Angular version, a minimal reproduction, and expected behavior when reporting a bug.

## License

MIT
