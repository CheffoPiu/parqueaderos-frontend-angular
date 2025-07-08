import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesProbablesComponent } from './clientes-probables.component';

describe('ClientesProbablesComponent', () => {
  let component: ClientesProbablesComponent;
  let fixture: ComponentFixture<ClientesProbablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesProbablesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientesProbablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
