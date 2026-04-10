import { NextResponse } from 'next/server';
import pool from '@/_DB/db';

const ADUANAS = {
  '-10': '',
  '10':   'ACAPULCO, GRO.', '6660': 'ADUANA VIRTUAL PARA PREVALIDADORES',
  '470':  'AEROPUERTO INTERNAL. CD. DE MEXICO, D.F.', '850': 'AEROPUERTO INTERNAL. FELIPE ANGELES, MEX',
  '20':   'AGUA PRIETA, SON.', '730': 'AGUASCALIENTES, AGS.', '810': 'ALTAMIRA, TAMPS.',
  '530':  'CANCUN, Q. ROO.', '440': 'CD. ACUNA, COAH.', '820': 'CD. CAMARGO, TAMPS.',
  '60':   'CD. DEL CARMEN, CAMP.', '370': 'CD. HIDALGO, CHIS.', '70': 'CD. JUAREZ, CHIH.',
  '340':  'CD. MIGUEL ALEMAN, TAMPS.', '300': 'CD. REYNOSA, TAMPS.', '670': 'CHIHUAHUA, CHIH.',
  '80':   'COATZACOALCOS, VER.', '800': 'COLOMBIA, N.L.', '830': 'DOS BOCAS',
  '110':  'ENSENADA, B.C.', '480': 'GUADALAJARA, JAL.', '840': 'GUANAJUATO, GTO',
  '120':  'GUAYMAS, SON.', '140': 'LA PAZ, B.C.S.', '510': 'LAZARO CARDENAS, MICH.',
  '160':  'MANZANILLO, COL.', '170': 'MATAMOROS, TAMPS.', '180': 'MAZATLAN, SIN.',
  '190':  'MEXICALI, B.C.', '200': 'MEXICO', '520': 'MONTERREY, N.L.',
  '220':  'NACO, SON.', '230': 'NOGALES, SON.', '240': 'NUEVO LAREDO, TAMPS.',
  '250':  'OJINAGA, CHIH.', '270': 'PIEDRAS NEGRAS, COAH.', '280': 'PROGRESO, YUC.',
  '750':  'PUEBLA, PUE.', '260': 'PUERTO PALOMAS, CHIH.', '640': 'QUERETARO, QRO.',
  '310':  'SALINA CRUZ, OAX.', '330': 'SAN LUIS RIO COLORADO, SON.', '500': 'SONOYTA, SON.',
  '50':   'SUBTENIENTE LOPEZ, Q. ROO.', '380': 'TAMPICO, TAMPS.', '390': 'TECATE, B.C.',
  '400':  'TIJUANA, B.C.', '650': 'TOLUCA, MEX.', '460': 'TORREON, COAH.',
  '420':  'TUXPAN, VER.', '430': 'VERACRUZ, VER.',
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { tipo, aduana, anio, patente, documento, vin, contenedor, encontrado, totalResultados } = body;

    const forwarded = request.headers.get('x-forwarded-for');
    const realIp    = request.headers.get('x-real-ip');
    const ip        = (forwarded ? forwarded.split(',')[0].trim() : realIp) || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';
    const vid       = request.cookies.get('vid')?.value || null;
    const aduanaLabel = ADUANAS[aduana] || '';

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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/registrar]', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
