package com.sgch.service;

import com.sgch.exception.ResourceNotFoundException;
import com.sgch.model.Cliente;
import com.sgch.repository.ClienteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClienteServiceTest {

    @Mock
    private ClienteRepository repository;

    @InjectMocks
    private ClienteService service;

    private Cliente cliente;

    @BeforeEach
    void setUp() {
        cliente = new Cliente();
        cliente.setId("c-1");
        cliente.setNombreRazonSocial("Agropecuaria El Ceibo");
        cliente.setTelefono("3415551234");
        cliente.setEmail("contacto@elceibo.com");
        cliente.setDireccion("Ruta 9 Km 200");
    }

    @Test
    void testFindAll() {
        when(repository.findAll()).thenReturn(List.of(cliente));

        List<Cliente> result = service.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNombreRazonSocial()).isEqualTo("Agropecuaria El Ceibo");
        verify(repository, times(1)).findAll();
    }

    @Test
    void testFindByIdSuccess() {
        when(repository.findById("c-1")).thenReturn(Optional.of(cliente));

        Cliente result = service.findById("c-1");

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("c-1");
        verify(repository, times(1)).findById("c-1");
    }

    @Test
    void testFindByIdNotFoundThrowsException() {
        when(repository.findById("c-unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.findById("c-unknown"));
        verify(repository, times(1)).findById("c-unknown");
    }

    @Test
    void testSave() {
        when(repository.save(cliente)).thenReturn(cliente);

        Cliente result = service.save(cliente);

        assertThat(result).isNotNull();
        assertThat(cliente.getId()).isNull();
        verify(repository, times(1)).save(cliente);
    }

    @Test
    void testSaveForcesNullIdToPreventIdInjection() {
        Cliente inputWithId = new Cliente();
        inputWithId.setId("malicious-id-123");
        inputWithId.setNombreRazonSocial("Cliente Con Id");
        inputWithId.setTelefono("12345");
        inputWithId.setDireccion("Calle 1");

        when(repository.save(any(Cliente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Cliente result = service.save(inputWithId);

        assertThat(result.getId()).isNull();
        verify(repository, times(1)).save(inputWithId);
    }

    @Test
    void testUpdateSuccess() {
        when(repository.findById("c-1")).thenReturn(Optional.of(cliente));
        when(repository.save(any(Cliente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Cliente updatedData = new Cliente();
        updatedData.setNombreRazonSocial("Nuevo Nombre");
        updatedData.setTelefono("3419998888");
        updatedData.setEmail("nuevo@elceibo.com");
        updatedData.setDireccion("Nueva Direccion 123");
        updatedData.setLatitud(-32.95);
        updatedData.setLongitud(-60.65);
        updatedData.setCalificacion("A");
        updatedData.setTipoHacienda("Invernada");
        updatedData.setFormasPagoPreferidas("Cheque 30 dias");
        updatedData.setObservaciones("Cliente destacado");

        Cliente result = service.update("c-1", updatedData);

        assertThat(result.getNombreRazonSocial()).isEqualTo("Nuevo Nombre");
        assertThat(result.getTelefono()).isEqualTo("3419998888");
        assertThat(result.getEmail()).isEqualTo("nuevo@elceibo.com");
        assertThat(result.getDireccion()).isEqualTo("Nueva Direccion 123");
        assertThat(result.getLatitud()).isEqualTo(-32.95);
        assertThat(result.getLongitud()).isEqualTo(-60.65);
        assertThat(result.getCalificacion()).isEqualTo("A");
        assertThat(result.getTipoHacienda()).isEqualTo("Invernada");
        assertThat(result.getFormasPagoPreferidas()).isEqualTo("Cheque 30 dias");
        assertThat(result.getObservaciones()).isEqualTo("Cliente destacado");
        verify(repository, times(1)).save(cliente);
    }

    @Test
    void testUpdateNotFoundThrowsException() {
        when(repository.findById("c-unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.update("c-unknown", cliente));
        verify(repository, never()).save(any());
    }

    @Test
    void testDeleteSuccess() {
        when(repository.findById("c-1")).thenReturn(Optional.of(cliente));
        doNothing().when(repository).delete(cliente);

        service.delete("c-1");

        verify(repository, times(1)).delete(cliente);
    }

    @Test
    void testDeleteNotFoundThrowsException() {
        when(repository.findById("c-unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.delete("c-unknown"));
        verify(repository, never()).delete(any());
    }
}
