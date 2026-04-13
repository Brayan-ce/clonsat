'use server';

import pool from '@/_DB/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

export async function actualizarPedimento(id, prevState, formData) {
  const get = (k) => (formData.get(k) || '').toString().trim();

  // Campos generales
  const aduana          = get('aduana');
  const aduana_label    = get('aduana_label');
  const anio            = get('anio');
  const patente         = get('patente');
  const documento       = get('documento');
  const factura         = get('factura');
  const secuencia       = get('secuencia');
  const estado          = get('estado');
  const fecha           = get('fecha');
  const tipo_operacion  = get('tipo_operacion');
  const clave_documento = get('clave_documento');

  // Campos específicos por tipo
  const vin       = get('vin');
  const contenedor = get('contenedor');

  // Pago
  const banco         = get('banco');
  const num_op        = get('numero_operacion');
  const importe       = get('importe');
  const fecha_hora    = get('fecha_hora_pago');
  const linea_captura = get('linea_captura');
  const estado_linea  = get('estado_linea_captura');

  // Determinar tipo
  const tipo = get('tipo'); // 'pedimento' | 'vin' | 'contenedor'

  // Validaciones básicas
  if (tipo === 'pedimento' && (!patente || !documento || !aduana)) {
    return { error: 'Los campos Patente, Documento y Aduana son obligatorios.' };
  }
  if (tipo === 'vin') {
    if (!vin) return { error: 'El campo VIN es obligatorio.' };
    if (vin.length !== 17) return { error: 'El VIN debe tener exactamente 17 caracteres.' };
  }
  if (tipo === 'contenedor' && !contenedor) {
    return { error: 'El campo Contenedor es obligatorio.' };
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE pedimentos SET
         aduana = ?, aduana_label = ?, anio = ?, patente = ?, documento = ?,
         factura = ?, secuencia = ?, estado = ?, fecha = ?,
         tipo_operacion = ?, clave_documento = ?,
         vin = ?, contenedor = ?
       WHERE id = ?`,
      [
        aduana, aduana_label, anio || null, patente, documento,
        factura, secuencia, estado, fecha || null,
        tipo_operacion, clave_documento,
        vin || null, contenedor || null,
        id,
      ]
    );

    // Verificar si existe detalle
    const [[det]] = await conn.query(
      'SELECT id FROM pedimentos_detalle WHERE id_pedimento = ?', [id]
    );

    if (det) {
      await conn.query(
        `UPDATE pedimentos_detalle SET
           banco = ?, numero_operacion = ?, importe = ?,
           fecha_hora_pago = ?, linea_captura = ?, estado_linea_captura = ?
         WHERE id_pedimento = ?`,
        [banco, num_op, importe || null, fecha_hora || null, linea_captura, estado_linea, id]
      );
    } else {
      await conn.query(
        `INSERT INTO pedimentos_detalle
           (id_pedimento, banco, numero_operacion, importe, fecha_hora_pago, linea_captura, estado_linea_captura)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, banco, num_op, importe || null, fecha_hora || null, linea_captura, estado_linea]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error('Error al actualizar pedimento:', err);
    return { error: 'Ocurrió un error al guardar. Intente de nuevo.' };
  } finally {
    conn.release();
  }

  revalidatePath('/superadmin/pedimentos');
  redirect(`/superadmin/pedimentos/${id}/ver`);
}
