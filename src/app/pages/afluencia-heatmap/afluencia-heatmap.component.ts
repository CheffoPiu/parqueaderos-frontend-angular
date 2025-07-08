import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api.service';

interface RegistroAfluencia {
  dia_semana: string;
  hora: number;
  conteo: number;
  nombre_estacionamiento: string;
}

@Component({
  standalone: true,
  imports: [CommonModule ,MaterialModule, NgApexchartsModule, TablerIconsModule],
  selector: 'app-afluencia-heatmap',
  templateUrl: './afluencia-heatmap.component.html',
})
export class AfluenciaHeatmapComponent implements OnInit {
  dias: string[] = [];
  horas: string[] = [];
  matrix: number[][] = [];

  parqueaderosDisponibles: string[] = ['Todos'];
  parqueaderoSeleccionado: string = 'Todos';
  originalData: any[] = [];
  chartLabels: string[] = [];
  chartData: number[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
  this.api.obtenerAfluencia().subscribe((res: RegistroAfluencia[]) => {
      console.log("🔵 Datos crudos:", res);
      this.originalData = res;

      const parqueaderos = Array.from(
        new Set(res.map((r: any) => r.estacionamiento))
      ).sort();
      this.parqueaderosDisponibles = ['Todos', ...parqueaderos];

      this.actualizarTabla(res);
      const ranking = this.obtenerRankingParqueaderos();
      this.chartLabels = ranking.map(r => r[0]);
      this.chartData = ranking.map(r => r[1]);

    });
  }

  actualizarTabla(datos: any[]) {
    const diasUnicos = [...new Set(datos.map(r => r.dia_semana))];
    const horasUnicas = [...new Set(datos.map(r => r.hora))].sort((a, b) => a - b);

    const matriz: number[][] = diasUnicos.map(() => Array(horasUnicas.length).fill(0));

    datos.forEach(r => {
      const fila = diasUnicos.indexOf(r.dia_semana);
      const col = horasUnicas.indexOf(r.hora);
      if (fila >= 0 && col >= 0) {
        matriz[fila][col] += r.conteo; 
      }
    });

    this.dias = diasUnicos;
    this.horas = horasUnicas.map(h => `${String(h).padStart(2, '0')}:00`);
    this.matrix = matriz;
  }

  filtrarPorParqueadero() {
    const filtrados = this.parqueaderoSeleccionado === 'Todos'
      ? this.originalData
      : this.originalData.filter(d => d.estacionamiento === this.parqueaderoSeleccionado);
    console.log("🔵 Filtrando por parqueadero:", filtrados);

    this.actualizarTabla(filtrados);
  }

  color(valor: number): string {
    if (valor === 0) return '#f5f5f5';
    if (valor < 5) return '#fde0dc';
    if (valor < 10) return '#ffab91';
    return '#ff7043';
  }

  obtenerRankingParqueaderos() {
    const resumen = new Map<string, number>();

    for (const registro of this.originalData) {
      const nombre = registro.estacionamiento;
      resumen.set(nombre, (resumen.get(nombre) || 0) + registro.conteo);
    }

    // Convertir a array y ordenar descendente
    const resultadoOrdenado = Array.from(resumen.entries())
      .sort((a, b) => b[1] - a[1]);

    return resultadoOrdenado;
  }

  


}
