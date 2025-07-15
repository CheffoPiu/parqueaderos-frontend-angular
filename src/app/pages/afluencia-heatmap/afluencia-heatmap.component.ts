import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api.service';
import html2canvas from 'html2canvas';
import { DomSanitizer } from '@angular/platform-browser';

interface RegistroAfluencia {
  dia_semana: string;
  hora: number;
  conteo: number;
  nombre_estacionamiento: string;
}

@Component({
  standalone: true,
  imports: [CommonModule ,MaterialModule, NgApexchartsModule, TablerIconsModule,],
  selector: 'app-afluencia-heatmap',
  templateUrl: './afluencia-heatmap.component.html',
})
export class AfluenciaHeatmapComponent implements OnInit {
  dias: string[] = [];
  horas: string[] = [];
  matrix: number[][] = [];

  parqueaderosDisponibles: { parkingId: string, nombre: string }[] = [];
  parqueaderoSeleccionado: string = 'Todos';
  originalData: any[] = [];
  chartLabels: string[] = [];
  chartData: number[] = [];
  chartPrediccionLabels: string[] = [];
  chartPrediccionData: number[] = [];
  diasPred: string[] = [];
  horasPred: string[] = [];
  matrixPred: number[][] = [];
  errorMAE: number | null = null;
  errorMAPE: number | null = null;
  errorN: number | null = null;
  interpretacionIA: string | null = null;

  @ViewChild('tablaAfluencia') tablaAfluencia!: ElementRef;


