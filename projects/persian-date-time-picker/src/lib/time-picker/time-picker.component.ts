import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  runInInjectionContext,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import {CdkOverlayOrigin, ConnectedOverlayPositionChange, OverlayModule} from '@angular/cdk/overlay';
import {slideMotion} from '../utils/animation/slide';
import {LanguageLocale} from '../utils/models';
import {PersianDateTimePickerService} from '../persian-date-time-picker.service';
import {DateAdapter, GregorianDateAdapter, JalaliDateAdapter} from '../date-adapter';
import {TimeConfig, TimeFormat, TimeValueType} from '../utils/types';
import {DEFAULT_DATE_PICKER_POSITIONS, NzConnectedOverlayDirective} from "../utils/overlay/overlay";
import {NgFor, NgIf, NgTemplateOutlet} from '@angular/common';
import {DateMaskDirective} from '../utils/input-mask.directive';

@Component({
  selector: 'persian-time-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    ReactiveFormsModule,
    NgTemplateOutlet,
    DateMaskDirective,
    OverlayModule,
    NzConnectedOverlayDirective
  ],
  providers: [
    PersianDateTimePickerService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true
    }
  ],
  host: {
    '(click)': 'open()'
  },
  animations: [slideMotion]
})
export class TimePickerComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges {

  @Input() placeholder?: string;
  @Input() rtl = false;
  @Input() placement: 'left' | 'right' = 'right';
  @Input() minTime?: string;
  @Input() maxTime?: string;
  @Input() lang!: LanguageLocale;
  @Input() valueType: TimeValueType = 'string';
  @Input() cssClass = '';
  @Input() showIcon = true;
  @Input() dateAdapter: DateAdapter<Date>;
  @Input() inline = false;
  @Input() disableInputMask = false;
  @Input() disabled = false;
  @Input() disabledTimesFilter?: (date: Date) => boolean;
  @Input() allowEmpty = true;
  @Input() readOnly = false;
  @Input() readOnlyInput = false;
  @Output() timeChange = new EventEmitter<Date | string>();
  @Output() openChange = new EventEmitter<boolean>();
  @ViewChild('timePickerInput') timePickerInput!: ElementRef<HTMLInputElement>;
  @ViewChild('popupWrapper') popupWrapper!: ElementRef<HTMLDivElement>;
  timeFormat: TimeFormat = '12';
  showSeconds = false;
  hours: number[] = [];
  minutes: number[] = Array.from({length: 60}, (_, i) => i);
  seconds: number[] = Array.from({length: 60}, (_, i) => i);
  periods: string[] = [];
  selectedTime: TimeConfig = {
    hour: 12,
    minute: 0,
    second: 0,
    period: ''
  };
  isOpen = false;
  form?: FormGroup;
  origin?: CdkOverlayOrigin;
  overlayPositions = [...DEFAULT_DATE_PICKER_POSITIONS];
  private timeoutId: number | null = null;

  constructor(public formBuilder: FormBuilder, public elementRef: ElementRef, public injector: Injector, public changeDetectorRef: ChangeDetectorRef, public persianDateTimePickerService: PersianDateTimePickerService, public jalaliDateAdapter: JalaliDateAdapter, public gregorianDateAdapter: GregorianDateAdapter) {
    this.dateAdapter = this.gregorianDateAdapter;
    this.initializeForm();
    this.initializeLocale();
  }

  private _displayFormat = 'hh:mm a';

  get displayFormat(): string {
    return this._displayFormat;
  }

  @Input() set displayFormat(value: string) {
    this._displayFormat = value;
    this.showSeconds = value.toLowerCase().includes('s');
    // Infer time format from display format
    this.timeFormat = this.getTimeFormatFromDisplayFormat(value);
    this.updateHourRange();
    this.updateTimeDisplay();
  }

  private _value: string | Date | null = null;

  // Value accessors and form control
  get value(): Date | string | null {
    return this._value;
  }

