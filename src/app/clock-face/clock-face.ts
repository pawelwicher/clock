import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Co jest wypisane na tarczy. */
export type DialMode = 'both' | 'hours' | 'none';

interface Tick {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  major: boolean;
}

interface Numeral {
  x: number;
  y: number;
  label: string;
}

interface Geometry {
  tickOuter: number;
  tickMajorInner: number;
  tickMinorInner: number;
  hourNumerals: number;
  minuteNumerals: number;
  hourHand: number;
  minuteHand: number;
}

const CENTER = 100;

/** Z cyframi minut wszystko zjeżdża do środka, żeby zewnętrzny pierścień był wolny. */
const GEOMETRY: Record<DialMode, Geometry> = {
  both: {
    tickOuter: 78,
    tickMajorInner: 68,
    tickMinorInner: 73,
    hourNumerals: 51,
    minuteNumerals: 89,
    hourHand: 40,
    minuteHand: 66,
  },
  hours: {
    tickOuter: 92,
    tickMajorInner: 82,
    tickMinorInner: 87,
    hourNumerals: 67,
    minuteNumerals: 0,
    hourHand: 52,
    minuteHand: 74,
  },
  none: {
    tickOuter: 92,
    tickMajorInner: 82,
    tickMinorInner: 87,
    hourNumerals: 0,
    minuteNumerals: 0,
    hourHand: 52,
    minuteHand: 74,
  },
};

function point(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

@Component({
  selector: 'app-clock-face',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './clock-face.scss',
  templateUrl: './clock-face.html',
})
export class ClockFace {
  /** Godzina 1-12. */
  readonly hour = input.required<number>();
  /** Minuta 0-59. */
  readonly minute = input.required<number>();
  /** Cyfry na tarczy. */
  readonly dial = input<DialMode>('hours');

  private readonly geometry = computed<Geometry>(() => GEOMETRY[this.dial()]);

  protected readonly ticks = computed<Tick[]>(() => {
    const geometry = this.geometry();
    return Array.from({ length: 60 }, (_, i) => {
      const major = i % 5 === 0;
      const angle = i * 6;
      const outer = point(angle, geometry.tickOuter);
      const inner = point(angle, major ? geometry.tickMajorInner : geometry.tickMinorInner);
      return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, major };
    });
  });

  protected readonly numerals = computed<Numeral[]>(() => {
    const radius = this.geometry().hourNumerals;
    if (radius === 0) {
      return [];
    }
    return Array.from({ length: 12 }, (_, i) => {
      const label = i + 1;
      const { x, y } = point(label * 30, radius);
      return { x, y, label: String(label) };
    });
  });

  protected readonly minuteNumerals = computed<Numeral[]>(() => {
    const radius = this.geometry().minuteNumerals;
    if (radius === 0) {
      return [];
    }
    return Array.from({ length: 12 }, (_, i) => {
      const value = i * 5;
      const { x, y } = point(value * 6, radius);
      return { x, y, label: String(value).padStart(2, '0') };
    });
  });

  protected readonly hourTip = computed(() => CENTER - this.geometry().hourHand);

  protected readonly minuteTip = computed(() => CENTER - this.geometry().minuteHand);

  protected readonly minuteAngle = computed(() => this.minute() * 6);

  protected readonly hourAngle = computed(() => (this.hour() % 12) * 30 + this.minute() * 0.5);
}
