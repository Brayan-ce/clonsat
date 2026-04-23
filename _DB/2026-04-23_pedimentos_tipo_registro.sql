USE clonsat;

ALTER TABLE pedimentos
  ADD COLUMN tipo_registro ENUM('pedimento','vin','contenedor','qr') NULL AFTER contenedor;

UPDATE pedimentos
SET tipo_registro = 'vin'
WHERE id > 0
  AND vin IS NOT NULL
  AND TRIM(vin) <> '';

UPDATE pedimentos
SET tipo_registro = 'contenedor'
WHERE id > 0
  AND (vin IS NULL OR TRIM(vin) = '')
  AND contenedor IS NOT NULL
  AND TRIM(contenedor) <> '';

UPDATE pedimentos p
SET p.tipo_registro = 'qr'
WHERE p.id > 0
  AND (p.vin IS NULL OR TRIM(p.vin) = '')
  AND (p.contenedor IS NULL OR TRIM(p.contenedor) = '')
  AND EXISTS (
    SELECT 1
    FROM pedimentos_movimientos m
    WHERE m.id_pedimento = p.id
  );

UPDATE pedimentos
SET tipo_registro = 'pedimento'
WHERE id > 0
  AND tipo_registro IS NULL;

ALTER TABLE pedimentos
  MODIFY COLUMN tipo_registro ENUM('pedimento','vin','contenedor','qr') NOT NULL DEFAULT 'pedimento';

ALTER TABLE pedimentos
  ADD INDEX idx_pedimentos_tipo_registro (tipo_registro);
