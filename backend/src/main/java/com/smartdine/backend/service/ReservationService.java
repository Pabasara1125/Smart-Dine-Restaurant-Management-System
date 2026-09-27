package com.smartdine.backend.service;

import com.smartdine.backend.entity.Reservation;
import com.smartdine.backend.repository.ReservationRepository;
import org.springframework.stereotype.Service;

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

    // Create reservation
    public Reservation createReservation(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    // Update reservation
    public Reservation updateReservation(Long id, Reservation reservationDetails) {

        Reservation reservation = reservationRepository.findById(id).orElse(null);

        if (reservation == null) {
            return null;
        }

        reservation.setDate(reservationDetails.getDate());
        reservation.setNoOfGuests(reservationDetails.getNoOfGuests());
        reservation.setTime(reservationDetails.getTime());
        reservation.setStatus(reservationDetails.getStatus());
        reservation.setCustomer(reservationDetails.getCustomer());
        reservation.setRestaurantTable(reservationDetails.getRestaurantTable());

        return reservationRepository.save(reservation);
    }

    // Delete reservation
    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }
}