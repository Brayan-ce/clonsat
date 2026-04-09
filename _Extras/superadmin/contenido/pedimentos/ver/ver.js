import Link from 'next/link';
import styles from './ver.module.css';

export default function Ver({ id, pedimento: p }) {
  if (!p) return <div className={styles.cargando}>Pedimento no encontrado.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Pedimento #{p.id}</h1>
        <div className={styles.acciones}>
          <Link href={`/superadmin/pedimentos/${p.id}/editar`} className={styles.btnEditar}>Editar</Link>
          <Link href="/superadmin/pedimentos" className={styles.btnVolver}>Volver a lista</Link>
        </div>
      </div>

      <div className={styles.tarjeta}>
        <h2 className={styles.seccionTitulo}>Datos del Pedimento</h2>
        <div className={styles.grid}>
          <div className={styles.campo}><span className={styles.label}>Aduana</span><span className={styles.valor}>{p.aduana_label}</span></div>
          <div className={styles.campo}><span className={styles.label}>Año</span><span className={styles.valor}>{p.anio}</span></div>
          <div className={styles.campo}><span className={styles.label}>Patente</span><span className={styles.valor}>{p.patente}</span></div>
          <div className={styles.campo}><span className={styles.label}>Documento</span><span className={styles.valor}>{p.documento}</span></div>
          <div className={styles.campo}><span className={styles.label}>Estado</span><span className={styles.valor}>{p.estado}</span></div>
          <div className={styles.campo}><span className={styles.label}>Fecha</span><span className={styles.valor}>{p.fecha}</span></div>
          <div className={styles.campo}><span className={styles.label}>Banco</span><span className={styles.valor}>{p.banco || '-'}</span></div>
          <div className={styles.campo}><span className={styles.label}>Secuencia</span><span className={styles.valor}>{p.secuencia}</span></div>
          <div className={styles.campo}><span className={styles.label}>Número de Operación</span><span className={styles.valor}>{p.numero_operacion}</span></div>
          <div className={styles.campo}><span className={styles.label}>Factura</span><span className={styles.valor}>{p.factura || '-'}</span></div>
          <div className={styles.campo}><span className={styles.label}>VIN</span><span className={styles.valor}>{p.vin || '-'}</span></div>
          <div className={styles.campo}><span className={styles.label}>Contenedor</span><span className={styles.valor}>{p.contenedor || '-'}</span></div>
        </div>
      </div>

      <div className={styles.tarjeta}>
        <h2 className={styles.seccionTitulo}>Información del Pago</h2>
        <div className={styles.grid}>
          <div className={styles.campo}><span className={styles.label}>Banco</span><span className={styles.valor}>{p.det_banco || '-'}</span></div>
          <div className={styles.campo}><span className={styles.label}>Número de Operación</span><span className={styles.valor}>{p.det_num_op || '-'}</span></div>
          <div className={styles.campo}><span className={styles.label}>Importe</span><span className={styles.valor}>{p.importe || '-'}</span></div>
          <div className={styles.campo}><span className={styles.label}>Fecha y Hora de Pago</span><span className={styles.valor}>{p.fecha_hora_pago || '-'}</span></div>
          <div className={`${styles.campo} ${styles.gridFull}`}><span className={styles.label}>Línea de Captura</span><span className={styles.valor}>{p.linea_captura || '-'}</span></div>
          <div className={`${styles.campo} ${styles.gridFull}`}><span className={styles.label}>Estado Línea de Captura</span><span className={styles.valor}>{p.estado_linea_captura || '-'}</span></div>
        </div>
      </div>

    </div>
  );
}
