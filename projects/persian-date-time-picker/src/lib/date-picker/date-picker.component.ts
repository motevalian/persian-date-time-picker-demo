import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Injector,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  runInInjectionContext,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors
} from '@angular/forms';
import {slideMotion} from '../utils/animation/slide';
import {DateAdapter, GregorianDateAdapter, JalaliDateAdapter} from '../date-adapter';
import {CustomLabels, DateRange, LanguageLocale, RangeInputLabels} from '../utils/models';
import {DatePickerPopupComponent} from '../date-picker-popup/date-picker-popup.component';
import {
  CdkOverlayOrigin,
  ConnectedOverlayPositionChange,
  ConnectionPositionPair,
  HorizontalConnectionPos,
  OverlayModule,
  VerticalConnectionPos
} from '@angular/cdk/overlay';
import {
  DATE_PICKER_POSITION_MAP,
  DEFAULT_DATE_PICKER_POSITIONS,
  NzConnectedOverlayDirective
} from '../utils/overlay/overlay';
import {DOCUMENT, NgIf, NgTemplateOutlet} from '@angular/common';
import {DestroyService, PersianDateTimePickerService} from '../persian-date-time-picker.service';
import {fromEvent, takeUntil} from 'rxjs';
import {CalendarType, DatePickerMode, Placement, RangePartType, ValueFormat} from '../utils/types';
import {CustomTemplate} from '../utils/template.directive';
import {DateMaskDirective} from '../utils/input-mask.directive';

@Component({
  selector: 'persian-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  host: {
    "[class.persian-date-picker]": "true",
    "[class.persian-date-picker-rtl]": "rtl"
  },
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    OverlayModule,
    NgTemplateOutlet,
    NzConnectedOverlayDirective,
    DateMaskDirective,
    DatePickerPopupComponent
  ],
  providers: [
    DestroyService,
    PersianDateTimePickerService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ],
  animations: [slideMotion]
})
export class DatePickerComponent implements ControlValueAccessor, OnInit, OnChanges, AfterViewInit, OnDestroy {

  // ========== Input Properties ==========
  @Input() rtl = false;
  @Input() mode: DatePickerMode = 'day';
  @Input() isRange = false;
  @Input() customLabels?: Array<CustomLabels>;
  @Input() calendarType: CalendarType = 'gregorian';
  @Input() lang?: LanguageLocale;
  @Input() cssClass = '';
  @Input() footerDescription = '';
  @Input() rangeInputLabels?: RangeInputLabels;
  @Input() inputLabel?: string;
  @Input() placement: Placement = 'bottomRight';
  @Input() disabled = false;
  @Input() isInline = false;
  @Input() showSidebar = true;
  @Input() showToday = false;
  @Input() valueFormat: ValueFormat = 'gregorian';
  @Input() disableInputMask = false;
  @Input() disabledDates: Array<Date | string> = [];
  @Input() disabledDatesFilter?: (date: Date) => boolean;
  @Input() disabledTimesFilter?: (date: Date) => boolean;
  @Input() allowEmpty = false;
  @Input() readOnly = false;
  @Input() readOnlyInput = false;
  // ========== Output Properties ==========
  @Output() onFocus = new EventEmitter<any>();
  @Output() onBlur = new EventEmitter<any>();
  @Output() onChangeValue = new EventEmitter<any>();
  @Output() onOpenChange = new EventEmitter<boolean>();
  // ========== ViewChild/ViewChildren/ContentChildren Properties ==========
  @ViewChild('datePickerInput') datePickerInput?: ElementRef;
  @ViewChildren('rangePickerInput') rangePickerInputs?: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChild(DatePickerPopupComponent) datePickerPopup?: DatePickerPopupComponent;
  @ContentChildren(CustomTemplate) templates!: QueryList<CustomTemplate>;
  // ========== Class Properties ==========
  origin?: CdkOverlayOrigin;
  overlayPositions: ConnectionPositionPair[] = [...DEFAULT_DATE_PICKER_POSITIONS];
  currentPositionX: HorizontalConnectionPos = 'start';
  currentPositionY: VerticalConnectionPos = 'bottom';
  document?: Document;
  isOpen = false;
  selectedDate: Date | null = null;
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  form?: FormGroup;
  dateAdapter?: DateAdapter<Date>;
  activeInput: 'start' | 'end' | '' | null = '';
  hideStateHelper = false;
  isInternalChange = false;
  lastEmittedValue: any = null;
  showTimePicker = false;
  timeDisplayFormat = 'HH:mm';
  documentClickListener?: (event: MouseEvent) => void;

