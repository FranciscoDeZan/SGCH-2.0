# Iteración 1: Fundamentos (Setup + CRUD Clientes) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inicializar los repositorios del backend (Spring Boot) y frontend (Vite/React), configurar la base de datos (MySQL + Flyway), e implementar el CRUD completo de Clientes (con TDD en BD real, ProblemDetail y Vite Tests).

**Architecture:** Backend Java 17 exponiendo API REST, conectado a MySQL 8. Frontend React consultando dicha API. Todo conviviendo en carpetas separadas (`backend/` y `frontend/`) dentro del monorepo.

**Tech Stack:** Java 17, Spring Boot 3, Spring Data JPA, Flyway, MySQL 8, Testcontainers, React 18, Vite, Vitest, TypeScript, TailwindCSS v3.

**Spec:** [docs/superpowers/specs/2026-09-13-sgch-v2-design.md](file:///C:/Users/frans/Desktop/SGCH%202.0/docs/superpowers/specs/2026-09-13-sgch-v2-design.md)

## Global Constraints

- Backend va en la subcarpeta `backend/`.
- Frontend va en la subcarpeta `frontend/`.
- Usar Java 17.
- Manejo de Errores estrictamente con `ProblemDetail` (RFC 7807).

---

### Task 1: Infraestructura y Scaffolding Backend

**Files:**
- Create: `.gitignore`
- Create: `docker-compose.yml`
- Create: `README.md`
- Create: `.env.example`
- Create: `backend/pom.xml`
- Create: `backend/src/main/resources/application.yml`
- Create: `backend/src/main/java/com/sgch/SgchApplication.java`

- [x] **Step 1: Crear config de infraestructura**
```gitignore
# .gitignore
backend/target/
frontend/node_modules/
frontend/dist/
.idea/
.vscode/
*.log
.env
```
```yaml
# docker-compose.yml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: sgch_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10
volumes:
  mysql_data:
```
```markdown
# README.md
# SGCH v2
## Requisitos
- Java 17, Node.js 20+, Docker
## Cómo levantar
1. Base de datos: `docker compose up -d`
2. Backend: `cd backend && mvn spring-boot:run`
3. Frontend: `cd frontend && npm run dev`
```
```env
# .env.example
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
```

- [x] **Step 2: Crear pom.xml**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.2.4</version>
		<relativePath/>
	</parent>
	<groupId>com.sgch</groupId>
	<artifactId>backend</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<properties>
		<java.version>17</java.version>
	</properties>
	<dependencies>
		<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
		<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
		<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
		<dependency><groupId>org.flywaydb</groupId><artifactId>flyway-core</artifactId></dependency>
		<dependency><groupId>org.flywaydb</groupId><artifactId>flyway-mysql</artifactId></dependency>
		<dependency><groupId>com.mysql</groupId><artifactId>mysql-connector-j</artifactId><scope>runtime</scope></dependency>
		<dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
		<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
		<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-testcontainers</artifactId><scope>test</scope></dependency>
		<dependency><groupId>org.testcontainers</groupId><artifactId>junit-jupiter</artifactId><scope>test</scope></dependency>
		<dependency><groupId>org.testcontainers</groupId><artifactId>mysql</artifactId><scope>test</scope></dependency>
	</dependencies>
</project>
```

- [x] **Step 3: Crear application.yml**
```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:3306/sgch_db?createDatabaseIfNotExist=true&useSSL=false
    username: ${DB_USER:root}
    password: ${DB_PASSWORD:root}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  flyway:
    enabled: true
    baseline-on-migrate: true
server:
  port: 8080
```

- [x] **Step 4: Crear Main class y verificar compilación**
```java
package com.sgch;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SgchApplication {
    public static void main(String[] args) {
        SpringApplication.run(SgchApplication.class, args);
    }
}
```

- [x] **Step 5: Commit**
```bash
git add .gitignore docker-compose.yml README.md .env.example backend/pom.xml backend/src
git commit -m "chore: scaffold infra, testcontainers and spring boot"
```

---

### Task 2: Modelo, Migración y Test de Integración JPA (BD Real)

**Files:**
- Create: `backend/src/main/resources/db/migration/V1__Create_clientes_table.sql`
- Create: `backend/src/main/java/com/sgch/model/Cliente.java`
- Create: `backend/src/main/java/com/sgch/repository/ClienteRepository.java`
- Create: `backend/src/test/java/com/sgch/repository/ClienteRepositoryTest.java`

- [x] **Step 1: Crear migración Flyway**
```sql
CREATE TABLE clientes (
    id VARCHAR(36) PRIMARY KEY,
    nombre_razon_social VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255),
    direccion VARCHAR(255) NOT NULL,
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    calificacion VARCHAR(10),
    tipo_hacienda VARCHAR(255),
    formas_pago_preferidas VARCHAR(255),
    observaciones TEXT,
    fecha_ultima_operacion DATETIME,
    fecha_ultimo_contacto DATETIME
);
```

- [x] **Step 2: Crear Entidad y Repositorio**
```java
// Cliente.java
package com.sgch.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "clientes")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @NotBlank(message = "Nombre/Razón Social es obligatorio")
    private String nombreRazonSocial;
    
    @NotBlank(message = "Teléfono es obligatorio")
    private String telefono;
    
    private String email;
    
    @NotBlank(message = "Dirección es obligatoria")
    private String direccion;
    
    private Double latitud;
    private Double longitud;
    private String calificacion;
    private String tipoHacienda;
    private String formasPagoPreferidas;
    private String observaciones;
    private LocalDateTime fechaUltimaOperacion;
    private LocalDateTime fechaUltimoContacto;
}

