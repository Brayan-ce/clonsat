'use server';

import pool from '@/_DB/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ADUANAS } from '@/_Extras/main/ingreso/constantes';

/* ────────────────────────────────────────
   CREAR PEDIMENTO (tipo: pedimento)
─────────────────────────────────────────*/
export async function crearPorPedimento(prevState, formData) {
  const f = (key, def = '') => formData.get(key) || def;

  const aduana         = f('aduana');
  const anio           = f('anio');
  const patente        = f('patente');
  const documento      = f('documento');
  const factura        = f('factura');
  const secuencia      = f('secuencia', '0');
  const estado         = f('estado', 'EN PROCESO');
  const fecha          = f('fecha');
  const tipoOperacion  = f('tipo_operacion');
  const claveDocumento = f('clave_documento');

  const banco          = f('banco');
  const numOperacion   = f('numero_operacion');
  const importe        = f('det_importe');
  const fechaHoraPago  = f('det_fecha_hora_pago');
  const lineaCaptura   = f('det_linea_captura');
  const estadoLinea    = f('det_estado_linea', 'PAGO REGISTRADO EN SAAI');

  const aduanaObj = ADUANAS.find((a) => a.value === aduana);
  const aduanaLabel = aduanaObj?.label ?? '';

  if (!aduana || !patente || !documento) {
    return { error: 'Los campos Aduana, Patente y Documento son obligatorios.' };
  }

  try {
    const [r] = await pool.query(
      `INSERT INTO pedimentos
         (aduana, aduana_label, anio, patente, documento, factura, secuencia,
          estado, fecha, tipo_operacion, clave_documento, banco, numero_operacion)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [aduana, aduanaLabel, anio, patente, documento, factura, secuencia,
       estado, fecha, tipoOperacion, claveDocumento, banco, numOperacion]
    );
    await pool.query(
      `INSERT INTO pedimentos_detalle
         (id_pedimento, banco, numero_operacion, importe, fecha_hora_pago, linea_captura, estado_linea_captura)
       VALUES (?,?,?,?,?,?,?)`,
      [r.insertId, banco, numOperacion, importe, fechaHoraPago, lineaCaptura, estadoLinea]
    );
  } catch (err) {
    console.error(err);
    return { error: 'Error al guardar el pedimento en la base de datos.' };
  }

  revalidatePath('/superadmin/pedimentos');
  redirect('/superadmin/pedimentos');
}

/* ────────────────────────────────────────
   CREAR POR VIN
─────────────────────────────────────────*/
export async function crearPorVin(prevState, formData) {
  const f = (key, def = '') => formData.get(key) || def;

  const vin    = f('vin').toUpperCase().trim();
  const anio   = f('anio');
  const estado = f('estado', 'EN PROCESO');
  const fecha  = f('fecha');

  const banco         = f('banco');
  const numOperacion  = f('numero_operacion');
  const importe       = f('det_importe');
  const fechaHoraPago = f('det_fecha_hora_pago');
  const lineaCaptura  = f('det_linea_captura');
  const estadoLinea   = f('det_estado_linea', 'PAGO REGISTRADO EN SAAI');

  if (!vin || vin.length !== 17) {
    return { error: 'El VIN debe tener exactamente 17 caracteres.' };
  }

  try {
    const [r] = await pool.query(
      `INSERT INTO pedimentos (aduana, aduana_label, anio, estado, fecha, vin, banco, numero_operacion)
       VALUES ('', '', ?, ?, ?, ?, ?, ?)`,
      [anio, estado, fecha, vin, banco, numOperacion]
    );
    await pool.query(
      `INSERT INTO pedimentos_detalle
         (id_pedimento, banco, numero_operacion, importe, fecha_hora_pago, linea_captura, estado_linea_captura)
       VALUES (?,?,?,?,?,?,?)`,
      [r.insertId, banco, numOperacion, importe, fechaHoraPago, lineaCaptura, estadoLinea]
    );
  } catch (err) {
    console.error(err);
    return { error: 'Error al guardar el pedimento en la base de datos.' };
  }

  revalidatePath('/superadmin/pedimentos');
  redirect('/superadmin/pedimentos');
}

/* ────────────────────────────────────────
   CREAR POR CONTENEDOR
─────────────────────────────────────────*/
export async function crearPorContenedor(prevState, formData) {
  const f = (key, def = '') => formData.get(key) || def;

  const contenedor     = f('contenedor').trim().toUpperCase();
  const aduana         = f('aduana');
  const anio           = f('anio');
  const patente        = f('patente');
  const documento      = f('documento');
  const estado         = f('estado', 'EN PROCESO');
  const fecha          = f('fecha');

  const banco         = f('banco');
  const numOperacion  = f('numero_operacion');
  const importe       = f('det_importe');
  const fechaHoraPago = f('det_fecha_hora_pago');
  const lineaCaptura  = f('det_linea_captura');
  const estadoLinea   = f('det_estado_linea', 'PAGO REGISTRADO EN SAAI');

  const aduanaObj = ADUANAS.find((a) => a.value === aduana);
  const aduanaLabel = aduanaObj?.label ?? '';

  if (!contenedor) return { error: 'El número de contenedor es obligatorio.' };

  try {
    const [r] = await pool.query(
      `INSERT INTO pedimentos
         (aduana, aduana_label, anio, patente, documento, estado, fecha, contenedor, banco, numero_operacion)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [aduana, aduanaLabel, anio, patente, documento, estado, fecha, contenedor, banco, numOperacion]
    );
    await pool.query(
      `INSERT INTO pedimentos_detalle
         (id_pedimento, banco, numero_operacion, importe, fecha_hora_pago, linea_captura, estado_linea_captura)
       VALUES (?,?,?,?,?,?,?)`,
      [r.insertId, banco, numOperacion, importe, fechaHoraPago, lineaCaptura, estadoLinea]
    );
  } catch (err) {
    console.error(err);
    return { error: 'Error al guardar el pedimento en la base de datos.' };
  }

  revalidatePath('/superadmin/pedimentos');
  redirect('/superadmin/pedimentos');
}
