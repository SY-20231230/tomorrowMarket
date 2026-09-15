package com.stock.tomorrowMarket.global.interceptor;

import com.stock.tomorrowMarket.global.security.CustomUserDetails;
import com.stock.tomorrowMarket.log.service.AccessLogService;
import com.stock.tomorrowMarket.user.entity.Users;
import com.stock.tomorrowMarket.user.repository.UsersRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class AccessLogInterceptor implements HandlerInterceptor {

    private final AccessLogService accessLogService;
    private final UsersRepository usersRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        
        // 1. Get Session ID
        String sessionId = request.getSession().getId();
        
        // 2. Get Referer
        String referer = request.getHeader("Referer");
        
        // 3. Get Entry Page
        String entryPage = request.getRequestURI();
        
        // 4. Get Source Type (Simple User-Agent check)
        String userAgent = request.getHeader("User-Agent");
        String sourceType = "WEB";
        if (userAgent != null && userAgent.toLowerCase().contains("mobile")) {
            sourceType = "MOBILE";
        }
        
        // 5. Get User (if authenticated)
        Users user = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            user = usersRepository.findById(userDetails.getUsersId()).orElse(null);
        }

        // 6. Save Log
        accessLogService.saveAccessLog(user, sessionId, referer, entryPage, sourceType);

        return true; // Continue the request pipeline
    }
}
