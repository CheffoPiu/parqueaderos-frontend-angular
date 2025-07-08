import { Component } from '@angular/core';
import { ClientesSegmentadosComponent } from "../../clientes-segmentados/clientes-segmentados.component";

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    ClientesSegmentadosComponent
],
  templateUrl: './clientes.component.html',
})
export class AppClientesComponent {
  constructor() {}
}
