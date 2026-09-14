package com.sgch.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "clientes")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private String id;
    
    @NotBlank(message = "Nombre/Razón Social es obligatorio")
    @Size(max = 255, message = "El nombre o razón social no puede superar 255 caracteres")
    @Column(name = "nombre_razon_social", nullable = false)
    private String nombreRazonSocial;
    
    @NotBlank(message = "Teléfono es obligatorio")
    @Size(max = 50, message = "El teléfono no puede superar 50 caracteres")
    @Column(name = "telefono", nullable = false, unique = true, length = 50)
    private String telefono;
    
    @Email(message = "El formato de email no es válido")
    @Size(max = 255, message = "El email no puede superar 255 caracteres")
    private String email;
    
    @NotBlank(message = "Dirección es obligatoria")
    @Size(max = 255, message = "La dirección no puede superar 255 caracteres")
    @Column(name = "direccion", nullable = false)
    private String direccion;
    
    @Column(columnDefinition = "DECIMAL(10,8)")
    private Double latitud;
    
    @Column(columnDefinition = "DECIMAL(11,8)")
    private Double longitud;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "calificacion", length = 10)
    private CalificacionCliente calificacion;
    private String tipoHacienda;
    private String formasPagoPreferidas;
    
    @Column(columnDefinition = "TEXT")
    private String observaciones;
    
    private LocalDateTime fechaUltimaOperacion;
    private LocalDateTime fechaUltimoContacto;
}
