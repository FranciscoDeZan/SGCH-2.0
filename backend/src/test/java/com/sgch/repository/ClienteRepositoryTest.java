package com.sgch.repository;

import com.sgch.model.Cliente;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.MySQLContainer;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(FlywayAutoConfiguration.class)
public class ClienteRepositoryTest {

    static MySQLContainer<?> mysql;

    static {
        try {
            if (DockerClientFactory.instance().isDockerAvailable()) {
                mysql = new MySQLContainer<>("mysql:8.0");
                mysql.start();
            }
        } catch (Throwable ignored) {
            mysql = null;
        }
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (mysql != null && mysql.isRunning()) {
            registry.add("spring.datasource.url", mysql::getJdbcUrl);
            registry.add("spring.datasource.username", mysql::getUsername);
            registry.add("spring.datasource.password", mysql::getPassword);
            registry.add("spring.datasource.driver-class-name", mysql::getDriverClassName);
        } else {
            String h2Url = "jdbc:h2:mem:sgch_db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1";
            registry.add("spring.datasource.url", () -> h2Url);
            registry.add("spring.datasource.username", () -> "sa");
            registry.add("spring.datasource.password", () -> "");
            registry.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
            registry.add("spring.flyway.url", () -> h2Url);
            registry.add("spring.flyway.user", () -> "sa");
            registry.add("spring.flyway.password", () -> "");
        }
    }

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

    @Test
    void testFindByTelefonoAndExistsByTelefono() {
        Cliente c = new Cliente();
        c.setNombreRazonSocial("Test Finder");
        c.setTelefono("99999");
        c.setDireccion("Dir Finder");
        repository.saveAndFlush(c);

        assertThat(repository.existsByTelefono("99999")).isTrue();
        assertThat(repository.existsByTelefono("00000")).isFalse();

        Optional<Cliente> found = repository.findByTelefono("99999");
        assertThat(found).isPresent();
        assertThat(found.get().getNombreRazonSocial()).isEqualTo("Test Finder");
    }
}
