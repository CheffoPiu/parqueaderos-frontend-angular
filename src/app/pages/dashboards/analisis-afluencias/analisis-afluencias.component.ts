import { Component } from '@angular/core';

import { AfluenciaHeatmapComponent } from "../../afluencia-heatmap/afluencia-heatmap.component";

@Component({
  selector: 'app-analisis-afluencias',
  standalone: true,
  imports: [
    AfluenciaHeatmapComponent
],
  templateUrl: './analisis-afluencias.component.html',
})
export class AppAnalisisAfluenciasComponent {
  constructor() {}
}
