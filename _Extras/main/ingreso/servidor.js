'use server';

import { headers } from 'next/headers';
import pool from '@/_DB/db';

export const MODO_VALIDACION = true;

export const ADUANAS = [
  { value: '-10', label: '-' },
  { value: '10',   label: 'ACAPULCO, GRO.' },
  { value: '6660', label: 'ADUANA VIRTUAL PARA PREVALIDADORES' },
  { value: '470',  label: 'AEROPUERTO INTERNAL. CD. DE MEXICO, D.F.' },
  { value: '850',  label: 'AEROPUERTO INTERNAL. FELIPE ANGELES, MEX' },
  { value: '20',   label: 'AGUA PRIETA, SON.' },
  { value: '730',  label: 'AGUASCALIENTES, AGS.' },
  { value: '810',  label: 'ALTAMIRA, TAMPS.' },
  { value: '530',  label: 'CANCUN, Q. ROO.' },
  { value: '440',  label: 'CD. ACUNA, COAH.' },
  { value: '820',  label: 'CD. CAMARGO, TAMPS.' },
  { value: '60',   label: 'CD. DEL CARMEN, CAMP.' },
  { value: '370',  label: 'CD. HIDALGO, CHIS.' },
  { value: '70',   label: 'CD. JUAREZ, CHIH.' },
  { value: '340',  label: 'CD. MIGUEL ALEMAN, TAMPS.' },
  { value: '300',  label: 'CD. REYNOSA, TAMPS.' },
  { value: '670',  label: 'CHIHUAHUA, CHIH.' },
  { value: '80',   label: 'COATZACOALCOS, VER.' },
  { value: '800',  label: 'COLOMBIA, N.L.' },
  { value: '830',  label: 'DOS BOCAS' },
  { value: '110',  label: 'ENSENADA, B.C.' },
  { value: '480',  label: 'GUADALAJARA, JAL.' },
  { value: '840',  label: 'GUANAJUATO, GTO' },
  { value: '120',  label: 'GUAYMAS, SON.' },
  { value: '140',  label: 'LA PAZ, B.C.S.' },
  { value: '510',  label: 'LAZARO CARDENAS, MICH.' },
  { value: '160',  label: 'MANZANILLO, COL.' },
  { value: '170',  label: 'MATAMOROS, TAMPS.' },
  { value: '180',  label: 'MAZATLAN, SIN.' },
  { value: '190',  label: 'MEXICALI, B.C.' },
  { value: '200',  label: 'MEXICO' },
  { value: '520',  label: 'MONTERREY, N.L.' },
  { value: '220',  label: 'NACO, SON.' },
  { value: '230',  label: 'NOGALES, SON.' },
  { value: '240',  label: 'NUEVO LAREDO, TAMPS.' },
  { value: '250',  label: 'OJINAGA, CHIH.' },
  { value: '270',  label: 'PIEDRAS NEGRAS, COAH.' },
  { value: '280',  label: 'PROGRESO, YUC.' },
  { value: '750',  label: 'PUEBLA, PUE.' },
  { value: '260',  label: 'PUERTO PALOMAS, CHIH.' },
  { value: '640',  label: 'QUERETARO, QRO.' },
  { value: '310',  label: 'SALINA CRUZ, OAX.' },
  { value: '330',  label: 'SAN LUIS RIO COLORADO, SON.' },
  { value: '500',  label: 'SONOYTA, SON.' },
  { value: '50',   label: 'SUBTENIENTE LOPEZ, Q. ROO.' },
  { value: '380',  label: 'TAMPICO, TAMPS.' },
  { value: '390',  label: 'TECATE, B.C.' },
  { value: '400',  label: 'TIJUANA, B.C.' },
  { value: '650',  label: 'TOLUCA, MEX.' },
  { value: '460',  label: 'TORREON, COAH.' },
  { value: '420',  label: 'TUXPAN, VER.' },
  { value: '430',  label: 'VERACRUZ, VER.' },
];

export const ANIOS = ['2026','2025','2024','2023','2022','2021','2020','2019','2018','2017'];

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
         (tipo, aduana, aduana_label, anio, patente, documento, vin, contenedor,
          ip, user_agent, pais, pais_codigo, region, ciudad, latitud, longitud, isp,
          encontrado, total_resultados)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tipo, aduana||null, aduanaLabel||null, anio||null, patente||null, documento||null,
       vin||null, contenedor||null, ip, userAgent,
       pais, paisCodigo, region, ciudad, latitud, longitud, isp,
       encontrado ? 1 : 0, totalResultados || 0]
    );
  } catch { /* registro opcional */ }
}
