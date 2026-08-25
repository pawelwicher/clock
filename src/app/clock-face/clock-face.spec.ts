import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClockFace } from './clock-face';

describe('ClockFace', () => {
  let fixture: ComponentFixture<ClockFace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClockFace],
    }).compileComponents();

    fixture = TestBed.createComponent(ClockFace);
    fixture.componentRef.setInput('hour', 3);
    fixture.componentRef.setInput('minute', 15);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should point the hands at the given time', () => {
    const svg = fixture.nativeElement as HTMLElement;
    const rotations = Array.from(svg.querySelectorAll('g')).map((g) => g.getAttribute('transform'));
    expect(rotations).toContain('rotate(97.5 100 100)');
    expect(rotations).toContain('rotate(90 100 100)');
  });
});
