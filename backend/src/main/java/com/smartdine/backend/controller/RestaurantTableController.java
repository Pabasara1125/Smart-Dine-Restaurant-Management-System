package com.smartdine.backend.controller;

import com.smartdine.backend.entity.RestaurantTable;
import com.smartdine.backend.service.RestaurantTableService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
public class RestaurantTableController {

    private final RestaurantTableService restaurantTableService;

    public RestaurantTableController(RestaurantTableService restaurantTableService) {
        this.restaurantTableService = restaurantTableService;
    }

    @GetMapping
    public List<RestaurantTable> getAllTables() {
        return restaurantTableService.getAllTables();
    }

    @GetMapping("/{id}")
    public RestaurantTable getTableById(@PathVariable Long id) {
        return restaurantTableService.getTableById(id);
    }

    @PostMapping
    public RestaurantTable createTable(@RequestBody RestaurantTable table) {
        return restaurantTableService.createTable(table);
    }

    @PutMapping("/{id}")
    public RestaurantTable updateTable(
            @PathVariable Long id,
            @RequestBody RestaurantTable tableDetails) {
        return restaurantTableService.updateTable(id, tableDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteTable(@PathVariable Long id) {
        restaurantTableService.deleteTable(id);
    }
}