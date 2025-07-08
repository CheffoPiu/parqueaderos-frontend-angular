import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MaterialModule } from 'src/app/material.module';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
  this.http.get<any[]>('http://localhost:8000/afluencia').subscribe((res) => {
    console.log("Datos crudos:", res);

    const diasUnicos = [...new Set(res.map(r => r.dia_semana))];
    const horasUnicas = [...new Set(res.map(r => r.hora))].sort((a, b) => a - b);

    // Inicializar matriz vacía
    const matriz: number[][] = diasUnicos.map(() => Array(horasUnicas.length).fill(0));

    // Rellenar matriz
    res.forEach(r => {
      const fila = diasUnicos.indexOf(r.dia_semana);
      const col = horasUnicas.indexOf(r.hora);
      if (fila >= 0 && col >= 0) {
        matriz[fila][col] = r.conteo;
      }
    });

    this.dias = diasUnicos;
    this.horas = horasUnicas.map(h => `${String(h).padStart(2, '0')}:00`);
    this.matrix = matriz;

    console.log("✅ Matriz lista", this.matrix);
  });
}


  color(valor: number): string {
    if (valor === 0) return '#eeeeee';
    const intensidad = Math.min(255, valor * 20);
    return `rgba(255, 87, 34, ${Math.min(1, intensidad / 255)})`;
  }


}
