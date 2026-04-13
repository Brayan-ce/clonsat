'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import styles from './crear.module.css';
import { crearPorPedimento, crearPorVin, crearPorContenedor } from './servidor';
import { ADUANAS, ANIOS } from '@/_Extras/main/ingreso/constantes';

const ESTADOS = ['EN PROCESO', 'DESADUANADO', 'EN REVISION', 'RECHAZADO'];

/* ── Descarga del QR como PNG ── */
function descargarQR(containerId, nombre) {
  const svgEl = document.getElementById(containerId)?.querySelector('svg');
  if (!svgEl) return;
  const svgData = new XMLSerializer().serializeToString(svgEl);
  const size = 480;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    URL.revokeObjectURL(url);
    const a = document.createElement('a');
    a.download = `${nombre}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  img.src = url;
}

/* ── Tipos de pedimento disponibles ── */
const TIPOS = [
  {
    key: 'pedimento',
    icono: 'document-text',
    titulo: 'Pedimento',
    descripcion: 'Ingreso por número de aduana, patente y documento. Es el tipo más común.',
    color: '#285c4d',
    colorBg: '#eaf7f2',
    colorBorde: '#285c4d',
  },
  {
    key: 'vin',
    icono: 'car',
    titulo: 'Por VIN',
    descripcion: 'Ingreso mediante el número de identificación vehicular (17 dígitos).',
    color: '#2c5fc4',
    colorBg: '#dbeafe',
    colorBorde: '#3b73d4',
  },
  {
    key: 'contenedor',
    icono: 'cube',
    titulo: 'Por Contenedor',
    descripcion: 'Ingreso usando el número de contenedor marítimo.',
    color: '#b45309',
    colorBg: '#fef3c7',
    colorBorde: '#d97706',
  },
  {
    key: 'qr',
    icono: 'qr-code',
    titulo: 'Pedimento con QR',
    descripcion: 'Igual que un pedimento normal, pero con QR en tiempo real. Puede escanearlo enseguida.',
    color: '#6d28d9',
    colorBg: '#ede9fe',
    colorBorde: '#7c3aed',
  },
];

/* ── Componente reutilizable: campo de formulario ── */
function Campo({ label, hint, children, obligatorio = false }) {
  return (
    <div className={styles.campo}>
      <label className={styles.campoLabel}>
        {label}
        {obligatorio && <span className={styles.obligatorio}>*</span>}
        {hint && <span className={styles.campoHint}> ({hint})</span>}
      </label>
      {children}
    </div>
  );
}

/* ────────────────────────────────────────
   PASO 2A — Formulario tipo PEDIMENTO
─────────────────────────────────────────*/
function FormPedimento() {
  const [state, formAction, pending] = useActionState(crearPorPedimento, null);
  return (
    <form className={styles.form} action={formAction}>
      {state?.error && <div className={styles.alerta}><ion-icon name="warning-outline" />{state.error}</div>}

      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}><ion-icon name="location-outline" />Información de la Aduana</h3>
        <div className={styles.grid2}>
          <Campo label="Aduana" obligatorio>
            <select name="aduana" className={styles.select} required>
              <option value="">— Seleccione la aduana —</option>
              {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Año">
            <select name="anio" className={styles.select}>
              {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </Campo>
        </div>
      </div>

      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}><ion-icon name="document-text-outline" />Datos del Pedimento</h3>
        <div className={styles.grid2}>
          <Campo label="Patente" obligatorio>
            <input name="patente" type="text" className={styles.input} placeholder="Ej. 3414" maxLength={20} required />
          </Campo>
          <Campo label="Documento" obligatorio>
            <input name="documento" type="text" className={styles.input} placeholder="Ej. 6009679" maxLength={20} required />
          </Campo>
          <Campo label="Factura">
            <input name="factura" type="text" className={styles.input} placeholder="Número de factura (opcional)" maxLength={50} />
          </Campo>
          <Campo label="Secuencia">
            <input name="secuencia" type="text" className={styles.input} defaultValue="0" maxLength={10} />
          </Campo>
          <Campo label="Tipo de Operación" hint="ej. 1 IMPORTACIÓN">
            <input name="tipo_operacion" type="text" className={styles.input} placeholder="1 IMPORTACIÓN" maxLength={80} />
          </Campo>
          <Campo label="Clave de Documento" hint="ej. VF">
            <input name="clave_documento" type="text" className={styles.input} placeholder="VF" maxLength={10} />
          </Campo>
          <Campo label="Estado">
            <select name="estado" className={styles.select}>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </Campo>
          <Campo label="Fecha" hint="DD/MM/AAAA HH:MM:SS">
            <input name="fecha" type="text" className={styles.input} placeholder="27/03/2026 13:21:37" maxLength={30} />
          </Campo>
        </div>
      </div>

      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}><ion-icon name="card-outline" />Información del Pago <span className={styles.opcional}>(puede completarla después)</span></h3>
        <div className={styles.grid2}>
          <Campo label="Banco">
            <input name="banco" type="text" className={styles.input} placeholder="Nombre del banco" maxLength={100} />
          </Campo>
          <Campo label="Número de Operación">
            <input name="numero_operacion" type="text" className={styles.input} maxLength={50} />
          </Campo>
          <Campo label="Importe pagado" hint="ej. 11778.00">
            <input name="det_importe" type="text" className={styles.input} placeholder="0.00" maxLength={30} />
          </Campo>
          <Campo label="Fecha y hora del pago" hint="AAAA-MM-DD HH:MM">
            <input name="det_fecha_hora_pago" type="text" className={styles.input} placeholder="2026-03-27 13:21" maxLength={30} />
          </Campo>
          <div className={styles.grid1}>
            <Campo label="Línea de Captura">
              <input name="det_linea_captura" type="text" className={styles.input} maxLength={60} />
            </Campo>
          </div>
          <Campo label="Estado de la Línea de Captura">
            <input name="det_estado_linea" type="text" className={styles.input} defaultValue="PAGO REGISTRADO EN SAAI" maxLength={100} />
          </Campo>
        </div>
      </div>

      <div className={styles.botones}>
        <button type="submit" className={styles.btnGuardar} disabled={pending} style={{ background: '#285c4d' }}>
          <ion-icon name="save-outline" />
          {pending ? 'Guardando pedimento…' : 'Guardar pedimento'}
        </button>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────
   PASO 2B — Formulario tipo VIN
─────────────────────────────────────────*/
function FormVin() {
  const [vin, setVin] = useState('');
  const [state, formAction, pending] = useActionState(crearPorVin, null);
  const vinValido = vin.length === 17;

  return (
    <form className={styles.form} action={formAction}>
      {state?.error && <div className={styles.alerta}><ion-icon name="warning-outline" />{state.error}</div>}

      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}><ion-icon name="car-outline" />Número VIN del Vehículo</h3>
        <div className={styles.vinWrap}>
          <Campo label="VIN — Número de Identificación Vehicular" obligatorio hint="17 caracteres exactos">
            <input
              name="vin"
              type="text"
              className={`${styles.input} ${styles.inputVin} ${vin.length > 0 ? (vinValido ? styles.inputValido : styles.inputInvalido) : ''}`}
              placeholder="Ej. 1HGBH41JXMN109186"
              maxLength={17}
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              required
            />
          </Campo>
          <div className={styles.vinContador} style={{ color: vinValido ? '#285c4d' : (vin.length > 0 ? '#c0392b' : '#aaa') }}>
            <ion-icon name={vinValido ? 'checkmark-circle' : 'information-circle-outline'} />
            {vin.length}/17 caracteres {vinValido ? '— Correcto' : ''}
          </div>
        </div>
      </div>

      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}><ion-icon name="settings-outline" />Datos generales</h3>
        <div className={styles.grid2}>
          <Campo label="Año">
            <select name="anio" className={styles.select}>
              {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </Campo>
          <Campo label="Estado">
            <select name="estado" className={styles.select}>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </Campo>
          <Campo label="Fecha" hint="DD/MM/AAAA HH:MM:SS">
            <input name="fecha" type="text" className={styles.input} placeholder="27/03/2026 13:21:37" maxLength={30} />
          </Campo>
        </div>
      </div>

      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}><ion-icon name="card-outline" />Información del Pago <span className={styles.opcional}>(opcional)</span></h3>
        <div className={styles.grid2}>
          <Campo label="Banco"><input name="banco" type="text" className={styles.input} maxLength={100} /></Campo>
          <Campo label="Número de Operación"><input name="numero_operacion" type="text" className={styles.input} maxLength={50} /></Campo>
          <Campo label="Importe" hint="ej. 55250.75"><input name="det_importe" type="text" className={styles.input} placeholder="0.00" maxLength={30} /></Campo>
          <Campo label="Fecha y hora del pago"><input name="det_fecha_hora_pago" type="text" className={styles.input} placeholder="2026-03-27 13:21" maxLength={30} /></Campo>
          <Campo label="Línea de Captura"><input name="det_linea_captura" type="text" className={styles.input} maxLength={60} /></Campo>
          <Campo label="Estado Línea de Captura"><input name="det_estado_linea" type="text" className={styles.input} defaultValue="PAGO REGISTRADO EN SAAI" maxLength={100} /></Campo>
        </div>
      </div>

      <div className={styles.botones}>
        <button type="submit" className={styles.btnGuardar} disabled={pending || !vinValido} style={{ background: '#2c5fc4' }}>
          <ion-icon name="save-outline" />
          {pending ? 'Guardando…' : 'Guardar pedimento por VIN'}
        </button>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────
   PASO 2C — Formulario tipo CONTENEDOR
─────────────────────────────────────────*/
function FormContenedor() {
  const [state, formAction, pending] = useActionState(crearPorContenedor, null);
  return (
    <form className={styles.form} action={formAction}>
      {state?.error && <div className={styles.alerta}><ion-icon name="warning-outline" />{state.error}</div>}

      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}><ion-icon name="cube-outline" />Número de Contenedor</h3>
        <Campo label="Número de Contenedor Marítimo" obligatorio>
          <input name="contenedor" type="text" className={`${styles.input} ${styles.inputDestacado}`} placeholder="Ej. HLXU8020617" maxLength={30} required />
        </Campo>
      </div>

      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}><ion-icon name="location-outline" />Aduana e Información General</h3>
        <div className={styles.grid2}>
          <Campo label="Aduana">
            <select name="aduana" className={styles.select}>
              <option value="">— Seleccione (opcional) —</option>
              {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Año">
            <select name="anio" className={styles.select}>
              {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </Campo>
          <Campo label="Patente"><input name="patente" type="text" className={styles.input} maxLength={20} /></Campo>
          <Campo label="Documento"><input name="documento" type="text" className={styles.input} maxLength={20} /></Campo>
          <Campo label="Estado">
            <select name="estado" className={styles.select}>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </Campo>
          <Campo label="Fecha" hint="DD/MM/AAAA HH:MM:SS">
            <input name="fecha" type="text" className={styles.input} placeholder="27/03/2026 13:21:37" maxLength={30} />
          </Campo>
        </div>
      </div>

      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}><ion-icon name="card-outline" />Información del Pago <span className={styles.opcional}>(opcional)</span></h3>
        <div className={styles.grid2}>
          <Campo label="Banco"><input name="banco" type="text" className={styles.input} maxLength={100} /></Campo>
          <Campo label="Número de Operación"><input name="numero_operacion" type="text" className={styles.input} maxLength={50} /></Campo>
          <Campo label="Importe"><input name="det_importe" type="text" className={styles.input} placeholder="0.00" maxLength={30} /></Campo>
          <Campo label="Fecha y hora del pago"><input name="det_fecha_hora_pago" type="text" className={styles.input} placeholder="2026-03-27 13:21" maxLength={30} /></Campo>
          <Campo label="Línea de Captura"><input name="det_linea_captura" type="text" className={styles.input} maxLength={60} /></Campo>
          <Campo label="Estado Línea de Captura"><input name="det_estado_linea" type="text" className={styles.input} defaultValue="PAGO REGISTRADO EN SAAI" maxLength={100} /></Campo>
        </div>
      </div>

      <div className={styles.botones}>
        <button type="submit" className={styles.btnGuardar} disabled={pending} style={{ background: '#b45309' }}>
          <ion-icon name="save-outline" />
          {pending ? 'Guardando…' : 'Guardar pedimento por Contenedor'}
        </button>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────
   PASO 2D — Formulario PEDIMENTO CON QR
   (mismos campos que pedimento + vista QR en vivo)
─────────────────────────────────────────*/
function FormQR() {
  const [state, formAction, pending] = useActionState(crearPorPedimento, null);
  const [aduana,      setAduana]      = useState('');
  const [aduanaLabel, setAduanaLabel] = useState('');
  const [anio,        setAnio]        = useState(String(new Date().getFullYear()));
  const [patente,     setPatente]     = useState('');
  const [documento,   setDocumento]   = useState('');

  const qrUrl = (typeof window !== 'undefined' && patente && documento && aduana)
    ? `${window.location.origin}/SOIANET/oia_consultarapd_cep.aspx?pa=${patente}&dn=${documento}&s=0&ap=${anio}&pad=${aduana}&ad=${encodeURIComponent(aduanaLabel)}&z=QR`
    : '';

  const handleAduana = (e) => {
    const val = e.target.value;
    setAduana(val);
    setAduanaLabel(ADUANAS.find((a) => a.value === val)?.label || '');
  };

  return (
    <div className={styles.qrLayout}>
      {/* ── Formulario (izquierda) ── */}
      <form className={styles.form} action={formAction}>
        {state?.error && <div className={styles.alerta}><ion-icon name="warning-outline" />{state.error}</div>}

        <div className={styles.seccion}>
          <h3 className={styles.seccionTitulo}><ion-icon name="location-outline" />Información de la Aduana</h3>
          <div className={styles.grid2}>
            <Campo label="Aduana" obligatorio>
              <select name="aduana" className={styles.select} value={aduana} onChange={handleAduana} required>
                <option value="">— Seleccione la aduana —</option>
                {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Año">
              <select name="anio" className={styles.select} value={anio} onChange={(e) => setAnio(e.target.value)}>
                {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </Campo>
          </div>
        </div>

        <div className={styles.seccion}>
          <h3 className={styles.seccionTitulo}><ion-icon name="document-text-outline" />Datos del Pedimento</h3>
          <div className={styles.grid2}>
            <Campo label="Patente" obligatorio>
              <input name="patente" type="text" className={styles.input} placeholder="Ej. 3414" maxLength={20} required
                value={patente} onChange={(e) => setPatente(e.target.value)} />
            </Campo>
            <Campo label="Documento" obligatorio>
              <input name="documento" type="text" className={styles.input} placeholder="Ej. 6009679" maxLength={20} required
                value={documento} onChange={(e) => setDocumento(e.target.value)} />
            </Campo>
            <Campo label="Factura">
              <input name="factura" type="text" className={styles.input} maxLength={50} />
            </Campo>
            <Campo label="Secuencia">
              <input name="secuencia" type="text" className={styles.input} defaultValue="0" maxLength={10} />
            </Campo>
            <Campo label="Tipo de Operación" hint="ej. 1 IMPORTACIÓN">
              <input name="tipo_operacion" type="text" className={styles.input} maxLength={80} />
            </Campo>
            <Campo label="Clave de Documento" hint="ej. VF">
              <input name="clave_documento" type="text" className={styles.input} maxLength={10} />
            </Campo>
            <Campo label="Estado">
              <select name="estado" className={styles.select}>
                {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </Campo>
            <Campo label="Fecha" hint="DD/MM/AAAA HH:MM:SS">
              <input name="fecha" type="text" className={styles.input} placeholder="27/03/2026 13:21:37" maxLength={30} />
            </Campo>
          </div>
        </div>

        <div className={styles.seccion}>
          <h3 className={styles.seccionTitulo}><ion-icon name="card-outline" />Información del Pago <span className={styles.opcional}>(puede completarla después)</span></h3>
          <div className={styles.grid2}>
            <Campo label="Banco"><input name="banco" type="text" className={styles.input} maxLength={100} /></Campo>
            <Campo label="Número de Operación"><input name="numero_operacion" type="text" className={styles.input} maxLength={50} /></Campo>
            <Campo label="Importe" hint="ej. 11778.00"><input name="det_importe" type="text" className={styles.input} placeholder="0.00" maxLength={30} /></Campo>
            <Campo label="Fecha y hora del pago"><input name="det_fecha_hora_pago" type="text" className={styles.input} maxLength={30} /></Campo>
            <Campo label="Línea de Captura"><input name="det_linea_captura" type="text" className={styles.input} maxLength={60} /></Campo>
            <Campo label="Estado Línea de Captura"><input name="det_estado_linea" type="text" className={styles.input} defaultValue="PAGO REGISTRADO EN SAAI" maxLength={100} /></Campo>
          </div>
        </div>

        <div className={styles.botones}>
          <button type="submit" className={styles.btnGuardar} disabled={pending} style={{ background: '#6d28d9' }}>
            <ion-icon name="save-outline" />
            {pending ? 'Guardando pedimento…' : 'Guardar pedimento con QR'}
          </button>
        </div>
      </form>

      {/* ── Panel QR en vivo (derecha) ── */}
      <div className={styles.qrPanel}>
        <h3 className={styles.qrPanelTitulo}>
          <ion-icon name="qr-code-outline" /> Vista previa del QR
        </h3>
        {qrUrl ? (
          <>
            <div id="qr-crear-codigo" className={styles.qrPanelCodigo}>
              <QRCodeSVG value={qrUrl} size={200} level="Q" />
            </div>
            <p className={styles.qrPanelOk}>
              <ion-icon name="checkmark-circle-outline" /> ¡Listo para escanear con el teléfono!
            </p>
            <p className={styles.qrPanelUrl}>{qrUrl}</p>
            <button
              type="button"
              className={styles.qrPanelBtnCopiar}
              onClick={() => navigator.clipboard.writeText(qrUrl).then(() => alert('¡Enlace copiado!'))}
            >
              <ion-icon name="copy-outline" /> Copiar enlace
            </button>
            <button
              type="button"
              className={styles.qrPanelBtnDescargar}
              onClick={() => descargarQR('qr-crear-codigo', `pedimento-qr-${patente}-${documento}`)}
            >
              <ion-icon name="download-outline" /> Descargar QR
            </button>
          </>
        ) : (
          <div className={styles.qrPanelVacio}>
            <ion-icon name="qr-code-outline" />
            <p>Complete la <strong>Aduana</strong>, <strong>Patente</strong> y <strong>Documento</strong></p>
            <p>para ver el código QR aquí.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   COMPONENTE PRINCIPAL
═════════════════════════════════════════*/
export default function Crear() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const tipo = TIPOS.find((t) => t.key === tipoSeleccionado);

  return (
    <div className={styles.pagina}>

      {/* ── Encabezado ── */}
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>
            <ion-icon name="add-circle-outline" /> Registrar nuevo pedimento
          </h1>
          <p className={styles.descripcion}>Siga los pasos para ingresar el pedimento correctamente.</p>
        </div>
        <Link href="/superadmin/pedimentos" className={styles.btnVolver}>
          <ion-icon name="arrow-back-outline" /> Volver a la lista
        </Link>
      </div>

      {/* ══ PASO 1 — Elegir tipo ══ */}
      <div className={styles.paso}>
        <div className={styles.pasoCabecera}>
          <div className={styles.pasoNumero} style={{ background: tipoSeleccionado ? '#285c4d' : '#888' }}>
            {tipoSeleccionado ? <ion-icon name="checkmark" /> : '1'}
          </div>
          <div>
            <div className={styles.pasoTitulo}>¿Cuál es el tipo de pedimento?</div>
            <div className={styles.pasoSubtitulo}>Seleccione la opción que corresponde a su caso.</div>
          </div>
          {tipoSeleccionado && (
            <button className={styles.btnCambiar} onClick={() => setTipoSeleccionado(null)}>
              <ion-icon name="pencil-outline" /> Cambiar
            </button>
          )}
        </div>

        {!tipoSeleccionado ? (
          <div className={styles.tipoOpciones}>
            {TIPOS.map((t) => (
              <button
                key={t.key}
                className={styles.tipoOpcion}
                style={{ borderColor: t.colorBorde, background: t.colorBg }}
                onClick={() => setTipoSeleccionado(t.key)}
              >
                <div className={styles.tipoOpcionIcono} style={{ color: t.color }}>
                  <ion-icon name={`${t.icono}-outline`} />
                </div>
                <div className={styles.tipoOpcionTexto} style={{ color: t.color }}>
                  <span className={styles.tipoOpcionTitulo}>{t.titulo}</span>
                  <span className={styles.tipoOpcionDesc}>{t.descripcion}</span>
                </div>
                <ion-icon name="chevron-forward-outline" style={{ color: t.color, fontSize: '20px', marginLeft: 'auto' }} />
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.tipoSeleccionado} style={{ borderColor: tipo.colorBorde, background: tipo.colorBg, color: tipo.color }}>
            <ion-icon name={`${tipo.icono}-outline`} style={{ fontSize: '22px' }} />
            <span className={styles.tipoOpcionTitulo}>{tipo.titulo}</span>
            <span style={{ fontSize: '13px', marginLeft: '8px', opacity: 0.8 }}>— {tipo.descripcion}</span>
          </div>
        )}
      </div>

      {/* ══ PASO 2 — Formulario (aparece al elegir tipo) ══ */}
      {tipoSeleccionado && (
        <div className={styles.paso}>
          <div className={styles.pasoCabecera}>
            <div className={styles.pasoNumero} style={{ background: tipo.color }}>2</div>
            <div>
              <div className={styles.pasoTitulo}>Complete los datos del pedimento</div>
              <div className={styles.pasoSubtitulo}>Los campos marcados con <span style={{ color: '#c0392b' }}>*</span> son obligatorios.</div>
            </div>
          </div>
          {tipoSeleccionado === 'pedimento'  && <FormPedimento />}
          {tipoSeleccionado === 'vin'        && <FormVin />}
          {tipoSeleccionado === 'contenedor' && <FormContenedor />}
          {tipoSeleccionado === 'qr'         && <FormQR />}
        </div>
      )}

    </div>
  );
}
