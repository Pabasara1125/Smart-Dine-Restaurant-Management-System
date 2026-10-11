
package com.smartdine.repository;

import com.smartdine.member4billing.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill, Integer> {
}
