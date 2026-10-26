'use client';

import { useState, useEffect } from 'react';

interface Nota {
  id: string;
  titulo: string;
  texto: string;
  color: string;
  minutosValidez: number;
}

const API_URL = 'http://localhost:3000/api/notas';

export default function AplicacionDeNotas() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [titulo, setTitulo] = useState<string>('');
  const [texto, setTexto] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);

  async function cargarNotas() {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        const normalizadas: Nota[] = data.map((item: {
          id: string;
          title?: string;
          titulo?: string;
          text?: string;
          texto?: string;
          color?: string;
          minutes?: number;
          minutosValidez?: number;
        }) => ({
          id: item.id,
          titulo: item.title ?? item.titulo ?? 'Sin título',
          texto: item.text ?? item.texto ?? '',
          color: item.color ?? '#ffff88',
          minutosValidez: item.minutes ?? item.minutosValidez ?? 5,
        }));
        setNotas(normalizadas);
      }
    } catch (error) {
      console.error('Error al conectar con el backend:', error);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission();
    }
    cargarNotas();
  }, []);

  async function agregarNota() {
    if (titulo.trim() === '') return;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titulo.trim(),
          text: texto.trim() !== '' ? texto.trim() : 'Sin descripción',
          color: '#ffff88',
          minutes: 5,
        }),
      });

      if (res.ok) {
        const nueva = await res.json();
        const nuevaNota: Nota = {
          id: nueva.id,
          titulo: nueva.title ?? nueva.titulo ?? titulo,
          texto: nueva.text ?? nueva.texto ?? texto,
          color: nueva.color ?? '#ffff88',
          minutosValidez: nueva.minutes ?? nueva.minutosValidez ?? 5,
        };

        setNotas((prev) => [nuevaNota, ...prev]);
        setTitulo('');
        setTexto('');

        const tiempoEnMilisegundos = nuevaNota.minutosValidez * 60000;
        setTimeout(() => {
          if (typeof window !== 'undefined' && 'Notification' in window) {
            new Notification(nuevaNota.titulo);
          }
        }, tiempoEnMilisegundos);
      }
    } catch (error) {
      console.error('Error al crear nota en el backend:', error);
    }
  }

  async function eliminarNota(idAEliminar: string) {
    try {
      const res = await fetch(`${API_URL}/${idAEliminar}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setNotas((prev) => prev.filter((nota) => nota.id !== idAEliminar));
      }
    } catch (error) {
      console.error('Error al eliminar nota en el backend:', error);
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Mis Recordatorios</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          value={titulo}
          onChange={(evento) => setTitulo(evento.target.value)}
          placeholder="Título..."
          style={{
            padding: '8px',
            borderRadius: '4px',
            color: 'black',
            backgroundColor: 'white',
            border: '2px solid #ccc',
          }}
        />
        <input
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder="Recordatorio..."
          style={{
            padding: '8px',
            borderRadius: '4px',
            color: 'black',
            backgroundColor: 'white',
            border: '2px solid #ccc',
            width: '250px',
          }}
        />
        <button
          onClick={agregarNota}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'black',
            backgroundColor: '#ffd700',
            border: 'none',
            fontWeight: 'bold',
          }}
        >
          Crear Nota
        </button>
      </div>

      {cargando ? (
        <p>Cargando notas...</p>
      ) : notas.length === 0 ? (
        <p style={{ color: '#888' }}>No hay notas guardadas.</p>
      ) : (
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {notas.map((nota) => (
            <div
              key={nota.id}
              style={{
                backgroundColor: nota.color,
                color: 'black',
                padding: '15px',
                borderRadius: '8px',
                width: '200px',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.15)',
              }}
            >
              <h3 style={{ marginTop: 0 }}>{nota.titulo}</h3>
              <p>{nota.texto}</p>
              <small>Válida por: {nota.minutosValidez} min</small>
              <br /><br />
              <button
                onClick={() => eliminarNota(nota.id)}
                style={{
                  color: '#b00',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: 'none',
                  textDecoration: 'underline',
                  fontWeight: 'bold',
                }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
