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
  if (!p) return null;

  const [[vehiculo]] = await pool.query(
    `SELECT rfc, curp, importador, fecha_pago, calle, numero_ext,
            municipio, apartado_postal, cp, entidad_federativa, pais, aduana_completa
     FROM pedimentos_vehiculo
     WHERE id_pedimento = ?
     ORDER BY id ASC
     LIMIT 1`,
    [id]
  );

  const [complementos] = await pool.query(
    `SELECT id_caso, complemento1, complemento2, complemento3
     FROM pedimentos_complemento
     WHERE id_pedimento = ?
     ORDER BY id ASC`,
    [id]
  );

  const [fracciones] = await pool.query(
    `SELECT fraccion, secuencia, marca, modelo, anio_vehiculo, numero_serie,
            kilometraje, valor_aduana, fp_iva, importe_iva,
            fp_advalorem, importe_advalorem, fp_isan, importe_isan,
            fp_tenencia, importe_tenencia
     FROM pedimentos_vehiculo_fraccion
     WHERE id_pedimento = ?
     ORDER BY id ASC`,
    [id]
  );

  const [movimientos] = await pool.query(
    `SELECT situacion, detalle, fecha
     FROM pedimentos_movimientos
     WHERE id_pedimento = ?
     ORDER BY orden ASC, id ASC`,
    [id]
  );

  return {
    ...p,
    es_qr: p.tipo_registro === 'qr',
    movimientos: movimientos || [],
    vehiculo: vehiculo || null,
    complementos: complementos || [],
    fracciones: fracciones || [],
  };
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
  const esQr = tipo === 'qr';
  const tipoRegistro = esQr ? 'qr' : (tipo === 'vin' || tipo === 'contenedor' ? tipo : 'pedimento');

  // Datos VIN extendidos
  const importadorData = {
    rfc: get('rfc'),
    curp: get('curp'),
    importador: get('importador'),
    fecha_pago: get('fecha_pago'),
    calle: get('calle'),
    numero_ext: get('numero_ext'),
    municipio: get('municipio'),
    apartado_postal: get('apartado_postal'),
    cp: get('cp'),
    entidad_federativa: get('entidad_federativa'),
    pais: get('pais'),
    aduana_completa: get('aduana_completa'),
  };

  const complementosCount = Number.parseInt(get('complementos_count') || '0', 10);
  const fraccionesCount = Number.parseInt(get('fracciones_count') || '0', 10);

  // Validaciones básicas
  if ((tipo === 'pedimento' || esQr) && (!patente || !documento || !aduana)) {
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
         vin = ?, contenedor = ?, tipo_registro = ?
       WHERE id = ?`,
      [
        aduana, aduana_label, anio || null, patente, documento,
        factura, secuencia, estado, fecha || null,
        tipo_operacion, clave_documento,
        vin || null, contenedor || null, tipoRegistro,
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

    if (tipo === 'vin') {
      const hayImportador = Object.values(importadorData).some((v) => Boolean(v));
      const [[vehiculoExistente]] = await conn.query(
        'SELECT id FROM pedimentos_vehiculo WHERE id_pedimento = ? LIMIT 1',
        [id]
      );

      if (vehiculoExistente) {
        await conn.query(
          `UPDATE pedimentos_vehiculo SET
             rfc = ?, curp = ?, importador = ?, fecha_pago = ?, calle = ?, numero_ext = ?,
             municipio = ?, apartado_postal = ?, cp = ?, entidad_federativa = ?, pais = ?, aduana_completa = ?
           WHERE id_pedimento = ?`,
          [
            importadorData.rfc || null,
            importadorData.curp || null,
            importadorData.importador || null,
            importadorData.fecha_pago || null,
            importadorData.calle || null,
            importadorData.numero_ext || null,
            importadorData.municipio || null,
            importadorData.apartado_postal || null,
            importadorData.cp || null,
            importadorData.entidad_federativa || null,
            importadorData.pais || null,
            importadorData.aduana_completa || null,
            id,
          ]
        );
      } else if (hayImportador) {
        await conn.query(
          `INSERT INTO pedimentos_vehiculo
             (id_pedimento, clave_documento, rfc, curp, importador, fecha_pago,
              calle, numero_ext, municipio, apartado_postal, cp, entidad_federativa, pais, aduana_completa)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            clave_documento || 'VU',
            importadorData.rfc || null,
            importadorData.curp || null,
            importadorData.importador || null,
            importadorData.fecha_pago || null,
            importadorData.calle || null,
            importadorData.numero_ext || null,
            importadorData.municipio || null,
            importadorData.apartado_postal || null,
            importadorData.cp || null,
            importadorData.entidad_federativa || null,
            importadorData.pais || null,
            importadorData.aduana_completa || null,
          ]
        );
      }

      await conn.query('DELETE FROM pedimentos_complemento WHERE id_pedimento = ?', [id]);
      for (let i = 0; i < complementosCount; i += 1) {
        const idCaso = get(`comp_id_caso_${i}`).toUpperCase();
        const complemento1 = get(`comp_complemento1_${i}`);
        const complemento2 = get(`comp_complemento2_${i}`);
        const complemento3 = get(`comp_complemento3_${i}`);
        if (!idCaso && !complemento1 && !complemento2 && !complemento3) continue;
        await conn.query(
          `INSERT INTO pedimentos_complemento (id_pedimento, id_caso, complemento1, complemento2, complemento3)
           VALUES (?, ?, ?, ?, ?)`,
          [id, idCaso || 'NA', complemento1 || null, complemento2 || null, complemento3 || null]
        );
      }

      await conn.query('DELETE FROM pedimentos_vehiculo_fraccion WHERE id_pedimento = ?', [id]);
      for (let i = 0; i < fraccionesCount; i += 1) {
        const fila = {
          fraccion: get(`fr_fraccion_${i}`),
          secuenciaFraccion: get(`fr_secuencia_${i}`),
          marca: get(`fr_marca_${i}`),
          modelo: get(`fr_modelo_${i}`),
          anioVehiculo: get(`fr_anio_vehiculo_${i}`),
          numeroSerie: get(`fr_numero_serie_${i}`).toUpperCase(),
          kilometraje: get(`fr_kilometraje_${i}`),
          valorAduana: get(`fr_valor_aduana_${i}`),
          fpIva: get(`fr_fp_iva_${i}`),
          importeIva: get(`fr_importe_iva_${i}`),
          fpAdvalorem: get(`fr_fp_advalorem_${i}`),
          importeAdvalorem: get(`fr_importe_advalorem_${i}`),
          fpIsan: get(`fr_fp_isan_${i}`),
          importeIsan: get(`fr_importe_isan_${i}`),
          fpTenencia: get(`fr_fp_tenencia_${i}`),
          importeTenencia: get(`fr_importe_tenencia_${i}`),
        };
        const tieneValores = Object.values(fila).some((v) => Boolean(v));
        if (!tieneValores) continue;

        await conn.query(
          `INSERT INTO pedimentos_vehiculo_fraccion
             (id_pedimento, fraccion, secuencia, marca, modelo, anio_vehiculo, numero_serie,
              kilometraje, valor_aduana, fp_iva, importe_iva,
              fp_advalorem, importe_advalorem, fp_isan, importe_isan,
              fp_tenencia, importe_tenencia)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            fila.fraccion || null,
            fila.secuenciaFraccion || null,
            fila.marca || null,
            fila.modelo || null,
            fila.anioVehiculo || null,
            fila.numeroSerie || null,
            fila.kilometraje || null,
            fila.valorAduana || null,
            fila.fpIva || null,
            fila.importeIva || null,
            fila.fpAdvalorem || null,
            fila.importeAdvalorem || null,
            fila.fpIsan || null,
            fila.importeIsan || null,
            fila.fpTenencia || null,
            fila.importeTenencia || null,
          ]
        );
      }
    }

    if (esQr) {
      const movimientosCount = Number.parseInt(get('movimientos_count') || '0', 10);
      await conn.query('DELETE FROM pedimentos_movimientos WHERE id_pedimento = ?', [id]);
      for (let i = 0; i < movimientosCount; i += 1) {
        const situacion = get(`mov_situacion_${i}`);
        const detalle = get(`mov_detalle_${i}`);
        const fechaMov = get(`mov_fecha_${i}`);
        if (!situacion && !detalle && !fechaMov) continue;
        await conn.query(
          `INSERT INTO pedimentos_movimientos (id_pedimento, situacion, detalle, fecha, orden)
           VALUES (?, ?, ?, ?, ?)`,
          [id, situacion || 'PAGADO', detalle || '', fechaMov || null, i + 1]
        );
      }
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
