'use server';

import { headers } from 'next/headers';
import pool from '../../../_DB/db.js';
import { ADUANAS } from './servidor.js';

export async function registrarBusqueda({ tipo, aduana, anio, patente, documento, vin, contenedor, encontrado, totalResultados }) {
  try {
    const hdrs      = await headers();
    const forwarded = hdrs.get('x-forwarded-for');
    const realIp    = hdrs.get('x-real-ip');
    const ip        = (forwarded ? forwarded.split(',')[0].trim() : realIp) || '127.0.0.1';
    const userAgent = hdrs.get('user-agent') || '';

    const aduanaObj   = ADUANAS.find((a) => a.value === aduana);
    const aduanaLabel = aduanaObj ? aduanaObj.label : '';

    // Geo por IP usando ip-api.com (gratuito, sin clave)
    let pais = null, paisCodigo = null, region = null, ciudad = null;
    let latitud = null, longitud = null, isp = null;

    // No hacer geo para localhost
    if (ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168') && !ip.startsWith('10.')) {
      try {
        const geo = await fetch(`http://ip-api.com/json/${ip}?lang=es&fields=status,country,countryCode,regionName,city,lat,lon,isp`, { cache: 'no-store' });
        if (geo.ok) {
          const g = await geo.json();
          if (g.status === 'success') {
            pais       = g.country      || null;
            paisCodigo = g.countryCode  || null;
            region     = g.regionName   || null;
            ciudad     = g.city         || null;
            latitud    = g.lat          ?? null;
            longitud   = g.lon          ?? null;
            isp        = g.isp          || null;
          }
        }
      } catch {
        // geo opcional — no bloquear si falla
      }
    }

    await pool.query(
      `INSERT INTO registro_busquedas
         (tipo, aduana, aduana_label, anio, patente, documento, vin, contenedor,
          ip, user_agent, pais, pais_codigo, region, ciudad, latitud, longitud, isp,
          encontrado, total_resultados)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tipo,
        aduana       || null,
        aduanaLabel  || null,
        anio         || null,
        patente      || null,
        documento    || null,
        vin          || null,
        contenedor   || null,
        ip,
        userAgent,
        pais, paisCodigo, region, ciudad, latitud, longitud, isp,
        encontrado ? 1 : 0,
        totalResultados || 0,
      ]
    );
  } catch {
    // Registro es opcional — nunca romper la experiencia del usuario
  }
}
