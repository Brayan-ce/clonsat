'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import styles from './editar.module.css';
import crearStyles from '../crear/crear.module.css';
import { actualizarPedimento } from './servidor';
import { ADUANAS, ANIOS } from '@/_Extras/main/ingreso/constantes';

const ESTADOS = ['EN PROCESO', 'DESADUANADO', 'EN REVISION', 'RECHAZADO'];
const MOVIMIENTO_QR_VACIO = { situacion: '', detalle: '', fecha: '' };
const COMPLEMENTO_VACIO = { id_caso: '', complemento1: '', complemento2: '', complemento3: '' };
const FRACCION_VACIA = {
  fraccion: '',
  secuencia: '1',
  marca: '',
  modelo: '',
  anio_vehiculo: '',
  numero_serie: '',
  kilometraje: '',
  valor_aduana: '',
  fp_iva: '',
  importe_iva: '',
  fp_advalorem: '',
  importe_advalorem: '',
  fp_isan: '',
  importe_isan: '',
  fp_tenencia: '',
  importe_tenencia: '',
};

/* ── Ayudante: obtener tipo del pedimento ── */
function getTipo(p) {
  if (p.tipo_registro === 'qr') return { key: 'qr', icono: 'qr-code', etiqueta: 'Pedimento con QR', color: '#6d28d9', colorBg: '#ede9fe' };
  if (p.tipo_registro === 'vin') return { key: 'vin', icono: 'car', etiqueta: 'Por VIN', color: '#2c5fc4', colorBg: '#dbeafe' };
  if (p.tipo_registro === 'contenedor') return { key: 'contenedor', icono: 'cube', etiqueta: 'Por Contenedor', color: '#b45309', colorBg: '#fef3c7' };
  if (p.tipo_registro === 'pedimento') return { key: 'pedimento', icono: 'document-text', etiqueta: 'Pedimento', color: '#285c4d', colorBg: '#eaf7f2' };
  if (p.vin)        return { key: 'vin',        icono: 'car',          etiqueta: 'Por VIN',       color: '#2c5fc4', colorBg: '#dbeafe' };
  if (p.contenedor) return { key: 'contenedor', icono: 'cube',         etiqueta: 'Por Contenedor', color: '#b45309', colorBg: '#fef3c7' };
  if (p.es_qr)      return { key: 'qr',         icono: 'qr-code',      etiqueta: 'Pedimento con QR', color: '#6d28d9', colorBg: '#ede9fe' };
  return              { key: 'pedimento',        icono: 'document-text', etiqueta: 'Pedimento',     color: '#285c4d', colorBg: '#eaf7f2' };
}

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
  const etiquetaRegistro = tipo.key === 'contenedor'
    ? 'registro por contenedor'
    : tipo.key === 'vin'
      ? 'registro por VIN'
      : tipo.key === 'qr'
        ? 'pedimento con QR'
      : 'pedimento';
  const accion = actualizarPedimento.bind(null, p.id);
  const [state, formAction, pending] = useActionState(accion, null);
  const [vin, setVin] = useState(p.vin || '');
  const [importador, setImportador] = useState({
    rfc: p.vehiculo?.rfc || '',
    curp: p.vehiculo?.curp || '',
    importador: p.vehiculo?.importador || '',
    fecha_pago: p.vehiculo?.fecha_pago || '',
    calle: p.vehiculo?.calle || '',
    numero_ext: p.vehiculo?.numero_ext || '',
    municipio: p.vehiculo?.municipio || '',
    apartado_postal: p.vehiculo?.apartado_postal || '',
    cp: p.vehiculo?.cp || '',
    entidad_federativa: p.vehiculo?.entidad_federativa || '',
    pais: p.vehiculo?.pais || '',
    aduana_completa: p.vehiculo?.aduana_completa || '',
  });
  const [pagoVin, setPagoVin] = useState({
    banco: p.det_banco || '',
    numero_operacion: p.det_num_op || '',
    importe: p.importe || '',
    fecha_hora_pago: p.fecha_hora_pago || '',
    linea_captura: p.linea_captura || '',
    estado_linea_captura: p.estado_linea_captura || 'PAGO REGISTRADO EN SAAI',
  });
  const [complementos, setComplementos] = useState(
    p.complementos?.length ? p.complementos : [{ ...COMPLEMENTO_VACIO }]
  );
  const [fracciones, setFracciones] = useState(
    p.fracciones?.length ? p.fracciones : [{ ...FRACCION_VACIA }]
  );
  const [abiertaFracciones, setAbiertaFracciones] = useState(true);
  const [abiertaComplementos, setAbiertaComplementos] = useState(true);
  const [aduanaQr, setAduanaQr] = useState(p.aduana || '');
  const [aduanaLabelQr, setAduanaLabelQr] = useState(p.aduana_label || (ADUANAS.find((a) => a.value === p.aduana)?.label || ''));
  const [anioQr, setAnioQr] = useState(p.anio || String(new Date().getFullYear()));
  const [patenteQr, setPatenteQr] = useState(p.patente || '');
  const [documentoQr, setDocumentoQr] = useState(p.documento || '');
  const [bancoQr, setBancoQr] = useState(p.det_banco || 'BBVA BANCOMER');
  const [numeroOperacionQr, setNumeroOperacionQr] = useState(p.det_num_op || '1');
  const [secuenciaQr, setSecuenciaQr] = useState(p.secuencia || '0');
  const [facturaQr, setFacturaQr] = useState(p.factura || '');
  const [movimientosQr, setMovimientosQr] = useState(
    p.movimientos?.length ? p.movimientos : [{ ...MOVIMIENTO_QR_VACIO }]
  );
  const vinValido = vin.length === 17;
  const qrUrl = (typeof window !== 'undefined' && patenteQr && documentoQr && aduanaQr)
    ? `${window.location.origin}/SOIANET/oia_consultarapd_cep.aspx?pa=${patenteQr}&dn=${documentoQr}&s=0&ap=${anioQr}&pad=${aduanaQr}&ad=${encodeURIComponent(aduanaLabelQr)}&z=QR`
    : '';

  const actualizarImportador = (campo, valor) => {
    setImportador((actual) => ({ ...actual, [campo]: valor }));
  };
  const actualizarPagoVin = (campo, valor) => {
    setPagoVin((actual) => ({ ...actual, [campo]: valor }));
  };
  const agregarComplemento = () => setComplementos((actual) => [...actual, { ...COMPLEMENTO_VACIO }]);
  const eliminarComplemento = (indice) => setComplementos((actual) => actual.filter((_, i) => i !== indice));
  const actualizarComplemento = (indice, campo, valor) => {
    setComplementos((actual) => actual.map((fila, i) => (i === indice ? { ...fila, [campo]: valor } : fila)));
  };
  const agregarFraccion = () => setFracciones((actual) => [...actual, { ...FRACCION_VACIA }]);
  const eliminarFraccion = (indice) => setFracciones((actual) => actual.filter((_, i) => i !== indice));
  const actualizarFraccion = (indice, campo, valor) => {
    setFracciones((actual) => actual.map((fila, i) => (i === indice ? { ...fila, [campo]: valor } : fila)));
  };
  const handleAduanaQr = (e) => {
    const val = e.target.value;
    setAduanaQr(val);
    setAduanaLabelQr(ADUANAS.find((a) => a.value === val)?.label || '');
  };
  const actualizarMovimientoQr = (indice, campo, valor) => {
    setMovimientosQr((actual) => actual.map((fila, i) => (i === indice ? { ...fila, [campo]: valor } : fila)));
  };
  const agregarMovimientoQr = () => setMovimientosQr((actual) => [...actual, { ...MOVIMIENTO_QR_VACIO }]);
  const eliminarMovimientoQr = (indice) => setMovimientosQr((actual) => actual.filter((_, i) => i !== indice));

  return (
    <div className={styles.pagina}>
      {/* Encabezado */}
      <div className={styles.encabezado}>
        <div className={styles.encabezadoIzq}>
          <Link href={`/superadmin/pedimentos/${p.id}/ver`} className={styles.linkVolver}>
            <ion-icon name="arrow-back-outline" /> Volver al detalle
          </Link>
          <h1 className={styles.titulo}>Editar {etiquetaRegistro} #{p.id}</h1>
          <div className={styles.tipoBadge} style={{ background: tipo.colorBg, color: tipo.color, borderColor: tipo.color }}>
            <ion-icon name={`${tipo.icono}-outline`} />
            {tipo.etiqueta}
            <span className={styles.tipoBadgeInfo}>{tipo.key === 'qr' ? ' — Tiempo real' : ' — El tipo no se puede cambiar'}</span>
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
            <div className={crearStyles.sgSeccionHeader}>
              <ion-icon name="location-outline" />
              Aduana
            </div>
            <div className={crearStyles.sgSeccionBody}>
              <div className={crearStyles.sgSoianetForm}>
                <div className={crearStyles.sgSoianetFila}>
                  <div className={crearStyles.sgSoianetCampo} style={{ flex: 2 }}>
                    <label className={crearStyles.sgSoianetLabel}>Aduana: <span className={crearStyles.sgObligatorio}>*</span></label>
                    <select name="aduana" className={crearStyles.sgSoianetSelect} defaultValue={p.aduana} required>
                      <option value="">Seleccione la aduana</option>
                      {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={crearStyles.sgSoianetCampo}>
                    <label className={crearStyles.sgSoianetLabel}>Año del Pedimento:</label>
                    <select name="anio" className={crearStyles.sgSoianetSelect} defaultValue={p.anio}>
                      {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className={crearStyles.sgSeccionHeader}>
              <ion-icon name="document-text-outline" />
              Datos del Pedimento
            </div>
            <div className={crearStyles.sgSeccionBody}>
              <div className={crearStyles.sgTablaWrapper}>
                <table className={crearStyles.sgTabla}>
                  <thead>
                    <tr className={crearStyles.sgTablaHeader}>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th>Banco</th>
                      <th>Secuencia</th>
                      <th>Núm. Operación</th>
                      <th>Factura</th>
                      <th>Patente</th>
                      <th>Documento</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={crearStyles.sgTablaRow}>
                      <td>
                        <select name="estado" className={crearStyles.sgTablaInput} defaultValue={p.estado || 'EN PROCESO'}>
                          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </td>
                      <td>
                        <input name="fecha" type="text" className={crearStyles.sgTablaInput} defaultValue={p.fecha || ''} maxLength={30} />
                      </td>
                      <td>
                        <input type="text" className={crearStyles.sgTablaInput} value={p.det_banco || ''} readOnly />
                      </td>
                      <td>
                        <input name="secuencia" type="text" className={`${crearStyles.sgTablaInput} ${crearStyles.sgTablaInputNum}`} defaultValue={p.secuencia || '0'} maxLength={10} />
                      </td>
                      <td>
                        <input type="text" className={crearStyles.sgTablaInput} value={p.det_num_op || ''} readOnly />
                      </td>
                      <td>
                        <input name="factura" type="text" className={crearStyles.sgTablaInput} defaultValue={p.factura || ''} maxLength={50} />
                      </td>
                      <td>
                        <input name="patente" type="text" className={crearStyles.sgTablaInput} defaultValue={p.patente || ''} maxLength={20} required />
                      </td>
                      <td>
                        <input name="documento" type="text" className={crearStyles.sgTablaInput} defaultValue={p.documento || ''} maxLength={20} required />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <input type="hidden" name="tipo_operacion" value={p.tipo_operacion || '1 IMPORTACIÓN'} />
              <input type="hidden" name="clave_documento" value={p.clave_documento || 'VF'} />
            </div>

            <div className={crearStyles.sgSeccionHeader}>
              <ion-icon name="card-outline" />
              Información del Pago
              <span className={crearStyles.sgOpcional}>puede completarse después</span>
            </div>
            <div className={crearStyles.sgSeccionBody}>
              <div className={crearStyles.sgTablaWrapper}>
                <table className={crearStyles.sgTabla}>
                  <thead>
                    <tr className={crearStyles.sgTablaHeader}>
                      <th>Banco</th>
                      <th>Núm. Operación</th>
                      <th>Importe</th>
                      <th>Fecha y Hora de Pago</th>
                      <th>Línea de Captura</th>
                      <th>Estado Línea de Captura</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={crearStyles.sgTablaRow}>
                      <td><input name="banco" type="text" className={crearStyles.sgTablaInput} defaultValue={p.det_banco || ''} maxLength={100} /></td>
                      <td><input name="numero_operacion" type="text" className={crearStyles.sgTablaInput} defaultValue={p.det_num_op || ''} maxLength={50} /></td>
                      <td><input name="importe" type="text" className={`${crearStyles.sgTablaInput} ${crearStyles.sgTablaInputNum}`} defaultValue={p.importe || ''} maxLength={30} /></td>
                      <td><input name="fecha_hora_pago" type="text" className={crearStyles.sgTablaInput} defaultValue={p.fecha_hora_pago || ''} maxLength={30} /></td>
                      <td><input name="linea_captura" type="text" className={crearStyles.sgTablaInput} defaultValue={p.linea_captura || ''} maxLength={60} /></td>
                      <td><input name="estado_linea_captura" type="text" className={crearStyles.sgTablaInput} defaultValue={p.estado_linea_captura || 'PAGO REGISTRADO EN SAAI'} maxLength={100} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ TIPO QR ══ */}
        {tipo.key === 'qr' && (
          <div className={crearStyles.qrLayout}>
            <div className={crearStyles.sgFormWrapper}>
              <input type="hidden" name="tipo_operacion" value="1 IMPORTACIÓN" />
              <input type="hidden" name="clave_documento" value="VF" />
              <input type="hidden" name="estado" value="PAGADO" />
              <input type="hidden" name="fecha" value={movimientosQr[0]?.fecha || p.fecha || ''} />
              <input type="hidden" name="aduana_label" value={aduanaLabelQr} />

              <div className={crearStyles.sgSeccionHeader}>
                <ion-icon name="document-text-outline" />
                Detalle de situacion del pedimento
              </div>
              <div className={crearStyles.sgSeccionBody}>
                <div className={crearStyles.qrDetalleResumen}>
                  <div className={crearStyles.qrDetalleFila}>
                    <div className={crearStyles.qrDetalleCampo}>
                      <span className={crearStyles.qrDetalleLabel}>Aduana:</span>
                      <select name="aduana" className={crearStyles.sgSoianetSelect} value={aduanaQr} onChange={handleAduanaQr} required>
                        <option value="">Seleccione la aduana</option>
                        {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className={crearStyles.qrDetalleCampo}>
                      <span className={crearStyles.qrDetalleLabel}>Tipo operación:</span>
                      <input type="text" className={crearStyles.qrDetalleInput} value="1 IMPORTACIÓN" readOnly />
                    </div>
                  </div>

                  <div className={crearStyles.qrDetalleFila}>
                    <div className={crearStyles.qrDetalleCampo}>
                      <span className={crearStyles.qrDetalleLabel}>Banco:</span>
                      <input name="banco" type="text" className={crearStyles.qrDetalleInput} value={bancoQr} onChange={(e) => setBancoQr(e.target.value)} maxLength={100} />
                    </div>
                    <div className={crearStyles.qrDetalleCampo}>
                      <span className={crearStyles.qrDetalleLabel}>Clave documento:</span>
                      <input type="text" className={crearStyles.qrDetalleInput} value="VF" readOnly />
                    </div>
                  </div>

                  <div className={crearStyles.qrDetalleFila}>
                    <div className={crearStyles.qrDetalleCampo}>
                      <span className={crearStyles.qrDetalleLabel}>Patente:</span>
                      <input name="patente" type="text" className={crearStyles.qrDetalleInput} value={patenteQr} onChange={(e) => setPatenteQr(e.target.value)} maxLength={20} required />
                    </div>
                    <div className={crearStyles.qrDetalleCampo}>
                      <span className={crearStyles.qrDetalleLabel}>Número operación:</span>
                      <input name="numero_operacion" type="text" className={crearStyles.qrDetalleInput} value={numeroOperacionQr} onChange={(e) => setNumeroOperacionQr(e.target.value)} maxLength={50} />
                    </div>
                  </div>

                  <div className={crearStyles.qrDetalleFila}>
                    <div className={crearStyles.qrDetalleCampoTriple} style={{ gridColumn: '1 / -1' }}>
                      <div className={crearStyles.qrDetalleCampoMini}>
                        <span className={crearStyles.qrDetalleLabel}>Documento:</span>
                        <input name="documento" type="text" className={crearStyles.qrDetalleInput} value={documentoQr} onChange={(e) => setDocumentoQr(e.target.value)} maxLength={20} required />
                      </div>
                      <div className={crearStyles.qrDetalleCampoMini}>
                        <span className={crearStyles.qrDetalleLabel}>Año:</span>
                        <select name="anio" className={crearStyles.qrDetalleInput} value={anioQr} onChange={(e) => setAnioQr(e.target.value)}>
                          {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div className={crearStyles.qrDetalleCampoMini}>
                        <span className={crearStyles.qrDetalleLabel}>Secuencia:</span>
                        <input name="secuencia" type="text" className={crearStyles.qrDetalleInput} value={secuenciaQr} onChange={(e) => setSecuenciaQr(e.target.value)} maxLength={10} />
                      </div>
                      <div className={crearStyles.qrDetalleCampoMini}>
                        <span className={crearStyles.qrDetalleLabel}>Factura:</span>
                        <input name="factura" type="text" className={crearStyles.qrDetalleInput} value={facturaQr} onChange={(e) => setFacturaQr(e.target.value)} maxLength={50} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={crearStyles.sgSeccionHeader}>
                <ion-icon name="git-branch-outline" />
                Movimientos del Pedimento
                <span className={crearStyles.sgOpcional}>Total de movimientos: {movimientosQr.length}</span>
              </div>
              <div className={crearStyles.sgSeccionBody}>
                <input type="hidden" name="movimientos_count" value={movimientosQr.length} />
                <div className={crearStyles.sgTablaWrapper}>
                  <table className={crearStyles.sgTabla}>
                    <thead>
                      <tr className={crearStyles.sgTablaHeader}>
                        <th>Situacion</th>
                        <th>Detalle</th>
                        <th>Fecha</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientosQr.map((movimiento, indice) => (
                        <tr key={indice} className={crearStyles.sgTablaRow}>
                          <td><input name={`mov_situacion_${indice}`} type="text" className={crearStyles.sgTablaInput} value={movimiento.situacion || ''} onChange={(e) => actualizarMovimientoQr(indice, 'situacion', e.target.value)} maxLength={100} /></td>
                          <td><input name={`mov_detalle_${indice}`} type="text" className={crearStyles.sgTablaInput} value={movimiento.detalle || ''} onChange={(e) => actualizarMovimientoQr(indice, 'detalle', e.target.value)} maxLength={200} /></td>
                          <td><input name={`mov_fecha_${indice}`} type="text" className={crearStyles.sgTablaInput} value={movimiento.fecha || ''} onChange={(e) => actualizarMovimientoQr(indice, 'fecha', e.target.value)} maxLength={30} /></td>
                          <td className={crearStyles.sgTablaAccion}>
                            <button type="button" className={crearStyles.sgBtnEliminar} onClick={() => eliminarMovimientoQr(indice)} disabled={movimientosQr.length === 1}>
                              <ion-icon name="trash-outline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" className={crearStyles.sgBtnAgregar} onClick={agregarMovimientoQr}>
                  <ion-icon name="add-circle-outline" />
                  Agregar movimiento
                </button>
              </div>

              <div className={crearStyles.sgBotones}>
                <Link href={`/superadmin/pedimentos/${p.id}/ver`} className={styles.btnCancelar}>
                  <ion-icon name="close-outline" /> Cancelar
                </Link>
                <button type="submit" className={crearStyles.sgBtnGuardar} disabled={pending || !patenteQr || !documentoQr || !aduanaQr}>
                  <ion-icon name="save-outline" />
                  {pending ? 'Guardando...' : 'Guardar pedimento con QR'}
                </button>
              </div>
            </div>

            <div className={crearStyles.qrPanel}>
              <h3 className={crearStyles.qrPanelTitulo}>
                <ion-icon name="qr-code-outline" /> Vista previa del QR
              </h3>
              {qrUrl ? (
                <>
                  <div id="qr-editar-codigo" className={crearStyles.qrPanelCodigo}>
                    <QRCodeSVG value={qrUrl} size={200} level="Q" />
                  </div>
                  <p className={crearStyles.qrPanelOk}>
                    <ion-icon name="checkmark-circle-outline" /> iListo para escanear con el telefono!
                  </p>
                  <p className={crearStyles.qrPanelUrl}>{qrUrl}</p>
                  <button type="button" className={crearStyles.qrPanelBtnCopiar} onClick={() => navigator.clipboard.writeText(qrUrl)}>
                    <ion-icon name="copy-outline" /> Copiar enlace
                  </button>
                  <button type="button" className={crearStyles.qrPanelBtnDescargar} onClick={() => descargarQR('qr-editar-codigo', `pedimento-qr-${patenteQr}-${documentoQr}`)}>
                    <ion-icon name="download-outline" /> Descargar QR
                  </button>
                </>
              ) : (
                <div className={crearStyles.qrPanelVacio}>
                  <ion-icon name="qr-code-outline" />
                  <p>Complete la <strong>Aduana</strong>, <strong>Patente</strong> y <strong>Documento</strong></p>
                  <p>para ver el codigo QR aqui.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TIPO VIN ══ */}
        {tipo.key === 'vin' && (
          <>
            <div className={crearStyles.sgGrupoSep}>
              <ion-icon name="search-outline" />
              Consulta de situacion de pedimentos / Consulta de importacion de vehiculos
            </div>

            <div className={crearStyles.sgSeccionHeader}>
              <ion-icon name="car-sport-outline" />
              Consulta por VIN
            </div>
            <div className={crearStyles.sgSeccionBody}>
              <div className={crearStyles.sgSoianetForm}>
                <div className={crearStyles.sgSoianetFila}>
                  <div className={crearStyles.sgSoianetCampo} style={{ flex: 2 }}>
                    <label className={crearStyles.sgSoianetLabel}>Aduana: <span className={crearStyles.sgObligatorio}>*</span></label>
                    <select name="aduana" className={crearStyles.sgSoianetSelect} defaultValue={p.aduana} required>
                      <option value="">Seleccione la aduana</option>
                      {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={crearStyles.sgSoianetCampo}>
                    <label className={crearStyles.sgSoianetLabel}>Año del Pedimento:</label>
                    <select name="anio" className={crearStyles.sgSoianetSelect} defaultValue={p.anio}>
                      {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div className={crearStyles.sgSoianetFila}>
                  <div className={crearStyles.sgSoianetCampo}>
                    <label className={crearStyles.sgSoianetLabel}>Patente: <span className={crearStyles.sgObligatorio}>*</span></label>
                    <input name="patente" type="text" className={crearStyles.sgSoianetInput} maxLength={20} required defaultValue={p.patente || ''} />
                  </div>
                  <div className={crearStyles.sgSoianetCampo}>
                    <label className={crearStyles.sgSoianetLabel}>Documento: <span className={crearStyles.sgObligatorio}>*</span></label>
                    <input name="documento" type="text" className={crearStyles.sgSoianetInput} maxLength={20} required defaultValue={p.documento || ''} />
                  </div>
                </div>

                <div className={crearStyles.sgCampo}>
                  <label className={crearStyles.sgLabel}>VIN - Numero de identificacion vehicular <span className={crearStyles.sgObligatorio}>*</span> <span className={crearStyles.sgHint}>17 caracteres exactos</span></label>
                  <input
                    name="vin"
                    type="text"
                    className={`${crearStyles.sgInput} ${crearStyles.sgInputVin}`}
                    maxLength={17}
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    required
                  />
                  <div className={crearStyles.sgVinContador} style={{ color: vinValido ? '#285c4d' : (vin.length > 0 ? '#c0392b' : '#777') }}>
                    <ion-icon name={vinValido ? 'checkmark-circle' : 'information-circle-outline'} />
                    {vin.length}/17 {vinValido ? '- correcto' : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className={crearStyles.sgSeccionHeader}>
              <ion-icon name="receipt-outline" />
              Datos del Pedimento
            </div>
            <div className={crearStyles.sgSeccionBody}>
              <div className={crearStyles.sgTablaWrapper}>
                <table className={crearStyles.sgTabla}>
                  <thead>
                    <tr className={crearStyles.sgTablaHeader}>
                      <th>Documento</th>
                      <th>Patente</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th>Banco</th>
                      <th>Secuencia</th>
                      <th>Numero de Operacion</th>
                      <th>Factura</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={crearStyles.sgTablaRow}>
                      <td><input type="text" className={crearStyles.sgTablaInput} readOnly value={p.documento || ''} /></td>
                      <td><input type="text" className={crearStyles.sgTablaInput} readOnly value={p.patente || ''} /></td>
                      <td>
                        <select name="estado" className={crearStyles.sgTablaInput} defaultValue={p.estado || 'EN PROCESO'}>
                          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </td>
                      <td><input name="fecha" type="text" className={crearStyles.sgTablaInput} defaultValue={p.fecha || ''} maxLength={30} /></td>
                      <td><input type="text" className={crearStyles.sgTablaInput} value={pagoVin.banco} readOnly /></td>
                      <td><input name="secuencia" type="text" className={`${crearStyles.sgTablaInput} ${crearStyles.sgTablaInputNum}`} defaultValue={p.secuencia || '0'} maxLength={10} /></td>
                      <td><input type="text" className={crearStyles.sgTablaInput} value={pagoVin.numero_operacion} readOnly /></td>
                      <td><input name="factura" type="text" className={crearStyles.sgTablaInput} defaultValue={p.factura || ''} maxLength={50} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <input type="hidden" name="tipo_operacion" value={p.tipo_operacion || '1 IMPORTACIÓN'} />
              <input type="hidden" name="clave_documento" value={p.clave_documento || 'VU'} />
            </div>

            <div className={crearStyles.sgSeccionHeader}>
              <ion-icon name="person-outline" />
              Datos del Importador (Ver detalle)
            </div>
            <div className={crearStyles.sgSeccionBody}>
              <div className={crearStyles.sgGrid2}>
                <div className={crearStyles.sgCampo}><label className={crearStyles.sgLabel}>Nombre / Razon social:</label><input name="importador" type="text" className={crearStyles.sgInput} value={importador.importador} onChange={(e) => actualizarImportador('importador', e.target.value)} maxLength={150} /></div>
                <div className={crearStyles.sgCampo}><label className={crearStyles.sgLabel}>RFC:</label><input name="rfc" type="text" className={crearStyles.sgInput} value={importador.rfc} onChange={(e) => actualizarImportador('rfc', e.target.value.toUpperCase())} maxLength={20} /></div>
                <div className={crearStyles.sgCampo}><label className={crearStyles.sgLabel}>CURP:</label><input name="curp" type="text" className={crearStyles.sgInput} value={importador.curp} onChange={(e) => actualizarImportador('curp', e.target.value.toUpperCase())} maxLength={20} /></div>
                <div className={crearStyles.sgCampo}><label className={crearStyles.sgLabel}>Fecha de pago:</label><input name="fecha_pago" type="text" className={crearStyles.sgInput} value={importador.fecha_pago} onChange={(e) => actualizarImportador('fecha_pago', e.target.value)} maxLength={30} /></div>
                <div className={crearStyles.sgCampo}><label className={crearStyles.sgLabel}>Direccion: Calle</label><input name="calle" type="text" className={crearStyles.sgInput} value={importador.calle} onChange={(e) => actualizarImportador('calle', e.target.value)} maxLength={200} /></div>
                <div className={crearStyles.sgCampo}><label className={crearStyles.sgLabel}>Numero Ext. / Int.:</label><input name="numero_ext" type="text" className={crearStyles.sgInput} value={importador.numero_ext} onChange={(e) => actualizarImportador('numero_ext', e.target.value)} maxLength={50} /></div>
                <div className={crearStyles.sgCampo}><label className={crearStyles.sgLabel}>Municipio:</label><input name="municipio" type="text" className={crearStyles.sgInput} value={importador.municipio} onChange={(e) => actualizarImportador('municipio', e.target.value)} maxLength={100} /></div>
                <div className={crearStyles.sgCampo}><label className={crearStyles.sgLabel}>Apartado postal:</label><input name="apartado_postal" type="text" className={crearStyles.sgInput} value={importador.apartado_postal} onChange={(e) => actualizarImportador('apartado_postal', e.target.value)} maxLength={50} /></div>
                <div className={crearStyles.sgCampo}><label className={crearStyles.sgLabel}>C. P.:</label><input name="cp" type="text" className={crearStyles.sgInput} value={importador.cp} onChange={(e) => actualizarImportador('cp', e.target.value)} maxLength={10} /></div>
                <div className={crearStyles.sgCampo}><label className={crearStyles.sgLabel}>Entidad federativa:</label><input name="entidad_federativa" type="text" className={crearStyles.sgInput} value={importador.entidad_federativa} onChange={(e) => actualizarImportador('entidad_federativa', e.target.value)} maxLength={100} /></div>
                <div className={crearStyles.sgCampo}><label className={crearStyles.sgLabel}>Pais:</label><input name="pais" type="text" className={crearStyles.sgInput} value={importador.pais} onChange={(e) => actualizarImportador('pais', e.target.value)} maxLength={150} /></div>
                <div className={crearStyles.sgCampo}><label className={crearStyles.sgLabel}>Aduana completa:</label><input name="aduana_completa" type="text" className={crearStyles.sgInput} value={importador.aduana_completa} onChange={(e) => actualizarImportador('aduana_completa', e.target.value)} maxLength={200} /></div>
              </div>
            </div>

            <div className={crearStyles.sgSeccionHeader}>
              <ion-icon name="card-outline" />
              Informacion del Pago
            </div>
            <div className={crearStyles.sgSeccionBody}>
              <div className={crearStyles.sgTablaWrapper}>
                <table className={crearStyles.sgTabla}>
                  <thead>
                    <tr className={crearStyles.sgTablaHeader}>
                      <th>Banco</th>
                      <th>Numero de Operacion</th>
                      <th>Importe</th>
                      <th>Fecha y Hora de Pago</th>
                      <th>Linea de Captura</th>
                      <th>Estado Linea de Captura</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={crearStyles.sgTablaRow}>
                      <td><input name="banco" type="text" className={crearStyles.sgTablaInput} value={pagoVin.banco} onChange={(e) => actualizarPagoVin('banco', e.target.value)} maxLength={100} /></td>
                      <td><input name="numero_operacion" type="text" className={crearStyles.sgTablaInput} value={pagoVin.numero_operacion} onChange={(e) => actualizarPagoVin('numero_operacion', e.target.value)} maxLength={50} /></td>
                      <td><input name="importe" type="text" className={`${crearStyles.sgTablaInput} ${crearStyles.sgTablaInputNum}`} value={pagoVin.importe} onChange={(e) => actualizarPagoVin('importe', e.target.value)} maxLength={30} /></td>
                      <td><input name="fecha_hora_pago" type="text" className={crearStyles.sgTablaInput} value={pagoVin.fecha_hora_pago} onChange={(e) => actualizarPagoVin('fecha_hora_pago', e.target.value)} maxLength={30} /></td>
                      <td><input name="linea_captura" type="text" className={crearStyles.sgTablaInput} value={pagoVin.linea_captura} onChange={(e) => actualizarPagoVin('linea_captura', e.target.value)} maxLength={60} /></td>
                      <td><input name="estado_linea_captura" type="text" className={crearStyles.sgTablaInput} value={pagoVin.estado_linea_captura} onChange={(e) => actualizarPagoVin('estado_linea_captura', e.target.value)} maxLength={100} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <button type="button" className={crearStyles.sgGrupoSepBtn} onClick={() => setAbiertaFracciones((valor) => !valor)}>
              <ion-icon name="car-outline" />
              Detalle de importacion de vehiculo
              <ion-icon name={abiertaFracciones ? 'chevron-up-outline' : 'chevron-down-outline'} style={{ marginLeft: 'auto' }} />
            </button>
            {abiertaFracciones && (
              <div className={crearStyles.sgSeccionBody}>
                <input type="hidden" name="fracciones_count" value={fracciones.length} />
                <div className={crearStyles.sgTablaWrapper}>
                  <table className={crearStyles.sgTabla}>
                    <thead>
                      <tr className={crearStyles.sgTablaHeader}>
                        <th>Fraccion</th><th>Secuen. Fracc.</th><th>Marca</th><th>Modelo</th><th>Año</th><th>Numero de serie</th><th>Kilometraje</th><th>Valor en aduana</th><th>FP IVA</th><th>Importe IVA</th><th>FP Ad-Valorem</th><th>Importe Ad-Valorem</th><th>FP ISAN</th><th>Importe ISAN</th><th>FP Tenencia</th><th>Importe Tenencia</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fracciones.map((fraccion, indice) => (
                        <tr key={indice} className={crearStyles.sgTablaRow}>
                          <td><input name={`fr_fraccion_${indice}`} type="text" className={crearStyles.sgTablaInput} value={fraccion.fraccion || ''} onChange={(e) => actualizarFraccion(indice, 'fraccion', e.target.value)} maxLength={20} /></td>
                          <td><input name={`fr_secuencia_${indice}`} type="text" className={`${crearStyles.sgTablaInput} ${crearStyles.sgTablaInputNum}`} value={fraccion.secuencia || ''} onChange={(e) => actualizarFraccion(indice, 'secuencia', e.target.value)} maxLength={10} /></td>
                          <td><input name={`fr_marca_${indice}`} type="text" className={crearStyles.sgTablaInput} value={fraccion.marca || ''} onChange={(e) => actualizarFraccion(indice, 'marca', e.target.value)} maxLength={100} /></td>
                          <td><input name={`fr_modelo_${indice}`} type="text" className={crearStyles.sgTablaInput} value={fraccion.modelo || ''} onChange={(e) => actualizarFraccion(indice, 'modelo', e.target.value)} maxLength={100} /></td>
                          <td><input name={`fr_anio_vehiculo_${indice}`} type="text" className={crearStyles.sgTablaInput} value={fraccion.anio_vehiculo || ''} onChange={(e) => actualizarFraccion(indice, 'anio_vehiculo', e.target.value)} maxLength={4} /></td>
                          <td><input name={`fr_numero_serie_${indice}`} type="text" className={crearStyles.sgTablaInput} value={fraccion.numero_serie || ''} onChange={(e) => actualizarFraccion(indice, 'numero_serie', e.target.value.toUpperCase())} maxLength={17} /></td>
                          <td><input name={`fr_kilometraje_${indice}`} type="text" className={crearStyles.sgTablaInput} value={fraccion.kilometraje || ''} onChange={(e) => actualizarFraccion(indice, 'kilometraje', e.target.value)} maxLength={20} /></td>
                          <td><input name={`fr_valor_aduana_${indice}`} type="text" className={`${crearStyles.sgTablaInput} ${crearStyles.sgTablaInputNum}`} value={fraccion.valor_aduana || ''} onChange={(e) => actualizarFraccion(indice, 'valor_aduana', e.target.value)} maxLength={20} /></td>
                          <td><input name={`fr_fp_iva_${indice}`} type="text" className={crearStyles.sgTablaInput} value={fraccion.fp_iva || ''} onChange={(e) => actualizarFraccion(indice, 'fp_iva', e.target.value)} maxLength={50} /></td>
                          <td><input name={`fr_importe_iva_${indice}`} type="text" className={`${crearStyles.sgTablaInput} ${crearStyles.sgTablaInputNum}`} value={fraccion.importe_iva || ''} onChange={(e) => actualizarFraccion(indice, 'importe_iva', e.target.value)} maxLength={20} /></td>
                          <td><input name={`fr_fp_advalorem_${indice}`} type="text" className={crearStyles.sgTablaInput} value={fraccion.fp_advalorem || ''} onChange={(e) => actualizarFraccion(indice, 'fp_advalorem', e.target.value)} maxLength={50} /></td>
                          <td><input name={`fr_importe_advalorem_${indice}`} type="text" className={`${crearStyles.sgTablaInput} ${crearStyles.sgTablaInputNum}`} value={fraccion.importe_advalorem || ''} onChange={(e) => actualizarFraccion(indice, 'importe_advalorem', e.target.value)} maxLength={20} /></td>
                          <td><input name={`fr_fp_isan_${indice}`} type="text" className={crearStyles.sgTablaInput} value={fraccion.fp_isan || ''} onChange={(e) => actualizarFraccion(indice, 'fp_isan', e.target.value)} maxLength={50} /></td>
                          <td><input name={`fr_importe_isan_${indice}`} type="text" className={`${crearStyles.sgTablaInput} ${crearStyles.sgTablaInputNum}`} value={fraccion.importe_isan || ''} onChange={(e) => actualizarFraccion(indice, 'importe_isan', e.target.value)} maxLength={20} /></td>
                          <td><input name={`fr_fp_tenencia_${indice}`} type="text" className={crearStyles.sgTablaInput} value={fraccion.fp_tenencia || ''} onChange={(e) => actualizarFraccion(indice, 'fp_tenencia', e.target.value)} maxLength={50} /></td>
                          <td><input name={`fr_importe_tenencia_${indice}`} type="text" className={`${crearStyles.sgTablaInput} ${crearStyles.sgTablaInputNum}`} value={fraccion.importe_tenencia || ''} onChange={(e) => actualizarFraccion(indice, 'importe_tenencia', e.target.value)} maxLength={20} /></td>
                          <td className={crearStyles.sgTablaAccion}>
                            <button type="button" className={crearStyles.sgBtnEliminar} onClick={() => eliminarFraccion(indice)} disabled={fracciones.length === 1}>
                              <ion-icon name="trash-outline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" className={crearStyles.sgBtnAgregar} onClick={agregarFraccion}>
                  <ion-icon name="add-circle-outline" />
                  Agregar fraccion
                </button>
              </div>
            )}

            <button type="button" className={crearStyles.sgGrupoSepBtn} onClick={() => setAbiertaComplementos((valor) => !valor)}>
              <ion-icon name="albums-outline" />
              Complementos
              <ion-icon name={abiertaComplementos ? 'chevron-up-outline' : 'chevron-down-outline'} style={{ marginLeft: 'auto' }} />
            </button>
            {abiertaComplementos && (
              <div className={crearStyles.sgSeccionBody}>
                <input type="hidden" name="complementos_count" value={complementos.length} />
                <div className={crearStyles.sgTablaWrapper}>
                  <table className={crearStyles.sgTabla}>
                    <thead>
                      <tr className={crearStyles.sgTablaHeader}>
                        <th>ID Caso</th><th>Complemento 1</th><th>Complemento 2</th><th>Complemento 3</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {complementos.map((complemento, indice) => (
                        <tr key={indice} className={crearStyles.sgTablaRow}>
                          <td><input name={`comp_id_caso_${indice}`} type="text" className={crearStyles.sgTablaInput} value={complemento.id_caso || ''} onChange={(e) => actualizarComplemento(indice, 'id_caso', e.target.value.toUpperCase())} maxLength={10} /></td>
                          <td><input name={`comp_complemento1_${indice}`} type="text" className={crearStyles.sgTablaInput} value={complemento.complemento1 || ''} onChange={(e) => actualizarComplemento(indice, 'complemento1', e.target.value)} maxLength={100} /></td>
                          <td><input name={`comp_complemento2_${indice}`} type="text" className={crearStyles.sgTablaInput} value={complemento.complemento2 || ''} onChange={(e) => actualizarComplemento(indice, 'complemento2', e.target.value)} maxLength={100} /></td>
                          <td><input name={`comp_complemento3_${indice}`} type="text" className={crearStyles.sgTablaInput} value={complemento.complemento3 || ''} onChange={(e) => actualizarComplemento(indice, 'complemento3', e.target.value)} maxLength={100} /></td>
                          <td className={crearStyles.sgTablaAccion}>
                            <button type="button" className={crearStyles.sgBtnEliminar} onClick={() => eliminarComplemento(indice)} disabled={complementos.length === 1}>
                              <ion-icon name="trash-outline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" className={crearStyles.sgBtnAgregar} onClick={agregarComplemento}>
                  <ion-icon name="add-circle-outline" />
                  Agregar complemento
                </button>
              </div>
            )}
          </>
        )}

        {/* ══ TIPO CONTENEDOR ══ */}
        {tipo.key === 'contenedor' && (
          <>
            <div className={crearStyles.sgFormWrapper}>
              <div className={crearStyles.sgSeccionHeader}>
                <ion-icon name="cube-outline" />
                Contenedor Maritimo
              </div>
              <div className={crearStyles.sgSeccionBody}>
                <div className={crearStyles.sgCampo}>
                  <label className={crearStyles.sgLabel}>Numero de Contenedor <span className={crearStyles.sgObligatorio}>*</span></label>
                  <input name="contenedor" type="text" className={`${crearStyles.sgInput} ${crearStyles.sgInputVin}`} defaultValue={p.contenedor || ''} placeholder="Ej. HLXU8020617" maxLength={30} required />
                </div>
              </div>

              <div className={crearStyles.sgSeccionHeader}>
                <ion-icon name="location-outline" />
                Datos de Referencia
              </div>
              <div className={crearStyles.sgSeccionBody}>
                <div className={crearStyles.sgSoianetForm}>
                  <div className={crearStyles.sgSoianetFila}>
                    <div className={crearStyles.sgSoianetCampo} style={{ flex: 2 }}>
                      <label className={crearStyles.sgSoianetLabel}>Aduana:</label>
                      <select name="aduana" className={crearStyles.sgSoianetSelect} defaultValue={p.aduana || ''}>
                        <option value="">- Seleccione (opcional) -</option>
                        {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className={crearStyles.sgSoianetCampo}>
                      <label className={crearStyles.sgSoianetLabel}>Año del Pedimento:</label>
                      <select name="anio" className={crearStyles.sgSoianetSelect} defaultValue={p.anio}>
                        {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={crearStyles.sgSoianetFila}>
                    <div className={crearStyles.sgSoianetCampo}>
                      <label className={crearStyles.sgSoianetLabel}>Patente:</label>
                      <input name="patente" type="text" className={crearStyles.sgSoianetInput} defaultValue={p.patente || ''} maxLength={20} />
                    </div>
                    <div className={crearStyles.sgSoianetCampo}>
                      <label className={crearStyles.sgSoianetLabel}>Documento:</label>
                      <input name="documento" type="text" className={crearStyles.sgSoianetInput} defaultValue={p.documento || ''} maxLength={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div className={crearStyles.sgSeccionHeader}>
                <ion-icon name="document-text-outline" />
                Estado del Registro
              </div>
              <div className={crearStyles.sgSeccionBody}>
                <div className={crearStyles.sgTablaWrapper}>
                  <table className={crearStyles.sgTabla}>
                    <thead>
                      <tr className={crearStyles.sgTablaHeader}>
                        <th>Estado</th>
                        <th>Fecha de Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={crearStyles.sgTablaRow}>
                        <td>
                          <select name="estado" className={crearStyles.sgTablaInput} defaultValue={p.estado || 'EN PROCESO'}>
                            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                          </select>
                        </td>
                        <td>
                          <input name="fecha" type="text" className={crearStyles.sgTablaInput} defaultValue={p.fecha || ''} maxLength={30} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <input type="hidden" name="tipo_operacion" value={p.tipo_operacion || ''} />
                <input type="hidden" name="clave_documento" value={p.clave_documento || ''} />
              </div>

              <div className={crearStyles.sgSeccionHeader}>
                <ion-icon name="card-outline" />
                Pago Relacionado
                <span className={crearStyles.sgOpcional}>(opcional)</span>
              </div>
              <div className={crearStyles.sgSeccionBody}>
                <div className={crearStyles.sgTablaWrapper}>
                  <table className={crearStyles.sgTabla}>
                    <thead>
                      <tr className={crearStyles.sgTablaHeader}>
                        <th>Banco</th>
                        <th>Numero de Operacion</th>
                        <th>Importe</th>
                        <th>Fecha y hora del pago</th>
                        <th>Linea de Captura</th>
                        <th>Estado Linea de Captura</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={crearStyles.sgTablaRow}>
                        <td><input name="banco" type="text" className={crearStyles.sgTablaInput} defaultValue={p.det_banco || ''} maxLength={100} /></td>
                        <td><input name="numero_operacion" type="text" className={crearStyles.sgTablaInput} defaultValue={p.det_num_op || ''} maxLength={50} /></td>
                        <td><input name="importe" type="text" className={`${crearStyles.sgTablaInput} ${crearStyles.sgTablaInputNum}`} defaultValue={p.importe || ''} maxLength={30} /></td>
                        <td><input name="fecha_hora_pago" type="text" className={crearStyles.sgTablaInput} defaultValue={p.fecha_hora_pago || ''} maxLength={30} /></td>
                        <td><input name="linea_captura" type="text" className={crearStyles.sgTablaInput} defaultValue={p.linea_captura || ''} maxLength={60} /></td>
                        <td><input name="estado_linea_captura" type="text" className={crearStyles.sgTablaInput} defaultValue={p.estado_linea_captura || 'PAGO REGISTRADO EN SAAI'} maxLength={100} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={crearStyles.sgBotones}>
                <button type="submit" className={crearStyles.sgBtnGuardar} disabled={pending}>
                  <ion-icon name="save-outline" />
                  {pending ? 'Guardando...' : 'Guardar pedimento por Contenedor'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Botones */}
        {tipo.key !== 'qr' && tipo.key !== 'contenedor' && (
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
        )}
      </form>
    </div>
  );
}
