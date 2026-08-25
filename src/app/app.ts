import { ChangeDetectionStrategy, Component, computed, HostListener, signal } from '@angular/core';
import { ClockFace, DialMode } from './clock-face/clock-face';

type LevelId = 'hour' | 'quarter' | 'five' | 'any';

type Field = 'hour' | 'minute';

interface Level {
  id: LevelId;
  label: string;
  hint: string;
}

type Verdict = { ok: boolean; text: string } | { ok: null; text: string };

const LEVELS: Level[] = [
  { id: 'hour', label: 'Pełne godziny', hint: 'np. 3:00' },
  { id: 'quarter', label: 'Kwadranse', hint: '00, 15, 30, 45' },
  { id: 'five', label: 'Co 5 minut', hint: '00, 05, 10, …' },
  { id: 'any', label: 'Dowolna minuta', hint: 'każda minuta' },
];

const DIALS: { id: DialMode; label: string; title: string }[] = [
  { id: 'both', label: 'Godz. i min.', title: 'Cyfry godzin i minut na tarczy' },
  { id: 'hours', label: 'Godziny', title: 'Tylko cyfry godzin na tarczy' },
  { id: 'none', label: 'Bez cyfr', title: 'Tarcza bez cyfr' },
];

const HOURS: string[] = Array.from({ length: 12 }, (_, i) => String(i + 1));

const FIVES: string[] = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

