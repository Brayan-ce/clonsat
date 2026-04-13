import { NextResponse } from 'next/server';
import pool from '@/_DB/db';

export async function POST(request) {
  try {
    const { patente, documento, anio, aduana } = await request.json();

    const [rows] = await pool.query(`
      SELECT
        p.id          AS pedimento_id,
        p.aduana_label,
        v.clave_documento, v.rfc, v.curp, v.importador, v.fecha_pago,
        v.calle, v.numero_ext, v.municipio, v.apartado_postal,
        v.cp, v.entidad_federativa, v.pais, v.aduana_completa
      FROM pedimentos p
      JOIN pedimentos_vehiculo v ON v.id_pedimento = p.id
      WHERE p.patente = ? AND p.documento = ? AND p.anio = ?
        AND (? = '-10' OR p.aduana = ?)
      LIMIT 1
    `, [patente, documento, anio, aduana || '-10', aduana || '-10']);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    const v = rows[0];

    const [fracciones] = await pool.query(
      'SELECT * FROM pedimentos_vehiculo_fraccion WHERE id_pedimento = ? ORDER BY secuencia',
      [v.pedimento_id]
    );

    return NextResponse.json({
      importador: {
        nombre:            v.importador            || '',
        rfc:               v.rfc                   || '',
        curp:              v.curp                  || '',
        calle:             v.calle                 || '',
        numeroExt:         v.numero_ext            || '',
        municipio:         v.municipio             || '',
        apartadoPostal:    v.apartado_postal       || '',
        cp:                v.cp                    || '',
        entidadFederativa: v.entidad_federativa    || '',
        pais:              v.pais                  || '',
      },
      pedimento: {
        aduana:         v.aduana_completa || v.aduana_label || '',
        fechaPago:      v.fecha_pago      || '',
        claveDocumento: v.clave_documento || '',
        patente,
        documento,
      },
      fracciones: fracciones.map(f => ({
        fraccion:         f.fraccion          || '',
        secuencia:        f.secuencia         ?? 1,
        marca:            f.marca             || '',
        modelo:           f.modelo            || '',
        anioVehiculo:     f.anio_vehiculo     || '',
        numeroSerie:      f.numero_serie      || '',
        kilometraje:      f.kilometraje       || '',
        valorAduana:      f.valor_aduana      || '',
        fpIva:            f.fp_iva            || '',
        importeIva:       f.importe_iva       ?? 0,
        fpAdvalorem:      f.fp_advalorem      || '',
        importeAdvalorem: f.importe_advalorem ?? 0,
        fpIsan:           f.fp_isan           || '',
        importeIsan:      f.importe_isan      ?? 0,
        fpTenencia:       f.fp_tenencia       || '',
        importeTenencia:  f.importe_tenencia  ?? 0,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
