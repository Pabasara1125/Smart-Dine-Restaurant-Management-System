package com.smartdine.backend.controller;

import com.smartdine.backend.dto.OrderRequest;
import com.smartdine.backend.entity.Order;
import com.smartdine.backend.entity.MenuItem;
import com.smartdine.backend.repository.OrderRepository;
import com.smartdine.backend.repository.MenuItemRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;

    public OrderController(
            OrderRepository orderRepository,
            MenuItemRepository menuItemRepository) {

        this.orderRepository = orderRepository;
        this.menuItemRepository = menuItemRepository;
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(
            @RequestBody OrderRequest request) {

        // Validate customer name
        if (request.getCustomerName() == null
                || request.getCustomerName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Customer name is required.");
        }

        // Set default order status
        String status = request.getStatus();

        if (status == null || status.isBlank()) {
            status = "PENDING";
        }

        // Find the existing menu items using their IDs
        List<MenuItem> selectedItems = new ArrayList<>();

        if (request.getMenuItemIds() != null) {

            for (Long itemId : request.getMenuItemIds()) {

                if (itemId == null) {
                    return ResponseEntity.badRequest()
                            .body("Menu item ID cannot be null.");
                }

                MenuItem item = menuItemRepository
                        .findById(itemId)
                        .orElse(null);

                if (item == null) {
                    return ResponseEntity.badRequest()
                            .body("Menu item not found: " + itemId);
                }

                selectedItems.add(item);
            }
        }

        // Create the order using existing database entities
        Order order = new Order();

        order.setCustomerName(request.getCustomerName());
        order.setStatus(status);
        order.setItems(selectedItems);

        Order savedOrder = orderRepository.save(order);

        return ResponseEntity.ok(savedOrder);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return orderRepository.findById(id)
                .map(order -> {
                    order.setStatus(status);
                    return ResponseEntity.ok(
                            orderRepository.save(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long id) {

        if (orderRepository.existsById(id)) {
            orderRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.notFound().build();
    }
}
