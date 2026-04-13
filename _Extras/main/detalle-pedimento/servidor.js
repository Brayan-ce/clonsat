'use server';

import db from '@/_DB/db';

export async function getDatosSituacion({ patente, numDcto, anio }) {
  const [rows] = await db.query(
    `SELECT p.id, p.aduana, p.aduana_label, p.anio, p.patente, p.documento,
            p.estado, p.tipo_operacion, p.clave_documento,
            p.secuencia, p.numero_operacion, p.factura,
            d.banco            AS det_banco,
            d.numero_operacion AS det_num_op,
            d.importe, d.fecha_hora_pago
     FROM pedimentos p
     LEFT JOIN pedimentos_detalle d ON d.id_pedimento = p.id
     WHERE p.patente = ? AND p.documento = ? AND p.anio = ?
     LIMIT 1`,
    [patente, numDcto, anio]
  );

  if (!rows.length) return null;

  const p = rows[0];

  const [movimientos] = await db.query(
    `SELECT situacion, detalle, fecha
     FROM pedimentos_movimientos
     WHERE id_pedimento = ?
     ORDER BY orden ASC, id ASC`,
    [p.id]
  );

  return {
    patente:          p.patente          ?? '',
    documento:        p.documento        ?? '',
    anio:             p.anio             ?? '',
    aduana:           p.aduana           ?? '',
    aduanaLabel:      p.aduana_label     ?? '',
    estado:           p.estado           ?? '',
    tipoOperacion:    p.tipo_operacion   ?? '',
    claveDocumento:   p.clave_documento  ?? '',
    secuencia:        p.secuencia        ?? '',
    numeroOperacion:  p.numero_operacion ?? '',
    factura:          p.factura          ?? '',
    banco:            p.det_banco        ?? '',
    movimientos: movimientos.map(m => ({
      situacion: m.situacion ?? '',
      detalle:   m.detalle   ?? '',
      fecha:     m.fecha     ?? '',
    })),
  };
}
