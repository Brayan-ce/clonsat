'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import styles from './crear.module.css';
import { crearPorPedimento, crearPorVin, crearPorContenedor } from './servidor';
import { ADUANAS, ANIOS } from '@/_Extras/main/ingreso/constantes';

const ESTADOS = ['EN PROCESO', 'DESADUANADO', 'EN REVISION', 'RECHAZADO'];
const PAGO_VACIO = {
  banco: '',
  numero_operacion: '',
  det_importe: '',
  det_fecha_hora_pago: '',
  det_linea_captura: '',
  det_estado_linea: 'PAGO REGISTRADO EN SAAI',
};
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
const MOVIMIENTO_QR_VACIO = { situacion: '', detalle: '', fecha: '' };
const MOVIMIENTOS_QR_INICIALES = [
  { situacion: 'PAGADO', detalle: '', fecha: '01/04/2026 15:41:00' },
  { situacion: 'SELECCIÓN AUTOMATIZADA', detalle: 'DESADUANAMIENTO LIBRE', fecha: '02/04/2026 08:40:26' },
  { situacion: 'DESADUANADO/CUMPLIDO', detalle: 'DESADUANADO', fecha: '02/04/2026 08:40:26' },
  { situacion: 'DESADUANADO/CUMPLIDO', detalle: 'CUMPLIDO', fecha: '02/04/2026 08:40:26' },
];

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