// ClienteRepository.java
package com.sgch.repository;
import com.sgch.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, String> {}
```

- [x] **Step 3: Test de Integración (Verifica UUID y Constraint UNIQUE)**
```java
package com.sgch.repository;
import com.sgch.model.Cliente;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(FlywayAutoConfiguration.class)
public class ClienteRepositoryTest {

    @Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");

    @Autowired
    private ClienteRepository repository;

    @Test
    void testSaveAssignsUUIDAndPersists() {
        Cliente c = new Cliente();
        c.setNombreRazonSocial("Test");
        c.setTelefono("12345");
        c.setDireccion("Dir");
        
        Cliente saved = repository.saveAndFlush(c);
        
        assertThat(saved.getId()).isNotNull();
        assertThat(repository.findAll()).hasSize(1);
    }

    @Test
    void testUniqueTelefonoThrowsException() {
        Cliente c1 = new Cliente();
        c1.setNombreRazonSocial("Test 1");
        c1.setTelefono("555");
        c1.setDireccion("Dir 1");
        repository.saveAndFlush(c1);

        Cliente c2 = new Cliente();
        c2.setNombreRazonSocial("Test 2");
        c2.setTelefono("555");
        c2.setDireccion("Dir 2");
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            repository.saveAndFlush(c2);
        });
    }
}
```

- [x] **Step 4: Ejecutar test y Commit**
Run: `cd backend && mvn test -Dtest=ClienteRepositoryTest`
Expected: PASS
```bash
git add backend/src/main/resources/db/migration backend/src/main/java/com/sgch/model backend/src/main/java/com/sgch/repository backend/src/test/java/com/sgch/repository
git commit -m "feat: add cliente entity, flyway migration and jpa testcontainers"
```

---

### Task 3: API CRUD Completo (TDD) + ProblemDetail (RFC 7807)

**Files:**
- Create: `backend/src/test/java/com/sgch/controller/ClienteControllerTest.java`
- Create: `backend/src/main/java/com/sgch/controller/ClienteController.java`
- Create: `backend/src/main/java/com/sgch/service/ClienteService.java`
- Create: `backend/src/main/java/com/sgch/exception/ResourceNotFoundException.java`
- Create: `backend/src/main/java/com/sgch/exception/GlobalExceptionHandler.java`
- Create: `backend/src/main/java/com/sgch/config/WebConfig.java`

- [x] **Step 1: Crear Test Fallido de Controller verificando ProblemDetail**
```java
package com.sgch.controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sgch.model.Cliente;
import com.sgch.service.ClienteService;
import com.sgch.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Collections;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClienteController.class)
public class ClienteControllerTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private ClienteService clienteService;

    @Test
    public void testCreateClienteInvalidReturnsProblemDetail() throws Exception {
        Cliente c = new Cliente(); 
        mockMvc.perform(post("/api/clientes").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(c)))
               .andExpect(status().isBadRequest())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
               .andExpect(jsonPath("$.type").value("about:blank"))
               .andExpect(jsonPath("$.status").value(400))
               .andExpect(jsonPath("$.title").value("Bad Request"))
               .andExpect(jsonPath("$.errores").exists());
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
}
```

- [x] **Step 2: Implementar Service (con validación, readOnly y transacciones correctas) y Controller**
```java
// ResourceNotFoundException.java
package com.sgch.exception;
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}

