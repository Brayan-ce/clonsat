import { NextResponse } from 'next/server';
import pool from '@/_DB/db';

const base = `
  SELECT p.*,
         d.banco            AS det_banco,
         d.numero_operacion AS det_num_op,
         d.importe,
         d.fecha_hora_pago,
         d.linea_captura,
         d.estado_linea_captura,
         v.clave_documento  AS veh_clave_doc,
         v.rfc              AS veh_rfc,
         v.curp             AS veh_curp,
         v.importador       AS veh_importador,
         v.fecha_pago       AS veh_fecha_pago
  FROM pedimentos p
  LEFT JOIN pedimentos_detalle  d ON d.id_pedimento = p.id
  LEFT JOIN pedimentos_vehiculo v ON v.id_pedimento = p.id
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
    vehiculo: r.veh_clave_doc ? {
      claveDocumento: r.veh_clave_doc,
      rfc:            r.veh_rfc            || '',
      curp:           r.veh_curp           || '',
      importador:     r.veh_importador     || '',
      fechaPago:      r.veh_fecha_pago     || '',
    } : null,
  };
}

export async function POST(request) {
  try {
    const { tipo, aduana, anio, patente, documento, vin, contenedor } = await request.json();
    let rows = [];

    if (tipo === 'pedimento') {
      [rows] = await pool.query(
        base + `WHERE (? = '-10' OR p.aduana = ?) AND p.anio = ? AND p.patente = ? AND p.documento = ?`,
        [aduana, aduana, anio, (patente || '').trim(), (documento || '').trim()]
      );
    } else if (tipo === 'vin') {
      [rows] = await pool.query(
        base + `WHERE p.anio = ? AND UPPER(p.vin) = UPPER(?)`,
        [anio, (vin || '').trim()]
      );
    } else if (tipo === 'contenedor') {
      [rows] = await pool.query(
        base + `WHERE (? = '-10' OR p.aduana = ?) AND p.anio = ? AND UPPER(p.contenedor) = UPPER(?)`,
        [aduana, aduana, anio, (contenedor || '').trim()]
      );
    }

    if (tipo === 'vin' && rows.length > 0) {
      const ids = rows.map(r => r.id);
      const [compRows] = await pool.query(
        'SELECT id_pedimento, id_caso, complemento1, complemento2, complemento3 FROM pedimentos_complemento WHERE id_pedimento IN (?)',
        [ids]
      );
      const compMap = {};
      for (const c of compRows) {
        if (!compMap[c.id_pedimento]) compMap[c.id_pedimento] = [];
        compMap[c.id_pedimento].push({
          idCaso:       c.id_caso,
          complemento1: c.complemento1 || '',
          complemento2: c.complemento2 || '',
          complemento3: c.complemento3 || '',
        });
      }
      return NextResponse.json(rows.map(r => ({ ...mapRow(r), complementos: compMap[r.id] || [] })));
    }

    return NextResponse.json(rows.map(mapRow));
  } catch (err) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
