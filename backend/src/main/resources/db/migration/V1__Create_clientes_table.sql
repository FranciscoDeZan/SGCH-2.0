CREATE TABLE clientes (
    id VARCHAR(36) PRIMARY KEY,
    nombre_razon_social VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255),
    direccion VARCHAR(255) NOT NULL,
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    calificacion VARCHAR(10),
    tipo_hacienda VARCHAR(255),
    formas_pago_preferidas VARCHAR(255),
    observaciones TEXT,
    fecha_ultima_operacion DATETIME,
    fecha_ultimo_contacto DATETIME
);
