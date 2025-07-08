import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfluenciaHeatmapComponent } from './afluencia-heatmap.component';

describe('AfluenciaHeatmapComponent', () => {
  let component: AfluenciaHeatmapComponent;
  let fixture: ComponentFixture<AfluenciaHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfluenciaHeatmapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfluenciaHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
