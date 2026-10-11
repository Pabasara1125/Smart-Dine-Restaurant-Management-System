
package com.smartdine.member4billing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.smartdine")
@EnableJpaRepositories(basePackages = "com.smartdine.repository")
public class Member4BillingPaymentApplication {

    public static void main(String[] args) {
        SpringApplication.run(Member4BillingPaymentApplication.class, args);
    }
}