  set value(val: Date | string | null) {
    this._value = val;
    this.updateFromValue(val);
  }

  private _selectedDate: Date | null = new Date();

  get selectedDate(): Date | null {
    return this._selectedDate;
  }

  @Input() set selectedDate(date: Date | null) {
    if (date) {
      this._selectedDate = date;
    }
  }

  // Lifecycle hooks
  ngOnInit(): void {
    this.updateHourRange();
    runInInjectionContext(this.injector, () => {
      this.origin = new CdkOverlayOrigin(this.elementRef);
    });
    this.setupInputSubscription();
    this.value = this.selectedDate;

    // Only add document click listener for non-inline mode
    if (!this.inline) {
      document.addEventListener('click', this.handleDocumentClick);
    }

    // Auto-open for inline mode
    if (this.inline) {
      this.isOpen = true;
      this.scrollToTime();
    }
  }

  ngOnDestroy(): void {
    this.cleanupTimeouts();
    document.removeEventListener('click', this.handleDocumentClick);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rtl'] || changes['lang']) {
      this.updateLocale();
    }
    if (changes['rtl'] && !changes['dateAdapter']) {
      this.dateAdapter = this.rtl ? this.jalaliDateAdapter : this.gregorianDateAdapter;
    }
  }

  // Initialization methods
  initializeForm(): void {
    this.form = this.formBuilder.group({
      timeInput: ['']
    });
  }

  initializeLocale(): void {
    this.lang = this.persianDateTimePickerService.englishLocale;
    this.selectedTime.period = this.lang.am;
    this.periods = [this.lang.am, this.lang.pm];
  }

  updateLocale(): void {
    this.lang = this.rtl ? this.persianDateTimePickerService.persianLocale : this.persianDateTimePickerService.englishLocale;
    this.selectedTime.period = this.lang.am;
    this.periods = [this.lang.am, this.lang.pm];
    this.placeholder = this.lang.selectTime;
  }

  setupInputSubscription(): void {
    this.form!.get('timeInput')?.valueChanges.subscribe(value => {
      if (!value) return;

      if (!this.isOpen) {
        this.validateAndUpdateTime(value);
      } else {
        this.parseTimeString(value);
        this.scrollToTime();
      }
    });
  }

  // Time management
  updateHourRange(): void {
    const format = this.getTimeFormatFromDisplayFormat(this._displayFormat);
    this.hours = format === '12'
      ? Array.from({length: 12}, (_, i) => i + 1)
      : Array.from({length: 24}, (_, i) => i);
  }

  formatTime(date?: Date): string {
    if (!date && !this.dateAdapter) return '';

    const currentDate = date || this.updateDateFromSelection();
    return this.dateAdapter.format(currentDate, this._displayFormat);
  }

  parseTimeString(value: string | Date): void {
    if (!this.dateAdapter) return;

    const date = value instanceof Date ? value : this.dateAdapter.parse(value, this._displayFormat);
    if (!date) return;

    const hours = this.dateAdapter.getHours(date);
    const minutes = this.dateAdapter.getMinutes(date);
    const seconds = this.dateAdapter.getSeconds(date);

    if (hours === null || minutes === null || seconds === null) return;

    this.selectedTime = {
      hour: hours,
      minute: minutes,
      second: seconds,
      period: hours >= 12 ? this.lang.pm : this.lang.am
    };

    this.changeDetectorRef.markForCheck();
  }

  updateFromValue(value: Date | string | null): void {
    if (!value) {
      this.resetSelection();
      return;
    }

    if (value instanceof Date) {
      this.updateFromDate(value);
    } else {
      this.parseTimeString(value);
    }
  }

  updateFromDate(date: Date | null): void {
    if (date && !isNaN(date.getTime()) && this.dateAdapter) {
      const hours = this.dateAdapter.getHours(date);
      if (hours === null) return;

      this.selectedTime = {
        hour: hours,
        minute: this.dateAdapter.getMinutes(date) ?? 0,
        second: this.dateAdapter.getSeconds(date) ?? 0,
        period: hours >= 12 ? this.lang.pm : this.lang.am
      };
    } else {
      this.resetSelection();
    }

    this.changeDetectorRef.markForCheck();
  }

  resetSelection(): void {
    this.selectedTime = {
      hour: 0,
      minute: 0,
      second: 0,
      period: this.lang.am
    };
    this.changeDetectorRef.markForCheck();
  }

  writeValue(value: Date | string | null): void {
    if (!value) {
      this.value = null;
      return;
    }

    if (value instanceof Date) {
      this.value = value;
    } else if (value.trim()) {
      const date = this.selectedDate;
      this.value = !isNaN(date!.getTime()) && this.valueType === 'date' ? date : value;
      this.parseTimeString(value);
    }

    this.updateTimeDisplay();
    this.save(false);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // UI Event handlers
  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab' || event.key === 'Enter') {
      this.handleTimeInput();
      if (event.key === 'Tab') this.close();
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  handleTimeInput(): void {
    const currentValue = this.form!.get('timeInput')?.value;
    if (currentValue || (!currentValue && !this.allowEmpty)) {
      this.validateAndUpdateTime(currentValue);
    }
  }

  handleDocumentClick = (event: MouseEvent): void => {
    if (!this.elementRef.nativeElement.contains(event.target) && this.isOpen) {
      this.close();
      this.handleTimeInput();
    }
  };

  onFocusInput(): void {
    if (!this.isOpen) {
      this.open();
    }
  }

  toggleTimePicker(event: Event): void {
    event.stopPropagation();
    this.isOpen ? this.close() : this.open();
  }

  // Picker operations
  open(): void {
    if (this.inline || this.disabled || this.readOnly) return;

    const wasOpen = this.isOpen;
    this.isOpen = true;
    this.openChange.emit(true);
    this.scrollToTime();

    if (!wasOpen) {
      this.changeDetectorRef.markForCheck();
    }
  }

  close(): void {
    if (this.inline) return;

    this.cleanupTimeouts();
    if (this.isOpen) {
      this.isOpen = false;
      this.openChange.emit(false);
      this.changeDetectorRef.markForCheck();
    }
  }

  // Selection methods
  selectHour(hour: number): void {
    if (!this.isHourDisabled(hour)) {
      this.selectedTime.hour = hour;
      this.updateTimeDisplay();
      this.scrollToSelectedItem(`h${hour}`);
      if (this.inline) this.save();
    }
  }

  selectMinute(minute: number): void {
    if (!this.isMinuteDisabled(minute)) {
      this.selectedTime.minute = minute;
      this.updateTimeDisplay();
      this.scrollToSelectedItem(`m${minute}`);
      if (this.inline) this.save();
    }
  }

  selectSecond(second: number): void {
    if (!this.isSecondDisabled(second)) {
      this.selectedTime.second = second;
      this.updateTimeDisplay();
      this.scrollToSelectedItem(`s${second}`);
      if (this.inline) this.save();
    }
  }

  selectPeriod(period: string): void {
    this.selectedTime.period = period;
    this.updateTimeDisplay();
  }

  selectNow(): void {
    const now = this.selectedDate;
    this.selectedTime = {
      hour: now!.getHours(),
      minute: now!.getMinutes(),
      second: now!.getSeconds(),
      period: now!.getHours() >= 12 ? this.lang.pm : this.lang.am
    };

    this.updateTimeDisplay();
    this.scrollToTime();
    this.save();
  }

  save(close = true): void {
    const date = this.updateDateFromSelection();
    const {
      isValid,
      normalizedDate
    } = this.validateAndNormalizeTime(date);

    if (!isValid || !normalizedDate) return;

    const outputValue = this.valueType === 'date'
      ? normalizedDate
      : this.formatTime(normalizedDate);

    const valueChanged = JSON.stringify(this._value) !== JSON.stringify(outputValue);
    if (valueChanged) {
      this._value = outputValue;
      this.form!.get('timeInput')?.setValue(this.formatTime(normalizedDate), {emitEvent: false});

      this.onChange(outputValue);
      this.timeChange.emit(outputValue);
      this.changeDetectorRef.markForCheck();
    }

    if (close && !this.inline) {
      this.close();
    }
  }

  // Validation methods
  validateAndUpdateTime(value: string): void {
    if (!value || !this.dateAdapter) {
      this.updateTimeDisplay();
      return;
    }

    try {
      const parsedDate = this.dateAdapter.parse(value, this._displayFormat);
      if (!parsedDate) {
        this.updateTimeDisplay();
        return;
      }

      const {
        isValid,
        normalizedDate
      } = this.validateAndNormalizeTime(parsedDate);
      const formattedTime = this.dateAdapter.format(normalizedDate!, this._displayFormat);
      this.form!.get('timeInput')?.setValue(formattedTime, {emitEvent: false});
      this.parseTimeString(normalizedDate!);

      const outputValue = this.valueType === 'date' ? normalizedDate : formattedTime;
      this._value = outputValue;
      this.onChange(outputValue);
      this.timeChange.emit(outputValue!);

    } catch (error) {
      console.error('Error normalizing time:', error);
      this.updateTimeDisplay();
    }
  }

  isHourDisabled(hour: number): boolean {
    if (!this.dateAdapter) return false;
    return this.isFullHourDisabled(hour);
  }

  isMinuteDisabled(minute: number): boolean {
    if (!this.dateAdapter) return false;
    return this.isFullMinuteDisabled(minute);
  }

  isSecondDisabled(second: number): boolean {
    if (!this.dateAdapter) return false;
    const testConfig = {
      ...this.selectedTime,
      second
    };
    const testDate = this.createDateWithTime(testConfig);
    return this.isTimeDisabled(testDate);
  }

  isTimeDisabled(testDate: Date): boolean {
    if (!this.dateAdapter) return false;

    if (this.minTime) {
      const minDate = this.dateAdapter.parse(this.minTime, this._displayFormat);
      if (minDate && this.dateAdapter.isBefore(testDate, minDate)) {
        return true;
      }
    }

    if (this.maxTime) {
      const maxDate = this.dateAdapter.parse(this.maxTime, this._displayFormat);
      if (maxDate && this.dateAdapter.isAfter(testDate, maxDate)) {
        return true;
      }
    }

    return this.disabledTimesFilter ? this.disabledTimesFilter(testDate) : false;
  }

  validateAndNormalizeTime(date: Date): { isValid: boolean; normalizedDate: Date | null } {
    if (!this.dateAdapter) {
      return {
        isValid: false,
        normalizedDate: null
      };
    }

    let isValid = true;
    // Clone the date to avoid modifying the original
    let normalizedDate = this.dateAdapter.clone(date);
    if (this.isTimeDisabled(normalizedDate)) {
      isValid = false;
      // Try to find nearest valid time (check next and previous 48 intervals of 30 minutes)
      for (let i = 1; i <= 48; i++) {
        const nextTime = this.dateAdapter.addMinutes(date, i * 30);
        const prevTime = this.dateAdapter.addMinutes(date, -i * 30);

        if (!this.isTimeDisabled(nextTime)) {
          normalizedDate = nextTime;
          break;
        }
        if (!this.isTimeDisabled(prevTime)) {
          normalizedDate = prevTime;
          break;
        }
      }

      // If still disabled after trying to find valid time
      if (this.isTimeDisabled(normalizedDate)) {
        return {
          isValid: false,
          normalizedDate: null
        };
      }
    }

    return {
      isValid: isValid,
      normalizedDate
    };
  }

  // Helper methods
  createDateWithTime(config: TimeConfig): Date {
    if (!this.dateAdapter) return this.selectedDate!;

    let testHour = config.hour;
    if (this.timeFormat === '12') {
      if (config.period === this.lang.pm && testHour < 12) testHour += 12;
      if (config.period === this.lang.am && testHour === 12) testHour = 0;
    }

    let date = this.selectedDate;
    date = this.dateAdapter.setHours(date!, testHour);
    date = this.dateAdapter.setMinutes(date!, config.minute);
    date = this.dateAdapter.setSeconds(date!, config.second);
    return date;
  }

  updateDateFromSelection(): Date {
    if (!this.dateAdapter) return this.selectedDate!;

    let hours = this.selectedTime.hour;
    if (this.timeFormat === '12') {
      if (this.selectedTime.period === this.lang.pm && hours < 12) hours += 12;
      if (this.selectedTime.period === this.lang.am && hours === 12) hours = 0;
    }

    let date = this._value instanceof Date ?
      this.dateAdapter.clone(this._value) :
      this.selectedDate;

    date = this.dateAdapter.setHours(date!, hours);
    date = this.dateAdapter.setMinutes(date!, this.selectedTime.minute);
    date = this.dateAdapter.setSeconds(date!, this.selectedTime.second);

    return date;
  }

  updateTimeDisplay(): void {
    if (this.form) {
      this.form.get('timeInput')?.setValue(this.formatTime(), {emitEvent: false});
    }
  }

  getTimeFormatFromDisplayFormat(format: string): '12' | '24' {
    // Check for 24-hour format indicators
    const has24HourFormat = /\bH{1,2}\b/.test(format);
    return has24HourFormat ? '24' : '12';
  }

  // UI Update methods
  async scrollToTime() {
    await this.scrollToSelectedItem(`h${this.selectedTime.hour}`, 'auto'),
      await this.scrollToSelectedItem(`m${this.selectedTime.minute}`, 'auto'),
      this.showSeconds ? await this.scrollToSelectedItem(`s${this.selectedTime.second}`, 'auto') : '';
  }

  scrollToSelectedItem(id: string, behavior: ScrollBehavior = 'smooth'): Promise<boolean> {
    this.cleanupTimeouts();
    return new Promise((resolve) => {
      if (!id) {
        resolve(false);
        return;
      }

      this.timeoutId = window.setTimeout(() => {
        const selectedElement = this.popupWrapper?.nativeElement.querySelector(`#selector_${id}`);
        if (selectedElement) {
          selectedElement.scrollIntoView({
            behavior,
            block: 'center'
          });
        }
        resolve(true);
      }, 0);
    });
  }

  cleanupTimeouts(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  onPositionChange(position: ConnectedOverlayPositionChange): void {
    this.changeDetectorRef.detectChanges();
  }

  private onChange: (value: any) => void = () => {
  };

  private onTouched: () => void = () => {
  };

  private isFullHourDisabled(hour: number): boolean {
    for (let minute = 0; minute < 60; minute++) {
      const testConfig = {
        ...this.selectedTime,
        hour,
        minute,
        second: 0
      };
      const testDate = this.createDateWithTime(testConfig);

      if (!this.isTimeDisabled(testDate)) {
        return false; // If any minute is enabled, hour is not fully disabled
      }
    }
    return true; // All minutes in hour are disabled
  }

  private isFullMinuteDisabled(minute: number): boolean {
    if (!this.showSeconds) {
      const testConfig = {
        ...this.selectedTime,
        minute,
        second: 0
      };
      const testDate = this.createDateWithTime(testConfig);
      return this.isTimeDisabled(testDate);
    }

    // If showing seconds, check each second
    for (let second = 0; second < 60; second++) {
      const testConfig = {
        ...this.selectedTime,
        minute,
        second
      };
      const testDate = this.createDateWithTime(testConfig);

      if (!this.isTimeDisabled(testDate)) {
        return false; // If any second is enabled, minute is not fully disabled
      }
    }
    return true; // All seconds in minute are disabled
  }
}
