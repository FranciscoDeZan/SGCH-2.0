package com.sgch.controller;

import com.sgch.dto.CalculoResultado;
import com.sgch.dto.OperacionRequest;
import com.sgch.dto.OperacionResponse;
import com.sgch.exception.ResourceNotFoundException;
import com.sgch.model.CategoriaOperacion;
import com.sgch.model.CondicionFiscal;
import com.sgch.model.EstadoLiquidacion;
import com.sgch.model.ModalidadCircuito;
import com.sgch.model.ModalidadPrecio;
import com.sgch.service.OperacionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OperacionController.class)
public class OperacionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private OperacionService operacionService;

    private OperacionRequest requestBase;

    @BeforeEach
    void setUp() {
        requestBase = new OperacionRequest();
        requestBase.setFechaOperacion(LocalDateTime.now().minusDays(1));
        requestBase.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        requestBase.setCompradorId("comp-1");
        requestBase.setVendedorId("vend-1");
        requestBase.setCategoria(CategoriaOperacion.INVERNADA);
        requestBase.setKgNeto(new BigDecimal("10000.00"));
        requestBase.setPrecioKgFacturado(new BigDecimal("2000.00"));
        requestBase.setModalidadPrecio(ModalidadPrecio.NETO);
        requestBase.setFormaPago("Cheque");
        requestBase.setPlazo("30/60/90");
    }

    private OperacionResponse crearResponseDummy(String id) {
        CalculoResultado calculo = new CalculoResultado(
                new BigDecimal("20000000.00"),
                new BigDecimal("400000.00"),
                new BigDecimal("400000.00"),
                new BigDecimal("2100000.00"),
                new BigDecimal("84000.00"),
                new BigDecimal("84000.00"),
                null,
                new BigDecimal("22100000.00"),
                new BigDecimal("968000.00"),
                new BigDecimal("484000.00"),
                BigDecimal.ZERO
        );

        return new OperacionResponse(
                id,
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now().minusDays(1),
                ModalidadCircuito.DIRECTO,
                null,
                "comp-1",
                "Comprador Uno",
                "vend-1",
                "Vendedor Uno",
                CategoriaOperacion.INVERNADA,
                null,
                new BigDecimal("10000.00"),
                null,
                null,
                null,
                new BigDecimal("2000.00"),
                null,
                ModalidadPrecio.NETO,
                false,
                new BigDecimal("2.00"),
                new BigDecimal("2.00"),
                null,
                CondicionFiscal.RESPONSABLE_INSCRIPTO,
                new BigDecimal("100.00"),
                new BigDecimal("100.00"),
                new BigDecimal("100.00"),
                null,
                null,
                null,
                true,
                null,
                null,
                null,
                null,
                EstadoLiquidacion.PENDIENTE,
                "Cheque",
                "30/60/90",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                Collections.emptyList(),
                calculo
        );
    }

    @Test
    void test01_postOperacionValida_retorna201CreatedYResponseConCalculo() throws Exception {
        OperacionResponse response = crearResponseDummy("op-100");
        when(operacionService.create(any(OperacionRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/operaciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBase)))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value("op-100"))
                .andExpect(jsonPath("$.compradorId").value("comp-1"))
                .andExpect(jsonPath("$.estadoLiquidacion").value("PENDIENTE"))
                .andExpect(jsonPath("$.calculo.saldoComisionFirma").value(968000.00))
                .andExpect(jsonPath("$.calculo.totalACobrarComprador").value(484000.00));

        verify(operacionService).create(any(OperacionRequest.class));
    }

    @Test
    void test02_postOperacionInvalida_kgNetoNull_retorna400ProblemDetail() throws Exception {
        requestBase.setKgNeto(null);

        mockMvc.perform(post("/api/v1/operaciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBase)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Bad Request"))
                .andExpect(jsonPath("$.errores.kgNeto").exists());
    }

    @Test
    void test03_postOperacionInvalida_porcentajeDesbasteFueraDeRango_retorna400ProblemDetail() throws Exception {
        requestBase.setPorcentajeDesbaste(new BigDecimal("15.01"));

        mockMvc.perform(post("/api/v1/operaciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBase)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errores.porcentajeDesbaste").exists());
    }

    @Test
    void test04_postOperacionLanzaIllegalArgumentException_retorna400ProblemDetail() throws Exception {
        when(operacionService.create(any(OperacionRequest.class)))
                .thenThrow(new IllegalArgumentException("La consignataria externa es obligatoria para el circuito CONSIGNATARIA_EXTERNA"));

        mockMvc.perform(post("/api/v1/operaciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBase)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detail").value("La consignataria externa es obligatoria para el circuito CONSIGNATARIA_EXTERNA"));
    }

    @Test
    void test05_getOperacionPorIdExistente_retorna200OK() throws Exception {
        OperacionResponse response = crearResponseDummy("op-200");
        when(operacionService.findById("op-200")).thenReturn(response);

        mockMvc.perform(get("/api/v1/operaciones/op-200")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value("op-200"))
                .andExpect(jsonPath("$.calculo.saldoHaciendaEntrePartes").value(22100000.00));
    }

    @Test
    void test06_getOperacionPorIdInexistente_retorna404ProblemDetail() throws Exception {
        when(operacionService.findById("no-existe"))
                .thenThrow(new ResourceNotFoundException("Operacion no encontrada con id: no-existe"));

        mockMvc.perform(get("/api/v1/operaciones/no-existe")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.detail").value("Operacion no encontrada con id: no-existe"));
    }

    @Test
    void test07_getOperacionesConFiltros_retorna200OKYLista() throws Exception {
        OperacionResponse op1 = crearResponseDummy("op-1");
        when(operacionService.findAll(eq(ModalidadCircuito.DIRECTO), eq("comp-1"), eq(EstadoLiquidacion.PENDIENTE), any(), any()))
                .thenReturn(List.of(op1));

        mockMvc.perform(get("/api/v1/operaciones")
                        .param("circuito", "DIRECTO")
                        .param("clienteId", "comp-1")
                        .param("estado", "PENDIENTE")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value("op-1"));
    }

    @Test
    void test08_putOperacionValida_retorna200OKYResponseActualizado() throws Exception {
        OperacionResponse response = crearResponseDummy("op-300");
        when(operacionService.update(eq("op-300"), any(OperacionRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/operaciones/op-300")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBase)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("op-300"));

        verify(operacionService).update(eq("op-300"), any(OperacionRequest.class));
    }
}
