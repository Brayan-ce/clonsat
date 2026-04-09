'use server';

import pool from '../../../../../_DB/db.js';
import { redirect } from 'next/navigation';
import { ADUANAS } from '../../../../main/ingreso/servidor.js';

export async function obtenerPedimento(id) {
  const [[p]] = await pool.query(
    `SELECT p.*, d.banco AS det_banco, d.numero_operacion AS det_num_op,
            d.importe, d.fecha_hora_pago, d.linea_captura, d.estado_linea_captura
     FROM pedimentos p
     LEFT JOIN pedimentos_detalle d ON d.id_pedimento = p.id
     WHERE p.id = ?`,
    [id]
  );
  return p || null;
}

export async function actualizarPedimento(id, formData) {
  const aduana       = formData.get('aduana')           || '';
  const anio         = formData.get('anio')             || '';
  const patente      = formData.get('patente')          || '';
  const documento    = formData.get('documento')        || '';
  const estado       = formData.get('estado')           || '';
  const fecha        = formData.get('fecha')            || '';
  const banco        = formData.get('banco')            || '';
  const secuencia    = formData.get('secuencia')        || '0';
  const numOperacion = formData.get('numero_operacion') || '';
  const factura      = formData.get('factura')          || '';
  const vin          = formData.get('vin')              || null;
  const contenedor   = formData.get('contenedor')       || null;

  const aduanaObj   = ADUANAS.find((a) => a.value === aduana);
  const aduanaLabel = aduanaObj ? aduanaObj.label : '';

  const detBanco     = formData.get('det_banco')            || '';
  const detNumOp     = formData.get('det_numero_operacion') || '';
  const detImporte   = formData.get('det_importe')          || '';
  const detFechaHora = formData.get('det_fecha_hora_pago')  || '';
  const detLinea     = formData.get('det_linea_captura')    || '';
  const detEstado    = formData.get('det_estado_linea')     || '';

  try {
    await pool.query(
      `UPDATE pedimentos
       SET aduana=?, aduana_label=?, anio=?, patente=?, documento=?, estado=?, fecha=?,
           banco=?, secuencia=?, numero_operacion=?, factura=?, vin=?, contenedor=?
       WHERE id=?`,
      [aduana, aduanaLabel, anio, patente, documento, estado, fecha, banco, secuencia,
       numOperacion, factura, vin || null, contenedor || null, id]
    );
    await pool.query(
      `UPDATE pedimentos_detalle
       SET banco=?, numero_operacion=?, importe=?, fecha_hora_pago=?, linea_captura=?, estado_linea_captura=?
       WHERE id_pedimento=?`,
      [detBanco, detNumOp, detImporte, detFechaHora, detLinea, detEstado, id]
    );
  } catch {
    return { error: 'Error al actualizar el pedimento' };
  }

  redirect(`/superadmin/pedimentos/${id}/ver`);
}
