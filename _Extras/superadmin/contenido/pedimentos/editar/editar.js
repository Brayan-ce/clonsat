'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import styles from './editar.module.css';
import { actualizarPedimento } from './servidor';
import { ADUANAS, ANIOS } from '@/_Extras/main/ingreso/constantes';

const ESTADOS = ['EN PROCESO', 'DESADUANADO', 'EN REVISION', 'RECHAZADO'];

/* ── Ayudante: obtener tipo del pedimento ── */
function getTipo(p) {
  if (p.vin)        return { key: 'vin',        icono: 'car',          etiqueta: 'Por VIN',       color: '#2c5fc4', colorBg: '#dbeafe' };
  if (p.contenedor) return { key: 'contenedor', icono: 'cube',         etiqueta: 'Por Contenedor', color: '#b45309', colorBg: '#fef3c7' };
  return              { key: 'pedimento',        icono: 'document-text', etiqueta: 'Pedimento',     color: '#285c4d', colorBg: '#eaf7f2' };
}

/* ── Campo reutilizable ── */
function Campo({ label, hint, children, obligatorio = false }) {
  return (
    <div className={styles.campo}>
      <label className={styles.campoLabel}>
        {label}
        {obligatorio && <span className={styles.obligatorio}> *</span>}
        {hint && <span className={styles.campoHint}> ({hint})</span>}
      </label>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════
   COMPONENTE PRINCIPAL
═════════════════════════════════════════*/
export default function Editar({ pedimento: p }) {
  if (!p) {
    return (
      <div className={styles.noEncontrado}>
        <ion-icon name="alert-circle-outline" />
        <h2>No se encontró el pedimento</h2>
        <p>El pedimento que intentas editar no existe o fue eliminado.</p>
        <Link href="/superadmin/pedimentos" className={styles.btnVolver}>
          <ion-icon name="arrow-back-outline" /> Volver a la lista
        </Link>
      </div>
    );
  }

  const tipo = getTipo(p);
  const accion = actualizarPedimento.bind(null, p.id);
  const [state, formAction, pending] = useActionState(accion, null);
  const [vin, setVin] = useState(p.vin || '');
  const vinValido = vin.length === 17;

  return (
    <div className={styles.pagina}>
      {/* Encabezado */}
      <div className={styles.encabezado}>
        <div className={styles.encabezadoIzq}>
          <Link href={`/superadmin/pedimentos/${p.id}/ver`} className={styles.linkVolver}>
            <ion-icon name="arrow-back-outline" /> Volver al detalle
          </Link>
          <h1 className={styles.titulo}>Editar Pedimento #{p.id}</h1>
          <div className={styles.tipoBadge} style={{ background: tipo.colorBg, color: tipo.color, borderColor: tipo.color }}>
            <ion-icon name={`${tipo.icono}-outline`} />
            {tipo.etiqueta}
            <span className={styles.tipoBadgeInfo}> — El tipo no se puede cambiar</span>
          </div>
        </div>
      </div>

      {/* Alerta global */}
      {state?.error && (
        <div className={styles.alerta}>
          <ion-icon name="warning-outline" />
          {state.error}
        </div>
      )}

      <form className={styles.form} action={formAction}>
        {/* Campo oculto con el tipo */}
        <input type="hidden" name="tipo" value={tipo.key} />

        {/* ══ TIPO PEDIMENTO ══ */}
        {tipo.key === 'pedimento' && (
          <>
            <div className={styles.paso}>
              <h2 className={styles.pasoTitulo}><ion-icon name="location-outline" />Información de la Aduana</h2>
              <div className={styles.grid2}>
                <Campo label="Aduana" obligatorio>
                  <select name="aduana" className={styles.select} defaultValue={p.aduana} required>
                    <option value="">— Seleccione la aduana —</option>
                    {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </Campo>
                <Campo label="Año">
                  <select name="anio" className={styles.select} defaultValue={p.anio}>
                    {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </Campo>
              </div>
            </div>

            <div className={styles.paso}>
              <h2 className={styles.pasoTitulo}><ion-icon name="document-text-outline" />Datos del Pedimento</h2>
              <div className={styles.grid2}>
                <Campo label="Patente" obligatorio>
                  <input name="patente" type="text" className={styles.input} defaultValue={p.patente} maxLength={20} required />
                </Campo>
                <Campo label="Documento" obligatorio>
                  <input name="documento" type="text" className={styles.input} defaultValue={p.documento} maxLength={20} required />
                </Campo>
                <Campo label="Factura">
                  <input name="factura" type="text" className={styles.input} defaultValue={p.factura || ''} maxLength={50} />
                </Campo>
                <Campo label="Secuencia">
                  <input name="secuencia" type="text" className={styles.input} defaultValue={p.secuencia || '0'} maxLength={10} />
                </Campo>
                <Campo label="Tipo de Operación" hint="ej. 1 IMPORTACIÓN">
                  <input name="tipo_operacion" type="text" className={styles.input} defaultValue={p.tipo_operacion || ''} maxLength={80} />
                </Campo>
                <Campo label="Clave de Documento" hint="ej. VF">
                  <input name="clave_documento" type="text" className={styles.input} defaultValue={p.clave_documento || ''} maxLength={10} />
                </Campo>
                <Campo label="Estado">
                  <select name="estado" className={styles.select} defaultValue={p.estado}>
                    {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </Campo>
                <Campo label="Fecha" hint="DD/MM/AAAA HH:MM:SS">
                  <input name="fecha" type="text" className={styles.input} defaultValue={p.fecha || ''} maxLength={30} />
                </Campo>
              </div>
            </div>
          </>
        )}

        {/* ══ TIPO VIN ══ */}
        {tipo.key === 'vin' && (
          <>
            <div className={styles.paso}>
              <h2 className={styles.pasoTitulo}><ion-icon name="car-outline" />Número VIN del Vehículo</h2>
              <Campo label="VIN — Número de Identificación Vehicular" obligatorio hint="17 caracteres exactos">
                <input
                  name="vin"
                  type="text"
                  className={`${styles.input} ${styles.inputVin} ${vin.length > 0 ? (vinValido ? styles.inputValido : styles.inputInvalido) : ''}`}
                  maxLength={17}
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  required
                />
              </Campo>
              <div className={styles.vinContador} style={{ color: vinValido ? '#285c4d' : (vin.length > 0 ? '#c0392b' : '#aaa') }}>
                <ion-icon name={vinValido ? 'checkmark-circle' : 'information-circle-outline'} />
                {vin.length}/17 caracteres {vinValido ? '— Correcto ✓' : ''}
              </div>
            </div>

            <div className={styles.paso}>
              <h2 className={styles.pasoTitulo}><ion-icon name="settings-outline" />Datos generales</h2>
              <div className={styles.grid2}>
                <Campo label="Año">
                  <select name="anio" className={styles.select} defaultValue={p.anio}>
                    {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </Campo>
                <Campo label="Estado">
                  <select name="estado" className={styles.select} defaultValue={p.estado}>
                    {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </Campo>
                <Campo label="Fecha" hint="DD/MM/AAAA HH:MM:SS">
                  <input name="fecha" type="text" className={styles.input} defaultValue={p.fecha || ''} maxLength={30} />
                </Campo>
              </div>
            </div>
          </>
        )}

        {/* ══ TIPO CONTENEDOR ══ */}
        {tipo.key === 'contenedor' && (
          <>
            <div className={styles.paso}>
              <h2 className={styles.pasoTitulo}><ion-icon name="cube-outline" />Número de Contenedor</h2>
              <Campo label="Número de Contenedor Marítimo" obligatorio>
                <input name="contenedor" type="text" className={`${styles.input} ${styles.inputDestacado}`} defaultValue={p.contenedor || ''} maxLength={30} required />
              </Campo>
            </div>

            <div className={styles.paso}>
              <h2 className={styles.pasoTitulo}><ion-icon name="location-outline" />Aduana e Información General</h2>
              <div className={styles.grid2}>
                <Campo label="Aduana">
                  <select name="aduana" className={styles.select} defaultValue={p.aduana || ''}>
                    <option value="">— Seleccione (opcional) —</option>
                    {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </Campo>
                <Campo label="Año">
                  <select name="anio" className={styles.select} defaultValue={p.anio}>
                    {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </Campo>
                <Campo label="Patente">
                  <input name="patente" type="text" className={styles.input} defaultValue={p.patente || ''} maxLength={20} />
                </Campo>
                <Campo label="Documento">
                  <input name="documento" type="text" className={styles.input} defaultValue={p.documento || ''} maxLength={20} />
                </Campo>
                <Campo label="Estado">
                  <select name="estado" className={styles.select} defaultValue={p.estado}>
                    {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </Campo>
                <Campo label="Fecha" hint="DD/MM/AAAA HH:MM:SS">
                  <input name="fecha" type="text" className={styles.input} defaultValue={p.fecha || ''} maxLength={30} />
                </Campo>
              </div>
            </div>
          </>
        )}

        {/* ══ PAGO (todos los tipos) ══ */}
        <div className={styles.paso}>
          <h2 className={styles.pasoTitulo}>
            <ion-icon name="card-outline" />Información del Pago
            <span className={styles.opcional}> (puede dejarlo en blanco)</span>
          </h2>
          <div className={styles.grid2}>
            <Campo label="Banco">
              <input name="banco" type="text" className={styles.input} defaultValue={p.det_banco || ''} maxLength={100} />
            </Campo>
            <Campo label="Número de Operación">
              <input name="numero_operacion" type="text" className={styles.input} defaultValue={p.det_num_op || ''} maxLength={50} />
            </Campo>
            <Campo label="Importe pagado" hint="ej. 11778.00">
              <input name="importe" type="text" className={styles.input} defaultValue={p.importe || ''} maxLength={30} />
            </Campo>
            <Campo label="Fecha y hora del pago" hint="AAAA-MM-DD HH:MM">
              <input name="fecha_hora_pago" type="text" className={styles.input} defaultValue={p.fecha_hora_pago || ''} maxLength={30} />
            </Campo>
            <Campo label="Línea de Captura">
              <input name="linea_captura" type="text" className={styles.input} defaultValue={p.linea_captura || ''} maxLength={60} />
            </Campo>
            <Campo label="Estado de la Línea de Captura">
              <input name="estado_linea_captura" type="text" className={styles.input} defaultValue={p.estado_linea_captura || 'PAGO REGISTRADO EN SAAI'} maxLength={100} />
            </Campo>
          </div>
        </div>

        {/* Botones */}
        <div className={styles.botones}>
          <Link href={`/superadmin/pedimentos/${p.id}/ver`} className={styles.btnCancelar}>
            <ion-icon name="close-outline" /> Cancelar
          </Link>
          <button
            type="submit"
            className={styles.btnGuardar}
            disabled={pending || (tipo.key === 'vin' && !vinValido)}
            style={{ background: tipo.color }}
          >
            <ion-icon name="save-outline" />
            {pending ? 'Guardando cambios…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
