import { Component } from '@angular/core';
import { MapaParqueaderosComponent } from "src/app/mapa-parqueaderos/mapa-parqueaderos.component";

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    MapaParqueaderosComponent
],
  templateUrl: './parqueaderos.component.html',
})
export class AppParqueaderosComponent {
  constructor() {}
}
