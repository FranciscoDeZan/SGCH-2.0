package com.sgch.service;

import com.sgch.exception.ResourceNotFoundException;
import com.sgch.model.Cliente;
import com.sgch.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio de lógica de negocio para la gestión de clientes (compradores y vendedores).
 * Maneja las transacciones y operaciones CRUD para la entidad {@link Cliente}.
 */
@Service
@RequiredArgsConstructor
public class ClienteService {
    private final ClienteRepository repository;
    
    /**
     * Recupera todos los clientes registrados en el sistema.
     *
     * @return lista con todos los clientes
     */
    @Transactional(readOnly = true)
    public List<Cliente> findAll() {
        return repository.findAll();
    }
    
    /**
     * Busca un cliente por su identificador único.
     *
     * @param id identificador UUID del cliente
     * @return el cliente encontrado
     * @throws ResourceNotFoundException si no existe un cliente con el identificador provisto
     */
    @Transactional(readOnly = true)
    public Cliente findById(String id) { 
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado")); 
    }
    
    /**
     * Registra un nuevo cliente en el sistema.
     * Para prevenir la inyección forzada de identificador en creación,
     * se asegura de que el id sea nulo antes de persistir.
     *
     * @param cliente datos del cliente a registrar
     * @return el cliente persistido con su identificador generado
     */
    @Transactional
    public Cliente save(Cliente cliente) {
        cliente.setId(null);
        return repository.save(cliente);
    }
    
    /**
     * Actualiza los datos de un cliente existente.
     *
     * @param id identificador UUID del cliente a actualizar
     * @param source datos actualizados del cliente
     * @return el cliente actualizado y persistido
     * @throws ResourceNotFoundException si no existe el cliente a actualizar
     */
    @Transactional
    public Cliente update(String id, Cliente source) {
        Cliente target = findById(id);
        // TODO(Iteración 2): Resolver copia de campos con DTOs y evitar merge completo.
        target.setNombreRazonSocial(source.getNombreRazonSocial());
        target.setTelefono(source.getTelefono());
        target.setEmail(source.getEmail());
        target.setDireccion(source.getDireccion());
        target.setLatitud(source.getLatitud());
        target.setLongitud(source.getLongitud());
        target.setCalificacion(source.getCalificacion());
        target.setTipoHacienda(source.getTipoHacienda());
        target.setFormasPagoPreferidas(source.getFormasPagoPreferidas());
        target.setObservaciones(source.getObservaciones());
        return repository.save(target);
    }
    
    /**
     * Elimina un cliente existente por su identificador.
     *
     * @param id identificador UUID del cliente a eliminar
     * @throws ResourceNotFoundException si no existe el cliente a eliminar
     */
    @Transactional
    public void delete(String id) { 
        Cliente target = findById(id);
        repository.delete(target); 
    }
}
