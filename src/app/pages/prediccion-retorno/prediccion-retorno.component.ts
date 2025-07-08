import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule], // 👈 necesario para usar el pipe number
  selector: 'app-prediccion-retorno',
  templateUrl: './prediccion-retorno.component.html',
  styleUrls: ['./prediccion-retorno.component.scss']
})
export class PrediccionRetornoComponent implements OnInit {
  resultado: string = '';
  probabilidad: number = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    const input = {
      frecuencia: 3,
      recencia: 15,
      monto_total: 8.5
    };

    this.api.predecirRetorno(input).subscribe(res => {
      this.resultado = res.volvera ? '✅ Sí volverá' : '❌ No volverá';
      this.probabilidad = res.probabilidad;
    });
  }
}
