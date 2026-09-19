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

    public boolean isFirstTradingDayOfWeek(LocalDate date) {
        if (!isTradingDay(date)) {
            return false;
        }

        // Iterate backwards from yesterday to Monday of this week
        LocalDate current = date.minusDays(1);
        while (current.getDayOfWeek() != DayOfWeek.SUNDAY) { // If it reaches Sunday, it has checked all days of this week
            if (isTradingDay(current)) {
                return false; // A previous day this week was a trading day
            }
            current = current.minusDays(1);
        }

        return true; // No previous trading days found this week
    }

    public boolean isFirstTradingDayOfMonth(LocalDate date) {
        if (!isTradingDay(date)) {
            return false;
        }

        // Iterate backwards from yesterday to the 1st of this month
        LocalDate current = date.minusDays(1);
        while (current.getMonthValue() == date.getMonthValue() && current.getDayOfMonth() >= 1) {
            if (isTradingDay(current)) {
                return false; // A previous day this month was a trading day
            }
            if (current.getDayOfMonth() == 1) {
                break;
            }
            current = current.minusDays(1);
        }

        return true; // No previous trading days found this month
    }
}