// ClienteService.java
package com.sgch.service;
import com.sgch.model.Cliente;
import com.sgch.repository.ClienteRepository;
import com.sgch.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {
    private final ClienteRepository repository;
    
    @Transactional(readOnly = true)
    public List<Cliente> findAll() { return repository.findAll(); }
    
    @Transactional(readOnly = true)
    public Cliente findById(String id) { 
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado")); 
    }
    
    @Transactional
    public Cliente save(Cliente cliente) { return repository.save(cliente); }
    
    @Transactional
    public Cliente update(String id, Cliente source) {
        Cliente target = findById(id);
        // TODO(Iteración 2): Resolver copia de campos elegantemente con DTOs y evitar merge completo.
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
    
    @Transactional
    public void delete(String id) { 
        Cliente target = findById(id);
        repository.delete(target); 
    }
}

// ClienteController.java
package com.sgch.controller;
import com.sgch.model.Cliente;
import com.sgch.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {
    private final ClienteService service;
    
    @GetMapping
    public List<Cliente> getAll() { return service.findAll(); }
    
    @GetMapping("/{id}")
    public Cliente getById(@PathVariable String id) { return service.findById(id); }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Cliente create(@Valid @RequestBody Cliente cliente) { return service.save(cliente); }
    
    @PutMapping("/{id}")
    public Cliente update(@PathVariable String id, @Valid @RequestBody Cliente cliente) {
        return service.update(id, cliente);
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) { service.delete(id); }
}
```

- [x] **Step 3: Implementar GlobalExceptionHandler (RFC 7807) y CORS**
```java
// GlobalExceptionHandler.java
package com.sgch.exception;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrity(DataIntegrityViolationException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Error de integridad de datos (ej. teléfono duplicado)");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining(", "));
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validación fallida");
        pd.setProperty("errores", errors);
        return pd;
    }
}

// WebConfig.java
package com.sgch.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedOrigins("http://localhost:5173").allowedMethods("*");
    }
}
```

- [x] **Step 4: Ejecutar test de controller**
Run: `cd backend && mvn test -Dtest=ClienteControllerTest`
Expected: PASS.

- [x] **Step 5: Commit**
```bash
git add backend/src/test backend/src/main/java/com/sgch/controller backend/src/main/java/com/sgch/service backend/src/main/java/com/sgch/exception backend/src/main/java/com/sgch/config
git commit -m "feat: complete cliente CRUD with RFC7807 ProblemDetail, robust update and Transactional"
```

---

### Task 4: Scaffolding Frontend (Vite + Tailwind v3 + Vitest)

- [x] **Step 1: Crear app Vite React TS**
Run: `npm create vite@latest frontend -- --template react-ts`

- [x] **Step 2: Instalar dependencias**
Run: `cd frontend && npm install && npm install tailwindcss@^3 postcss autoprefixer axios && npx tailwindcss init -p`

- [x] **Step 3: Instalar dependencias de test (Vitest + RTL)**
Run: `cd frontend && npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom`

- [x] **Step 4: Configurar Tailwind, Package.json y Vitest**
Update `frontend/vite.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  }
})
```
Update `frontend/package.json`:
Add `"test": "vitest run"` inside the `scripts` block.

Update `frontend/tailwind.config.js`:
```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```
Update `frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [x] **Step 5: Crear un Smoke Test básico**
Create `frontend/src/App.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders app successfully', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
})
```

- [x] **Step 6: Verificar build y test**
Run: `cd frontend && npm run build && npm run test`
Expected: Successfully compiled & tests pass.

- [x] **Step 7: Commit**
```bash
git add frontend/
git commit -m "chore: scaffold vite react ts frontend with tailwind v3 and vitest"
```
