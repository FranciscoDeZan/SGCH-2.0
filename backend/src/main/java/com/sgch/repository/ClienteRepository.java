package com.sgch.repository;

import com.sgch.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repositorio de acceso a datos para la entidad {@link Cliente}.
 * Provee operaciones CRUD estándar y consultas derivadas de Spring Data JPA.
 */
public interface ClienteRepository extends JpaRepository<Cliente, String> {

    /**
     * Verifica si existe un cliente registrado con el número de teléfono especificado.
     *
     * @param telefono número de teléfono a verificar
     * @return {@code true} si existe un cliente con dicho teléfono, {@code false} en caso contrario
     */
    boolean existsByTelefono(String telefono);

    /**
     * Busca un cliente a partir de su número de teléfono único.
     *
     * @param telefono número de teléfono del cliente
     * @return un {@link Optional} que contiene el cliente si fue encontrado, o vacío en caso contrario
     */
    Optional<Cliente> findByTelefono(String telefono);
}
