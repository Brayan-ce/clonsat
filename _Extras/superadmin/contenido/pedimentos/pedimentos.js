'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import styles from './pedimentos.module.css';
import { eliminarPedimento } from './servidor';

/* ── Configuración de estados ── */
const ESTADOS = {
  'DESADUANADO': { bg: '#eaf7f2', border: '#285c4d', color: '#1a3d2e', icono: 'checkmark-circle' },
  'EN PROCESO':  { bg: '#dbeafe', border: '#3b73d4', color: '#1a398a', icono: 'time'             },
  'EN REVISION': { bg: '#fef3c7', border: '#d97706', color: '#7c4a00', icono: 'alert-circle'     },
  'RECHAZADO':   { bg: '#fdecea', border: '#e57373', color: '#b91c1c', icono: 'close-circle'     },
};

/* ── URL para el código QR de un pedimento ── */
function buildQrUrl(p) {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  if (p.patente && p.documento) {
    return `${base}/SOIANET/oia_consultarapd_cep.aspx?pa=${p.patente}&dn=${p.documento}&s=0&ap=${p.anio}&pad=${p.aduana}&ad=${encodeURIComponent(p.aduana_label || '')}&z=QR`;
  }
  if (p.vin)        return p.vin;
  if (p.contenedor) return p.contenedor;
  return `Pedimento #${p.id}`;
}

/* ── Tipo de pedimento según sus campos ── */
function getTipo(p) {
  if (p.vin)        return { key: 'vin',        icono: 'car',           etiqueta: 'Por VIN',        color: '#3b73d4' };
  if (p.contenedor) return { key: 'contenedor', icono: 'cube',          etiqueta: 'Por Contenedor', color: '#d97706' };
  return              { key: 'pedimento',  icono: 'document-text', etiqueta: 'Pedimento',     color: '#285c4d' };
}

