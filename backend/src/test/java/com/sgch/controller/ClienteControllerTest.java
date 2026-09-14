package com.sgch.controller;

import tools.jackson.databind.ObjectMapper;
import com.sgch.model.Cliente;
import com.sgch.service.ClienteService;
import com.sgch.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClienteController.class)
public class ClienteControllerTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockitoBean private ClienteService clienteService;

    @Test
    public void testGetAllClientes() throws Exception {
        Cliente c = new Cliente();
        c.setId("1");
        c.setNombreRazonSocial("Test");
        when(clienteService.findAll()).thenReturn(Collections.singletonList(c));
        mockMvc.perform(get("/api/clientes").accept(MediaType.APPLICATION_JSON))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].nombreRazonSocial").value("Test"));
    }

    @Test
    public void testCreateClienteInvalidReturnsProblemDetail() throws Exception {
        Cliente c = new Cliente(); 
        mockMvc.perform(post("/api/clientes").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(c)))
               .andExpect(status().isBadRequest())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
               .andExpect(jsonPath("$.status").value(400))
               .andExpect(jsonPath("$.title").value("Bad Request"))
               .andExpect(jsonPath("$.errores").exists());
    }

    @Test
    public void testCreateClienteExceedingLengthConstraintsReturnsValidationErrors() throws Exception {
        Cliente c = new Cliente();
        c.setNombreRazonSocial("A".repeat(256));
        c.setTelefono("1".repeat(51));
        c.setDireccion("D".repeat(256));

        mockMvc.perform(post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(c)))
               .andExpect(status().isBadRequest())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
               .andExpect(jsonPath("$.status").value(400))
               .andExpect(jsonPath("$.errores.nombreRazonSocial").value("El nombre o razón social no puede superar 255 caracteres"))
               .andExpect(jsonPath("$.errores.telefono").value("El teléfono no puede superar 50 caracteres"))
               .andExpect(jsonPath("$.errores.direccion").value("La dirección no puede superar 255 caracteres"));
    }

    @Test
    public void testNotFoundReturnsProblemDetail() throws Exception {
        when(clienteService.findById("99")).thenThrow(new ResourceNotFoundException("No existe"));
        mockMvc.perform(get("/api/clientes/99"))
               .andExpect(status().isNotFound())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
               .andExpect(jsonPath("$.status").value(404))
               .andExpect(jsonPath("$.detail").value("No existe"));
    }

    @Test
    public void testUniqueConflictReturnsProblemDetail() throws Exception {
        when(clienteService.save(any(Cliente.class))).thenThrow(new DataIntegrityViolationException("Conflict"));
        Cliente c = new Cliente();
        c.setNombreRazonSocial("A"); c.setTelefono("123"); c.setDireccion("A");
        mockMvc.perform(post("/api/clientes").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(c)))
               .andExpect(status().isConflict())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
               .andExpect(jsonPath("$.status").value(409))
               .andExpect(jsonPath("$.detail").value("Error de integridad de datos (ej. teléfono duplicado)"));
    }

    @Test
    public void testGetClienteByIdSuccess() throws Exception {
        Cliente c = new Cliente();
        c.setId("1");
        c.setNombreRazonSocial("Juan Perez");
        c.setTelefono("11223344");
        c.setDireccion("Calle Falsa 123");
        when(clienteService.findById("1")).thenReturn(c);

        mockMvc.perform(get("/api/clientes/1").accept(MediaType.APPLICATION_JSON))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value("1"))
               .andExpect(jsonPath("$.nombreRazonSocial").value("Juan Perez"));
    }

    @Test
    public void testCreateClienteSuccess() throws Exception {
        Cliente c = new Cliente();
        c.setNombreRazonSocial("Juan Perez");
        c.setTelefono("11223344");
        c.setDireccion("Calle Falsa 123");

        Cliente saved = new Cliente();
        saved.setId("uuid-1");
        saved.setNombreRazonSocial("Juan Perez");
        saved.setTelefono("11223344");
        saved.setDireccion("Calle Falsa 123");

        when(clienteService.save(any(Cliente.class))).thenReturn(saved);

        mockMvc.perform(post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(c)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value("uuid-1"))
               .andExpect(jsonPath("$.nombreRazonSocial").value("Juan Perez"));
    }

    @Test
    public void testUpdateClienteSuccess() throws Exception {
        Cliente c = new Cliente();
        c.setNombreRazonSocial("Juan Actualizado");
        c.setTelefono("11223344");
        c.setDireccion("Nueva Calle 456");

        Cliente updated = new Cliente();
        updated.setId("1");
        updated.setNombreRazonSocial("Juan Actualizado");
        updated.setTelefono("11223344");
        updated.setDireccion("Nueva Calle 456");

        when(clienteService.update(eq("1"), any(Cliente.class))).thenReturn(updated);

        mockMvc.perform(put("/api/clientes/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(c)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value("1"))
               .andExpect(jsonPath("$.nombreRazonSocial").value("Juan Actualizado"));
    }

    @Test
    public void testDeleteClienteSuccess() throws Exception {
        mockMvc.perform(delete("/api/clientes/1"))
               .andExpect(status().isNoContent());
        verify(clienteService, times(1)).delete("1");
    }
}

