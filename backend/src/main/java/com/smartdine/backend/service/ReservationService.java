package com.smartdine.backend.service;

import com.smartdine.backend.entity.Reservation;
import com.smartdine.backend.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public ReservationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    // Get all reservations
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    // Get reservation by ID
    public Reservation getReservationById(Long id) {
        return reservationRepository.findById(id).orElse(null);
    }

    // Validate reservation details
    private void validateReservation(Reservation reservation) {

        if (reservation == null) {
            throw new IllegalArgumentException(
                "Reservation details are required."
            );
        }

        // Date validation
        if (reservation.getDate() == null) {
            throw new IllegalArgumentException(
                "Please select a reservation date."
            );
        }

        if (reservation.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                "Cannot make a reservation for a past date."
            );
        }

        // Time validation
        if (reservation.getTime() == null) {
            throw new IllegalArgumentException(
                "Please select a reservation time."
            );
        }

        // Guest count validation
        if (reservation.getNoOfGuests() == null
                || reservation.getNoOfGuests() <= 0) {
            throw new IllegalArgumentException(
                "Number of guests must be at least 1."
            );
        }

        // Customer validation
        if (reservation.getCustomer() == null
                || reservation.getCustomer().getCustomerId() == null) {
            throw new IllegalArgumentException(
                "Please select a valid customer."
            );
        }

        // Table validation
        if (reservation.getRestaurantTable() == null
                || reservation.getRestaurantTable().getTableId() == null) {
            throw new IllegalArgumentException(
                "Please select a valid table."
            );
        }
    }

    // Create reservation
    public Reservation createReservation(Reservation reservation) {

        validateReservation(reservation);

        return reservationRepository.save(reservation);
    }

    // Update reservation
    public Reservation updateReservation(
            Long id,
            Reservation reservationDetails) {

        Reservation reservation = reservationRepository
                .findById(id)
                .orElse(null);

        if (reservation == null) {
            return null;
        }

        validateReservation(reservationDetails);

        reservation.setDate(reservationDetails.getDate());
        reservation.setNoOfGuests(reservationDetails.getNoOfGuests());
        reservation.setTime(reservationDetails.getTime());
        reservation.setStatus(reservationDetails.getStatus());
        reservation.setCustomer(reservationDetails.getCustomer());
        reservation.setRestaurantTable(
            reservationDetails.getRestaurantTable()
        );

        return reservationRepository.save(reservation);
    }

    // Delete reservation
    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }
}