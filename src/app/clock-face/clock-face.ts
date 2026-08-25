import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

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
  label: number;
}

const CENTER = 100;

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

  protected readonly ticks = computed<Tick[]>(() =>
    Array.from({ length: 60 }, (_, i) => {
      const major = i % 5 === 0;
      const angle = i * 6;
      const outer = point(angle, 92);
      const inner = point(angle, major ? 82 : 87);
      return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, major };
    }),
  );

  protected readonly numerals = computed<Numeral[]>(() =>
    Array.from({ length: 12 }, (_, i) => {
      const label = i + 1;
      const { x, y } = point(label * 30, 67);
      return { x, y, label };
    }),
  );

  protected readonly minuteAngle = computed(() => this.minute() * 6);

  protected readonly hourAngle = computed(() => (this.hour() % 12) * 30 + this.minute() * 0.5);
}
