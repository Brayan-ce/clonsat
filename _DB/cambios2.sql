-- ═══════════════════════════════════════════════════════
--  CAMBIOS2.SQL  —  detalle de situación del pedimento
--  Ejecutar después de cambios1.sql
-- ═══════════════════════════════════════════════════════

USE clonsat;

-- ── 1. Nuevos campos en pedimentos ──────────────────────
--  tipo_operacion : IMPORTACIÓN / EXPORTACIÓN / TRÁNSITO ...
--  clave_documento: VF, VU, IN, A1 ... (clave del pedimento)
-- ────────────────────────────────────────────────────────
ALTER TABLE pedimentos
  ADD COLUMN tipo_operacion  VARCHAR(80)  NULL AFTER estado,
  ADD COLUMN clave_documento VARCHAR(10)  NULL AFTER tipo_operacion;

-- Marcar los registros de prueba existentes como importaciones
UPDATE pedimentos SET tipo_operacion = 'IMPORTACIÓN' WHERE id IN (1, 2, 3, 4);

-- ── 2. Movimientos (historial de situación del pedimento) ──
--  Cada vez que el pedimento cambia de estado SAT genera un
--  registro. Ejemplo: PAGADO → SELECCIÓN AUTOMATIZADA → DESADUANADO
-- ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedimentos_movimientos (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_pedimento INT UNSIGNED  NOT NULL,
  situacion    VARCHAR(100)  NOT NULL,
  detalle      VARCHAR(200)  NULL DEFAULT '',
  fecha        VARCHAR(30)   NULL,
  orden        SMALLINT      NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_movimiento_pedimento
    FOREIGN KEY (id_pedimento) REFERENCES pedimentos(id) ON DELETE CASCADE,
  INDEX idx_mov_pedimento (id_pedimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 3. Pedimento de ejemplo para la página de detalle ──
--  Acceso vía QR:
--  /SOIANET/oia_consultarapd_cep.aspx?pa=1656&dn=6001452&s=0&ap=2026&pad=190&ad=MEXICA&z=20B
-- ────────────────────────────────────────────────────────
INSERT INTO pedimentos
  (aduana, aduana_label, anio, patente, documento, estado,
   tipo_operacion, clave_documento,
   fecha, banco, secuencia, numero_operacion, factura, vin, contenedor)
VALUES
  ('190', 'MEXICALI, B.C.', '2026', '1656', '6001452', 'DESADUANADO',
   '1 IMPORTACIÓN', 'VF',
   '02/04/2026 08:40:26', 'BBVA BANCOMER', '0', '1', '1625400', NULL, NULL);

SET @id_nuevo = LAST_INSERT_ID();

INSERT INTO pedimentos_detalle
  (id_pedimento, banco, numero_operacion, importe, fecha_hora_pago, linea_captura, estado_linea_captura)
VALUES
  (@id_nuevo, 'BBVA BANCOMER', '1', '0.00', '2026-04-01 15:41:00', '', 'PAGO REGISTRADO EN SAAI');

INSERT INTO pedimentos_movimientos (id_pedimento, situacion, detalle, fecha, orden)
VALUES
  (@id_nuevo, 'PAGADO',                 '',                      '01/04/2026 15:41:00', 1),
  (@id_nuevo, 'SELECCIÓN AUTOMATIZADA', 'DESADUANAMIENTO LIBRE', '02/04/2026 08:40:26', 2),
  (@id_nuevo, 'DESADUANADO/CUMPLIDO',   'DESADUANADO',           '02/04/2026 08:40:26', 3),
  (@id_nuevo, 'DESADUANADO/CUMPLIDO',   'CUMPLIDO',              '02/04/2026 08:40:26', 4);
