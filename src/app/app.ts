import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';
import { ClockFace } from './clock-face/clock-face';

type LevelId = 'hour' | 'quarter' | 'five' | 'any';

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

  protected readonly level = signal<LevelId>('quarter');

  protected readonly hour = signal(1);
  protected readonly minute = signal(0);

  protected readonly hourAnswer = signal('');
  protected readonly minuteAnswer = signal('');

  protected readonly verdict = signal<Verdict | null>(null);
  protected readonly answered = signal(false);

  protected readonly correct = signal(0);
  protected readonly wrong = signal(0);

  private readonly hourField = viewChild<ElementRef<HTMLInputElement>>('hourField');

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

  protected onHourInput(value: string): void {
    this.hourAnswer.set(value);
  }

  protected onMinuteInput(value: string): void {
    this.minuteAnswer.set(value);
  }

  protected submit(): void {
    if (this.answered()) {
      this.newQuestion();
      return;
    }

    const hour = Number.parseInt(this.hourAnswer(), 10);
    const minute = Number.parseInt(this.minuteAnswer(), 10);

    if (!Number.isInteger(hour) || hour < 1 || hour > 12) {
      this.verdict.set({ ok: null, text: 'Wpisz godzinę od 1 do 12.' });
      return;
    }

    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
      this.verdict.set({ ok: null, text: 'Wpisz minuty od 0 do 59.' });
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
    this.verdict.set(null);
    this.answered.set(false);
    this.hourField()?.nativeElement.focus();
  }

  protected resetScore(): void {
    this.correct.set(0);
    this.wrong.set(0);
    this.newQuestion();
  }

  protected formatted(): string {
    return `${this.hour()}:${String(this.minute()).padStart(2, '0')}`;
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