  constructor(public formBuilder: FormBuilder, public elementRef: ElementRef, public injector: Injector, public changeDetectorRef: ChangeDetectorRef, public persianDateTimePickerService: PersianDateTimePickerService, public destroyService: DestroyService, public ngZone: NgZone, public jalaliDateAdapter: JalaliDateAdapter, public gregorianDateAdapter: GregorianDateAdapter, @Inject(DOCUMENT) doc: Document) {
    this.initializeComponent(doc);
  }

  private _minDate: any;

  get minDate(): Date {
    return this._minDate;
  }

  @Input() set minDate(date: Date | string | null) {
    if (date) {
      this._minDate = date;
    }
  };

  private _maxDate: any;

  get maxDate(): Date {
    return this._maxDate;
  }

  @Input() set maxDate(date: Date | string | null) {
    if (date) {
      this._maxDate = date;
    }
  };

  private _format = 'yyyy/MM/dd';

  get format(): string {
    return this._format;
  }

  @Input() set format(value: string) {
    this._format = value;
    this.showTimePicker = this.hasTimeComponent(value);
    this.timeDisplayFormat = this.extractTimeFormat(value);
  }

  get valueAdapter() {
    return this.valueFormat == 'jalali' ? this.jalaliDateAdapter : this.gregorianDateAdapter;
  }

  // ========== Lifecycle Hooks ==========
  ngOnInit(): void {
    this.initialize();
    document.addEventListener('click', this.documentClickListener!);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.handleChanges(changes);
  }

  ngAfterViewInit(): void {
    this.setupAfterViewInit();
    this._minDate = this.valueAdapter?.parse(this._minDate, this.extractDateFormat(this.format));
    this._maxDate = this.valueAdapter?.parse(this._maxDate, this.extractDateFormat(this.format));
  }

  ngOnDestroy(): void {
    this.destroyService.next();
    this.destroyService.complete();
    document.removeEventListener('click', this.documentClickListener!);
  }

  // ========== Initialization Methods ==========
  initializeComponent(doc: Document): void {
    this.origin = new CdkOverlayOrigin(this.elementRef);
    this.document = doc;
    this.form = this.formBuilder.group({
      dateInput: [''],
      startDateInput: [''],
      endDateInput: ['']
    });
    this.documentClickListener = this.handleDocumentClick.bind(this);
    this.lang = this.calendarType === 'jalali' ? this.persianDateTimePickerService.persianLocale : this.persianDateTimePickerService.englishLocale;
    this.persianDateTimePickerService.languageLocale = this.lang;
  }

  initialize(): void {
    this.setDateAdapter();
    this.setupFormControls();
  }

  setupAfterViewInit(): void {
    this.setupActiveInputSubscription();
    this.setupMouseDownEventHandler();
  }

  // ========== Date Adapter Methods ==========
  setDateAdapter(): void {
    this.dateAdapter = this.calendarType === 'jalali' ? this.jalaliDateAdapter : this.gregorianDateAdapter;
  }

