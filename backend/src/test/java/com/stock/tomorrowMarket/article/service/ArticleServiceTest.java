package com.stock.tomorrowMarket.article.service;

import com.stock.tomorrowMarket.article.dto.ArticleResponse;
import com.stock.tomorrowMarket.article.entity.Article;
import com.stock.tomorrowMarket.article.repository.ArticleRepository;
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

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {

    @Mock
    private ArticleRepository articleRepository;

    @InjectMocks
    private ArticleService articleService;

    @Test
    @DisplayName("조건에 맞는 뉴스 기사를 페이징하여 조회할 수 있다.")
    void getArticles() {
        // given
        Article article = Article.builder()
                .title("테스트 기사")
                .summary("테스트 내용")
                .sentimentLabel(com.stock.tomorrowMarket.article.entity.SentimentLabel.POSITIVE)
                .registrationDate(java.time.LocalDateTime.now())
                .keywords("삼성전자, 반도체")
                .build();
        
        Page<Article> articlePage = new PageImpl<>(List.of(article));
        
        when(articleRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(articlePage);

        // when
        Page<ArticleResponse> result = articleService.getArticles(1L, null, null, PageRequest.of(0, 10));

        // then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("테스트 기사");
        assertThat(result.getContent().get(0).getTags()).containsExactly("삼성전자", "반도체");
    }
}
