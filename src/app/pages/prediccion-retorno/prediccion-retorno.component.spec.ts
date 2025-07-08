import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrediccionRetornoComponent } from './prediccion-retorno.component';

describe('PrediccionRetornoComponent', () => {
  let component: PrediccionRetornoComponent;
  let fixture: ComponentFixture<PrediccionRetornoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrediccionRetornoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrediccionRetornoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
