# SDD ledger — plan: migracion-boot4
Ruling: 'DO NOT touch @MockBean' makes Phase 1 uncompilable because @MockBean is removed in Boot 4. The implementer tried to use maven-replacer-plugin. I rejected this and reverted. We must migrate @MockBean in Phase 1.
Ruling: Boot 4 eliminó @MockBean del source. La restricción original de no tocar Java en Fase 1 era inválida. Migrado a Fase 1.

Context7 Verification Findings:
- @AutoConfigureMockMvc: Se movió al paquete org.springframework.boot.webmvc.test.autoconfigure en el módulo spring-boot-webmvc-test (Boot 4). No lo usamos directamente en tests de controlador, usamos @WebMvcTest.
- @ServiceConnection: Sigue residiendo en org.springframework.boot.testcontainers.service.connection dentro de spring-boot-testcontainers.
- @DataJpaTest y @WebMvcTest: En Boot 4 modularizado se distribuyen a través de spring-boot-starter-data-jpa-test y spring-boot-starter-webmvc-test. Durante Fase 1 con spring-boot-starter-test-classic, spring-boot-test-classic-modules provee compatibilidad hacia atrás para las anotaciones clásicas.
Finding: 'spring-boot-starter-classic' no reemplaza a web, data-jpa ni validation.
Causa raíz:
- En Spring Boot 4, 'spring-boot-starter-classic' es únicamente 'spring-boot-starter' + 'spring-boot-autoconfigure-classic' (proveyendo configuración clásica de logging, YAML y autoconfiguración base).
- No incluye Tomcat, Spring MVC, Spring Data JPA, Hibernate ni Jakarta Validation.
- Al eliminar 'spring-boot-starter-web', 'spring-boot-starter-data-jpa' y 'spring-boot-starter-validation', el proyecto pierde todos los símbolos (@RestController, @Entity, @Transactional, @NotBlank, etc.) y falla la compilación de producción.
- En Spring Boot 4, los starters de producción son:
  * Web: 'spring-boot-starter-webmvc' (reemplazo de spring-boot-starter-web).
  * JPA: 'spring-boot-starter-data-jpa' (sigue existiendo).
  * Validation: 'spring-boot-starter-validation' (sigue existiendo).
Ruling 2: 'spring-boot-starter-classic' en Boot 4 es solo el starter base + autoconfiguración clásica. NO reemplaza a web/data-jpa/validation. En Fase 1 usamos starters modulares de producción desde el principio. La Fase 4 se simplifica a migrar solo los test slices.

Estrategia actualizada:
- Fase 1: Boot 4.1.1 + Starters modulares de producción (webmvc, data-jpa, validation) + Test Classic + @MockitoBean.
- Fase 2: Migración Jackson 2 -> Jackson 3.
- Fase 3 / 4: Migración de test slices a starters modulares (spring-boot-starter-webmvc-test, spring-boot-starter-data-jpa-test), eliminación de starter-test-classic y verificación Context7 de imports.
Ruling 3: 'spring-boot-starter-test-classic' NO provee clases de compatibilidad hacia atrás para paquetes de Boot 3 ni Jackson 2.
Hallazgos empíricos (inspección de JARs oficiales 4.1.1):
1. El código de producción (9 archivos Java) compila al 100% con los starters modulares (webmvc, data-jpa, validation).
2. Los tests no compilan porque Boot 4 no dejó shims ni alias para los paquetes viejos:
   - @WebMvcTest solo existe en 'org.springframework.boot.webmvc.test.autoconfigure'.
   - @DataJpaTest solo existe en 'org.springframework.boot.data.jpa.test.autoconfigure'.
   - @AutoConfigureTestDatabase solo existe en 'org.springframework.boot.jdbc.test.autoconfigure'.
   - FlywayAutoConfiguration requiere 'spring-boot-starter-flyway' y está en 'org.springframework.boot.flyway.autoconfigure'.
   - ObjectMapper solo existe como Jackson 3 ('tools.jackson.databind.ObjectMapper').
3. Conclusión: Intentar una Fase 1 donde 'corren los 21 tests sin tocar imports de Jackson ni de test slices' es inviable en Spring Boot 4.

Ruling 4: Testcontainers 2.x depreco MySQLContainer en org.testcontainers.containers y la movio a org.testcontainers.mysql.
La clase nueva NO es generica (no lleva <?>). El artifactId Maven correcto es 'testcontainers-mysql' (ya estaba correcto en pom.xml).
Cambios aplicados en ClienteRepositoryTest:
- import: org.testcontainers.containers.MySQLContainer -> org.testcontainers.mysql.MySQLContainer
- declaracion: static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0") -> static MySQLContainer mysql = new MySQLContainer("mysql:8.0")
Resultado: warning de deprecated API eliminado. BUILD SUCCESS 0 warnings.

Ruling 5: Usuario dedicado 'sgch' con permisos exclusivos sobre 'sgch_db'. La contrasena de root de MySQL NO debe ir en el repositorio ni como default.
Cambios aplicados:
- En backend/src/main/resources/application.yml se actualizaron los valores por defecto del datasource:
  * username: ${DB_USER:sgch}
  * password: ${DB_PASSWORD:sgch_dev}
- Se mantiene el patron ${VAR:default} para permitir override por variables de entorno.
Verificacion:
- Backend inicio con exito (Tomcat en puerto 8080 en 3.6s).
- Flyway aplico exitosamente la migracion V1__Create_clientes_table.sql (version 1).
- Smoke test HTTP GET /api/clientes devolvio HTTP 200 con cuerpo [].
