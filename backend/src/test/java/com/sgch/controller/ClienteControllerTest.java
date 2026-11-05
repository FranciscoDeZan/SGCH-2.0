package com.sgch.controller;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.sgch.dto.ClienteRequest;
import com.sgch.dto.ClienteResponse;
import com.sgch.mapper.ClienteMapper;
import com.sgch.model.CalificacionCliente;
import com.sgch.model.Cliente;
import com.sgch.model.CondicionFiscal;
import com.sgch.service.ClienteService;
import com.sgch.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Import(ClienteMapper.class)
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
        ClienteRequest req = new ClienteRequest(); 
        mockMvc.perform(post("/api/clientes").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(req)))
               .andExpect(status().isBadRequest())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
               .andExpect(jsonPath("$.status").value(400))
               .andExpect(jsonPath("$.title").value("Bad Request"))
               .andExpect(jsonPath("$.errores").exists());
    }

    @Test
    public void testCreateClienteExceedingLengthConstraintsReturnsValidationErrors() throws Exception {
        ClienteRequest req = new ClienteRequest();
        req.setNombreRazonSocial("A".repeat(256));
        req.setTelefono("1".repeat(51));
        req.setDireccion("D".repeat(256));

        mockMvc.perform(post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
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
        ClienteRequest req = new ClienteRequest();
        req.setNombreRazonSocial("A"); req.setTelefono("123"); req.setDireccion("A");
        mockMvc.perform(post("/api/clientes").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(req)))
               .andExpect(status().isConflict())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
               .andExpect(jsonPath("$.status").value(409))
               .andExpect(jsonPath("$.detail").value("Error de integridad de datos (ej. teléfono o CUIT duplicado)"));
    }

    @Test
    public void testDuplicateTelefonoReturnsSpecificConflictDetail() throws Exception {
        when(clienteService.save(any(Cliente.class)))
                .thenThrow(new DataIntegrityViolationException("Duplicate entry '3415551234' for key 'clientes.telefono'"));
        ClienteRequest req = new ClienteRequest();
        req.setNombreRazonSocial("A"); req.setTelefono("3415551234"); req.setDireccion("A");
        mockMvc.perform(post("/api/clientes").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(req)))
               .andExpect(status().isConflict())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
               .andExpect(jsonPath("$.status").value(409))
               .andExpect(jsonPath("$.detail").value("Ya existe un cliente registrado con ese teléfono"));
    }

    @Test
    public void testDuplicateCuitReturnsSpecificConflictDetail() throws Exception {
        when(clienteService.save(any(Cliente.class)))
                .thenThrow(new DataIntegrityViolationException("Duplicate entry '20301112224' for key 'clientes.uk_clientes_cuit'"));
        ClienteRequest req = new ClienteRequest();
        req.setNombreRazonSocial("A"); req.setTelefono("123"); req.setDireccion("A");
        mockMvc.perform(post("/api/clientes").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(req)))
               .andExpect(status().isConflict())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
               .andExpect(jsonPath("$.status").value(409))
               .andExpect(jsonPath("$.detail").value("Ya existe un cliente registrado con ese CUIT"));
    }

    @Test
    public void testForeignKeyViolationOnDeleteReturnsSpecificConflictDetail() throws Exception {
        doThrow(new DataIntegrityViolationException("Cannot delete or update a parent row: a foreign key constraint fails (fk_operaciones_comprador)"))
                .when(clienteService).delete("1");

        mockMvc.perform(delete("/api/v1/clientes/1"))
               .andExpect(status().isConflict())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
               .andExpect(jsonPath("$.status").value(409))
               .andExpect(jsonPath("$.detail").value("No se puede completar la operación porque el registro tiene datos asociados"));
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
        ClienteRequest req = new ClienteRequest();
        req.setNombreRazonSocial("Juan Perez");
        req.setTelefono("11223344");
        req.setDireccion("Calle Falsa 123");

        Cliente saved = new Cliente();
        saved.setId("uuid-1");
        saved.setNombreRazonSocial("Juan Perez");
        saved.setTelefono("11223344");
        saved.setDireccion("Calle Falsa 123");

        when(clienteService.save(any(Cliente.class))).thenReturn(saved);

        mockMvc.perform(post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value("uuid-1"))
               .andExpect(jsonPath("$.nombreRazonSocial").value("Juan Perez"));
    }

    @Test
    public void testUpdateClienteSuccess() throws Exception {
        ClienteRequest req = new ClienteRequest();
        req.setNombreRazonSocial("Juan Actualizado");
        req.setTelefono("11223344");
        req.setDireccion("Nueva Calle 456");

        Cliente updated = new Cliente();
        updated.setId("1");
        updated.setNombreRazonSocial("Juan Actualizado");
        updated.setTelefono("11223344");
        updated.setDireccion("Nueva Calle 456");

        when(clienteService.update(eq("1"), any(Cliente.class))).thenReturn(updated);

        mockMvc.perform(put("/api/clientes/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
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

    @Test
    public void testCreateClienteWithBigDecimalCoordinatesSuccess() throws Exception {
        ClienteRequest req = new ClienteRequest();
        req.setNombreRazonSocial("Agropecuaria El Ceibo");
        req.setTelefono("3415556677");
        req.setDireccion("Ruta 34 Km 120");
        req.setLatitud(new BigDecimal("-31.63332940"));
        req.setLongitud(new BigDecimal("-60.70000080"));

        Cliente saved = new Cliente();
        saved.setId("uuid-coords");
        saved.setNombreRazonSocial("Agropecuaria El Ceibo");
        saved.setTelefono("3415556677");
        saved.setDireccion("Ruta 34 Km 120");
        saved.setLatitud(new BigDecimal("-31.63332940"));
        saved.setLongitud(new BigDecimal("-60.70000080"));

        when(clienteService.save(any(Cliente.class))).thenReturn(saved);

        mockMvc.perform(post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value("uuid-coords"))
               .andExpect(jsonPath("$.latitud").value(-31.63332940))
               .andExpect(jsonPath("$.longitud").value(-60.70000080));
    }

    @Test
    public void testListClientesV1Path() throws Exception {
        Cliente c = new Cliente();
        c.setId("1");
        c.setNombreRazonSocial("Test V1");
        when(clienteService.findAll()).thenReturn(Collections.singletonList(c));

        mockMvc.perform(get("/api/v1/clientes").accept(MediaType.APPLICATION_JSON))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].nombreRazonSocial").value("Test V1"));
    }

    @Test
    public void testCreateClienteV1Path() throws Exception {
        ClienteRequest req = new ClienteRequest();
        req.setNombreRazonSocial("Juan Perez V1");
        req.setTelefono("11223344");
        req.setDireccion("Calle Falsa 123");

        Cliente saved = new Cliente();
        saved.setId("uuid-v1");
        saved.setNombreRazonSocial("Juan Perez V1");
        saved.setTelefono("11223344");
        saved.setDireccion("Calle Falsa 123");

        when(clienteService.save(any(Cliente.class))).thenReturn(saved);

        mockMvc.perform(post("/api/v1/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value("uuid-v1"))
               .andExpect(jsonPath("$.nombreRazonSocial").value("Juan Perez V1"));
    }

    @Test
    public void testGetClienteByIdV1PathNotFound() throws Exception {
        when(clienteService.findById("99")).thenThrow(new ResourceNotFoundException("No existe"));

        mockMvc.perform(get("/api/v1/clientes/99"))
               .andExpect(status().isNotFound())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
               .andExpect(jsonPath("$.status").value(404))
               .andExpect(jsonPath("$.detail").value("No existe"));
    }

    @Test
    public void testCreateClienteSinCondicionFiscalEnJson_delegaEnService() throws Exception {
        String jsonWithoutCondicionFiscal = """
                {
                    "nombreRazonSocial": "Juan Sin Condicion",
                    "telefono": "11223344",
                    "direccion": "Calle Falsa 123"
                }
                """;

        Cliente saved = new Cliente();
        saved.setId("uuid-no-cond");
        saved.setNombreRazonSocial("Juan Sin Condicion");
        saved.setTelefono("11223344");
        saved.setDireccion("Calle Falsa 123");

        when(clienteService.save(any(Cliente.class))).thenReturn(saved);

        mockMvc.perform(post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonWithoutCondicionFiscal))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value("uuid-no-cond"))
               .andExpect(jsonPath("$.nombreRazonSocial").value("Juan Sin Condicion"));

        ArgumentCaptor<Cliente> captor = ArgumentCaptor.forClass(Cliente.class);
        verify(clienteService, times(1)).save(captor.capture());
        assertThat(captor.getValue().getNombreRazonSocial()).isEqualTo("Juan Sin Condicion");
    }

    @Test
    public void testJsonContractIsomorphismBetweenEntityAndResponse() throws Exception {
        Cliente cliente = new Cliente();
        cliente.setId("uuid-iso-1");
        cliente.setNombreRazonSocial("Agropecuaria San Carlos S.A.");
        cliente.setCuit("30712345678");
        cliente.setCondicionFiscal(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        cliente.setTelefono("3415559988");
        cliente.setEmail("contacto@sancarlos.com.ar");
        cliente.setDireccion("Ruta 9 Km 280");
        cliente.setLatitud(new BigDecimal("-32.95123456"));
        cliente.setLongitud(new BigDecimal("-60.66123456"));
        cliente.setCalificacion(CalificacionCliente.A);
        cliente.setTipoHacienda("Invernada y Cria");
        cliente.setFormasPagoPreferidas("Valores 30/60 dias");
        cliente.setObservaciones("Cliente preferencial con calificacion crediticia impecable");
        cliente.setFechaUltimaOperacion(LocalDateTime.of(2026, 11, 1, 10, 30, 0));
        cliente.setFechaUltimoContacto(LocalDateTime.of(2026, 11, 2, 16, 45, 0));

        when(clienteService.save(any(Cliente.class))).thenReturn(cliente);

        String rawJson = """
                {
                    "nombreRazonSocial": "Agropecuaria San Carlos S.A.",
                    "cuit": "30712345678",
                    "condicionFiscal": "RESPONSABLE_INSCRIPTO",
                    "telefono": "3415559988",
                    "email": "contacto@sancarlos.com.ar",
                    "direccion": "Ruta 9 Km 280",
                    "latitud": -32.95123456,
                    "longitud": -60.66123456,
                    "calificacion": "A",
                    "tipoHacienda": "Invernada y Cria",
                    "formasPagoPreferidas": "Valores 30/60 dias",
                    "observaciones": "Cliente preferencial con calificacion crediticia impecable",
                    "fechaUltimaOperacion": "2026-11-01T10:30:00",
                    "fechaUltimoContacto": "2026-11-02T16:45:00"
                }
                """;

        MvcResult result = mockMvc.perform(post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(rawJson))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        JsonNode expectedEntityNode = objectMapper.readTree(objectMapper.writeValueAsString(cliente));

        assertThat(responseNode).isEqualTo(expectedEntityNode);
        assertThat(responseNode.size()).isEqualTo(15);
    }

    @Test
    public void testCreateClienteWithInvalidCuitReturnsBadRequest() throws Exception {
        String invalidCuitJson = """
                {
                    "nombreRazonSocial": "Cliente Cuit Invalido",
                    "telefono": "11223344",
                    "direccion": "Calle Falsa 123",
                    "cuit": "12345"
                }
                """;

        mockMvc.perform(post("/api/v1/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidCuitJson))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errores.cuit").value("El CUIT debe tener 11 dígitos"));
    }
}

