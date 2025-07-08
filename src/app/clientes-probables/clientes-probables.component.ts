import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clientes-probables',
  imports: [CommonModule],
  templateUrl: './clientes-probables.component.html',
  styleUrl: './clientes-probables.component.scss'
})

export class ClientesProbablesComponent implements OnInit {
  clientes: any[] = [];
  cargando = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.obtenerClientesProbables().subscribe({
      next: (data) => {
        this.clientes = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener los clientes probables', error);
        this.cargando = false;
      }
    });
  }
}