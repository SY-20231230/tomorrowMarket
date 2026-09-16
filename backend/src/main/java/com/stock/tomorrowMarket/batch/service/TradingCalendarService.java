package com.stock.tomorrowMarket.batch.service;

import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

@Service
public class TradingCalendarService {

    // Dummy logic for holidays. In production, this should fetch from Open API or a DB table.
    private static final Set<LocalDate> HOLIDAYS = Set.of(
        LocalDate.of(2023, 1, 1),
        LocalDate.of(2023, 12, 25)
        // Add specific Korean holidays here
    );

    public boolean isTradingDay(LocalDate date) {
        // Weekend check
        if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            return false;
        }
        
        // Holiday check
        if (HOLIDAYS.contains(date)) {
            return false;
        }

        return true;
    }
}