const KEYPAD: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function drawMinute(level: LevelId): number {
  switch (level) {
    case 'hour':
      return 0;
    case 'quarter':
      return randomInt(4) * 15;
    case 'five':
      return randomInt(12) * 5;
    case 'any':
      return randomInt(60);
  }
}

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ClockFace],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly levels = LEVELS;
  protected readonly dials = DIALS;
  protected readonly hourOptions = HOURS;
  protected readonly keypad = KEYPAD;

  protected readonly level = signal<LevelId>('quarter');
  protected readonly dial = signal<DialMode>('hours');

  protected readonly hour = signal(1);
  protected readonly minute = signal(0);

  protected readonly hourAnswer = signal('');
  protected readonly minuteAnswer = signal('');

  protected readonly activeField = signal<Field>('hour');

  protected readonly verdict = signal<Verdict | null>(null);
  protected readonly answered = signal(false);

  protected readonly correct = signal(0);
  protected readonly wrong = signal(0);

  /** Gotowe minuty do wyboru; pusta lista oznacza wystukiwanie cyfr. */
  protected readonly minuteOptions = computed<string[]>(() => {
    switch (this.level()) {
      case 'hour':
        return ['00'];
      case 'quarter':
        return ['00', '15', '30', '45'];
      case 'five':
        return FIVES;
      case 'any':
        return [];
    }
  });

  protected readonly total = computed(() => this.correct() + this.wrong());

  protected readonly accuracy = computed(() => {
    const total = this.total();
    return total === 0 ? 0 : Math.round((this.correct() / total) * 100);
  });

  constructor() {
    this.draw();
  }

  protected setLevel(id: LevelId): void {
    if (this.level() === id) {
      return;
    }
    this.level.set(id);
    this.newQuestion();
  }

  /** Wygląd tarczy nie zmienia zadania — zegar tylko się przerysowuje. */
  protected setDial(id: DialMode): void {
    this.dial.set(id);
  }

  protected setActiveField(field: Field): void {
    if (this.answered()) {
      return;
    }
    this.activeField.set(field);
  }

  protected pickHour(value: string): void {
    if (this.answered()) {
      return;
    }
    this.hourAnswer.set(value);
    this.verdict.set(null);
    this.activeField.set('minute');
  }

  protected pickMinute(value: string): void {
    if (this.answered()) {
      return;
    }
    this.minuteAnswer.set(value);
    this.verdict.set(null);
  }

  /** Wystukiwanie minut cyfra po cyfrze na poziomie „dowolna minuta”. */
  protected pressDigit(digit: string): void {
    if (this.answered()) {
      return;
    }
    const current = this.minuteAnswer();
    const candidate = current.length >= 2 ? digit : current + digit;
    this.minuteAnswer.set(Number.parseInt(candidate, 10) > 59 ? digit : candidate);
    this.verdict.set(null);
  }

  protected pressBackspace(): void {
    if (this.answered()) {
      return;
    }
    if (this.activeField() === 'hour') {
      this.hourAnswer.set('');
    } else {
      this.minuteAnswer.update((value) => value.slice(0, -1));
    }
    this.verdict.set(null);
  }

  @HostListener('window:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    const key = event.key;
    const onButton = (event.target as HTMLElement | null)?.tagName === 'BUTTON';

    if (key === 'Enter' && !onButton) {
      event.preventDefault();
      this.submit();
      return;
    }

    if (this.answered()) {
      return;
    }

    if (key === 'Backspace') {
      event.preventDefault();
      this.pressBackspace();
      return;
    }

    if (key >= '0' && key <= '9') {
      event.preventDefault();
      this.typeDigit(key);
    }
  }

  protected submit(): void {
    if (this.answered()) {
      this.newQuestion();
      return;
    }

    const hour = Number.parseInt(this.hourAnswer(), 10);
    const minute = Number.parseInt(this.minuteAnswer(), 10);

    if (!Number.isInteger(hour) || hour < 1 || hour > 12) {
      this.activeField.set('hour');
      this.verdict.set({ ok: null, text: 'Wybierz godzinę od 1 do 12.' });
      return;
    }

    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
      this.activeField.set('minute');
      this.verdict.set({ ok: null, text: 'Wybierz minuty od 0 do 59.' });
      return;
    }

    const isCorrect = hour === this.hour() && minute === this.minute();
    this.answered.set(true);

    if (isCorrect) {
      this.correct.update((value) => value + 1);
      this.verdict.set({ ok: true, text: `Dobrze! Zegar wskazuje ${this.formatted()}.` });
    } else {
      this.wrong.update((value) => value + 1);
      this.verdict.set({
        ok: false,
        text: `Niestety nie. Poprawna godzina to ${this.formatted()}.`,
      });
    }
  }

  protected newQuestion(): void {
    this.draw();
    this.hourAnswer.set('');
    this.minuteAnswer.set('');
    this.activeField.set('hour');
    this.verdict.set(null);
    this.answered.set(false);
  }

  protected resetScore(): void {
    this.correct.set(0);
    this.wrong.set(0);
    this.newQuestion();
  }

  protected formatted(): string {
    return `${this.hour()}:${String(this.minute()).padStart(2, '0')}`;
  }

  /** Klawiatura fizyczna: godzina sama przeskakuje do minut, gdy nie da się jej rozbudować. */
  private typeDigit(digit: string): void {
    if (this.activeField() === 'minute') {
      this.pressDigit(digit);
      return;
    }

    const current = this.hourAnswer();

    if (current === '1' && Number.parseInt(current + digit, 10) <= 12) {
      this.hourAnswer.set(current + digit);
      this.activeField.set('minute');
      this.verdict.set(null);
      return;
    }

    if (digit === '0') {
      return;
    }

    this.hourAnswer.set(digit);
    this.verdict.set(null);
    if (digit !== '1') {
      this.activeField.set('minute');
    }
  }

  private draw(): void {
    const previousHour = this.hour();
    const previousMinute = this.minute();
    const level = this.level();

    let hour = previousHour;
    let minute = previousMinute;

    for (let attempt = 0; attempt < 10; attempt++) {
      hour = randomInt(12) + 1;
      minute = drawMinute(level);
      if (hour !== previousHour || minute !== previousMinute) {
        break;
      }
    }

    this.hour.set(hour);
    this.minute.set(minute);
  }
}