const TIPOS = [
  {
    key: 'pedimento',
    icono: 'document-text',
    titulo: 'Pedimento',
    descripcion: 'Ingreso por numero de aduana, patente y documento. Es el tipo mas comun.',
    color: '#285c4d',
    colorBg: '#eaf7f2',
    colorBorde: '#285c4d',
  },
  {
    key: 'vin',
    icono: 'car',
    titulo: 'Por VIN',
    descripcion: 'Ingreso mediante el numero de identificacion vehicular (17 digitos).',
    color: '#2c5fc4',
    colorBg: '#dbeafe',
    colorBorde: '#3b73d4',
  },
  {
    key: 'contenedor',
    icono: 'cube',
    titulo: 'Por Contenedor',
    descripcion: 'Ingreso usando el numero de contenedor maritimo.',
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

function FormPedimento() {
  const [state, formAction, pending] = useActionState(crearPorPedimento, null);
  const [pagos, setPagos] = useState([{ ...PAGO_VACIO }]);

  const agregarPago = () => setPagos((actual) => [...actual, { ...PAGO_VACIO }]);
  const eliminarPago = (indice) => setPagos((actual) => actual.filter((_, i) => i !== indice));
  const actualizarPago = (indice, campo, valor) => {
    setPagos((actual) => actual.map((fila, i) => (i === indice ? { ...fila, [campo]: valor } : fila)));
  };

  return (
    <form className={styles.sgFormWrapper} action={formAction}>
      {state?.error && <div className={styles.sgAlerta}><ion-icon name="warning-outline" />{state.error}</div>}

      <input type="hidden" name="tipo_registro" value="pedimento" />

      <div className={styles.sgSeccionHeader}>
        <ion-icon name="location-outline" />
        Aduana
      </div>
      <div className={styles.sgSeccionBody}>
        <div className={styles.sgSoianetForm}>
          <div className={styles.sgSoianetFila}>
            <div className={styles.sgSoianetCampo} style={{ flex: 2 }}>
              <label className={styles.sgSoianetLabel}>Aduana: <span className={styles.sgObligatorio}>*</span></label>
              <select name="aduana" className={styles.sgSoianetSelect} required>
                <option value="">Seleccione la aduana</option>
                {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.sgSoianetCampo}>
              <label className={styles.sgSoianetLabel}>Año del Pedimento:</label>
              <select name="anio" className={styles.sgSoianetSelect}>
                {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.sgSoianetFila}>
            <div className={styles.sgSoianetCampo}>
              <label className={styles.sgSoianetLabel}>Patente: <span className={styles.sgObligatorio}>*</span></label>
              <input name="patente" type="text" className={styles.sgSoianetInput} placeholder="Ej. 3414" maxLength={20} required />
            </div>
            <div className={styles.sgSoianetCampo}>
              <label className={styles.sgSoianetLabel}>Documento: <span className={styles.sgObligatorio}>*</span></label>
              <input name="documento" type="text" className={styles.sgSoianetInput} placeholder="Ej. 6009679" maxLength={20} required />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sgSeccionHeader}>
        <ion-icon name="document-text-outline" />
        Datos del Pedimento
      </div>
      <div className={styles.sgSeccionBody}>
        <div className={styles.sgTablaWrapper}>
          <table className={styles.sgTabla}>
            <thead>
              <tr className={styles.sgTablaHeader}>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Banco</th>
                <th>Secuencia</th>
                <th>Núm. Operación</th>
                <th>Factura</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.sgTablaRow}>
                <td>
                  <select name="estado" className={styles.sgTablaInput}>
                    {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </td>
                <td>
                  <input name="fecha" type="text" className={styles.sgTablaInput} placeholder="27/03/2026 13:21:37" maxLength={30} />
                </td>
                <td>
                  <input name="banco" type="text" className={styles.sgTablaInput} placeholder="Banco" maxLength={100} />
                </td>
                <td>
                  <input name="secuencia" type="text" className={`${styles.sgTablaInput} ${styles.sgTablaInputNum}`} defaultValue="0" maxLength={10} />
                </td>
                <td>
                  <input name="numero_operacion" type="text" className={styles.sgTablaInput} maxLength={50} />
                </td>
                <td>
                  <input name="factura" type="text" className={styles.sgTablaInput} placeholder="(opcional)" maxLength={50} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <input type="hidden" name="tipo_operacion" value="1 IMPORTACIÓN" />
        <input type="hidden" name="clave_documento" value="VF" />
      </div>

      <div className={styles.sgSeccionHeader}>
        <ion-icon name="card-outline" />
        Información del Pago
        <span className={styles.sgOpcional}>puede completarse después</span>
      </div>
      <div className={styles.sgSeccionBody}>
        <input type="hidden" name="pagos_count" value={pagos.length} />
        <div className={styles.sgTablaWrapper}>
          <table className={styles.sgTabla}>
            <thead>
              <tr className={styles.sgTablaHeader}>
                <th>#</th>
                <th>Banco</th>
                <th>Núm. Operación</th>
                <th>Importe</th>
                <th>Fecha y Hora de Pago</th>
                <th>Línea de Captura</th>
                <th>Estado Línea de Captura</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago, indice) => (
                <tr key={indice} className={styles.sgTablaRow}>
                  <td className={styles.sgTablaNum}>{indice + 1}</td>
                  <td><input name={`banco_${indice}`} type="text" className={styles.sgTablaInput} value={pago.banco} onChange={(e) => actualizarPago(indice, 'banco', e.target.value)} maxLength={100} /></td>
                  <td><input name={`numero_operacion_${indice}`} type="text" className={styles.sgTablaInput} value={pago.numero_operacion} onChange={(e) => actualizarPago(indice, 'numero_operacion', e.target.value)} maxLength={50} /></td>
                  <td><input name={`det_importe_${indice}`} type="text" className={`${styles.sgTablaInput} ${styles.sgTablaInputNum}`} value={pago.det_importe} onChange={(e) => actualizarPago(indice, 'det_importe', e.target.value)} placeholder="0.00" maxLength={30} /></td>
                  <td><input name={`det_fecha_hora_pago_${indice}`} type="text" className={styles.sgTablaInput} value={pago.det_fecha_hora_pago} onChange={(e) => actualizarPago(indice, 'det_fecha_hora_pago', e.target.value)} placeholder="2026-03-27 13:21" maxLength={30} /></td>
                  <td><input name={`det_linea_captura_${indice}`} type="text" className={styles.sgTablaInput} value={pago.det_linea_captura} onChange={(e) => actualizarPago(indice, 'det_linea_captura', e.target.value)} maxLength={60} /></td>
                  <td><input name={`det_estado_linea_${indice}`} type="text" className={styles.sgTablaInput} value={pago.det_estado_linea} onChange={(e) => actualizarPago(indice, 'det_estado_linea', e.target.value)} maxLength={100} /></td>
                  <td className={styles.sgTablaAccion}>
                    <button type="button" className={styles.sgBtnEliminar} onClick={() => eliminarPago(indice)} disabled={pagos.length === 1} title="Eliminar fila">
                      <ion-icon name="trash-outline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className={styles.sgBtnAgregar} onClick={agregarPago}>
          <ion-icon name="add-circle-outline" />
          Agregar pago
        </button>
      </div>

      <div className={styles.sgBotones}>
        <button type="submit" className={styles.sgBtnGuardar} disabled={pending}>
          <ion-icon name="save-outline" />
          {pending ? 'Guardando...' : 'Guardar pedimento'}
        </button>
      </div>
    </form>
  );
}

function FormVin() {
  const [vin, setVin] = useState('');
  const [patenteVin, setPatenteVin] = useState('');
  const [documentoVin, setDocumentoVin] = useState('');
  const [pagoVin, setPagoVin] = useState({
    banco: '',
    numero_operacion: '',
    det_importe: '',
    det_fecha_hora_pago: '',
    det_linea_captura: '',
    det_estado_linea: 'PAGO REGISTRADO EN SAAI',
  });
  const [complementos, setComplementos] = useState([{ ...COMPLEMENTO_VACIO }]);
  const [fracciones, setFracciones] = useState([{ ...FRACCION_VACIA }]);
  const [abiertaFracciones, setAbiertaFracciones] = useState(true);
  const [abiertaComplementos, setAbiertaComplementos] = useState(true);
  const [state, formAction, pending] = useActionState(crearPorVin, null);
  const vinValido = vin.length === 17;

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

  return (
    <form className={styles.sgFormWrapper} action={formAction}>
      {state?.error && <div className={styles.sgAlerta}><ion-icon name="warning-outline" />{state.error}</div>}

      <input type="hidden" name="tipo_operacion" value="1 IMPORTACIÓN" />
      <input type="hidden" name="clave_documento" value="VU" />

      <div className={styles.sgGrupoSep}>
        <ion-icon name="search-outline" />
        Consulta de situacion de pedimentos / Consulta de importacion de vehiculos
      </div>

      <div className={styles.sgSeccionHeader}>
        <ion-icon name="car-sport-outline" />
        Consulta por VIN
      </div>
      <div className={styles.sgSeccionBody}>
        <div className={styles.sgSoianetForm}>
          <div className={styles.sgSoianetFila}>
            <div className={styles.sgSoianetCampo} style={{ flex: 2 }}>
              <label className={styles.sgSoianetLabel}>Aduana: <span className={styles.sgObligatorio}>*</span></label>
              <select name="aduana" className={styles.sgSoianetSelect} required>
                <option value="">Seleccione la aduana</option>
                {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.sgSoianetCampo}>
              <label className={styles.sgSoianetLabel}>Año del Pedimento:</label>
              <select name="anio" className={styles.sgSoianetSelect}>
                {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.sgSoianetFila}>
            <div className={styles.sgSoianetCampo}>
              <label className={styles.sgSoianetLabel}>Patente: <span className={styles.sgObligatorio}>*</span></label>
              <input name="patente" type="text" className={styles.sgSoianetInput} placeholder="Ej. 2312" maxLength={20} required value={patenteVin} onChange={(e) => setPatenteVin(e.target.value)} />
            </div>
            <div className={styles.sgSoianetCampo}>
              <label className={styles.sgSoianetLabel}>Documento: <span className={styles.sgObligatorio}>*</span></label>
              <input name="documento" type="text" className={styles.sgSoianetInput} placeholder="Ej. 0023123" maxLength={20} required value={documentoVin} onChange={(e) => setDocumentoVin(e.target.value)} />
            </div>
          </div>

          <div className={styles.sgCampo}>
            <label className={styles.sgLabel}>VIN - Numero de identificacion vehicular <span className={styles.sgObligatorio}>*</span> <span className={styles.sgHint}>17 caracteres exactos</span></label>
            <input
              name="vin"
              type="text"
              className={`${styles.sgInput} ${styles.sgInputVin}`}
              placeholder="Ej. WVWZZZ1JZ3W386703"
              maxLength={17}
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              required
            />
            <div className={styles.sgVinContador} style={{ color: vinValido ? '#285c4d' : (vin.length > 0 ? '#c0392b' : '#777') }}>
              <ion-icon name={vinValido ? 'checkmark-circle' : 'information-circle-outline'} />
              {vin.length}/17 {vinValido ? '- correcto' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sgSeccionHeader}>
        <ion-icon name="receipt-outline" />
        Datos del Pedimento
      </div>
      <div className={styles.sgSeccionBody}>
        <div className={styles.sgTablaWrapper}>
          <table className={styles.sgTabla}>
            <thead>
              <tr className={styles.sgTablaHeader}>
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
              <tr className={styles.sgTablaRow}>
                <td><input type="text" className={styles.sgTablaInput} readOnly value={documentoVin} /></td>
                <td><input type="text" className={styles.sgTablaInput} readOnly value={patenteVin} /></td>
                <td>
                  <select name="estado" className={styles.sgTablaInput}>
                    {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </td>
                <td><input name="fecha" type="text" className={styles.sgTablaInput} placeholder="10/03/2026 14:47:55" maxLength={30} /></td>
                <td><input type="text" className={styles.sgTablaInput} value={pagoVin.banco} readOnly /></td>
                <td><input name="secuencia" type="text" className={`${styles.sgTablaInput} ${styles.sgTablaInputNum}`} defaultValue="0" maxLength={10} /></td>
                <td><input type="text" className={styles.sgTablaInput} value={pagoVin.numero_operacion} readOnly /></td>
                <td><input name="factura" type="text" className={styles.sgTablaInput} placeholder="FC-4421" maxLength={50} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.sgSeccionHeader}>
        <ion-icon name="person-outline" />
        Datos del Importador (Ver detalle)
      </div>
      <div className={styles.sgSeccionBody}>
        <div className={styles.sgGrid2}>
          <div className={styles.sgCampo}>
            <label className={styles.sgLabel}>Nombre / Razon social:</label>
            <input name="importador" type="text" className={styles.sgInput} maxLength={150} placeholder="OTRO IMPORTADOR S.A. DE C.V." />
          </div>
          <div className={styles.sgCampo}>
            <label className={styles.sgLabel}>RFC:</label>
            <input name="rfc" type="text" className={styles.sgInput} maxLength={20} placeholder="XYZ100101AA1" />
          </div>
          <div className={styles.sgCampo}>
            <label className={styles.sgLabel}>CURP:</label>
            <input name="curp" type="text" className={styles.sgInput} maxLength={20} />
          </div>
          <div className={styles.sgCampo}>
            <label className={styles.sgLabel}>Fecha de pago:</label>
            <input name="fecha_pago" type="text" className={styles.sgInput} maxLength={30} placeholder="10/03/2026 14:47:55" />
          </div>
          <div className={styles.sgCampo}>
            <label className={styles.sgLabel}>Direccion: Calle</label>
            <input name="calle" type="text" className={styles.sgInput} maxLength={200} />
          </div>
          <div className={styles.sgCampo}>
            <label className={styles.sgLabel}>Numero Ext. / Int.:</label>
            <input name="numero_ext" type="text" className={styles.sgInput} maxLength={50} />
          </div>
          <div className={styles.sgCampo}>
            <label className={styles.sgLabel}>Municipio:</label>
            <input name="municipio" type="text" className={styles.sgInput} maxLength={100} />
          </div>
          <div className={styles.sgCampo}>
            <label className={styles.sgLabel}>Apartado postal:</label>
            <input name="apartado_postal" type="text" className={styles.sgInput} maxLength={50} />
          </div>
          <div className={styles.sgCampo}>
            <label className={styles.sgLabel}>C. P.:</label>
            <input name="cp" type="text" className={styles.sgInput} maxLength={10} />
          </div>
          <div className={styles.sgCampo}>
            <label className={styles.sgLabel}>Entidad federativa:</label>
            <input name="entidad_federativa" type="text" className={styles.sgInput} maxLength={100} />
          </div>
          <div className={styles.sgCampo}>
            <label className={styles.sgLabel}>Pais:</label>
            <input name="pais" type="text" className={styles.sgInput} maxLength={150} />
          </div>
          <div className={styles.sgCampo}>
            <label className={styles.sgLabel}>Aduana completa:</label>
            <input name="aduana_completa" type="text" className={styles.sgInput} maxLength={200} placeholder="NUEVO LAREDO, TAMPS." />
          </div>
        </div>
      </div>

      <div className={styles.sgSeccionHeader}>
        <ion-icon name="card-outline" />
        Informacion del Pago
      </div>
      <div className={styles.sgSeccionBody}>
        <div className={styles.sgTablaWrapper}>
          <table className={styles.sgTabla}>
            <thead>
              <tr className={styles.sgTablaHeader}>
                <th>Banco</th>
                <th>Numero de Operacion</th>
                <th>Importe</th>
                <th>Fecha y Hora de Pago</th>
                <th>Linea de Captura</th>
                <th>Estado Linea de Captura</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.sgTablaRow}>
                <td>
                  <input name="banco" type="text" className={styles.sgTablaInput} value={pagoVin.banco} onChange={(e) => actualizarPagoVin('banco', e.target.value)} maxLength={100} />
                </td>
                <td>
                  <input name="numero_operacion" type="text" className={styles.sgTablaInput} value={pagoVin.numero_operacion} onChange={(e) => actualizarPagoVin('numero_operacion', e.target.value)} maxLength={50} />
                </td>
                <td>
                  <input name="det_importe" type="text" className={`${styles.sgTablaInput} ${styles.sgTablaInputNum}`} value={pagoVin.det_importe} onChange={(e) => actualizarPagoVin('det_importe', e.target.value)} placeholder="0.00" maxLength={30} />
                </td>
                <td>
                  <input name="det_fecha_hora_pago" type="text" className={styles.sgTablaInput} value={pagoVin.det_fecha_hora_pago} onChange={(e) => actualizarPagoVin('det_fecha_hora_pago', e.target.value)} placeholder="2026-03-27 13:21" maxLength={30} />
                </td>
                <td>
                  <input name="det_linea_captura" type="text" className={styles.sgTablaInput} value={pagoVin.det_linea_captura} onChange={(e) => actualizarPagoVin('det_linea_captura', e.target.value)} maxLength={60} />
                </td>
                <td>
                  <input name="det_estado_linea" type="text" className={styles.sgTablaInput} value={pagoVin.det_estado_linea} onChange={(e) => actualizarPagoVin('det_estado_linea', e.target.value)} maxLength={100} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <button type="button" className={styles.sgGrupoSepBtn} onClick={() => setAbiertaFracciones((valor) => !valor)}>
        <ion-icon name="car-outline" />
        Detalle de importacion de vehiculo
        <ion-icon name={abiertaFracciones ? 'chevron-up-outline' : 'chevron-down-outline'} style={{ marginLeft: 'auto' }} />
      </button>
      {abiertaFracciones && (
        <div className={styles.sgSeccionBody}>
          <input type="hidden" name="fracciones_count" value={fracciones.length} />
          <div className={styles.sgTablaWrapper}>
            <table className={styles.sgTabla}>
              <thead>
                <tr className={styles.sgTablaHeader}>
                  <th>Fraccion</th>
                  <th>Secuen. Fracc.</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Año</th>
                  <th>Numero de serie</th>
                  <th>Kilometraje</th>
                  <th>Valor en aduana</th>
                  <th>FP IVA</th>
                  <th>Importe IVA</th>
                  <th>FP Ad-Valorem</th>
                  <th>Importe Ad-Valorem</th>
                  <th>FP ISAN</th>
                  <th>Importe ISAN</th>
                  <th>FP Tenencia</th>
                  <th>Importe Tenencia</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {fracciones.map((fraccion, indice) => (
                  <tr key={indice} className={styles.sgTablaRow}>
                    <td><input name={`fr_fraccion_${indice}`} type="text" className={styles.sgTablaInput} value={fraccion.fraccion} onChange={(e) => actualizarFraccion(indice, 'fraccion', e.target.value)} maxLength={20} /></td>
                    <td><input name={`fr_secuencia_${indice}`} type="text" className={`${styles.sgTablaInput} ${styles.sgTablaInputNum}`} value={fraccion.secuencia} onChange={(e) => actualizarFraccion(indice, 'secuencia', e.target.value)} maxLength={10} /></td>
                    <td><input name={`fr_marca_${indice}`} type="text" className={styles.sgTablaInput} value={fraccion.marca} onChange={(e) => actualizarFraccion(indice, 'marca', e.target.value)} maxLength={100} /></td>
                    <td><input name={`fr_modelo_${indice}`} type="text" className={styles.sgTablaInput} value={fraccion.modelo} onChange={(e) => actualizarFraccion(indice, 'modelo', e.target.value)} maxLength={100} /></td>
                    <td><input name={`fr_anio_vehiculo_${indice}`} type="text" className={styles.sgTablaInput} value={fraccion.anio_vehiculo} onChange={(e) => actualizarFraccion(indice, 'anio_vehiculo', e.target.value)} maxLength={4} /></td>
                    <td><input name={`fr_numero_serie_${indice}`} type="text" className={styles.sgTablaInput} value={fraccion.numero_serie} onChange={(e) => actualizarFraccion(indice, 'numero_serie', e.target.value.toUpperCase())} maxLength={17} /></td>
                    <td><input name={`fr_kilometraje_${indice}`} type="text" className={styles.sgTablaInput} value={fraccion.kilometraje} onChange={(e) => actualizarFraccion(indice, 'kilometraje', e.target.value)} maxLength={20} /></td>
                    <td><input name={`fr_valor_aduana_${indice}`} type="text" className={`${styles.sgTablaInput} ${styles.sgTablaInputNum}`} value={fraccion.valor_aduana} onChange={(e) => actualizarFraccion(indice, 'valor_aduana', e.target.value)} maxLength={20} /></td>
                    <td><input name={`fr_fp_iva_${indice}`} type="text" className={styles.sgTablaInput} value={fraccion.fp_iva} onChange={(e) => actualizarFraccion(indice, 'fp_iva', e.target.value)} maxLength={50} /></td>
                    <td><input name={`fr_importe_iva_${indice}`} type="text" className={`${styles.sgTablaInput} ${styles.sgTablaInputNum}`} value={fraccion.importe_iva} onChange={(e) => actualizarFraccion(indice, 'importe_iva', e.target.value)} maxLength={20} /></td>
                    <td><input name={`fr_fp_advalorem_${indice}`} type="text" className={styles.sgTablaInput} value={fraccion.fp_advalorem} onChange={(e) => actualizarFraccion(indice, 'fp_advalorem', e.target.value)} maxLength={50} /></td>
                    <td><input name={`fr_importe_advalorem_${indice}`} type="text" className={`${styles.sgTablaInput} ${styles.sgTablaInputNum}`} value={fraccion.importe_advalorem} onChange={(e) => actualizarFraccion(indice, 'importe_advalorem', e.target.value)} maxLength={20} /></td>
                    <td><input name={`fr_fp_isan_${indice}`} type="text" className={styles.sgTablaInput} value={fraccion.fp_isan} onChange={(e) => actualizarFraccion(indice, 'fp_isan', e.target.value)} maxLength={50} /></td>
                    <td><input name={`fr_importe_isan_${indice}`} type="text" className={`${styles.sgTablaInput} ${styles.sgTablaInputNum}`} value={fraccion.importe_isan} onChange={(e) => actualizarFraccion(indice, 'importe_isan', e.target.value)} maxLength={20} /></td>
                    <td><input name={`fr_fp_tenencia_${indice}`} type="text" className={styles.sgTablaInput} value={fraccion.fp_tenencia} onChange={(e) => actualizarFraccion(indice, 'fp_tenencia', e.target.value)} maxLength={50} /></td>
                    <td><input name={`fr_importe_tenencia_${indice}`} type="text" className={`${styles.sgTablaInput} ${styles.sgTablaInputNum}`} value={fraccion.importe_tenencia} onChange={(e) => actualizarFraccion(indice, 'importe_tenencia', e.target.value)} maxLength={20} /></td>
                    <td className={styles.sgTablaAccion}>
                      <button type="button" className={styles.sgBtnEliminar} onClick={() => eliminarFraccion(indice)} disabled={fracciones.length === 1}>
                        <ion-icon name="trash-outline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className={styles.sgBtnAgregar} onClick={agregarFraccion}>
            <ion-icon name="add-circle-outline" />
            Agregar fraccion
          </button>
        </div>
      )}

      <button type="button" className={styles.sgGrupoSepBtn} onClick={() => setAbiertaComplementos((valor) => !valor)}>
        <ion-icon name="albums-outline" />
        Complementos
        <ion-icon name={abiertaComplementos ? 'chevron-up-outline' : 'chevron-down-outline'} style={{ marginLeft: 'auto' }} />
      </button>
      {abiertaComplementos && (
        <div className={styles.sgSeccionBody}>
          <input type="hidden" name="complementos_count" value={complementos.length} />
          <div className={styles.sgTablaWrapper}>
            <table className={styles.sgTabla}>
              <thead>
                <tr className={styles.sgTablaHeader}>
                  <th>ID Caso</th>
                  <th>Complemento 1</th>
                  <th>Complemento 2</th>
                  <th>Complemento 3</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {complementos.map((complemento, indice) => (
                  <tr key={indice} className={styles.sgTablaRow}>
                    <td><input name={`comp_id_caso_${indice}`} type="text" className={styles.sgTablaInput} value={complemento.id_caso} onChange={(e) => actualizarComplemento(indice, 'id_caso', e.target.value.toUpperCase())} maxLength={10} /></td>
                    <td><input name={`comp_complemento1_${indice}`} type="text" className={styles.sgTablaInput} value={complemento.complemento1} onChange={(e) => actualizarComplemento(indice, 'complemento1', e.target.value)} maxLength={100} /></td>
                    <td><input name={`comp_complemento2_${indice}`} type="text" className={styles.sgTablaInput} value={complemento.complemento2} onChange={(e) => actualizarComplemento(indice, 'complemento2', e.target.value)} maxLength={100} /></td>
                    <td><input name={`comp_complemento3_${indice}`} type="text" className={styles.sgTablaInput} value={complemento.complemento3} onChange={(e) => actualizarComplemento(indice, 'complemento3', e.target.value)} maxLength={100} /></td>
                    <td className={styles.sgTablaAccion}>
                      <button type="button" className={styles.sgBtnEliminar} onClick={() => eliminarComplemento(indice)} disabled={complementos.length === 1}>
                        <ion-icon name="trash-outline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className={styles.sgBtnAgregar} onClick={agregarComplemento}>
            <ion-icon name="add-circle-outline" />
            Agregar complemento
          </button>
        </div>
      )}

      <div className={styles.sgBotones}>
        <button type="submit" className={styles.sgBtnGuardar} disabled={pending || !vinValido}>
          <ion-icon name="save-outline" />
          {pending ? 'Guardando...' : 'Guardar por VIN'}
        </button>
      </div>
    </form>
  );
}

function FormContenedor() {
  const [state, formAction, pending] = useActionState(crearPorContenedor, null);
  return (
    <form className={styles.sgFormWrapper} action={formAction}>
      {state?.error && <div className={styles.sgAlerta}><ion-icon name="warning-outline" />{state.error}</div>}

      <div className={styles.sgSeccionHeader}>
        <ion-icon name="cube-outline" />
        Contenedor Maritimo
      </div>
      <div className={styles.sgSeccionBody}>
        <div className={styles.sgCampo}>
          <label className={styles.sgLabel}>Numero de Contenedor <span className={styles.sgObligatorio}>*</span></label>
          <input name="contenedor" type="text" className={`${styles.sgInput} ${styles.sgInputVin}`} placeholder="Ej. HLXU8020617" maxLength={30} required />
        </div>
      </div>

      <div className={styles.sgSeccionHeader}>
        <ion-icon name="location-outline" />
        Datos de Referencia
      </div>
      <div className={styles.sgSeccionBody}>
        <div className={styles.sgSoianetForm}>
          <div className={styles.sgSoianetFila}>
            <div className={styles.sgSoianetCampo} style={{ flex: 2 }}>
              <label className={styles.sgSoianetLabel}>Aduana:</label>
              <select name="aduana" className={styles.sgSoianetSelect}>
                <option value="">- Seleccione (opcional) -</option>
                {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.sgSoianetCampo}>
              <label className={styles.sgSoianetLabel}>Año del Pedimento:</label>
              <select name="anio" className={styles.sgSoianetSelect}>
                {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.sgSoianetFila}>
            <div className={styles.sgSoianetCampo}>
              <label className={styles.sgSoianetLabel}>Patente:</label>
              <input name="patente" type="text" className={styles.sgSoianetInput} maxLength={20} />
            </div>
            <div className={styles.sgSoianetCampo}>
              <label className={styles.sgSoianetLabel}>Documento:</label>
              <input name="documento" type="text" className={styles.sgSoianetInput} maxLength={20} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sgSeccionHeader}>
        <ion-icon name="document-text-outline" />
        Estado del Registro
      </div>
      <div className={styles.sgSeccionBody}>
        <div className={styles.sgTablaWrapper}>
          <table className={styles.sgTabla}>
            <thead>
              <tr className={styles.sgTablaHeader}>
                <th>Estado</th>
                <th>Fecha de Registro</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.sgTablaRow}>
                <td>
                  <select name="estado" className={styles.sgTablaInput}>
                    {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </td>
                <td>
                  <input name="fecha" type="text" className={styles.sgTablaInput} placeholder="27/03/2026 13:21:37" maxLength={30} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.sgSeccionHeader}>
        <ion-icon name="card-outline" />
        Pago Relacionado
        <span className={styles.sgOpcional}>(opcional)</span>
      </div>
      <div className={styles.sgSeccionBody}>
        <div className={styles.sgTablaWrapper}>
          <table className={styles.sgTabla}>
            <thead>
              <tr className={styles.sgTablaHeader}>
                <th>Banco</th>
                <th>Numero de Operacion</th>
                <th>Importe</th>
                <th>Fecha y hora del pago</th>
                <th>Linea de Captura</th>
                <th>Estado Linea de Captura</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.sgTablaRow}>
                <td><input name="banco" type="text" className={styles.sgTablaInput} maxLength={100} /></td>
                <td><input name="numero_operacion" type="text" className={styles.sgTablaInput} maxLength={50} /></td>
                <td><input name="det_importe" type="text" className={`${styles.sgTablaInput} ${styles.sgTablaInputNum}`} placeholder="0.00" maxLength={30} /></td>
                <td><input name="det_fecha_hora_pago" type="text" className={styles.sgTablaInput} placeholder="2026-03-27 13:21" maxLength={30} /></td>
                <td><input name="det_linea_captura" type="text" className={styles.sgTablaInput} maxLength={60} /></td>
                <td><input name="det_estado_linea" type="text" className={styles.sgTablaInput} defaultValue="PAGO REGISTRADO EN SAAI" maxLength={100} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.sgBotones}>
        <button type="submit" className={styles.sgBtnGuardar} disabled={pending}>
          <ion-icon name="save-outline" />
          {pending ? 'Guardando...' : 'Guardar pedimento por Contenedor'}
        </button>
      </div>
    </form>
  );
}

function FormQR() {
  const [state, formAction, pending] = useActionState(crearPorPedimento, null);
  const [aduana, setAduana] = useState('');
  const [aduanaLabel, setAduanaLabel] = useState('');
  const [anio, setAnio] = useState(String(new Date().getFullYear()));
  const [patente, setPatente] = useState('');
  const [documento, setDocumento] = useState('');
  const [banco, setBanco] = useState('BBVA BANCOMER');
  const [numeroOperacion, setNumeroOperacion] = useState('1');
  const [secuencia, setSecuencia] = useState('0');
  const [factura, setFactura] = useState('');
  const [movimientos, setMovimientos] = useState(MOVIMIENTOS_QR_INICIALES);

  const qrUrl = (typeof window !== 'undefined' && patente && documento && aduana)
    ? `${window.location.origin}/SOIANET/oia_consultarapd_cep.aspx?pa=${patente}&dn=${documento}&s=0&ap=${anio}&pad=${aduana}&ad=${encodeURIComponent(aduanaLabel)}&z=QR`
    : '';

  const handleAduana = (e) => {
    const val = e.target.value;
    setAduana(val);
    setAduanaLabel(ADUANAS.find((a) => a.value === val)?.label || '');
  };

  const actualizarMovimiento = (indice, campo, valor) => {
    setMovimientos((actual) => actual.map((fila, i) => (i === indice ? { ...fila, [campo]: valor } : fila)));
  };

  const agregarMovimiento = () => setMovimientos((actual) => [...actual, { ...MOVIMIENTO_QR_VACIO }]);
  const eliminarMovimiento = (indice) => setMovimientos((actual) => actual.filter((_, i) => i !== indice));

  return (
    <div className={styles.qrLayout}>
      <form className={styles.sgFormWrapper} action={formAction}>
        {state?.error && <div className={styles.sgAlerta}><ion-icon name="warning-outline" />{state.error}</div>}

        <input type="hidden" name="tipo_registro" value="qr" />

        <input type="hidden" name="tipo_operacion" value="1 IMPORTACIÓN" />
        <input type="hidden" name="clave_documento" value="VF" />
        <input type="hidden" name="det_importe_0" value="" />
        <input type="hidden" name="det_fecha_hora_pago_0" value="" />
        <input type="hidden" name="det_linea_captura_0" value="" />
        <input type="hidden" name="det_estado_linea_0" value="PAGO REGISTRADO EN SAAI" />

        <div className={styles.sgSeccionHeader}>
          <ion-icon name="document-text-outline" />
          Detalle de situacion del pedimento
        </div>
        <div className={styles.sgSeccionBody}>
          <div className={styles.qrDetalleResumen}>
            <div className={styles.qrDetalleFila}>
              <div className={styles.qrDetalleCampo}>
                <span className={styles.qrDetalleLabel}>Aduana:</span>
                <select name="aduana" className={styles.sgSoianetSelect} value={aduana} onChange={handleAduana} required>
                  <option value="">Seleccione la aduana</option>
                  {ADUANAS.filter((a) => a.value !== '-10').map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.qrDetalleCampo}>
                <span className={styles.qrDetalleLabel}>Tipo operación:</span>
                <input type="text" className={styles.qrDetalleInput} value="1 IMPORTACIÓN" readOnly />
              </div>
            </div>

            <div className={styles.qrDetalleFila}>
              <div className={styles.qrDetalleCampo}>
                <span className={styles.qrDetalleLabel}>Banco:</span>
                <input name="banco" type="text" className={styles.qrDetalleInput} value={banco} onChange={(e) => setBanco(e.target.value)} maxLength={100} />
              </div>
              <div className={styles.qrDetalleCampo}>
                <span className={styles.qrDetalleLabel}>Clave documento:</span>
                <input type="text" className={styles.qrDetalleInput} value="VF" readOnly />
              </div>
            </div>

            <div className={styles.qrDetalleFila}>
              <div className={styles.qrDetalleCampo}>
                <span className={styles.qrDetalleLabel}>Patente:</span>
                <input name="patente" type="text" className={styles.qrDetalleInput} value={patente} onChange={(e) => setPatente(e.target.value)} maxLength={20} required />
              </div>
              <div className={styles.qrDetalleCampo}>
                <span className={styles.qrDetalleLabel}>Número operación:</span>
                <input name="numero_operacion" type="text" className={styles.qrDetalleInput} value={numeroOperacion} onChange={(e) => setNumeroOperacion(e.target.value)} maxLength={50} />
              </div>
            </div>

            <div className={styles.qrDetalleFila}>
              <div className={styles.qrDetalleCampoTriple} style={{ gridColumn: '1 / -1' }}>
                <div className={styles.qrDetalleCampoMini}>
                  <span className={styles.qrDetalleLabel}>Documento:</span>
                  <input name="documento" type="text" className={styles.qrDetalleInput} value={documento} onChange={(e) => setDocumento(e.target.value)} maxLength={20} required />
                </div>
                <div className={styles.qrDetalleCampoMini}>
                  <span className={styles.qrDetalleLabel}>Año:</span>
                  <select name="anio" className={styles.qrDetalleInput} value={anio} onChange={(e) => setAnio(e.target.value)}>
                    {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className={styles.qrDetalleCampoMini}>
                  <span className={styles.qrDetalleLabel}>Secuencia:</span>
                  <input name="secuencia" type="text" className={styles.qrDetalleInput} value={secuencia} onChange={(e) => setSecuencia(e.target.value)} maxLength={10} />
                </div>
                <div className={styles.qrDetalleCampoMini}>
                  <span className={styles.qrDetalleLabel}>Factura:</span>
                  <input name="factura" type="text" className={styles.qrDetalleInput} value={factura} onChange={(e) => setFactura(e.target.value)} maxLength={50} />
                </div>
              </div>
            </div>

            <input type="hidden" name="estado" value="PAGADO" />
            <input type="hidden" name="fecha" value={movimientos[0]?.fecha || ''} />
            <input type="hidden" name="pagos_count" value="1" />
            <input type="hidden" name="banco_0" value={banco} />
            <input type="hidden" name="numero_operacion_0" value={numeroOperacion} />
          </div>
        </div>

        <div className={styles.sgSeccionHeader}>
          <ion-icon name="git-branch-outline" />
          Movimientos del Pedimento
          <span className={styles.sgOpcional}>Total de movimientos: {movimientos.length}</span>
        </div>
        <div className={styles.sgSeccionBody}>
          <input type="hidden" name="movimientos_count" value={movimientos.length} />
          <div className={styles.sgTablaWrapper}>
            <table className={styles.sgTabla}>
              <thead>
                <tr className={styles.sgTablaHeader}>
                  <th>Situacion</th>
                  <th>Detalle</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((movimiento, indice) => (
                  <tr key={indice} className={styles.sgTablaRow}>
                    <td>
                      <input name={`mov_situacion_${indice}`} type="text" className={styles.sgTablaInput} value={movimiento.situacion} onChange={(e) => actualizarMovimiento(indice, 'situacion', e.target.value)} maxLength={100} />
                    </td>
                    <td>
                      <input name={`mov_detalle_${indice}`} type="text" className={styles.sgTablaInput} value={movimiento.detalle} onChange={(e) => actualizarMovimiento(indice, 'detalle', e.target.value)} maxLength={200} />
                    </td>
                    <td>
                      <input name={`mov_fecha_${indice}`} type="text" className={styles.sgTablaInput} value={movimiento.fecha} onChange={(e) => actualizarMovimiento(indice, 'fecha', e.target.value)} maxLength={30} />
                    </td>
                    <td className={styles.sgTablaAccion}>
                      <button type="button" className={styles.sgBtnEliminar} onClick={() => eliminarMovimiento(indice)} disabled={movimientos.length === 1}>
                        <ion-icon name="trash-outline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className={styles.sgBtnAgregar} onClick={agregarMovimiento}>
            <ion-icon name="add-circle-outline" />
            Agregar movimiento
          </button>
        </div>

        <div className={styles.sgBotones}>
          <button type="submit" className={styles.sgBtnGuardar} disabled={pending || !patente || !documento || !aduana}>
            <ion-icon name="save-outline" />
            {pending ? 'Guardando...' : 'Guardar pedimento con QR'}
          </button>
        </div>
      </form>

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
              <ion-icon name="checkmark-circle-outline" /> iListo para escanear con el telefono!
            </p>
            <p className={styles.qrPanelUrl}>{qrUrl}</p>
            <button
              type="button"
              className={styles.qrPanelBtnCopiar}
              onClick={() => navigator.clipboard.writeText(qrUrl).then(() => alert('iEnlace copiado!'))}
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
            <p>para ver el codigo QR aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Crear({ tipo: tipoInicial = null }) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState(tipoInicial);
  const tipo = TIPOS.find((t) => t.key === tipoSeleccionado);
  const etiquetaRegistro = tipoSeleccionado === 'contenedor'
    ? 'contenedor'
    : tipoSeleccionado === 'vin'
      ? 'registro por VIN'
      : tipoSeleccionado === 'qr'
        ? 'pedimento con QR'
        : 'pedimento';

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>
            <ion-icon name="add-circle-outline" /> Registrar nuevo {etiquetaRegistro}
          </h1>
          <p className={styles.descripcion}>Siga los pasos para ingresar el {etiquetaRegistro} correctamente.</p>
        </div>
        <Link href="/superadmin/pedimentos" className={styles.btnVolver}>
          <ion-icon name="arrow-back-outline" /> Volver a la lista
        </Link>
      </div>

      <div className={`${styles.paso} ${tipoSeleccionado ? styles.pasoCompacto : ''}`}>
        <div className={styles.pasoCabecera}>
          <div className={styles.pasoNumeroWrap}>
            <div className={styles.pasoNumero} style={{ background: tipoSeleccionado ? '#1d9e75' : '#c8c8c8' }}>
              {tipoSeleccionado ? <ion-icon name="checkmark" /> : '1'}
            </div>
            {tipoSeleccionado && <div className={styles.pasoLinea} />}
          </div>
          <div className={styles.pasoTexto}>
            <div className={styles.pasoTitulo}>iCual es el tipo de registro?</div>
            {!tipoSeleccionado ? (
              <div className={styles.pasoSubtitulo}>Seleccione la opcion que corresponde a su caso.</div>
            ) : (
              <div className={styles.pasoResumenTipo} style={{ borderColor: tipo.colorBorde, background: tipo.colorBg, color: tipo.color }}>
                <ion-icon name={`${tipo.icono}-outline`} />
                <strong>{tipo.titulo}</strong>
                <span>{tipo.descripcion}</span>
              </div>
            )}
          </div>
          {tipoSeleccionado && (
            <button type="button" className={styles.btnCambiar} onClick={() => setTipoSeleccionado(null)}>
              <ion-icon name="pencil-outline" /> Cambiar
            </button>
          )}
        </div>

        {!tipoSeleccionado ? (
          <div className={styles.tipoGrid}>
            {TIPOS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={styles.tipoCard}
                style={{ '--card-bg': t.colorBg, '--card-border': t.colorBorde, '--card-accent': t.color }}
                onClick={() => setTipoSeleccionado(t.key)}
              >
                <div className={styles.tipoAccent} />
                <div className={styles.tipoCardInner}>
                  <div className={styles.tipoIconWrap} style={{ color: t.color }}>
                    <ion-icon name={`${t.icono}-outline`} />
                  </div>
                  <div className={styles.tipoInfo}>
                    <div className={styles.tipoTituloRow}>
                      <span className={styles.tipoTitulo} style={{ color: t.color }}>{t.titulo}</span>
                      <span className={styles.tipoBadge} style={{ background: '#fff', color: t.color, border: `1px solid ${t.colorBorde}` }}>
                        {t.key === 'pedimento' ? 'Comun' : t.key === 'vin' ? 'Vehiculo' : t.key === 'contenedor' ? 'Maritimo' : 'Tiempo real'}
                      </span>
                    </div>
                    <span className={styles.tipoDesc}>{t.descripcion}</span>
                  </div>
                  <ion-icon name="chevron-forward-outline" className={styles.tipoArrow} style={{ color: t.color }} />
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {tipoSeleccionado && (
        <div className={styles.paso}>
          <div className={styles.pasoCabecera}>
            <div className={styles.pasoNumero} style={{ background: tipo.color }}>2</div>
            <div>
              <div className={styles.pasoTitulo}>Complete los datos del {etiquetaRegistro}</div>
              <div className={styles.pasoSubtitulo}>Los campos marcados con <span style={{ color: '#c0392b' }}>*</span> son obligatorios.</div>
            </div>
          </div>
          {tipoSeleccionado === 'pedimento' && <FormPedimento />}
          {tipoSeleccionado === 'vin' && <FormVin />}
          {tipoSeleccionado === 'contenedor' && <FormContenedor />}
          {tipoSeleccionado === 'qr' && <FormQR />}
        </div>
      )}
    </div>
  );
}