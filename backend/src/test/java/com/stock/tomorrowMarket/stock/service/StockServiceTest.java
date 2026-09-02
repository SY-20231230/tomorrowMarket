package com.stock.tomorrowMarket.stock.service;

import com.stock.tomorrowMarket.stock.dto.StockResponse;
import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.repository.StockHistoryRepository;
import com.stock.tomorrowMarket.stock.repository.StockRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StockServiceTest {

    @Mock
    private StockRepository stockRepository;

    @Mock
    private StockHistoryRepository stockHistoryRepository;

    @InjectMocks
    private StockService stockService;

    @Test
    @DisplayName("주식 목록을 조건에 따라 페이징하여 조회할 수 있다.")
    void getStocks() {
        // given
        Stock stock = Stock.builder()
                .name("삼성전자")
                .stockCode("005930")
                .build();

        Page<Stock> stockPage = new PageImpl<>(List.of(stock));

        when(stockRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(stockPage);

        // when
        Page<StockResponse> result = stockService.getStocks("삼성", null, null, PageRequest.of(0, 10));

        // then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("삼성전자");
        assertThat(result.getContent().get(0).getStockCode()).isEqualTo("005930");
    }
}
