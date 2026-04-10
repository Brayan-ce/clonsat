'use server';

import { headers, cookies } from 'next/headers';
import pool from '@/_DB/db';
import { ADUANAS } from './constantes';

// ── TOTAL VISITAS ────────────────────────────────────────
export async function obtenerTotalVisitas() {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM registro_busquedas');
    return total;
  } catch {
    return 0;
  }
}

// ── BUSCAR PEDIMENTO ─────────────────────────────────────
const base = `
  SELECT p.*,
         d.banco            AS det_banco,
         d.numero_operacion AS det_num_op,
         d.importe,
         d.fecha_hora_pago,
         d.linea_captura,
         d.estado_linea_captura
  FROM pedimentos p
  LEFT JOIN pedimentos_detalle d ON d.id_pedimento = p.id
`;

function mapRow(r) {
  return {
    aduana:          r.aduana,
    aduanaLabel:     r.aduana_label,
    anio:            r.anio,
    patente:         r.patente,
    documento:       r.documento,
    estado:          r.estado,
    fecha:           r.fecha,
    banco:           r.banco            || '',
    secuencia:       r.secuencia,
    numeroOperacion: r.numero_operacion,
    factura:         r.factura          || '',
    vin:             r.vin,
    contenedor:      r.contenedor,
    detalle: {
      banco:              r.det_banco            || '',
      numeroOperacion:    r.det_num_op           || '',
      importe:            r.importe              || '',
      fechaHoraPago:      r.fecha_hora_pago      || '',
      lineaCaptura:       r.linea_captura        || '',
      estadoLineaCaptura: r.estado_linea_captura || '',
    },
  };
}

export async function buscarPedimento({ tipo, aduana, anio, patente, documento, vin, contenedor }) {
  let rows = [];
  if (tipo === 'pedimento') {
    [rows] = await pool.query(
      base + `WHERE (? = '-10' OR p.aduana = ?) AND p.anio = ? AND p.patente = ? AND p.documento = ?`,
      [aduana, aduana, anio, patente.trim(), documento.trim()]
    );
  } else if (tipo === 'vin') {
    [rows] = await pool.query(
      base + `WHERE p.anio = ? AND UPPER(p.vin) = UPPER(?)`,
      [anio, vin.trim()]
    );
  } else if (tipo === 'contenedor') {
    [rows] = await pool.query(
      base + `WHERE (? = '-10' OR p.aduana = ?) AND p.anio = ? AND UPPER(p.contenedor) = UPPER(?)`,
      [aduana, aduana, anio, contenedor.trim()]
    );
  }
  return rows.map(mapRow);
}

// ── REGISTRAR BÚSQUEDA ───────────────────────────────────
export async function registrarBusqueda({ tipo, aduana, anio, patente, documento, vin, contenedor, encontrado, totalResultados }) {
  try {
    const hdrs      = await headers();
    const cookieStore = await cookies();
    const vid       = cookieStore.get('vid')?.value || null;
    const forwarded = hdrs.get('x-forwarded-for');
    const realIp    = hdrs.get('x-real-ip');
    const ip        = (forwarded ? forwarded.split(',')[0].trim() : realIp) || '127.0.0.1';
    const userAgent = hdrs.get('user-agent') || '';

    const aduanaObj   = ADUANAS.find((a) => a.value === aduana);
    const aduanaLabel = aduanaObj ? aduanaObj.label : '';

    let pais = null, paisCodigo = null, region = null, ciudad = null;
    let latitud = null, longitud = null, isp = null;

    if (ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168') && !ip.startsWith('10.')) {
      try {
        const geo = await fetch(`http://ip-api.com/json/${ip}?lang=es&fields=status,country,countryCode,regionName,city,lat,lon,isp`, { cache: 'no-store' });
        if (geo.ok) {
          const g = await geo.json();
          if (g.status === 'success') {
            pais = g.country || null; paisCodigo = g.countryCode || null;
            region = g.regionName || null; ciudad = g.city || null;
            latitud = g.lat ?? null; longitud = g.lon ?? null; isp = g.isp || null;
          }
        }
      } catch { /* geo opcional */ }
    }

    await pool.query(
      `INSERT INTO registro_busquedas
         (visitor_id, tipo, aduana, aduana_label, anio, patente, documento, vin, contenedor,
          ip, user_agent, pais, pais_codigo, region, ciudad, latitud, longitud, isp,
          encontrado, total_resultados)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vid, tipo, aduana||null, aduanaLabel||null, anio||null, patente||null, documento||null,
       vin||null, contenedor||null, ip, userAgent,
       pais, paisCodigo, region, ciudad, latitud, longitud, isp,
       encontrado ? 1 : 0, totalResultados || 0]
    );
  } catch(err) { console.error('[registrarBusqueda]', err?.message ?? err); }
}