  constructor(private api: ApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.api.obtenerParqueaderos().subscribe(parqueaderos => {
      this.parqueaderosDisponibles = parqueaderos;
      this.parqueaderosDisponibles.unshift({ parkingId: '', nombre: 'Todos' }); // Agrega opción 'Todos' al inicio
          console.log('🔵 Cargando datos de afluencia...', this.parqueaderosDisponibles);
    });

  this.api.obtenerAfluencia().subscribe((res: RegistroAfluencia[]) => {
      console.log("🔵 Datos crudos:", res);
      this.originalData = res;

      /*this.api.interpretarAfluencia(this.originalData).subscribe(resp => {
                console.log("🧠 Interpretación IA:", resp);

        this.interpretacionIA = resp.interpretacion;
        console.log("🧠 Interpretación IA:", this.interpretacionIA);
      });*/

      const parqueaderos = Array.from(
        new Set(res.map((r: any) => r.estacionamiento))
      ).sort();
      this.parqueaderosDisponibles = ['Todos', ...parqueaderos];

      this.actualizarTabla(res);
      const ranking = this.obtenerRankingParqueaderos();
      this.chartLabels = ranking.map(r => r[0]);
      this.chartData = ranking.map(r => r[1]);

      this.cargarPrediccionProphet(); // predicción global o por parqueadero default

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
    
      console.log('🔵 Datos filtrados por parqueadero:', this.parqueaderoSeleccionado, filtrados);
    this.actualizarTabla(filtrados);
  // Buscar el ID correspondiente al nombre
  const parqueadero = this.parqueaderosDisponibles.find(p => p.nombre === this.parqueaderoSeleccionado);
  console.log("asdad",parqueadero)
  const id = parqueadero ? parqueadero.parkingId : ''; // si no lo encuentra, manda global
  console.log('🔵 Cargando predicción Prophet para parqueadero:', id);
  this.cargarPrediccionProphet(id);
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

  cargarPrediccionProphet(parqueaderoId: string = '') {
  console.log('🔵 Cargando predicción Prophet para parqueadero:', parqueaderoId);
  this.api.obtenerPrediccionProphet(parqueaderoId).subscribe(res => {
    console.log('📈 Predicción Prophet:', res);

    if (!res || !Array.isArray(res.prediccion)) {
      console.warn('⚠️ No se pudo obtener predicción válida:', res);
      this.matrixPred = [];
      this.diasPred = [];
      this.horasPred = [];
      this.errorMAE = null;
      this.errorMAPE = null;
      this.errorN = null;
      return;
    }

    const prediccion = res.prediccion;
    const transformado = this.transformarPrediccionAHeatmap(prediccion);
    this.actualizarTablaPrediccion(prediccion);

    // Actualiza errores
    this.errorMAE = res.error.mae;
    this.errorMAPE = res.error.mape;
    this.errorN = res.error.n;
  });
}



  transformarPrediccionAHeatmap(prediccion: any[]): RegistroAfluencia[] {
    return prediccion.map(p => {
      const fecha = new Date(p.ds);
      const hora = fecha.getHours();
      const opciones: Intl.DateTimeFormatOptions = { weekday: 'long' };
      const dia_semana = fecha.toLocaleDateString('en-US', opciones); // Ej: "Monday"
      return {
        dia_semana,
        hora,
        conteo: Math.round(p.yhat), // Redondeas la predicción
        nombre_estacionamiento: this.parqueaderoSeleccionado
      };
    });
  }

  actualizarTablaPrediccion(prediccion: any[]) {
    const diasMap = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    // Extraer día y hora
    const datos = prediccion.map(p => {
      const fecha = new Date(p.ds);
      return {
        dia: diasMap[fecha.getDay()],
        hora: fecha.getHours(),
        conteo: p.yhat
      };
    });

    const diasUnicos = [...new Set(datos.map(r => r.dia))];
    const horasUnicas = [...new Set(datos.map(r => r.hora))].sort((a, b) => a - b);
    const matriz: number[][] = diasUnicos.map(() => Array(horasUnicas.length).fill(0));

    datos.forEach(r => {
      const fila = diasUnicos.indexOf(r.dia);
      const col = horasUnicas.indexOf(r.hora);
      if (fila >= 0 && col >= 0) {
        matriz[fila][col] += r.conteo;
      }
    });

    this.diasPred = diasUnicos;
    this.horasPred = horasUnicas.map(h => `${String(h).padStart(2, '0')}:00`);
    this.matrixPred = matriz;
  }

  colorPred(valor: number): string {
    if (valor === 0) return '#f5f5f5';
    if (valor < 5) return '#e8f5e9';
    if (valor < 10) return '#a5d6a7';
    return '#66bb6a';
  }

  capturarTablaComoImagen() {
    const tabla = this.tablaAfluencia.nativeElement;

    html2canvas(tabla).then(canvas => {
      const base64image = canvas.toDataURL('image/png');

      const prompt = 'Analiza esta tabla de afluencia horaria por día en un parqueadero. La tabla representa la cantidad de personas que usan el parqueadero en cada hora de cada día de la semana. Quiero que identifiques: '+
      '1. Los patrones de uso más importantes (horas y días más concurridos y más vacíos).'+
      '2. Horarios donde podría ser rentable aplicar promociones u ofertas para atraer más clientes.'+
      '3. Recomendaciones prácticas para mejorar la gestión operativa (turnos, mantenimiento, seguridad).'+
      '4. Ideas para fidelizar a los clientes o aumentar la recurrencia, basándote en los patrones de comportamiento.'+
      'Devuelve el análisis en formato claro, breve y orientado a decisiones del negocio. Úsalo como si fuera un resumen ejecutivo para un gerente.;'

      this.api.analizarImagen(base64image, prompt).subscribe(resp => {
        console.log("🧠 Respuesta IA:", resp);
        this.interpretacionIA = this.convertirMarkdownBasico(resp.respuesta);
      }, error => {
        console.error("⚠️ Error al analizar imagen:", error);
      });
    });
  }

  convertirMarkdownBasico(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')       // negritas
      .replace(/(?:\r\n|\r|\n)/g, '<br>')           // saltos de línea
      .replace(/- (.*?)(?=<br>)/g, '• $1');          // viñetas
  }


}
