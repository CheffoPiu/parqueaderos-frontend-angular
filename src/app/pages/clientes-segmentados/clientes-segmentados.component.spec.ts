import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesSegmentadosComponent } from './clientes-segmentados.component';

describe('ClientesSegmentadosComponent', () => {
  let component: ClientesSegmentadosComponent;
  let fixture: ComponentFixture<ClientesSegmentadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesSegmentadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientesSegmentadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
