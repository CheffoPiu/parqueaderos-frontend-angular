import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaParqueaderosComponent } from './mapa-parqueaderos.component';

describe('MapaParqueaderosComponent', () => {
  let component: MapaParqueaderosComponent;
  let fixture: ComponentFixture<MapaParqueaderosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaParqueaderosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaParqueaderosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
