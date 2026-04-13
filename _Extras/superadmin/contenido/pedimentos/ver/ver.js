'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import styles from './ver.module.css';
import { eliminarPedimento, agregarMovimiento, eliminarMovimiento } from './servidor';

/* ── Configuración de estados ── */
const ESTADOS = {
  'DESADUANADO': { bg: '#eaf7f2', border: '#285c4d', color: '#1a3d2e', icono: 'checkmark-circle' },
  'EN PROCESO':  { bg: '#dbeafe', border: '#3b73d4', color: '#1a398a', icono: 'time'             },
  'EN REVISION': { bg: '#fef3c7', border: '#d97706', color: '#7c4a00', icono: 'alert-circle'     },
  'RECHAZADO':   { bg: '#fdecea', border: '#e57373', color: '#b91c1c', icono: 'close-circle'     },
};

/* ── Campo de sólo lectura ── */
function Campo({ label, valor, full = false }) {
  const vacio = valor === null || valor === undefined || valor === '';
  return (
    <div className={`${styles.campo} ${full ? styles.campoFull : ''}`}>
      <span className={styles.campoLabel}>{label}</span>
      {vacio
        ? <span className={styles.campoVacio}>—</span>
        : <span className={styles.campoValor}>{valor}</span>}
    </div>
  );
}

