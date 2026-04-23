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
  const tipoOperacion  = f('tipo_operacion', '1 IMPORTACIÓN');
  const claveDocumento = f('clave_documento', 'VF');
  const tipoRegistroEntrada = f('tipo_registro', 'pedimento');
  const tipoRegistro = tipoRegistroEntrada === 'qr' ? 'qr' : 'pedimento';

  const aduanaObj = ADUANAS.find((a) => a.value === aduana);
  const aduanaLabel = aduanaObj?.label ?? '';

  const banco         = f('banco');
  const numOperacion  = f('numero_operacion');
  const pagosCount    = Math.max(1, parseInt(formData.get('pagos_count') || '1', 10));
  const movimientosCount = Math.max(0, parseInt(formData.get('movimientos_count') || '0', 10));

  if (!aduana || !patente || !documento) {
    return { error: 'Los campos Aduana, Patente y Documento son obligatorios.' };
  }

  try {
    const [r] = await pool.query(
      `INSERT INTO pedimentos
         (aduana, aduana_label, anio, patente, documento, factura, secuencia,
         estado, fecha, tipo_operacion, clave_documento, banco, numero_operacion, tipo_registro)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [aduana, aduanaLabel, anio, patente, documento, factura, secuencia,
       estado, fecha, tipoOperacion, claveDocumento, banco, numOperacion, tipoRegistro]
    );
    for (let i = 0; i < pagosCount; i++) {
      const banco        = formData.get(`banco_${i}`) || '';
      const numOperacion = formData.get(`numero_operacion_${i}`) || '';
      const importe      = formData.get(`det_importe_${i}`) || '';
      const fechaHoraPago= formData.get(`det_fecha_hora_pago_${i}`) || '';
      const lineaCaptura = formData.get(`det_linea_captura_${i}`) || '';
      const estadoLinea  = formData.get(`det_estado_linea_${i}`) || 'PAGO REGISTRADO EN SAAI';
      await pool.query(
        `INSERT INTO pedimentos_detalle
           (id_pedimento, banco, numero_operacion, importe, fecha_hora_pago, linea_captura, estado_linea_captura)
         VALUES (?,?,?,?,?,?,?)`,
        [r.insertId, banco, numOperacion, importe, fechaHoraPago, lineaCaptura, estadoLinea]
      );
    }

    for (let i = 0; i < movimientosCount; i++) {
      const situacion = (formData.get(`mov_situacion_${i}`) || '').toString().trim();
      const detalle = (formData.get(`mov_detalle_${i}`) || '').toString().trim();
      const fechaMovimiento = (formData.get(`mov_fecha_${i}`) || '').toString().trim();
      if (!situacion && !detalle && !fechaMovimiento) continue;
      await pool.query(
        `INSERT INTO pedimentos_movimientos
           (id_pedimento, situacion, detalle, fecha, orden)
         VALUES (?,?,?,?,?)`,
        [r.insertId, situacion || 'PAGADO', detalle, fechaMovimiento, i + 1]
      );
    }
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

  const vin            = f('vin').toUpperCase().trim();
  const aduana         = f('aduana');
  const anio           = f('anio');
  const patente        = f('patente');
  const documento      = f('documento');
  const factura        = f('factura');
  const secuencia      = f('secuencia', '0');
  const estado         = f('estado', 'EN PROCESO');
  const fecha          = f('fecha');
  const tipoOperacion  = f('tipo_operacion', '1 IMPORTACIÓN');

  const banco         = f('banco');
  const numOperacion  = f('numero_operacion');
  const importe       = f('det_importe');
  const fechaHoraPago = f('det_fecha_hora_pago');
  const lineaCaptura  = f('det_linea_captura');
  const estadoLinea   = f('det_estado_linea', 'PAGO REGISTRADO EN SAAI');

  const claveDocumento = f('clave_documento', 'VU');
  const rfc            = f('rfc');
  const curp           = f('curp');
  const importador     = f('importador');
  const fechaPago      = f('fecha_pago') || fecha;
  const calle          = f('calle');
  const numeroExt      = f('numero_ext');
  const municipio      = f('municipio');
  const apartadoPostal = f('apartado_postal');
  const cp             = f('cp');
  const entidadFed     = f('entidad_federativa');
  const pais           = f('pais');
  const aduanaCompletaIn = f('aduana_completa');

  if (!vin || vin.length !== 17) {
    return { error: 'El VIN debe tener exactamente 17 caracteres.' };
  }
  if (!aduana || !patente || !documento) {
    return { error: 'Para VIN también se requiere Aduana, Patente y Documento.' };
  }

  const aduanaObj = ADUANAS.find((a) => a.value === aduana);
  const aduanaLabel = aduanaObj?.label ?? '';
  const aduanaCompleta = aduanaCompletaIn || aduanaLabel;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [r] = await conn.query(
      `INSERT INTO pedimentos
         (aduana, aduana_label, anio, patente, documento, factura, secuencia,
          estado, fecha, tipo_operacion, clave_documento, vin, banco, numero_operacion, tipo_registro)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        aduana, aduanaLabel, anio, patente, documento, factura, secuencia,
        estado, fecha, tipoOperacion, claveDocumento, vin, banco, numOperacion, 'vin',
      ]
    );

    await conn.query(
      `INSERT INTO pedimentos_detalle
         (id_pedimento, banco, numero_operacion, importe, fecha_hora_pago, linea_captura, estado_linea_captura)
       VALUES (?,?,?,?,?,?,?)`,
      [r.insertId, banco, numOperacion, importe, fechaHoraPago, lineaCaptura, estadoLinea]
    );

    await conn.query(
      `INSERT INTO pedimentos_vehiculo
         (id_pedimento, clave_documento, rfc, curp, importador, fecha_pago,
          calle, numero_ext, municipio, apartado_postal, cp, entidad_federativa, pais, aduana_completa)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        r.insertId, claveDocumento, rfc, curp, importador, fechaPago,
        calle, numeroExt, municipio, apartadoPostal, cp, entidadFed, pais, aduanaCompleta,
      ]
    );

    const complementosCount = Math.max(1, parseInt(formData.get('complementos_count') || '1', 10));
    for (let i = 0; i < complementosCount; i++) {
      const idCaso = (formData.get(`comp_id_caso_${i}`) || '').toString().trim().toUpperCase();
      const c1 = (formData.get(`comp_complemento1_${i}`) || '').toString().trim();
      const c2 = (formData.get(`comp_complemento2_${i}`) || '').toString().trim();
      const c3 = (formData.get(`comp_complemento3_${i}`) || '').toString().trim();
      if (!idCaso && !c1 && !c2 && !c3) continue;
      await conn.query(
        `INSERT INTO pedimentos_complemento
           (id_pedimento, id_caso, complemento1, complemento2, complemento3)
         VALUES (?,?,?,?,?)`,
        [r.insertId, idCaso || 'ED', c1, c2, c3]
      );
    }

    const fraccionesCount = Math.max(1, parseInt(formData.get('fracciones_count') || '1', 10));
    for (let i = 0; i < fraccionesCount; i++) {
      const fraccion = (formData.get(`fr_fraccion_${i}`) || '').toString().trim();
      const sec = (formData.get(`fr_secuencia_${i}`) || '').toString().trim();
      const marca = (formData.get(`fr_marca_${i}`) || '').toString().trim();
      const modelo = (formData.get(`fr_modelo_${i}`) || '').toString().trim();
      const anioVeh = (formData.get(`fr_anio_vehiculo_${i}`) || '').toString().trim();
      const numeroSerie = (formData.get(`fr_numero_serie_${i}`) || '').toString().trim().toUpperCase();
      const kilometraje = (formData.get(`fr_kilometraje_${i}`) || '').toString().trim();
      const valorAduana = (formData.get(`fr_valor_aduana_${i}`) || '').toString().trim();
      const fpIva = (formData.get(`fr_fp_iva_${i}`) || '').toString().trim();
      const impIva = (formData.get(`fr_importe_iva_${i}`) || '').toString().trim();
      const fpAd = (formData.get(`fr_fp_advalorem_${i}`) || '').toString().trim();
      const impAd = (formData.get(`fr_importe_advalorem_${i}`) || '').toString().trim();
      const fpIsan = (formData.get(`fr_fp_isan_${i}`) || '').toString().trim();
      const impIsan = (formData.get(`fr_importe_isan_${i}`) || '').toString().trim();
      const fpTen = (formData.get(`fr_fp_tenencia_${i}`) || '').toString().trim();
      const impTen = (formData.get(`fr_importe_tenencia_${i}`) || '').toString().trim();

      if (!fraccion && !marca && !modelo && !numeroSerie) continue;

      await conn.query(
        `INSERT INTO pedimentos_vehiculo_fraccion
           (id_pedimento, fraccion, secuencia, marca, modelo, anio_vehiculo, numero_serie,
            kilometraje, valor_aduana, fp_iva, importe_iva, fp_advalorem, importe_advalorem,
            fp_isan, importe_isan, fp_tenencia, importe_tenencia)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          r.insertId, fraccion, sec || '1', marca, modelo, anioVeh, numeroSerie,
          kilometraje, valorAduana, fpIva, impIva || 0, fpAd, impAd || 0,
          fpIsan, impIsan || 0, fpTen, impTen || 0,
        ]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return { error: 'Error al guardar el pedimento VIN en la base de datos.' };
  } finally {
    conn.release();
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
         (aduana, aduana_label, anio, patente, documento, estado, fecha, contenedor, banco, numero_operacion, tipo_registro)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [aduana, aduanaLabel, anio, patente, documento, estado, fecha, contenedor, banco, numOperacion, 'contenedor']
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
