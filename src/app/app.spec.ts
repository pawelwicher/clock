import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the question', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Która godzina?');
  });

  it('should count a correct answer', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const app = fixture.componentInstance as unknown as {
      hour: () => number;
      minute: () => number;
      hourAnswer: { set: (value: string) => void };
      minuteAnswer: { set: (value: string) => void };
      submit: () => void;
      correct: () => number;
      wrong: () => number;
    };

    app.hourAnswer.set(String(app.hour()));
    app.minuteAnswer.set(String(app.minute()));
    app.submit();

    expect(app.correct()).toBe(1);
    expect(app.wrong()).toBe(0);
  });
});