/* ── Sección de Movimientos ── */
function Movimientos({ pedimento: p }) {
  const [mostrar, setMostrar] = useState(false);
  const accion = agregarMovimiento.bind(null, null);
  const [state, formAction, pending] = useActionState(accion, null);

  return (
    <div>
      {/* Botón agregar */}
      <div className={styles.movBarra}>
        <p className={styles.movInfo}>
          {(p.movimientos ?? []).length === 0
            ? 'No hay movimientos registrados aún.'
            : `${p.movimientos.length} movimiento(s) registrado(s)`}
        </p>
        <button className={styles.btnAgregar} onClick={() => setMostrar((v) => !v)}>
          <ion-icon name={mostrar ? 'close-outline' : 'add-outline'} />
          {mostrar ? 'Cancelar' : 'Agregar movimiento'}
        </button>
      </div>

      {/* Formulario de agregar */}
      {mostrar && (
        <form className={styles.formMov} action={formAction}>
          <input type="hidden" name="id_pedimento" value={p.id} />
          {state?.error && (
            <div className={styles.alerta}><ion-icon name="warning-outline" /> {state.error}</div>
          )}
          <h4 className={styles.formMovTitulo}>Nuevo movimiento</h4>
          <div className={styles.formMovGrid}>
            <div className={styles.formMovCampo}>
              <label className={styles.formMovLabel}>Descripción / Situación <span style={{ color: '#c0392b' }}>*</span></label>
              <input name="situacion" type="text" className={styles.formMovInput} maxLength={100} required
                placeholder="Ej. PAGADO, DESADUANADO, EN REVISIÓN..." />
            </div>
            <div className={styles.formMovCampo}>
              <label className={styles.formMovLabel}>Fecha</label>
              <input name="fecha" type="text" className={styles.formMovInput} maxLength={30}
                placeholder="Ej. 27/03/2026 13:21" />
            </div>
            <div className={`${styles.formMovCampo} ${styles.formMovCampoFull}`}>
              <label className={styles.formMovLabel}>Detalle adicional (opcional)</label>
              <input name="detalle" type="text" className={styles.formMovInput} maxLength={200}
                placeholder="Información complementaria..." />
            </div>
          </div>
          <button type="submit" className={styles.btnGuardarMov} disabled={pending}>
            <ion-icon name="save-outline" />
            {pending ? 'Guardando…' : 'Guardar movimiento'}
          </button>
        </form>
      )}

      {/* Lista de movimientos */}
      {(p.movimientos ?? []).length > 0 && (
        <div className={styles.movLista}>
          {p.movimientos.map((m, i) => (
            <div key={m.id} className={`${styles.movItem} ${i % 2 === 0 ? styles.movPar : ''}`}>
              <div className={styles.movNumero}>{i + 1}</div>
              <div className={styles.movContenido}>
                <div className={styles.movSituacion}>{m.situacion}</div>
                {m.detalle && <div className={styles.movDetalle}>{m.detalle}</div>}
                {m.fecha   && (
                  <div className={styles.movFecha}>
                    <ion-icon name="time-outline" /> {m.fecha}
                  </div>
                )}
              </div>
              <form
                action={eliminarMovimiento.bind(null, m.id, p.id)}
                onSubmit={(e) => {
                  if (!confirm('¿Eliminar este movimiento?')) e.preventDefault();
                }}
              >
                <button type="submit" className={styles.btnEliminarMov} title="Eliminar">
                  <ion-icon name="trash-outline" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Sección de Vehículos ── */
function Vehiculos({ vehiculos }) {
  if (!vehiculos?.length) return <p className={styles.movInfo}>No hay vehículos asociados.</p>;
  return (
    <div className={styles.vehiculoLista}>
      {vehiculos.map((v, i) => (
        <div key={v.id} className={styles.vehiculoCard}>
          <div className={styles.vehiculoNum}>
            <ion-icon name="car-outline" /> Vehículo #{i + 1}
          </div>
          <div className={styles.camposGrid}>
            <Campo label="VIN / N° Serie"  valor={v.numero_serie} />
            <Campo label="Año Modelo"      valor={v.anio_vehiculo} />
            <Campo label="Marca"           valor={v.marca} />
            <Campo label="Modelo"          valor={v.modelo} />
            <Campo label="Fracción"        valor={v.fraccion} />
            <Campo label="Kilometraje"     valor={v.kilometraje} />
            <Campo label="Valor en Aduana" valor={v.valor_aduana} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   COMPONENTE PRINCIPAL
═════════════════════════════════════════*/
export default function Ver({ id, pedimento: p }) {
  const [tab, setTab] = useState('datos');

  if (!p) {
    return (
      <div className={styles.pagina}>
        <div className={styles.noEncontrado}>
          <ion-icon name="alert-circle-outline" />
          <h2>Pedimento no encontrado</h2>
          <p>El pedimento #{id} no existe o fue eliminado.</p>
          <Link href="/superadmin/pedimentos" className={styles.btnVolver}>
            <ion-icon name="arrow-back-outline" /> Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  const tipo        = p.vin ? 'vin' : p.contenedor ? 'contenedor' : 'pedimento';
  const estadoConf  = ESTADOS[p.estado] ?? { bg: '#f5f5f5', border: '#ccc', color: '#666', icono: 'ellipse' };

  const tipoTxt = { vin: 'Por VIN', contenedor: 'Por Contenedor', pedimento: 'Pedimento' }[tipo];
  const tipoIcono = { vin: 'car', contenedor: 'cube', pedimento: 'document-text' }[tipo];
  const tipoColor = { vin: '#2c5fc4', contenedor: '#b45309', pedimento: '#285c4d' }[tipo];

  const qrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/SOIANET/oia_consultarapd_cep.aspx?pa=${p.patente}&dn=${p.documento}&s=0&ap=${p.anio}&pad=${p.aduana}&ad=${encodeURIComponent(p.aduana_label ?? '')}&z=QR`
    : `/SOIANET/oia_consultarapd_cep.aspx?pa=${p.patente}&dn=${p.documento}&s=0&ap=${p.anio}&pad=${p.aduana}&ad=${encodeURIComponent(p.aduana_label ?? '')}&z=QR`;

  const TABS = [
    { key: 'datos',       label: 'Datos generales', icono: 'document-text-outline' },
    { key: 'pago',        label: 'Pago',             icono: 'card-outline' },
    { key: 'movimientos', label: `Historial${p.movimientos?.length ? ` (${p.movimientos.length})` : ''}`, icono: 'git-branch-outline' },
    ...(p.vehiculos?.length ? [{ key: 'vehiculos', label: `Vehículos (${p.vehiculos.length})`, icono: 'car-outline' }] : []),
    { key: 'qr',          label: 'Código QR',        icono: 'qr-code-outline' },
  ];

  return (
    <div className={styles.pagina}>

      {/* ══ ENCABEZADO ══ */}
      <div className={styles.encabezado}>
        <div className={styles.encabezadoIzq}>
          <div className={styles.encabezadoTitulos}>
            <h1 className={styles.titulo}>Pedimento #{p.id}</h1>
            <div className={styles.badges}>
              {/* Estado */}
              <span className={styles.badge} style={{ background: estadoConf.bg, borderColor: estadoConf.border, color: estadoConf.color }}>
                <ion-icon name={`${estadoConf.icono}-outline`} /> {p.estado}
              </span>
              {/* Tipo */}
              <span className={styles.badge} style={{ background: '#f0f0f0', borderColor: tipoColor, color: tipoColor }}>
                <ion-icon name={`${tipoIcono}-outline`} /> {tipoTxt}
              </span>
            </div>
          </div>
          <Link href="/superadmin/pedimentos" className={styles.linkVolver}>
            <ion-icon name="arrow-back-outline" /> Volver a la lista de pedimentos
          </Link>
        </div>

        <div className={styles.btnAcciones}>
          <Link href={`/superadmin/pedimentos/${p.id}/editar`} className={styles.btnEditar}>
            <ion-icon name="create-outline" /> Editar pedimento
          </Link>
          <form
            action={eliminarPedimento.bind(null, p.id)}
            onSubmit={(e) => {
              if (!confirm(`¿Está seguro que desea eliminar el Pedimento #${p.id}?\n\nEsta acción no se puede deshacer.`))
                e.preventDefault();
            }}
          >
            <button type="submit" className={styles.btnEliminar}>
              <ion-icon name="trash-outline" /> Eliminar
            </button>
          </form>
        </div>
      </div>

      {/* ══ PESTAÑAS ══ */}
      <div className={styles.tabs}>
        {TABS.map(({ key, label, icono }) => (
          <button
            key={key}
            className={`${styles.tab} ${tab === key ? styles.tabActivo : ''}`}
            onClick={() => setTab(key)}
          >
            <ion-icon name={icono} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ══ CONTENIDO POR PESTAÑA ══ */}
      <div className={styles.tarjeta}>

        {/* ── Datos generales ── */}
        {tab === 'datos' && (
          <div>
            <h2 className={styles.seccionTitulo}><ion-icon name="document-text-outline" />Datos del Pedimento</h2>
            <div className={styles.camposGrid}>
              <Campo label="Aduana"             valor={p.aduana_label} />
              <Campo label="Año"                valor={p.anio} />
              <Campo label="Estado"             valor={p.estado} />
              <Campo label="Fecha"              valor={p.fecha} />
              <Campo label="Tipo de Operación"  valor={p.tipo_operacion} />
              <Campo label="Clave de Documento" valor={p.clave_documento} />
              {tipo !== 'vin' && <Campo label="Patente"   valor={p.patente} />}
              {tipo !== 'vin' && <Campo label="Documento" valor={p.documento} />}
              {tipo === 'pedimento' && <Campo label="Factura"              valor={p.factura} />}
              {tipo === 'pedimento' && <Campo label="Secuencia"            valor={p.secuencia} />}
              {tipo === 'pedimento' && <Campo label="Número de Operación"  valor={p.numero_operacion} />}
              {tipo === 'vin'       && <Campo label="VIN"                  valor={p.vin} full />}
              {tipo === 'contenedor'&& <Campo label="Número de Contenedor" valor={p.contenedor} full />}
            </div>
          </div>
        )}

        {/* ── Pago ── */}
        {tab === 'pago' && (
          <div>
            <h2 className={styles.seccionTitulo}><ion-icon name="card-outline" />Información del Pago</h2>
            <div className={styles.camposGrid}>
              <Campo label="Banco"                  valor={p.det_banco} />
              <Campo label="Número de Operación"    valor={p.det_num_op} />
              <Campo label="Importe"                valor={p.importe} />
              <Campo label="Fecha y Hora del Pago"  valor={p.fecha_hora_pago} />
              <Campo label="Línea de Captura"        valor={p.linea_captura}        full />
              <Campo label="Estado Línea de Captura" valor={p.estado_linea_captura} full />
            </div>
          </div>
        )}

        {/* ── Historial de movimientos ── */}
        {tab === 'movimientos' && (
          <div>
            <h2 className={styles.seccionTitulo}><ion-icon name="git-branch-outline" />Historial de Movimientos</h2>
            <Movimientos pedimento={p} />
          </div>
        )}

        {/* ── Vehículos ── */}
        {tab === 'vehiculos' && (
          <div>
            <h2 className={styles.seccionTitulo}><ion-icon name="car-outline" />Vehículos Asociados</h2>
            <Vehiculos vehiculos={p.vehiculos} />
          </div>
        )}

        {/* ── QR ── */}
        {tab === 'qr' && (
          <div>
            <h2 className={styles.seccionTitulo}><ion-icon name="qr-code-outline" />Código QR — Situación del Pedimento</h2>
            <div className={styles.qrWrap}>
              <div className={styles.qrCodigo}>
                <QRCodeSVG value={qrUrl} size={240} level="M" includeMargin />
              </div>
              <div className={styles.qrInfo}>
                <p className={styles.qrDescripcion}>
                  Escanee este código QR con cualquier celular para consultar el estado del pedimento en tiempo real.
                </p>
                <div className={styles.qrAcciones}>
                  <a href={qrUrl} target="_blank" rel="noopener noreferrer" className={styles.btnQrAbrir}>
                    <ion-icon name="open-outline" /> Abrir enlace en el navegador
                  </a>
                  <button
                    className={styles.btnQrCopiar}
                    onClick={() => {
                      navigator.clipboard.writeText(qrUrl);
                      alert('¡Enlace copiado al portapapeles!');
                    }}
                  >
                    <ion-icon name="copy-outline" /> Copiar enlace
                  </button>
                </div>
                <div className={styles.qrUrl}>{qrUrl}</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
