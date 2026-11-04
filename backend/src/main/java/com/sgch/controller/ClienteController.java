package com.sgch.controller;

import com.sgch.dto.ClienteRequest;
import com.sgch.dto.ClienteResponse;
import com.sgch.mapper.ClienteMapper;
import com.sgch.model.Cliente;
import com.sgch.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión integral de clientes.
 * Provee endpoints CRUD para consultar, crear, actualizar y eliminar clientes.
 */
@RestController
@RequestMapping({"/api/clientes", "/api/v1/clientes"})
@RequiredArgsConstructor
public class ClienteController {
    private final ClienteService service;
    private final ClienteMapper mapper;

    /**
     * Obtiene el listado completo de clientes.
     *
     * @return lista de todos los clientes registrados como DTOs de respuesta
     */
    @GetMapping
    public List<ClienteResponse> getAll() {
        return service.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Obtiene el detalle de un cliente específico por su identificador.
     *
     * @param id identificador UUID del cliente
     * @return el cliente correspondiente al identificador provisto como DTO de respuesta
     */
    @GetMapping("/{id}")
    public ClienteResponse getById(@PathVariable String id) {
        return mapper.toResponse(service.findById(id));
    }

    /**
     * Crea y registra un nuevo cliente en el sistema.
     *
     * @param request datos validados del cliente a crear
     * @return el cliente creado con su identificador generado como DTO de respuesta
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteResponse create(@Valid @RequestBody ClienteRequest request) {
        Cliente cliente = mapper.toEntity(request);
        Cliente saved = service.save(cliente);
        return mapper.toResponse(saved);
    }

    /**
     * Actualiza los datos de un cliente existente.
     *
     * @param id identificador UUID del cliente a modificar
     * @param request datos actualizados y validados del cliente
     * @return el cliente con los cambios aplicados como DTO de respuesta
     */
    @PutMapping("/{id}")
    public ClienteResponse update(@PathVariable String id, @Valid @RequestBody ClienteRequest request) {
        Cliente cliente = mapper.toEntity(request);
        Cliente updated = service.update(id, cliente);
        return mapper.toResponse(updated);
    }

    /**
     * Elimina un cliente del sistema.
     *
     * @param id identificador UUID del cliente a eliminar
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
