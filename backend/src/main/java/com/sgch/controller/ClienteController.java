package com.sgch.controller;

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
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {
    private final ClienteService service;
    
    /**
     * Obtiene el listado completo de clientes.
     *
     * @return lista de todos los clientes registrados
     */
    @GetMapping
    public List<Cliente> getAll() {
        return service.findAll();
    }
    
    /**
     * Obtiene el detalle de un cliente específico por su identificador.
     *
     * @param id identificador UUID del cliente
     * @return el cliente correspondiente al identificador provisto
     */
    @GetMapping("/{id}")
    public Cliente getById(@PathVariable String id) {
        return service.findById(id);
    }
    
    /**
     * Crea y registra un nuevo cliente en el sistema.
     *
     * @param cliente datos validados del cliente a crear
     * @return el cliente creado con su identificador generado
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Cliente create(@Valid @RequestBody Cliente cliente) {
        return service.save(cliente);
    }
    
    /**
     * Actualiza los datos de un cliente existente.
     *
     * @param id identificador UUID del cliente a modificar
     * @param cliente datos actualizados y validados del cliente
     * @return el cliente con los cambios aplicados
     */
    @PutMapping("/{id}")
    public Cliente update(@PathVariable String id, @Valid @RequestBody Cliente cliente) {
        return service.update(id, cliente);
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
