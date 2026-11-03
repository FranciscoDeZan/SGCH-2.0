package com.sgch.controller;

import com.sgch.dto.CobroRequest;
import com.sgch.dto.CobroResponse;
import com.sgch.exception.ResourceNotFoundException;
import com.sgch.model.MedioPago;
import com.sgch.model.TipoMovimientoCobro;
import com.sgch.service.CobroService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CobroController.class)
public class CobroControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CobroService cobroService;

    private CobroRequest requestBase;

    @BeforeEach
    void setUp() {
        requestBase = new CobroRequest();
        requestBase.setOperacionId("op-1");
        requestBase.setClienteId("cli-1");
        requestBase.setCuotaId("cuota-1");
        requestBase.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMPRADOR);
        requestBase.setFechaMovimiento(LocalDate.of(2026, 11, 3));
        requestBase.setMonto(new BigDecimal("500000.00"));
        requestBase.setMedioPago(MedioPago.TRANSFERENCIA);
        requestBase.setDocumentado(true);
    }

    private CobroResponse crearResponseDummy(String id) {
        return new CobroResponse(
                id,
                "op-1",
                "cuota-1",
                1,
                "cli-1",
                "Cliente Uno",
                TipoMovimientoCobro.COBRO_COMPRADOR,
                LocalDate.of(2026, 11, 3),
                new BigDecimal("500000.00"),
                MedioPago.TRANSFERENCIA,
                true,
                "Pago cuota 1"
        );
    }

    @Test
    void test09_postCobroValido_retorna201CreatedYCobroResponse() throws Exception {
        CobroResponse response = crearResponseDummy("cobro-1");
        when(cobroService.create(any(CobroRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/cobros")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBase)))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value("cobro-1"))
                .andExpect(jsonPath("$.operacionId").value("op-1"))
                .andExpect(jsonPath("$.monto").value(500000.00));

        verify(cobroService).create(any(CobroRequest.class));
    }

    @Test
    void test10_postCobroSinOperacionIdOSinMedioPago_retorna400ProblemDetail() throws Exception {
        requestBase.setOperacionId(null);
        requestBase.setMedioPago(null);

        mockMvc.perform(post("/api/v1/cobros")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBase)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Bad Request"))
                .andExpect(jsonPath("$.errores.operacionId").exists())
                .andExpect(jsonPath("$.errores.medioPago").exists());
    }

    @Test
    void test11_postCobroConMontoInvalido_retorna400ProblemDetail() throws Exception {
        requestBase.setMonto(new BigDecimal("-50.00"));

        mockMvc.perform(post("/api/v1/cobros")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBase)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errores.monto").exists());
    }

    @Test
    void test12_getCobrosPorOperacionId_retorna200OKYLista() throws Exception {
        CobroResponse r1 = crearResponseDummy("c1");
        when(cobroService.findByOperacionId("op-1")).thenReturn(List.of(r1));

        mockMvc.perform(get("/api/v1/cobros")
                        .param("operacionId", "op-1")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value("c1"));
    }

    @Test
    void test13_getCobroPorIdInexistente_retorna404ProblemDetail() throws Exception {
        when(cobroService.findById("no-existe"))
                .thenThrow(new ResourceNotFoundException("Cobro no encontrado con id: no-existe"));

        mockMvc.perform(get("/api/v1/cobros/no-existe")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.detail").value("Cobro no encontrado con id: no-existe"));
    }

    @Test
    void test14_getCobroPorIdExistente_retorna200OK() throws Exception {
        CobroResponse response = crearResponseDummy("c200");
        when(cobroService.findById("c200")).thenReturn(response);

        mockMvc.perform(get("/api/v1/cobros/c200")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value("c200"));
    }

    @Test
    void test15_postCobroLanzaIllegalArgumentException_retorna400ProblemDetail() throws Exception {
        when(cobroService.create(any(CobroRequest.class)))
                .thenThrow(new IllegalArgumentException("La cuota no pertenece a la operacion indicada"));

        mockMvc.perform(post("/api/v1/cobros")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBase)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detail").value("La cuota no pertenece a la operacion indicada"));
    }
}