  // ========== Form Control Methods ==========
  setupFormControls(): void {
    if (this.isRange) {
      this.form!.get('startDateInput')?.valueChanges.pipe(takeUntil(this.destroyService)).subscribe(value => this.onInputChange(value, 'start'));
      this.form!.get('endDateInput')?.valueChanges.pipe(takeUntil(this.destroyService)).subscribe(value => this.onInputChange(value, 'end'));
    } else {
      this.form!.get('dateInput')?.valueChanges.pipe(takeUntil(this.destroyService)).subscribe(value => this.onInputChange(value));
    }
  }

  // ========== Event Handlers ==========
  handleChanges(changes: SimpleChanges): void {
    if (changes['calendarType']) {
      this.setDateAdapter();
      this.updateInputValue();
      this.lang = this.calendarType === 'jalali' ? this.persianDateTimePickerService.persianLocale : this.persianDateTimePickerService.englishLocale;
      this.persianDateTimePickerService.languageLocale = this.lang;
    }
    if (changes['minDate'] || changes['maxDate']) {
      this._minDate = this.valueAdapter?.parse(this._minDate, this.extractDateFormat(this.format));
      this._maxDate = this.valueAdapter?.parse(this._maxDate, this.extractDateFormat(this.format));
      this.form!.updateValueAndValidity();
    }
    if (changes['mode'] || changes['isRange']) {
      this.setupFormControls();
    }
    if (changes['placement']) {
      this.setPlacement(this.placement);
    }
    if (changes['lang']) {
      this.lang = changes['lang'].currentValue;
      this.persianDateTimePickerService.languageLocale = this.lang;
    }
    if (changes['mode'] && !changes['format']) {
      this.format = this.getFormatForMode();
    }
    if (changes['isRange'] && !this.isRange) {
      runInInjectionContext(this.injector, () => {
        this.origin = new CdkOverlayOrigin(this.elementRef);
      });
    }
    if (changes['valueFormat']) {
      this.emitValueIfChanged();
    }
  }

  handleDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isOpen) {
        this.close();
        this.onInputBlur(this.activeInput as any, event as any);
      }
      this.hideStateHelper = false;
    }
  }

  // ========== Input Handling Methods ==========
  onInputChange(value: string, inputType?: 'start' | 'end'): void {
    if (!this.isInternalChange) {
      if (this.isRange) {
        this.handleRangeInputChange(value, inputType);
      } else {
        this.handleSingleInputChange(value);
      }
      this.updateDatePickerPopup();
    }
  }

  handleRangeInputChange(value: string, inputType?: 'start' | 'end'): void {
    const date = this.dateAdapter!.parse(value, this.format);
    if (date) {
      if (inputType === 'start') {
        this.selectedStartDate = this.clampDate(date);
      } else if (inputType === 'end') {
        this.selectedEndDate = this.clampDate(date);
      }
      this.emitValueIfChanged();
    }
  }

  handleSingleInputChange(value: string): void {
    const date = this.dateAdapter!.parse(value, this.format);
    if (date) {
      this.selectedDate = this.clampDate(date);
      this.emitValueIfChanged();
    }
  }

  // ========== Value Emission Methods ==========
  emitValueIfChanged(): void {
    const newValue = this.prepareValueForEmission();
    if (newValue && JSON.stringify(newValue) !== JSON.stringify(this.lastEmittedValue)) {
      this.lastEmittedValue = newValue;
      this.onChange(newValue);
      this.onChangeValue.emit(newValue);
    }
  }

  prepareValueForEmission(): any {
    if (this.isRange) {
      if (this.selectedStartDate && this.selectedEndDate) {
        return {
          start: this.convertDateToFormat(this.selectedStartDate, this.calendarType),
          end: this.convertDateToFormat(this.selectedEndDate, this.calendarType)
        };
      }
    } else if (this.selectedDate) {
      return this.convertDateToFormat(this.selectedDate, this.calendarType);
    }
    return null;
  }

  // ========== Date Selection Methods ==========
  onDateSelected(date: Date): void {
    const clampedDate = this.clampDate(date);
    if (this.isRange) {
      this.handleRangeDateSelection(clampedDate!);
    } else {
      this.handleSingleDateSelection(clampedDate!);
    }
    this.hideStateHelper = true;
    this.updateDatePickerPopup();
    this.focus();
  }

  handleRangeDateSelection(date: Date): void {
    if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate) ||
      this.dateAdapter!.isBefore(date, this.selectedStartDate)) {
      this.selectedStartDate = date;
      this.selectedEndDate = null;
      this.form!.get('startDateInput')?.setValue(this.dateAdapter!.format(date, this.format), {emitEvent: false});
      this.form!.get('endDateInput')?.setValue('', {emitEvent: false});
    } else {
      this.selectedEndDate = date;
      this.form!.get('endDateInput')?.setValue(this.dateAdapter!.format(date, this.format), {emitEvent: false});
      this.emitValueIfChanged();
      this.close();
    }
  }

  handleSingleDateSelection(date: Date): void {
    this.selectedDate = date;
    const formattedDate = this.dateAdapter!.format(date, this.format);
    this.form!.get('dateInput')?.setValue(formattedDate, {emitEvent: false});
    this.emitValueIfChanged();
    this.close();
  }

  // ========== Date Range Methods ==========
  onDateRangeSelected(dateRange: DateRange): void {
    this.hideStateHelper = true;

    this.selectedStartDate = this.clampDate(<Date>dateRange.start);
    const startFormatted = this.dateAdapter!.format(this.selectedStartDate!, this.format);
    this.form!.get('startDateInput')?.setValue(startFormatted, {emitEvent: false});

    if (dateRange.end) {
      this.selectedEndDate = this.clampDate(<Date>dateRange.end);
      const endFormatted = this.dateAdapter!.format(this.selectedEndDate!, this.format);
      this.form!.get('endDateInput')?.setValue(endFormatted, {emitEvent: false});
      this.emitValueIfChanged();
      if (!this.hasTimeComponent(this.format)) this.close();
      this.updateDatePickerPopup();
      this.focus();
    }
  }

  // ========== UI State Methods ==========
  close(): void {
    if (this.isInline) {
      return;
    }
    if (this.isOpen) {
      this.isOpen = false;
      this.onOpenChange.emit(false);
      this.changeDetectorRef.markForCheck();
    }
  }

  open(): void {
    if (this.isInline || this.isOpen || this.disabled || this.readOnly) {
      return;
    }
    this.isOpen = true;
    this.onOpenChange.emit(true);
    this.focus();
    this.changeDetectorRef.markForCheck();
  }

  focus(): void {
    const activeInputElement = this.getInput(this.activeInput!);
    if (this.document!.activeElement !== activeInputElement) {
      activeInputElement?.focus();
      const length = activeInputElement?.value?.length;
      activeInputElement?.setSelectionRange(length!, length!);
    }
  }

  // ========== UI Helper Methods ==========
  getInput(partType?: RangePartType): HTMLInputElement | undefined {
    if (this.isInline) {
      return undefined;
    }
    return this.isRange
      ? partType === 'start'
        ? this.rangePickerInputs?.first.nativeElement
        : this.rangePickerInputs?.last.nativeElement
      : this.datePickerInput?.nativeElement;
  }

  getPlaceholder(inputType: string | null = null): string {
    if (inputType === 'start') return this.lang!.startDate;
    if (inputType === 'end') return this.lang!.endDate;

    switch (this.mode) {
      case 'month':
        return this.lang!.selectMonth;
      case 'year':
        return this.lang!.selectYear;
      default:
        return this.lang!.selectDate;
    }
  }

  // ========== Date Validation Methods ==========
  clampDate(date: Date): Date | null {
    if (!date) return date;

    let adjustedDate: Date | null = this.dateAdapter!.clone(date);

    if (this.minDate && this.dateAdapter!.isBefore(adjustedDate, this.minDate)) {
      return this.minDate;
    }
    if (this.maxDate && this.dateAdapter!.isAfter(adjustedDate, this.maxDate)) {
      return this.maxDate;
    }

    if (this.isDateDisabled(adjustedDate)) {
      // Find the nearest enabled date
      adjustedDate = this.findNearestValidDate(adjustedDate);
    }

    // Preserve the original time if format includes time
    adjustedDate = this.clampDateTime(adjustedDate, date);

    return adjustedDate;
  }

  clampDateTime(adjustedDate: Date | null, date: Date) {
    if (this.hasTimeComponent(this.format)) {
      adjustedDate!.setHours(date.getHours());
      adjustedDate!.setMinutes(date.getMinutes());
      adjustedDate!.setSeconds(date.getSeconds());
      let {normalizedDate} = this.validateAndNormalizeTime(adjustedDate!);
      adjustedDate = normalizedDate;
    }
    return adjustedDate;
  }

  findNearestValidDate(date: Date) {
    let nextDate = this.dateAdapter!.addDays(date, 1);
    let prevDate = this.dateAdapter!.addDays(date, -1);

    while (this.isDateDisabled(nextDate) && this.isDateDisabled(prevDate)) {
      nextDate = this.dateAdapter!.addDays(nextDate, 1);
      prevDate = this.dateAdapter!.addDays(prevDate, -1);
    }

    // Return the first non-disabled date found
    if (!this.isDateDisabled(nextDate)) {
      date = nextDate;
    } else if (!this.isDateDisabled(prevDate)) {
      date = prevDate;
    }
    return date;
  }

  validateAndNormalizeTime(date: Date): { isValid: boolean; normalizedDate: Date | null } {
    if (!this.dateAdapter) {
      return {
        isValid: false,
        normalizedDate: null
      };
    }

    let isValid = true;
    let normalizedDate = this.dateAdapter!.clone(date);

    if (this.isTimeDisabled(normalizedDate)) {
      isValid = false;

      // Get start and end of the current day
      const startOfDay = this.dateAdapter!.clone(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = this.dateAdapter!.clone(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Try to find nearest valid time within the same day
      const currentMinutes = date.getHours() * 60 + date.getMinutes();
      const maxForwardMinutes = (24 * 60) - currentMinutes;
      let validTimeFound = false;

      // Check forward
      for (let i = 1; i <= maxForwardMinutes; i++) {
        const nextTime = this.dateAdapter!.clone(date);
        nextTime.setHours(Math.floor((currentMinutes + i) / 60), (currentMinutes + i) % 60, 0);
        if (nextTime.getTime() <= endOfDay.getTime() && !this.isTimeDisabled(nextTime)) {
          normalizedDate = nextTime;
          validTimeFound = true;
          break;
        }
      }

      // Check backward
      if (!validTimeFound)
        for (let i = 1; i < currentMinutes; i++) {
          const prevTime = this.dateAdapter!.clone(date);
          prevTime.setHours(Math.floor((currentMinutes - i) / 60), (currentMinutes - i) % 60, 0);
          if (prevTime.getTime() >= startOfDay.getTime() && !this.isTimeDisabled(prevTime)) {
            normalizedDate = prevTime;
            break;
          }
        }

      // If no valid time found in the current day, set to start of day
      if (this.isTimeDisabled(normalizedDate)) {
        normalizedDate = startOfDay;
      }
    }

    return {
      isValid: isValid,
      normalizedDate
    };
  }

  parseDisabledDates(): Date[] {
    return this.disabledDates.map(date => {
      if (date instanceof Date) {
        return this.dateAdapter!.startOfDay(date);
      }
      const parsedDate = this.dateAdapter!.parse(date, this.extractDateFormat(this.format));
      return parsedDate || null;
    }).filter(date => date !== null) as Date[];
  }

  isDateDisabled(date: Date): boolean {
    if (!date) return false;

    const dateToCheck = this.dateAdapter!.startOfDay(date);
    // Check if date is in disabled dates array
    const parsedDisabledDates = this.parseDisabledDates();
    const isDisabledDate = parsedDisabledDates.some(disabledDate =>
      this.dateAdapter!.isSameDay(dateToCheck, disabledDate)
    );

    // Check custom filter function if provided
    const isFilterDisabled = this.disabledDatesFilter ?
      this.disabledDatesFilter(dateToCheck) :
      false;

    return isDisabledDate || isFilterDisabled;
  }

  isTimeDisabled(date: Date) {
    return this.disabledTimesFilter ? this.disabledTimesFilter(date) : false;
  }

  // ========== Date Validation Methods (continued) ==========
  dateFormatValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const format = this.getFormatForMode();
    if (!this.dateAdapter!.isValidFormat(value, format)) {
      return {invalidFormat: true};
    }
    return null;
  }

  getFormatForMode(): string {
    switch (this.mode) {
      case 'year':
        return 'yyyy';
      case 'month':
        return 'yyyy/MM';
      default:
        return this.format;
    }
  }

  // ========== Overlay Position Methods ==========
  setPlacement(placement: Placement): void {
    const position: ConnectionPositionPair = DATE_PICKER_POSITION_MAP[placement];
    this.overlayPositions = [position, ...DEFAULT_DATE_PICKER_POSITIONS];
    this.currentPositionX = position.originX;
    this.currentPositionY = position.originY;
  }

  onPositionChange(position: ConnectedOverlayPositionChange): void {
    if (this.currentPositionX !== position.connectionPair.originX ||
      this.currentPositionY !== position.connectionPair.originY) {
      this.currentPositionX = position.connectionPair.originX;
      this.currentPositionY = position.connectionPair.originY;
      this.changeDetectorRef.markForCheck();
    }
  }

  // ========== Input Event Handlers ==========
  onFocusout(event: FocusEvent): void {
    event.preventDefault();
    this.onTouch();
    if (
      !this.elementRef.nativeElement.contains(event.relatedTarget as Node) &&
      !this.datePickerPopup?.elementRef.nativeElement.contains(event.relatedTarget as Node)
    ) {
      this.close();
    }
  }

  onInputBlur(inputType: 'start' | 'end' | null, event: Event): void {
    const inputValue = this.getInputValue(inputType);

    if (typeof inputValue === 'string' && !this.isOpen) {
      const correctedValue = this.validateAndCorrectInput(inputValue);
      if (correctedValue !== inputValue) {
        if (inputValue) {
          this.handleCorrectedValue(inputType, correctedValue);
        } else if (!this.allowEmpty) {
          this.handleCorrectedValue(inputType, correctedValue);
        } else {
          this.selectedDate = null;
          this.onChange(inputValue);
        }
      }
      this.onBlur.emit({
        input: inputType,
        event,
        value: correctedValue
      });
    }
  }

  getInputValue(inputType: 'start' | 'end' | null): string | undefined {
    if (this.isRange) {
      return inputType === 'start'
        ? this.form!.get('startDateInput')?.value
        : this.form!.get('endDateInput')?.value;
    }
    return this.form!.get('dateInput')?.value;
  }

  validateAndCorrectInput(value: string): string {
    let date = this.dateAdapter!.parse(value, this.format);
    if (!date) {
      const today = this.dateAdapter!.today();
      date = this.clampDate(today);
    } else {
      date = this.clampDate(date);
    }
    return this.dateAdapter!.format(date!, this.format);
  }

  handleCorrectedValue(inputType: 'start' | 'end' | null, correctedValue: string): void {
    this.isInternalChange = true;
    if (this.isRange) {
      this.handleRangeCorrectedValue(inputType, correctedValue);
    } else {
      this.handleSingleCorrectedValue(correctedValue);
    }
    this.isInternalChange = false;
  }

  handleRangeCorrectedValue(inputType: 'start' | 'end' | null, correctedValue: string): void {
    if (inputType === 'start') {
      this.form!.get('startDateInput')?.setValue(correctedValue);
      this.selectedStartDate = this.dateAdapter!.parse(correctedValue, this.format);
    } else {
      this.form!.get('endDateInput')?.setValue(correctedValue);
      this.selectedEndDate = this.dateAdapter!.parse(correctedValue, this.format);
    }

    if (this.selectedStartDate && this.selectedEndDate) {
      this.onChange({
        start: this.dateAdapter!.format(this.selectedStartDate, this.format),
        end: this.dateAdapter!.format(this.selectedEndDate, this.format)
      });
    }

    if (this.datePickerPopup) {
      this.datePickerPopup.selectedStartDate = this.selectedStartDate;
      this.datePickerPopup.selectedEndDate = this.selectedEndDate;
      this.datePickerPopup.generateCalendar();
    }
  }

  handleSingleCorrectedValue(correctedValue: string): void {
    this.form!.get('dateInput')?.setValue(correctedValue);
    this.selectedDate = this.dateAdapter!.parse(correctedValue, this.format);
    this.onChange(this.selectedDate);

    if (this.datePickerPopup) {
      this.datePickerPopup.selectedDate = this.selectedDate;
    }
  }

  onFocusInput(inputType: 'start' | 'end' | null, event: Event): void {
    if (this.hideStateHelper == false) {
      this.toggleDatePicker(inputType, event);
      this.hideStateHelper = true;
    } else {
      this.hideStateHelper = false;
    }
  }

  toggleDatePicker(inputType: 'start' | 'end' | null, event: Event): void {
    this.onFocus.emit({
      input: inputType,
      event
    });
    this.activeInput = inputType;
    this.persianDateTimePickerService.activeInput.next(this.activeInput!);
    this.open();
    this.changeDetectorRef.detectChanges();
  }

  onInputKeydown(event: KeyboardEvent): void {
    if ((!event.shiftKey && event.key === 'Tab') || (!event.shiftKey && event.key === 'Enter')) {
      if (this.isRange) {
        return;
      }
      this.close();
    }
  }

  // ========== Update Methods ==========
  updateInputValue(): void {
    if (this.isRange) {
      if (this.selectedStartDate) {
        this.form!.get('startDateInput')?.setValue(
          this.dateAdapter!.format(this.selectedStartDate, this.format)
        );
      }
      if (this.selectedEndDate) {
        this.form!.get('endDateInput')?.setValue(
          this.dateAdapter!.format(this.selectedEndDate, this.format)
        );
      }
    } else if (this.selectedDate) {
      this.form!.get('dateInput')?.setValue(
        this.dateAdapter!.format(this.selectedDate, this.format)
      );
    }
  }

  updateDatePickerPopup(): void {
    if (this.datePickerPopup) {
      if (this.isRange) {
        this.datePickerPopup.selectedStartDate = this.selectedStartDate;
        this.datePickerPopup.selectedEndDate = this.selectedEndDate;
        if (this.showTimePicker) {
          this.datePickerPopup!.timePicker!.updateFromDate(
            this.activeInput == 'start' ?
              this.selectedStartDate :
              this.selectedEndDate
          );
          this.datePickerPopup!.timePicker!.scrollToTime();
        }
      } else {
        this.datePickerPopup.selectedDate = this.selectedDate;
        if (this.showTimePicker) {
          this.datePickerPopup!.timePicker!.updateFromDate(this.selectedDate);
          this.datePickerPopup!.timePicker!.scrollToTime();
        }
      }
      this.datePickerPopup.generateCalendar();
      this.changeDetectorRef.detectChanges();
    }
  }

  convertDateToFormat(date: Date, fromType: CalendarType): any {
    if (!date) return null;

    switch (this.valueFormat) {
      case 'date':
        return date;
      case 'jalali':
        return this.jalaliDateAdapter.format(date, this.format);
      case 'gregorian':
        return this.gregorianDateAdapter.format(date, this.format);
      default:
        return this.dateAdapter!.format(date, this.format);
    }
  }

  // ========== ControlValueAccessor Implementation ==========
  onChange: any = () => {
  };
  onTouch: any = () => {
  };

  writeValue(value: any): void {
    if (value) {
      this.isInternalChange = true;

      if (this.isRange && typeof value === 'object') {
        const startDate = this.parseIncomingValue(value.start);
        const endDate = this.parseIncomingValue(value.end);

        if (startDate) {
          this.selectedStartDate = startDate;
          this.form!.get('startDateInput')?.setValue(
            this.dateAdapter!.format(startDate, this.format),
            {emitEvent: false}
          );
        }

        if (endDate) {
          this.selectedEndDate = endDate;
          this.form!.get('endDateInput')?.setValue(
            this.dateAdapter!.format(endDate, this.format),
            {emitEvent: false}
          );
        }
      } else {
        const parsedDate = this.parseIncomingValue(value);
        if (parsedDate) {
          this.selectedDate = parsedDate;
          this.form!.get('dateInput')?.setValue(
            this.dateAdapter!.format(parsedDate, this.format),
            {emitEvent: false}
          );
        }
      }

      this.lastEmittedValue = value;
      this.isInternalChange = false;
      this.updateDatePickerPopup();

      this.changeDetectorRef.markForCheck();
    } else {
      this.resetValues();
    }
  }

  resetValues(): void {
    this.isInternalChange = true;
    this.selectedDate = null;
    this.selectedStartDate = null;
    this.selectedEndDate = null;
    this.form!.get('dateInput')?.setValue('', {emitEvent: false});
    this.form!.get('startDateInput')?.setValue('', {emitEvent: false});
    this.form!.get('endDateInput')?.setValue('', {emitEvent: false});
    this.lastEmittedValue = null;
    this.isInternalChange = false;
    this.updateDatePickerPopup();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  // ========== Setup Methods ==========
  setupActiveInputSubscription(): void {
    this.persianDateTimePickerService.activeInput
      .pipe(takeUntil(this.destroyService))
      .subscribe((active: any) => {
        this.activeInput = active;
        if (active) {
          if (!this.isOpen)
            this.origin = new CdkOverlayOrigin(this.activeInput == 'start' ? this.rangePickerInputs?.first : this.rangePickerInputs!.last);
          this.focus();
        }
      });
  }

  setupMouseDownEventHandler(): void {
    this.ngZone.runOutsideAngular(() =>
      fromEvent(this.elementRef.nativeElement, 'mousedown')
        .pipe(takeUntil(this.destroyService))
        .subscribe((event: any) => {
          if ((event.target as HTMLInputElement).tagName.toLowerCase() !== 'input') {
            event.preventDefault();
          }
        })
    );
  }

  parseDateValue(value: any): Date | null {
    if (value instanceof Date) {
      return value;
    }
    return this.dateAdapter!.parse(value, this.format);
  }

  parseValueFromFormat(value: string | Date, targetAdapter: DateAdapter<Date>): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;

    return targetAdapter.parse(value, this.format);
  }

  parseIncomingValue(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    let parsedDate: Date | null = null;

    // try with value adapter
    parsedDate = this.valueAdapter.parse(value, this.format);
    if (parsedDate) return parsedDate;

    return null;
  }

  // ========== Time Methods ==========
  hasTimeComponent(format: string): boolean {
    return /[Hh]|[m]|[s]|[a]/g.test(format);
  }

  extractTimeFormat(format: string): string {
    const timeMatch = format.match(/[Hh]{1,2}:mm(?::ss)?(?:\s*[aA])?/);
    return timeMatch ? timeMatch[0] : 'HH:mm';
  }

  extractDateFormat(format: string): string {
    const dateFormatMatch = format.match(/[yMd\/.-]+/);
    return dateFormatMatch ? dateFormatMatch[0] : '';
  }
}
