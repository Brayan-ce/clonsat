'use server';

import pool from '@/_DB/db';
import { redirect } from 'next/navigation';
import { ADUANAS } from '@/_Extras/main/ingreso/constantes';

export async function crearPedimento(formData) {
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
    const [result] = await pool.query(
      `INSERT INTO pedimentos
         (aduana, aduana_label, anio, patente, documento, estado, fecha, banco, secuencia, numero_operacion, factura, vin, contenedor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [aduana, aduanaLabel, anio, patente, documento, estado, fecha, banco, secuencia, numOperacion, factura,
       vin || null, contenedor || null]
    );
    await pool.query(
      `INSERT INTO pedimentos_detalle
         (id_pedimento, banco, numero_operacion, importe, fecha_hora_pago, linea_captura, estado_linea_captura)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [result.insertId, detBanco, detNumOp, detImporte, detFechaHora, detLinea, detEstado]
    );
  } catch {
    return { error: 'Error al guardar el pedimento' };
  }

  redirect('/superadmin/pedimentos');
}
