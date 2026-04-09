'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './editar.module.css';
import { actualizarPedimento } from './servidor';
import { ADUANAS, ANIOS } from '../../../../main/ingreso/constantes';

const ESTADOS = ['DESADUANADO', 'EN PROCESO', 'EN REVISION', 'RECHAZADO'];

export default function Editar({ id, pedimento: p }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError]       = useState('');

  if (!p) return <div className={styles.page}>Pedimento no encontrado.</div>;

  async function handleSubmit(formData) {
    setEnviando(true);
    setError('');
    const res = await actualizarPedimento(id, formData);
    if (res?.error) {
      setError(res.error);
      setEnviando(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Editar Pedimento #{id}</h1>
        <Link href={`/superadmin/pedimentos/${id}/ver`} className={styles.btnVolver}>
          Volver al detalle
        </Link>
      </div>

      <form className={styles.form} action={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <h2 className={styles.seccionTitulo}>Datos del Pedimento</h2>
        <div className={styles.grid}>

          <div className={`${styles.campo} ${styles.gridFull}`}>
            <label className={styles.label}>Aduana</label>
            <select name="aduana" className={styles.select} defaultValue={p.aduana} required>
              {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Año</label>
            <select name="anio" className={styles.select} defaultValue={p.anio}>
              {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Estado</label>
            <select name="estado" className={styles.select} defaultValue={p.estado}>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Patente</label>
            <input name="patente" type="text" className={styles.input} defaultValue={p.patente} maxLength={20} required />
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Documento</label>
            <input name="documento" type="text" className={styles.input} defaultValue={p.documento} maxLength={20} required />
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Fecha</label>
            <input name="fecha" type="text" className={styles.input} defaultValue={p.fecha ?? ''} placeholder="27/03/2026 13:21:37" maxLength={30} />
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Secuencia</label>
            <input name="secuencia" type="text" className={styles.input} defaultValue={p.secuencia ?? '0'} maxLength={10} />
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Banco</label>
            <input name="banco" type="text" className={styles.input} defaultValue={p.banco ?? ''} maxLength={100} />
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Número de Operación</label>
            <input name="numero_operacion" type="text" className={styles.input} defaultValue={p.numero_operacion ?? ''} maxLength={50} />
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Factura</label>
            <input name="factura" type="text" className={styles.input} defaultValue={p.factura ?? ''} maxLength={50} />
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>VIN</label>
            <input name="vin" type="text" className={styles.input} defaultValue={p.vin ?? ''} maxLength={17} />
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Contenedor</label>
            <input name="contenedor" type="text" className={styles.input} defaultValue={p.contenedor ?? ''} maxLength={30} />
          </div>

        </div>

        <hr className={styles.divider} />
        <h2 className={styles.seccionTitulo}>Información del Pago</h2>
        <div className={styles.grid}>

          <div className={styles.campo}>
            <label className={styles.label}>Banco</label>
            <input name="det_banco" type="text" className={styles.input} defaultValue={p.det_banco ?? ''} maxLength={100} />
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Número de Operación</label>
            <input name="det_numero_operacion" type="text" className={styles.input} defaultValue={p.det_num_op ?? ''} maxLength={50} />
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Importe</label>
            <input name="det_importe" type="text" className={styles.input} defaultValue={p.importe ?? ''} maxLength={30} />
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Fecha y Hora de Pago</label>
            <input name="det_fecha_hora_pago" type="text" className={styles.input} defaultValue={p.fecha_hora_pago ?? ''} maxLength={30} />
          </div>

          <div className={`${styles.campo} ${styles.gridFull}`}>
            <label className={styles.label}>Línea de Captura</label>
            <input name="det_linea_captura" type="text" className={styles.input} defaultValue={p.linea_captura ?? ''} maxLength={60} />
          </div>

          <div className={`${styles.campo} ${styles.gridFull}`}>
            <label className={styles.label}>Estado Línea de Captura</label>
            <input name="det_estado_linea" type="text" className={styles.input} defaultValue={p.estado_linea_captura ?? ''} maxLength={100} />
          </div>

        </div>

        <div className={styles.botones}>
          <button type="submit" className={styles.btnGuardar} disabled={enviando}>
            {enviando ? 'Guardando...' : 'Actualizar Pedimento'}
          </button>
        </div>

      </form>
    </div>
  );
}
