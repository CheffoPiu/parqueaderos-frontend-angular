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

  parqueaderosDisponibles: { parkingId: string, nombre: string, capacidad: number }[] = [];
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
  interpretacionIAPrediccion: string | null = null;

  @ViewChild('tablaAfluencia') tablaAfluencia!: ElementRef;
  @ViewChild('tablaPrediccion') tablaPrediccion!: ElementRef;


  constructor(private api: ApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.api.obtenerParqueaderos().subscribe(parqueaderos => {
      this.parqueaderosDisponibles = parqueaderos;
      console.log('🔵 Cargando datos de afluencia...', this.parqueaderosDisponibles);
    });

          
    this.api.obtenerAfluencia('2025-07-07','2025-07-14').subscribe((res: RegistroAfluencia[]) => {
      console.log("🔵 Datos crudos:", res);
      this.originalData = res;

      /*this.api.interpretarAfluencia(this.originalData).subscribe(resp => {
                console.log("🧠 Interpretación IA:", resp);

        this.interpretacionIA = resp.interpretacion;
        console.log("🧠 Interpretación IA:", this.interpretacionIA);
      });*/


      this.actualizarTabla([]);
      const ranking = this.obtenerRankingParqueaderos();
      this.chartLabels = ranking.map(r => r[0]);
      this.chartData = ranking.map(r => r[1]);

      this.cargarPrediccionProphet(); // predicción global o por parqueadero default

    });
  }

  actualizarTabla(datos: any[]) {
    if (datos.length === 0) {
      // Definir los días y horas posibles (puedes ajustar esto según tus necesidades)
      const diasUnicos = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ];
      const horasUnicas = Array.from({ length: 24 }, (_, i) => i);

      const matriz: number[][] = diasUnicos.map(() => Array(horasUnicas.length).fill(0));

      this.dias = diasUnicos;
      this.horas = horasUnicas.map(h => `${String(h).padStart(2, '0')}:00`);
      this.matrix = matriz;
      return;
    }

    // ... tu código normal para cuando sí hay datos
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
    if (this.capacidadParqueaderoSeleccionado) {
      const porcentaje = valor / this.capacidadParqueaderoSeleccionado;
      if (porcentaje === 0) return '#f5f5f5';
      if (porcentaje < 0.6) return '#a5d6a7';   // Verde claro
      if (porcentaje < 0.9) return '#ffeb3b';   // Amarillo
      return '#ef5350';                         // Rojo
    } else {
      // Color por valor absoluto si es "Todos"
      if (valor === 0) return '#f5f5f5';
      if (valor < 5) return '#fde0dc';
      if (valor < 10) return '#ffab91';
      return '#ff7043';
    }
  }

  colorPred(valor: number): string {
    if (this.capacidadParqueaderoSeleccionado) {
      const porcentaje = valor / this.capacidadParqueaderoSeleccionado;
      if (porcentaje === 0) return '#f5f5f5';
      if (porcentaje < 0.6) return '#a5d6a7';   // Verde claro
      if (porcentaje < 0.9) return '#ffeb3b';   // Amarillo
      return '#ef5350';                         // Rojo
    } else {
      // Color por valor absoluto si es "Todos"
      if (valor === 0) return '#f5f5f5';
      if (valor < 5) return '#fde0dc';
      if (valor < 10) return '#ffab91';
      return '#ff7043';
    }
  }

  getColorPorcentaje(valor: number): string {
    if (this.capacidadParqueaderoSeleccionado) {
      const porcentaje = valor / this.capacidadParqueaderoSeleccionado;
      // Si la celda es roja (>90% ocupado), el texto va blanco
      if (porcentaje >= 0.9) return '#fff'; // blanco
      return '#888'; // gris suave para los demás casos
    }
    return '#888';
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
    console.log('🔵 Datos transformados para heatmap:', transformado);
    this.actualizarTablaPrediccion(transformado);

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
  const diasUnicos = diasMap;
  const horasUnicas = Array.from({ length: 24 }, (_, i) => i);

  // Inicializa la matriz
  const matriz: number[][] = diasUnicos.map(() => Array(horasUnicas.length).fill(0));

  // Agrupa para promediar si recibes múltiples semanas, si no, simplemente llena la matriz.
  const grupos: { [clave: string]: number[] } = {};
  prediccion.forEach(p => {
    const clave = `${p.dia_semana}|${p.hora}`;
    if (!grupos[clave]) grupos[clave] = [];
    grupos[clave].push(p.conteo);
  });

  diasUnicos.forEach((dia, i) => {
    horasUnicas.forEach((hora, j) => {
      const clave = `${dia}|${hora}`;
      const valores = grupos[clave] || [];
      matriz[i][j] = valores.length
        ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length)
        : 0;
    });
  });

  // === NUEVO: Filtrar horas ===
  // Solo queremos horas donde al menos en algún día hay valor distinto de cero
  const horasConMovimiento: number[] = [];
  horasUnicas.forEach((hora, idx) => {
    const hayMovimiento = diasUnicos.some((_, diaIdx) => matriz[diaIdx][idx] > 0);
    if (hayMovimiento) horasConMovimiento.push(hora);
  });

  // Filtrar matriz solo a esas horas
  const matrizFiltrada = matriz.map(fila =>
    horasConMovimiento.map(hora => fila[hora])
  );

  this.diasPred = diasUnicos;
  this.horasPred = horasConMovimiento.map(h => `${String(h).padStart(2, '0')}:00`);
  this.matrixPred = matrizFiltrada;
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

  get capacidadParqueaderoSeleccionado(): number | null {
    if (this.parqueaderoSeleccionado === 'Todos') return null;
    const parqueadero = this.parqueaderosDisponibles.find(
      p => p.nombre === this.parqueaderoSeleccionado
    );
    return parqueadero?.capacidad ?? null;
  }

  capturarTablaPrediccionComoImagen() {
  const tabla = this.tablaPrediccion.nativeElement;

  html2canvas(tabla).then(canvas => {
    const base64image = canvas.toDataURL('image/png');

    const prompt = 'Analiza esta tabla de predicción de afluencia horaria por día en un parqueadero. La tabla representa la cantidad estimada de personas que usarán el parqueadero en cada hora de cada día de la semana (siguientes 7 días). Quiero que identifiques: '+
    '1. Los picos y valles estimados de afluencia para los próximos días.'+
    '2. Riesgo de sobreocupación según la predicción y recomendaciones para evitarlo.'+
    '3. Oportunidades para ajustar la operación según las tendencias previstas.'+
    'Devuelve el análisis en formato ejecutivo, claro y accionable para el gerente.';

    this.api.analizarImagen(base64image, prompt).subscribe(resp => {
      console.log("🧠 Respuesta IA predicción:", resp);
      // Puedes mostrar en otro card, o sobrescribir la misma variable
      this.interpretacionIAPrediccion = this.convertirMarkdownBasico(resp.respuesta);
    }, error => {
      console.error("⚠️ Error al analizar imagen predicción:", error);
    });
  });
}



}
