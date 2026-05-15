import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 경로가 변경될 때마다 최상단으로 스크롤
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // 화면에 렌더링할 내용은 없음
};

export default ScrollToTop;
