import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from 'src/app/services/api.service';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexTitleSubtitle, ApexDataLabels, ApexOptions,ChartComponent } from 'ng-apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-clientes-segmentados',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    NgApexchartsModule
],
  templateUrl: './clientes-segmentados.component.html',
  styleUrl: './clientes-segmentados.component.scss'
})
export class ClientesSegmentadosComponent implements OnInit {
  displayedColumns: string[] = ['#', 'clienteId', 'nombre', 'email', 'frecuencia', 'recencia', 'monto_total', 'probabilidad'];
  displayedResumenColumns = ['grupo', 'etiqueta', 'cantidad', 'frecuencia_promedio', 'recencia_promedio', 'monto_promedio'];

  dataSource = new MatTableDataSource<any>([]);
  resumenSegmentos = new MatTableDataSource<any>([]);
  // Añade esto arriba
  chartSeries: ApexAxisChartSeries = [];
  chartChart: ApexChart = { type: 'bar', height: 350 };
  chartXAxis: ApexXAxis = { categories: [] };
  chartTitle: ApexTitleSubtitle = { text: 'Distribución por Segmento' };
  chartDataLabels: ApexDataLabels = { enabled: true };




  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.obtenerClientesProbables().subscribe(clientes => {
      this.dataSource = new MatTableDataSource(clientes);
      this.dataSource.paginator = this.paginator;
    });

    this.api.obtenerResumenSegmentos().subscribe(resumen => {
        this.resumenSegmentos = resumen;
        this.chartSeries = [{
          name: 'Clientes',
          data: resumen.map((r: { cantidad: any; }) => r.cantidad)
        }];
        this.chartXAxis = {
          categories: resumen.map((r: { etiqueta: any; }) => r.etiqueta)
        };
      });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}

