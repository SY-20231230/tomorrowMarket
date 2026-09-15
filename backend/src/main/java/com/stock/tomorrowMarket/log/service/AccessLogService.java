package com.stock.tomorrowMarket.log.service;

import com.stock.tomorrowMarket.log.entity.AccessLog;
import com.stock.tomorrowMarket.log.repository.AccessLogRepository;
import com.stock.tomorrowMarket.user.entity.Users;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccessLogService {

    private final AccessLogRepository accessLogRepository;

    @Transactional
    public void saveAccessLog(Users user, String sessionId, String referer, String entryPage, String sourceType) {
        AccessLog accessLog = AccessLog.builder()
                .user(user)
                .sessionId(sessionId)
                .referer(referer)
                .entryPage(entryPage)
                .sourceType(sourceType)
                .build();
        accessLogRepository.save(accessLog);
    }
}
