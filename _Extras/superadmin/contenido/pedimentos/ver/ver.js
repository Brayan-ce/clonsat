'use client';

import Link from 'next/link';
import styles from './ver.module.css';
import { eliminarPedimento } from '../servidor';

const ESTADO_COLORES = {
  'DESADUANADO': { bg: '#eaf7f2', border: '#285c4d', color: '#1a3d2e' },
  'EN PROCESO':  { bg: '#e8f0fe', border: '#2c5fc4', color: '#1a3880' },
  'EN REVISION': { bg: '#fff4e5', border: '#d97706', color: '#7c4a00' },
  'RECHAZADO':   { bg: '#fdecea', border: '#e57373', color: '#c0392b' },
};

const TIPO_INFO = {
  vin:        { label: 'Por VIN',        bg: '#e8f0fe', border: '#2c5fc4', color: '#1a3880', icon: 'car-outline' },
  contenedor: { label: 'Por Contenedor', bg: '#fff4e5', border: '#d97706', color: '#7c4a00', icon: 'cube-outline' },
  pedimento:  { label: 'Por Pedimento',  bg: '#eaf7f2', border: '#285c4d', color: '#1a3d2e', icon: 'document-text-outline' },
};

function Campo({ label, valor }) {
  const vacio = valor === null || valor === undefined || valor === '' || valor === '-';
  return (
    <div className={styles.campo}>
      <span className={styles.label}>{label}</span>
      <span className={vacio ? styles.valorVacio : styles.valor}>{vacio ? '—' : valor}</span>
    </div>
  );
}

export default function Ver({ id, pedimento: p }) {
  if (!p) return <div className={styles.cargando}>Pedimento no encontrado.</div>;

  const tipo      = p.vin ? 'vin' : p.contenedor ? 'contenedor' : 'pedimento';
  const tipoInfo  = TIPO_INFO[tipo];
  const estadoColor = ESTADO_COLORES[p.estado] ?? { bg: '#f0f0f0', border: '#999', color: '#555' };

  function handleEliminar(e) {
    if (!confirm(`¿Eliminar el pedimento #${p.id}? Esta acción no se puede deshacer.`)) {
      e.preventDefault();
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.encabezado}>
        <div className={styles.encabezadoIzq}>
          <h1 className={styles.titulo}>Pedimento #{p.id}</h1>
          <div className={styles.badges}>
            <span
              className={styles.badge}
              style={{ background: estadoColor.bg, borderColor: estadoColor.border, color: estadoColor.color }}
            >
              <ion-icon name="ellipse" style={{ fontSize: '8px' }} /> {p.estado}
            </span>
            <span
              className={styles.badge}
              style={{ background: tipoInfo.bg, borderColor: tipoInfo.border, color: tipoInfo.color }}
            >
              <ion-icon name={tipoInfo.icon} /> {tipoInfo.label}
            </span>
          </div>
        </div>
        <div className={styles.acciones}>
          <Link href={`/superadmin/pedimentos/${p.id}/editar`} className={styles.btnEditar}>
            <ion-icon name="create-outline" /> Editar
          </Link>
          <form action={eliminarPedimento.bind(null, p.id)} onSubmit={handleEliminar} style={{ display: 'inline' }}>
            <button type="submit" className={styles.btnEliminar}>
              <ion-icon name="trash-outline" /> Eliminar
            </button>
          </form>
          <Link href="/superadmin/pedimentos" className={styles.btnVolver}>← Volver</Link>
        </div>
      </div>

      <div className={styles.tarjeta}>
        <h2 className={styles.seccionTitulo}>Datos del Pedimento</h2>
        <div className={styles.grid}>
          <Campo label="Aduana"             valor={p.aduana_label} />
          <Campo label="Año"                valor={p.anio} />
          <Campo label="Estado"             valor={p.estado} />
          <Campo label="Fecha"              valor={p.fecha} />
          {(tipo === 'pedimento' || tipo === 'contenedor') && <Campo label="Patente"   valor={p.patente} />}
          {(tipo === 'pedimento' || tipo === 'contenedor') && <Campo label="Documento" valor={p.documento} />}
          {tipo === 'pedimento' && <Campo label="Factura"   valor={p.factura} />}
          {tipo === 'pedimento' && <Campo label="Secuencia" valor={p.secuencia} />}
          {tipo === 'pedimento' && <Campo label="Número de Operación" valor={p.numero_operacion} />}
          {tipo === 'vin' && (
            <div className={styles.gridFull}><Campo label="VIN" valor={p.vin} /></div>
          )}
          {tipo === 'contenedor' && (
            <div className={styles.gridFull}><Campo label="Número de Contenedor" valor={p.contenedor} /></div>
          )}
        </div>
      </div>

      <div className={styles.tarjeta}>
        <h2 className={styles.seccionTitulo}>Información del Pago</h2>
        <div className={styles.grid}>
          <Campo label="Banco"               valor={p.det_banco} />
          <Campo label="Número de Operación" valor={p.det_num_op} />
          <Campo label="Importe"             valor={p.importe} />
          <Campo label="Fecha y Hora de Pago" valor={p.fecha_hora_pago} />
          <div className={styles.gridFull}><Campo label="Línea de Captura"        valor={p.linea_captura} /></div>
          <div className={styles.gridFull}><Campo label="Estado Línea de Captura" valor={p.estado_linea_captura} /></div>
        </div>
      </div>

    </div>
  );
}
