'use server';

import db from '@/_DB/db';

export async function getDatosPedimento({ patente, numDcto, anio, docClave, vin, aduana }) {
  // Buscar pedimento por patente + documento + anio
  const [pedimentos] = await db.query(
    `SELECT p.id, p.aduana, p.aduana_label, p.anio, p.patente, p.documento,
            p.fecha, p.vin,
            pv.importador, pv.rfc, pv.curp, pv.clave_documento,
            pv.fecha_pago, pv.calle, pv.numero_ext, pv.municipio,
            pv.apartado_postal, pv.cp, pv.entidad_federativa,
            pv.pais, pv.aduana_completa
     FROM pedimentos p
     LEFT JOIN pedimentos_vehiculo pv ON pv.id_pedimento = p.id
     WHERE p.patente = ? AND p.documento = ? AND p.anio = ?
     LIMIT 1`,
    [patente, numDcto, anio]
  );

  if (!pedimentos.length) return null;

  const p = pedimentos[0];

  const [fracciones] = await db.query(
    `SELECT fraccion, secuencia, marca, modelo, anio_vehiculo,
            numero_serie, kilometraje, valor_aduana,
            fp_iva, importe_iva, fp_advalorem, importe_advalorem,
            fp_isan, importe_isan, fp_tenencia, importe_tenencia
     FROM pedimentos_vehiculo_fraccion
     WHERE id_pedimento = ?`,
    [p.id]
  );

  return {
    importador: p.importador          ?? '',
    rfc:        p.rfc                 ?? '',
    curp:       p.curp                ?? '',
    calle:      p.calle               ?? '',
    numExt:     p.numero_ext          ?? '',
    cp:         p.cp                  ?? '',
    municipio:  p.municipio           ?? '',
    aPostal:    p.apartado_postal     ?? '',
    entidad:    p.entidad_federativa  ?? '',
    pais:       p.pais                ?? '',
    aduana:     p.aduana_completa     ?? p.aduana_label ?? p.aduana ?? '',
    fechaPago:  p.fecha_pago          ?? p.fecha        ?? '',
    claveDoc:   p.clave_documento     ?? docClave       ?? '',
    patente:    p.patente             ?? '',
    documento:  p.documento           ?? '',
    vehiculos: fracciones.map(f => ({
      fraccion:      f.fraccion                    ?? '',
      secuencia:     String(f.secuencia            ?? ''),
      marca:         f.marca                       ?? '',
      modelo:        f.modelo                      ?? '',
      anio:          f.anio_vehiculo               ?? '',
      serie:         f.numero_serie                ?? '',
      km:            f.kilometraje                 ?? '',
      valorAduana:   f.valor_aduana                ?? '',
      fpIva:         f.fp_iva                      ?? '',
      impIva:        String(f.importe_iva          ?? '0'),
      fpAdValorem:   f.fp_advalorem                ?? '',
      impAdValorem:  String(f.importe_advalorem    ?? '0'),
      fpIsan:        f.fp_isan                     ?? '',
      impIsan:       String(f.importe_isan         ?? '0'),
      fpTenencia:    f.fp_tenencia                 ?? '',
      impTenencia:   String(f.importe_tenencia     ?? '0'),
    })),
  };
}