package com.stock.tomorrowMarket.watchlist.service;

import com.stock.tomorrowMarket.stock.entity.Stock;
import com.stock.tomorrowMarket.stock.repository.StockRepository;
import com.stock.tomorrowMarket.user.entity.Users;
import com.stock.tomorrowMarket.user.repository.UsersRepository;
import com.stock.tomorrowMarket.watchlist.dto.WatchlistResponse;
import com.stock.tomorrowMarket.global.exception.CustomException;
import com.stock.tomorrowMarket.global.exception.ErrorCode;
import com.stock.tomorrowMarket.watchlist.entity.Watchlist;
import com.stock.tomorrowMarket.watchlist.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UsersRepository usersRepository;
    private final StockRepository stockRepository;

    public List<WatchlistResponse> getUserWatchlist(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return watchlistRepository.findByUser(user).stream()
                .map(WatchlistResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addStockToWatchlist(Long userId, Long stockId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));

        if (watchlistRepository.existsByUserAndStock(user, stock)) {
            throw new CustomException(ErrorCode.DUPLICATE_WATCHLIST);
        }

        Watchlist watchlist = Watchlist.builder()
                .user(user)
                .stock(stock)
                .build();

        watchlistRepository.save(watchlist);
    }

    @Transactional
    public void removeStockFromWatchlist(Long userId, Long stockId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));

        Watchlist watchlist = watchlistRepository.findByUserAndStock(user, stock)
                .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));

        watchlistRepository.delete(watchlist);
    }
}
