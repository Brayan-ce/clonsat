'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ingreso.module.css';
import { ADUANAS, ANIOS, MODO_VALIDACION } from './constantes';

const SESSION_KEY = 'ingreso_estado';

export default function Ingreso() {
  const [numVisitante, setNumVisitante] = useState(0);
  const [tipoBusqueda, setTipoBusqueda] = useState('pedimento');
  const [aduana, setAduana]             = useState('-10');
  const [anio, setAnio]                 = useState('2026');
  const [patente, setPatente]           = useState('');
  const [documento, setDocumento]       = useState('');
  const [vin, setVin]                   = useState('');
  const [contenedor, setContenedor]     = useState('');
  const [resultado, setResultado]       = useState(null);
  const [detalleIdx, setDetalleIdx]     = useState(null);
  const [buscado, setBuscado]           = useState(false);
  const [cargando, setCargando]         = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState(null);
  const [noEncontradoCount, setNoEncontradoCount] = useState(0);
  const [showComplementos, setShowComplementos] = useState(false);
  const [restored, setRestored]         = useState(false);

  // Restaurar estado al montar (cuando el usuario regresa del detalle)
  useEffect(() => {
    setNumVisitante(Math.floor(Math.random() * 901) + 100);
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        if (s.tipoBusqueda) setTipoBusqueda(s.tipoBusqueda);
        if (s.aduana)        setAduana(s.aduana);
        if (s.anio)          setAnio(s.anio);
        if (s.patente)       setPatente(s.patente);
        if (s.documento)     setDocumento(s.documento);
        if (s.vin)           setVin(s.vin);
        if (s.contenedor)    setContenedor(s.contenedor);
        if (s.resultado)     setResultado(s.resultado);
        if (s.buscado)       setBuscado(s.buscado);
        if (s.detalleIdx !== undefined && s.detalleIdx !== null) setDetalleIdx(s.detalleIdx);
        if (s.showComplementos) setShowComplementos(s.showComplementos);
      }
    } catch { /* sessionStorage no disponible */ }
    setRestored(true);
  }, []);

  // Guardar estado en sessionStorage cada vez que cambia (solo tras restaurar)
  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        tipoBusqueda, aduana, anio, patente, documento, vin, contenedor,
        resultado, buscado, detalleIdx, showComplementos,
      }));
    } catch { /* sessionStorage no disponible */ }
  }, [restored, tipoBusqueda, aduana, anio, patente, documento, vin, contenedor,
      resultado, buscado, detalleIdx, showComplementos]);

  async function handleBuscar() {
    if (cargando) return;
    setCargando(true);
    setErrorBusqueda(null);
    setBuscado(false);
    setResultado(null);
    setShowComplementos(false);

    const params = { tipo: tipoBusqueda, aduana, anio, patente, documento, vin, contenedor };
    let res = null;
    try {
      const response = await fetch('/api/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error(`Respuesta inesperada del servidor`);
      res = data;
      setResultado(res);
      setBuscado(true);
      // Autocompletar campos cuando se busca por VIN y hay resultado
      if (tipoBusqueda === 'vin' && res.length > 0) {
        const p = res[0];
        setAduana(p.aduana   || '-10');
        setAnio(p.anio       || '2026');
        setPatente(p.patente || '');
        setDocumento(p.documento || '');
      }
      if (res.length === 0) {
        setNoEncontradoCount((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            window.location.href = 'https://aplicacionesc.mat.sat.gob.mx/SOIANET/oia_consultarap_cep.aspx';
          }
          return next;
        });
      }
    } catch (err) {
      setErrorBusqueda(`Error: ${err?.message || 'No se pudo conectar al servidor'}`);
    } finally {
      setCargando(false);
    }

    // Registrar en background — fire and forget, no bloquea la UI
    if (res !== null) {
      fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          encontrado: res.length > 0,
          totalResultados: res.length,
        }),
      }).catch(() => {});
    }
  }

  function handleLimpiar() {
    setTipoBusqueda('pedimento');
    setAduana('-10');
    setAnio('2026');
    setPatente('');
    setDocumento('');
    setVin('');
    setContenedor('');
    setResultado(null);
    setDetalleIdx(null);
    setBuscado(false);
    setCargando(false);
    setErrorBusqueda(null);
    setShowComplementos(false);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* no disponible */ }
  }

  function handleTipo(t) {
    setTipoBusqueda(t);
    setResultado(null);
    setDetalleIdx(null);
    setBuscado(false);
  }

  const noEncontrado = MODO_VALIDACION && buscado && Array.isArray(resultado) && resultado.length === 0;
  const encontrado   = Array.isArray(resultado) && resultado.length > 0;

  return (
    <div className={styles.page}>

      {/* ── IMAGEN ENCABEZADO ── */}
      <div className={styles.headerDiv} />

      {/* ── TÍTULO SECCIÓN ── */}
      <span className={styles.lblTitulo}>
        Consulta rápida por pedimento, VIN o contenedor específico
      </span>

      {/* ── VISITANTE ── */}
      <span className={styles.lblAccesos}>
        Usted es el visitante: {numVisitante.toLocaleString('es-MX')}
      </span>

      {/* ── BTN INICIO ── */}
      <button className={styles.imgMenu} title="Regresa a pantalla de inicio" type="button">
        <Image src="/casa.gif" alt="Inicio" width={22} height={22} unoptimized />
      </button>

      {/* ── BTN SALIR ── */}
      <button className={styles.imgRegresa} title="Salir" type="button">
        <Image src="/salir.gif" alt="Salir" width={17} height={16} unoptimized />
      </button>

      {/* ── LABEL ADUANA ── */}
      <span className={styles.lblEtAduana}>Aduana:</span>

      {/* ── LABEL AÑO ── */}
      <span className={styles.lblAnio}>Año del Pedimento:</span>

      {/* ── SELECT ADUANA ── */}
      <select
        className={styles.cmbAduanas}
        value={aduana}
        onChange={(e) => setAduana(e.target.value)}
        disabled={tipoBusqueda === 'vin'}
      >
        {ADUANAS.map((a) => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </select>

      {/* ── SELECT AÑO ── */}
      <select
        className={styles.cmbAnio}
        value={anio}
        onChange={(e) => setAnio(e.target.value)}
      >
        {ANIOS.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* ── LABEL PATENTE ── */}
      <span className={styles.lblPatente}>Patente:</span>

      {/* ── LABEL DOCUMENTO ── */}
      <span className={styles.lblDocumento}>Documento:</span>

      {/* ── INPUT PATENTE ── */}
      <input
        type="text"
        className={styles.txtPatente}
        value={patente}
        onChange={(e) => setPatente(e.target.value)}
        disabled={tipoBusqueda !== 'pedimento'}
        maxLength={10}
      />

      {/* ── INPUT DOCUMENTO ── */}
      <input
        type="text"
        className={styles.txtDocumento}
        value={documento}
        onChange={(e) => setDocumento(e.target.value)}
        disabled={tipoBusqueda !== 'pedimento'}
        maxLength={15}
      />

      {/* ── RADIO: POR PEDIMENTO ── */}
      <label className={styles.radioPedimento}>
        <input
          type="radio"
          name="tipoBusqueda"
          value="pedimento"
          checked={tipoBusqueda === 'pedimento'}
          onChange={() => handleTipo('pedimento')}
        />
        {' '}Por pedimento
      </label>

      {/* ── RADIO: POR VIN ── */}
      <label className={styles.radioVin}>
        <input
          type="radio"
          name="tipoBusqueda"
          value="vin"
          checked={tipoBusqueda === 'vin'}
          onChange={() => handleTipo('vin')}
        />
        {' '}Por VIN
      </label>

      {/* ── INPUT VIN ── */}
      <input
        type="text"
        className={styles.txtVin}
        value={vin}
        onChange={(e) => setVin(e.target.value)}
        disabled={tipoBusqueda !== 'vin'}
        maxLength={17}
      />

      {/* ── RADIO: POR CONTENEDOR ── */}
      <label className={styles.radioContenedor}>
        <input
          type="radio"
          name="tipoBusqueda"
          value="contenedor"
          checked={tipoBusqueda === 'contenedor'}
          onChange={() => handleTipo('contenedor')}
        />
        {' '}Por contenedor
      </label>

      {/* ── INPUT CONTENEDOR ── */}
      <input
        type="text"
        className={styles.txtContenedor}
        value={contenedor}
        onChange={(e) => setContenedor(e.target.value)}
        disabled={tipoBusqueda !== 'contenedor'}
        maxLength={20}
      />

      {/* ── BTN BUSCAR ── */}
      <button className={styles.btnBuscar} onClick={handleBuscar} type="button" disabled={cargando}>
        {cargando ? 'Buscando...' : 'Buscar'}
      </button>

      {/* ── BTN LIMPIAR ── */}
      <button className={styles.btnLimpiar} onClick={handleLimpiar} type="button">
        Limpiar
      </button>

      {/* ── MENSAJE ── */}
      {errorBusqueda && (
        <div className={styles.messageBar}>
          {errorBusqueda}
        </div>
      )}
      {!errorBusqueda && noEncontrado && (
        <div className={styles.messageBar}>
          ¡No se encontró información relacionada con los parámetros proporcionados, verifique los datos y/o el año del pedimento
        </div>
      )}

      {/* ── TABLA RESULTADOS ── */}
      {encontrado && (
        <div className={styles.resultsWrapper}>

          {/* ── SECCIÓN COMPLEMENTOS (solo VIN, al dar clic en gif) ── */}
          {tipoBusqueda === 'vin' && showComplementos && (() => {
            const complementos = resultado.flatMap(p => p.complementos || []);
            if (complementos.length === 0) return null;
            return (
              <>
                <span className={styles.tituloTabla}> COMPLEMENTOS</span>
                <table className={styles.grdComplementos}>
                  <thead>
                    <tr className={styles.grdHeader}>
                      <td>ID DE CASO</td>
                      <td>COMPLEMENTO 1</td>
                      <td>COMPLEMENTO 2</td>
                      <td>COMPLEMENTO 3</td>
                    </tr>
                  </thead>
                  <tbody>
                    {complementos.map((c, i) => (
                      <tr key={i} className={styles.grdRow}>
                        <td align="center">{c.idCaso}</td>
                        <td align="center">{c.complemento1 || '\u00a0'}</td>
                        <td align="center">{c.complemento2 || '\u00a0'}</td>
                        <td align="center">{c.complemento3 || '\u00a0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            );
          })()}

          {tipoBusqueda === 'vin' && showComplementos && <div className={styles.tablaSeparador} />}

          {/* Título y contador */}
          <span className={styles.tituloTabla}>CONSULTA DE SITUACIÓN DE PEDIMENTOS</span>
          <span className={styles.totalRegistros}>&nbsp;Total de registros: {resultado.length}</span>

          {/* Tabla principal */}
          <table className={styles.grdPedimentos}>
            <thead>
              <tr className={styles.grdHeader}>
                <td style={{width:'30px',whiteSpace:'nowrap'}}>DOCUMENTO</td>
                <td>PATENTE</td>
                <td>ESTADO</td>
                <td>FECHA</td>
                <td>BANCO</td>
                <td>SECUENCIA</td>
                <td>NUMERO DE OPERACION</td>
                <td>FACTURA</td>
                <td>INFORMACIÓN DEL PAGO</td>
              </tr>
            </thead>
            <tbody>
              {resultado.map((p, i) => (
                <tr key={i} className={styles.grdRow}>
                  <td className={styles.gridLink} align="center">{p.documento}</td>
                  <td align="center">{p.patente}</td>
                  <td align="left">{p.estado}</td>
                  <td align="center">{p.fecha}</td>
                  <td align="left">{p.banco || '\u00a0'}</td>
                  <td align="center">{p.secuencia}</td>
                  <td align="center">{p.numeroOperacion}</td>
                  <td align="center">{p.factura || '\u00a0'}</td>
                  <td align="center" className={styles.detalleCell}>
                    <button
                      type="button"
                      className={styles.detalleBtn}
                      onClick={() => setDetalleIdx(detalleIdx === i ? null : i)}
                    >
                      DETALLE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tabla detalle de pago */}
          {detalleIdx !== null && resultado[detalleIdx] && (() => {
            const p = resultado[detalleIdx];
            const d = p.detalle;
            return (
              <>
                <span className={styles.tituloDetalle}>Información del Pago</span>
                <table className={styles.grdDetallePago}>
                  <thead>
                    <tr className={styles.grdHeader}>
                      <td>ADUANA</td>
                      <td>PATENTE</td>
                      <td>DOCUMENTO</td>
                      <td>BANCO</td>
                      <td>NUMERO DE OPERACION</td>
                      <td>IMPORTE</td>
                      <td>FECHA Y HORA DE PAGO</td>
                      <td>LINEA DE CAPTURA</td>
                      <td>ESTADO LINEA DE CAPTURA</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={styles.grdRowDetalle}>
                      <td>{p.aduana} {p.aduanaLabel}</td>
                      <td>{p.patente}</td>
                      <td>{p.documento}</td>
                      <td>{d.banco}</td>
                      <td>{d.numeroOperacion}</td>
                      <td>{d.importe}</td>
                      <td>{d.fechaHoraPago}</td>
                      <td>{d.lineaCaptura}</td>
                      <td>{d.estadoLineaCaptura}</td>
                    </tr>
                  </tbody>
                </table>
              </>
            );
          })()}

          {/* ── TABLA IMPORTACIÓN DE VEHÍCULOS (solo búsqueda por VIN) ── */}
          {tipoBusqueda === 'vin' && (() => {
            const vehiculos = resultado.filter(p => p.vehiculo);
            return (
              <div className={styles.vehiculosSection}>
                <span className={styles.tituloTabla}> CONSULTA DE IMPORTACIÓN DE VEHÍCULOS</span>
                <span className={styles.totalRegistros}>Total de registros: {vehiculos.length}</span>
                <table className={styles.grdPedimentos}>
                  <thead>
                    <tr className={styles.grdHeader}>
                      <td style={{width:'70px',whiteSpace:'nowrap'}}>VER DETALLE</td>
                      <td style={{width:'70px'}}>CLAVE DE DOCUMENTO</td>
                      <td style={{width:'65px'}}>DOCUMENTO</td>
                      <td style={{width:'65px'}}>PATENTE</td>
                      <td>RFC</td>
                      <td>CURP</td>
                      <td>IMPORTADOR</td>
                      <td>FECHA DE PAGO</td>
                      <td>COMPLEMENTOS</td>
                    </tr>
                  </thead>
                  <tbody>
                    {vehiculos.map((p, i) => {
                      const v = p.vehiculo;
                      const verUrl = `https://aplicacionesc.mat.sat.gob.mx/SOIANET/oia_consultadter_civ.aspx?Patente=${p.patente}&NumDcto=${p.documento}&Anio=${p.anio}&DocClave=${v.claveDocumento}&VIN=${p.vin}&Aduana=${p.aduana}`;
                      return (
                        <tr key={i} className={styles.grdRow}>
                          <td className={styles.gridLink} align="center">
                            <Link href={`/SOIANET/oia_consultadter_civ.aspx?Patente=${p.patente}&NumDcto=${p.documento}&Anio=${p.anio}&DocClave=${v.claveDocumento}&VIN=${p.vin}&Aduana=${p.aduana}`}>
                              <Image src="/ver_detalle.gif" alt="Ver detalle" width={15} height={15} unoptimized />
                            </Link>
                          </td>
                          <td align="center">{v.claveDocumento || '\u00a0'}</td>
                          <td align="center">{p.documento}</td>
                          <td align="center">{p.patente}</td>
                          <td align="left">{v.rfc || '\u00a0'}</td>
                          <td align="center">{v.curp || '\u00a0'}</td>
                          <td align="left">{v.importador || '\u00a0'}</td>
                          <td align="center">{v.fechaPago || '\u00a0'}</td>
                          <td className={styles.gridLink} align="center">
                            <button
                              type="button"
                              onClick={() => setShowComplementos(prev => !prev)}
                              style={{background:'none',border:'none',cursor:'pointer',padding:0,lineHeight:0}}
                            >
                              <Image src="/complementos.gif" alt="Complementos" width={15} height={15} unoptimized />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}

        </div>
      )}

    </div>
  );
}
