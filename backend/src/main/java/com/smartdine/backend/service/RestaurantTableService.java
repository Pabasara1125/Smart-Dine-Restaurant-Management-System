package com.smartdine.backend.service;

import com.smartdine.backend.entity.RestaurantTable;
import com.smartdine.backend.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RestaurantTableService {

    private final RestaurantTableRepository restaurantTableRepository;

    public RestaurantTableService(RestaurantTableRepository restaurantTableRepository) {
        this.restaurantTableRepository = restaurantTableRepository;
    }

    public List<RestaurantTable> getAllTables() {
        return restaurantTableRepository.findAll();
    }

    public RestaurantTable getTableById(Long id) {
        return restaurantTableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant table not found"));
    }

    public RestaurantTable createTable(RestaurantTable table) {
        return restaurantTableRepository.save(table);
    }

    public RestaurantTable updateTable(Long id, RestaurantTable tableDetails) {
        RestaurantTable table = getTableById(id);

        table.setTableNumber(tableDetails.getTableNumber());
        table.setCapacity(tableDetails.getCapacity());
        table.setLocation(tableDetails.getLocation());
        table.setStatus(tableDetails.getStatus());

        return restaurantTableRepository.save(table);
    }

    public void deleteTable(Long id) {
        restaurantTableRepository.deleteById(id);
    }
}