export default function Pedimentos({ lista = [] }) {
  const [busqueda,     setBusqueda]     = useState('');
  const [filtroTipo,   setFiltroTipo]   = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [qrAbierto,    setQrAbierto]    = useState(null);

  /* ── Contadores para las pestañas de tipo ── */
  const contadores = useMemo(() => ({
    todo:       lista.length,
    pedimento:  lista.filter((p) => !p.vin && !p.contenedor).length,
    vin:        lista.filter((p) => !!p.vin).length,
    contenedor: lista.filter((p) => !!p.contenedor && !p.vin).length,
  }), [lista]);

  /* ── Lista filtrada ── */
  const resultado = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return lista.filter((p) => {
      const tipo = getTipo(p);
      const coincide = !q || [
        String(p.id), p.patente, p.documento, p.aduana_label, p.vin, p.contenedor,
      ].filter(Boolean).some((v) => v.toLowerCase().includes(q));

      return (
        coincide &&
        (!filtroTipo   || tipo.key   === filtroTipo) &&
        (!filtroEstado || p.estado   === filtroEstado)
      );
    });
  }, [lista, busqueda, filtroTipo, filtroEstado]);

  const hayFiltros = busqueda || filtroTipo || filtroEstado;

  return (
    <div className={styles.pagina}>

      {/* ══ ENCABEZADO ══ */}
      <div className={styles.encabezado}>
        <div className={styles.encabezadoTexto}>
          <h1 className={styles.titulo}>
            <ion-icon name="document-text-outline" /> Pedimentos de Importación
          </h1>
          <p className={styles.descripcion}>
            Aquí puedes consultar, crear, editar y eliminar todos tus pedimentos.
          </p>
        </div>
        <Link href="/superadmin/pedimentos/crear" className={styles.btnNuevo}>
          <ion-icon name="add-circle-outline" />
          Registrar nuevo pedimento
        </Link>
      </div>

      {/* ══ PESTAÑAS DE TIPO ══ */}
      <div className={styles.tipoTabs}>
        {[
          { key: '',           icono: 'list-outline',          etiqueta: 'Todos',        count: contadores.todo },
          { key: 'pedimento',  icono: 'document-text-outline', etiqueta: 'Pedimento',    count: contadores.pedimento },
          { key: 'vin',        icono: 'car-outline',           etiqueta: 'Por VIN',      count: contadores.vin },
          { key: 'contenedor', icono: 'cube-outline',          etiqueta: 'Contenedor',   count: contadores.contenedor },
        ].map(({ key, icono, etiqueta, count }) => (
          <button
            key={key}
            className={`${styles.tipoTab} ${filtroTipo === key ? styles.tipoTabActivo : ''}`}
            onClick={() => setFiltroTipo(key)}
          >
            <ion-icon name={icono} />
            <span className={styles.tipoTabEtiqueta}>{etiqueta}</span>
            <span className={styles.tipoTabContador}>{count}</span>
          </button>
        ))}
      </div>

      {/* ══ BARRA DE BÚSQUEDA ══ */}
      <div className={styles.barraBusqueda}>
        <div className={styles.inputBusquedaWrap}>
          <ion-icon name="search-outline" />
          <input
            type="text"
            className={styles.inputBusqueda}
            placeholder="Escriba aquí para buscar: número de ID, patente, documento, VIN, aduana..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className={styles.btnBorrarBusqueda} onClick={() => setBusqueda('')} title="Borrar búsqueda">
              <ion-icon name="close-circle" />
            </button>
          )}
        </div>

        <select
          className={styles.selectEstado}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">— Cualquier estado —</option>
          {Object.keys(ESTADOS).map((e) => <option key={e} value={e}>{e}</option>)}
        </select>

        {hayFiltros && (
          <button
            className={styles.btnLimpiarFiltros}
            onClick={() => { setBusqueda(''); setFiltroTipo(''); setFiltroEstado(''); }}
          >
            <ion-icon name="refresh-outline" /> Limpiar filtros
          </button>
        )}
      </div>

      {/* ══ LISTA ══ */}
      {resultado.length === 0 ? (
        <div className={styles.vacio}>
          <ion-icon name="search-outline" />
          <h3>No se encontraron pedimentos</h3>
          <p>Intente cambiar los filtros o escribir otros términos de búsqueda.</p>
          {hayFiltros && (
            <button
              className={styles.btnLimpiarFiltros}
              onClick={() => { setBusqueda(''); setFiltroTipo(''); setFiltroEstado(''); }}
            >
              <ion-icon name="refresh-outline" /> Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <p className={styles.infoResultados}>
            Mostrando <strong>{resultado.length}</strong> de {lista.length} pedimentos
          </p>
          <div className={styles.lista}>
            {resultado.map((p) => {
              const tipo      = getTipo(p);
              const estadoConf = ESTADOS[p.estado] ?? { bg: '#f5f5f5', border: '#ccc', color: '#666', icono: 'ellipse' };
              return (
                <div key={p.id} className={styles.tarjeta}>

                  {/* Franja lateral de color por tipo */}
                  <div className={styles.tarjetaFranja} style={{ background: tipo.color }} />

                  {/* Ícono de tipo */}
                  <div className={styles.tarjetaTipoCol} style={{ color: tipo.color }}>
                    <ion-icon name={`${tipo.icono}-outline`} />
                    <span>{tipo.etiqueta}</span>
                  </div>

                  {/* Datos principales */}
                  <div className={styles.tarjetaDatos}>
                    <div className={styles.tarjetaCabecera}>
                      <span className={styles.tarjetaIdNum}>Pedimento #{p.id}</span>
                      <span
                        className={styles.estadoBadge}
                        style={{ background: estadoConf.bg, borderColor: estadoConf.border, color: estadoConf.color }}
                      >
                        <ion-icon name={`${estadoConf.icono}-outline`} />
                        {p.estado}
                      </span>
                    </div>
                    <div className={styles.tarjetaGrid}>
                      <div className={styles.tarjetaCampo}>
                        <span className={styles.campoEtiqueta}>Aduana</span>
                        <span className={styles.campoValor}>{p.aduana_label || '—'}</span>
                      </div>
                      <div className={styles.tarjetaCampo}>
                        <span className={styles.campoEtiqueta}>Año</span>
                        <span className={styles.campoValor}>{p.anio}</span>
                      </div>
                      {p.patente   && <div className={styles.tarjetaCampo}><span className={styles.campoEtiqueta}>Patente</span><span className={styles.campoValor}>{p.patente}</span></div>}
                      {p.documento && <div className={styles.tarjetaCampo}><span className={styles.campoEtiqueta}>Documento</span><span className={styles.campoValor}>{p.documento}</span></div>}
                      {p.vin       && <div className={styles.tarjetaCampo}><span className={styles.campoEtiqueta}>VIN</span><span className={styles.campoValor}>{p.vin}</span></div>}
                      {p.contenedor && <div className={styles.tarjetaCampo}><span className={styles.campoEtiqueta}>Contenedor</span><span className={styles.campoValor}>{p.contenedor}</span></div>}
                      {p.fecha && (
                        <div className={styles.tarjetaCampo}>
                          <span className={styles.campoEtiqueta}>Fecha</span>
                          <span className={styles.campoValor}>{p.fecha}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className={styles.tarjetaAcciones}>
                    <Link href={`/superadmin/pedimentos/${p.id}/ver`} className={styles.btnAccionVer}>
                      <ion-icon name="eye-outline" />
                      Ver detalle
                    </Link>
                    <Link href={`/superadmin/pedimentos/${p.id}/editar`} className={styles.btnAccionEditar}>
                      <ion-icon name="create-outline" />
                      Editar
                    </Link>
                    <form
                      action={eliminarPedimento.bind(null, p.id)}
                      onSubmit={(e) => {
                        if (!confirm(
                          `¿Está seguro que desea eliminar el Pedimento #${p.id}?\n\nEsta acción no se puede deshacer.`
                        )) e.preventDefault();
                      }}
                    >
                      <button type="submit" className={styles.btnAccionEliminar}>
                        <ion-icon name="trash-outline" />
                        Eliminar
                      </button>
                    </form>
                    <button
                      type="button"
                      className={styles.btnAccionQr}
                      onClick={() => setQrAbierto(p)}
                      title="Ver código QR"
                    >
                      <ion-icon name="qr-code-outline" />
                      QR
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </>
      )}
      {/* ══ MODAL QR ══ */}
      {qrAbierto && (
        <div className={styles.modalOverlay} onClick={() => setQrAbierto(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalCabecera}>
              <h3 className={styles.modalTitulo}>
                <ion-icon name="qr-code-outline" /> Código QR — Pedimento #{qrAbierto.id}
              </h3>
              <button className={styles.modalCerrar} onClick={() => setQrAbierto(null)}>
                <ion-icon name="close-outline" />
              </button>
            </div>
            <div className={styles.modalCuerpo}>
              <div className={styles.modalQrCodigo}>
                <QRCodeSVG value={buildQrUrl(qrAbierto)} size={220} level="Q" />
              </div>
              <p className={styles.modalQrDescripcion}>
                Escanee este código con su teléfono para consultar el pedimento en SOIANET.
              </p>
              <p className={styles.modalQrUrl}>{buildQrUrl(qrAbierto)}</p>
              <div className={styles.modalAcciones}>
                <a
                  href={buildQrUrl(qrAbierto)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnQrAbrir}
                >
                  <ion-icon name="open-outline" /> Abrir enlace
                </a>
                <button
                  className={styles.btnQrCopiar}
                  onClick={() => navigator.clipboard.writeText(buildQrUrl(qrAbierto)).then(() => alert('¡Enlace copiado al portapapeles!'))}
                >
                  <ion-icon name="copy-outline" /> Copiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
