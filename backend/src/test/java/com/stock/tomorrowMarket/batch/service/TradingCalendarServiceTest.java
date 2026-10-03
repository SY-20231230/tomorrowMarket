package com.stock.tomorrowMarket.batch.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class TradingCalendarServiceTest {

    private final TradingCalendarService tradingCalendarService = new TradingCalendarService();

    @Test
    @DisplayName("토요일은 휴장일로 판단한다")
    void isTradingDay_ReturnsFalse_OnSaturday() {
        // given
        LocalDate saturday = LocalDate.of(2023, 11, 4); // 2023-11-04 is Saturday

        // when
        boolean isTradingDay = tradingCalendarService.isTradingDay(saturday);

        // then
        assertThat(isTradingDay).isFalse();
    }

    @Test
    @DisplayName("일요일은 휴장일로 판단한다")
    void isTradingDay_ReturnsFalse_OnSunday() {
        // given
        LocalDate sunday = LocalDate.of(2023, 11, 5); // 2023-11-05 is Sunday

        // when
        boolean isTradingDay = tradingCalendarService.isTradingDay(sunday);

        // then
        assertThat(isTradingDay).isFalse();
    }

    @Test
    @DisplayName("지정된 공휴일은 휴장일로 판단한다")
    void isTradingDay_ReturnsFalse_OnHoliday() {
        // given
        LocalDate holiday = LocalDate.of(2023, 12, 25); // Christmas (hardcoded in TradingCalendarService)

        // when
        boolean isTradingDay = tradingCalendarService.isTradingDay(holiday);

        // then
        assertThat(isTradingDay).isFalse();
    }

    @Test
    @DisplayName("평일(월~금)이며 공휴일이 아니면 영업일로 판단한다")
    void isTradingDay_ReturnsTrue_OnWeekday() {
        // given
        LocalDate weekday = LocalDate.of(2023, 11, 3); // 2023-11-03 is Friday

        // when
        boolean isTradingDay = tradingCalendarService.isTradingDay(weekday);

        // then
        assertThat(isTradingDay).isTrue();
    }
}
