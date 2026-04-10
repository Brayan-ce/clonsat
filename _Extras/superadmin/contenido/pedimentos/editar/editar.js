'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import styles from './editar.module.css';
import { actualizarPedimento } from './servidor';
import { ADUANAS, ANIOS } from '@/_Extras/main/ingreso/constantes';

const ESTADOS = ['DESADUANADO', 'EN PROCESO', 'EN REVISION', 'RECHAZADO'];

const TIPO_INFO = {
  pedimento:  { label: 'Por Pedimento',  color: '#285c4d', bg: '#eaf7f2', border: '#285c4d', textColor: '#1a3d2e', icon: 'document-text-outline' },
  vin:        { label: 'Por VIN',        color: '#2c5fc4', bg: '#e8f0fe', border: '#2c5fc4', textColor: '#1a3880', icon: 'car-outline' },
  contenedor: { label: 'Por Contenedor', color: '#d97706', bg: '#fff4e5', border: '#d97706', textColor: '#7c4a00', icon: 'cube-outline' },
};

export default function Editar({ id, pedimento: p }) {
  const tipo = p?.vin ? 'vin' : p?.contenedor ? 'contenedor' : 'pedimento';
  const info = TIPO_INFO[tipo];

  const actualizarConId = actualizarPedimento.bind(null, id);
  const [state, formAction, pending] = useActionState(actualizarConId, null);

  if (!p) return <div className={styles.page}>Pedimento no encontrado.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Editar Pedimento #{id}</h1>
        <Link href={`/superadmin/pedimentos/${id}/ver`} className={styles.btnVolver}>← Volver al detalle</Link>
      </div>

      {/* Paso 1: Tipo (solo lectura) */}
      <div className={styles.paso}>
        <div className={styles.pasoHead}>
          <span className={styles.pasoNum}>1</span>
          <div>
            <div className={styles.pasoTitulo}>Tipo de pedimento</div>
            <div className={styles.pasoSub}>Tipo de registro del pedimento</div>
          </div>
        </div>
        <div
          className={styles.tipoSeleccionado}
          style={{ background: info.bg, borderColor: info.border, color: info.textColor }}
        >
          <span className={styles.tipoIcono}><ion-icon name={info.icon} /></span>
          <span className={styles.tipoLabel}>{info.label}</span>
        </div>
      </div>

      {/* Paso 2: Formulario */}
      <div className={styles.paso}>
        <div className={styles.pasoHead}>
          <span className={styles.pasoNum}>2</span>
          <div>
            <div className={styles.pasoTitulo}>Datos del pedimento</div>
            <div className={styles.pasoSub}>Modifica los campos del formulario</div>
          </div>
        </div>

        <form className={styles.form} action={formAction}>
          {state?.error && <div className={styles.error}>{state.error}</div>}

          <h2 className={styles.seccionTitulo} style={{ borderColor: info.color, color: info.color }}>
            Datos Principales
          </h2>
          <div className={styles.grid}>

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
              <label className={styles.label}>Fecha <span className={styles.hint}>(DD/MM/YYYY HH:MM:SS)</span></label>
              <input name="fecha" type="text" className={styles.input} defaultValue={p.fecha ?? ''} placeholder="27/03/2026 13:21:37" maxLength={30} />
            </div>

            {(tipo === 'pedimento' || tipo === 'contenedor') && (
              <div className={`${styles.campo} ${styles.gridFull}`}>
                <label className={styles.label}>Aduana</label>
                <select name="aduana" className={styles.select} defaultValue={p.aduana} required>
                  {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
            )}

            {tipo === 'pedimento' && (
              <>
                <div className={styles.campo}>
                  <label className={styles.label}>Patente</label>
                  <input name="patente" type="text" className={styles.input} defaultValue={p.patente ?? ''} maxLength={20} required />
                </div>
                <div className={styles.campo}>
                  <label className={styles.label}>Documento</label>
                  <input name="documento" type="text" className={styles.input} defaultValue={p.documento ?? ''} maxLength={20} required />
                </div>
                <div className={styles.campo}>
                  <label className={styles.label}>Factura</label>
                  <input name="factura" type="text" className={styles.input} defaultValue={p.factura ?? ''} maxLength={50} />
                </div>
                <div className={styles.campo}>
                  <label className={styles.label}>Secuencia</label>
                  <input name="secuencia" type="text" className={styles.input} defaultValue={p.secuencia ?? '0'} maxLength={10} />
                </div>
              </>
            )}

            {tipo === 'vin' && (
              <div className={`${styles.campo} ${styles.gridFull}`}>
                <label className={styles.label}>VIN <span className={styles.hint}>(17 caracteres)</span></label>
                <input name="vin" type="text" className={`${styles.input} ${styles.inputDestacado}`}
                  defaultValue={p.vin ?? ''} maxLength={17} required />
              </div>
            )}

            {tipo === 'contenedor' && (
              <div className={`${styles.campo} ${styles.gridFull}`}>
                <label className={styles.label}>Número de Contenedor</label>
                <input name="contenedor" type="text" className={`${styles.input} ${styles.inputDestacado}`}
                  defaultValue={p.contenedor ?? ''} maxLength={30} required />
              </div>
            )}

          </div>

          <hr className={styles.divider} />
          <h2 className={styles.seccionTitulo} style={{ borderColor: info.color, color: info.color }}>
            Información del Pago <span className={styles.opcional}>(opcional)</span>
          </h2>
          <div className={styles.grid}>
            <div className={styles.campo}>
              <label className={styles.label}>Banco</label>
              <input name="banco" type="text" className={styles.input} defaultValue={p.banco ?? ''} maxLength={100} />
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Número de Operación</label>
              <input name="numero_operacion" type="text" className={styles.input} defaultValue={p.numero_operacion ?? ''} maxLength={50} />
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Importe</label>
              <input name="det_importe" type="text" className={styles.input} defaultValue={p.importe ?? ''} maxLength={30} placeholder="0.00" />
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
            <button type="submit" className={styles.btnGuardar} style={{ background: info.color }} disabled={pending}>
              {pending ? 'Guardando...' : 'Actualizar Pedimento'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
