import { Component, OnInit } from '@angular/core';
import { latLng, tileLayer, marker, divIcon, Marker } from 'leaflet';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MaterialModule } from '../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApiService } from '../services/api.service';

interface Parqueadero {
  parkingId: string;
  nombre: string;
  lat: number;
  lng: number;
  capacidad: number;
  libres: number;
  color: string;
}

@Component({
  standalone: true,
  selector: 'app-mapa-parqueaderos',
  templateUrl: './mapa-parqueaderos.component.html',
  styleUrls: [],
  imports: [LeafletModule,MaterialModule, NgApexchartsModule, TablerIconsModule],
})
export class MapaParqueaderosComponent implements OnInit {


  constructor(private api: ApiService) {}

  
  layers: Marker[] = [];
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      })
    ],
    zoom: 13,
    center: latLng(-0.2202, -78.5127) // Quito centro
  };

  parqueaderos: Parqueadero[] = [
    
  ];

  ngOnInit(): void {
    this.api.obtenerParqueaderos().subscribe(parqueaderos => {
      console.log('Parqueaderos recibidos:', parqueaderos);
      this.parqueaderos = parqueaderos;
      this.actualizarMapa(); // crea los marcadores
    });

    setInterval(() => {
      this.ActualizacionParqueaderos(); // solo actualiza ocupación
    }, 5000);
  }



  /*simularActualizacion() {
    this.parqueaderos.forEach(p => {
      p.libres = Math.floor(Math.random() * (p.capacidad + 1));
    });
  }*/

  ActualizacionParqueaderos() {
    this.api.obtenerOcupacion().subscribe(data => {
      console.log('Datos de ocupación recibidos:', data);
      data.forEach(d => {
        const parqueadero = this.parqueaderos.find(p => p.parkingId === d.parkingId);
        if (parqueadero) {
          parqueadero.capacidad = d.capacidad;
          parqueadero.libres = d.capacidad - d.ocupados;
          parqueadero.color = d.color;
        }
      });
      this.actualizarMapa();
    });
  }




  actualizarMapa() {
    const colorMap: Record<string, string> = {
      verde: '#4caf50',
      amarillo: '#ffeb3b',
      rojo: '#f44336',
      gray: 'gray'
    };

    this.layers = this.parqueaderos.map(p => {
      const backgroundColor = colorMap[p.color] || 'gray';

      return marker([p.lat, p.lng], {
        icon: divIcon({
          className: '',
          html: `
            <div style="
              background-color: ${backgroundColor};
              color: ${p.color === 'amarillo' ? 'black' : 'white'};
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              font-weight: bold;
              box-shadow: 0 0 6px rgba(0,0,0,0.3);
              font-size: 14px;
              border: 2px solid white;
            ">
              🅿️<span style="margin-left: 2px;">${p.libres}</span>
            </div>
          `
        })
      }).bindPopup(`
        <b>${p.nombre || 'Parqueadero'}</b><br>
        Libres: ${p.libres} / ${p.capacidad}
      `);
    });
  }


}
