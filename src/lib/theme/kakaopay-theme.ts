/**
 * KakaoPay Theme Configuration
 * Based on kakaopay_theme_data.json
 */

export const kakaoPayTheme = {
  // Brand Information
  brand: {
    name: "카카오페이",
    logoSrc: "https://tech.kakaopay.com/_astro/thumb.42fc3b96_1Bju8W.avif",
    tagline: "카카오페이 서비스를 만드는 크루들의 기술 노하우와 경험을 공유합니다.",
  },

  // Color Palette
  colors: {
    primary: {
      kakaoYellow: "#FFEB00",
      darkText: "#060B11",
      white: "#FFFFFF",
    },
    backgrounds: [
      "#FFFFFF",
      "#060B11", 
      "#EFF2F4",
      "#E3E8EC",
      "#FFEB00",
    ],
    textColors: [
      "#000000",
      "#060B11",
      "#FFFFFF", 
      "rgba(255, 255, 255, 0.48)",
      "rgba(6, 11, 17, 0.48)",
      "#0000EE",
    ],
  },

  // Typography
  typography: {
    fontFamily: {
      primary: '"Noto Sans KR", sans-serif',
      heading: '"Noto Sans KR", sans-serif',
    },
    styles: {
      h1: {
        fontSize: "52px",
        fontWeight: "700",
        lineHeight: "70px",
        color: "#FFFFFF",
        margin: "0px 0px 24px",
      },
      h2: {
        fontSize: "32px",
        fontWeight: "600", 
        lineHeight: "44px",
        color: "#060B11",
      },
      paragraph: {
        fontSize: "18px",
        fontWeight: "400",
        lineHeight: "28px",
        color: "rgba(255, 255, 255, 0.48)",
      },
      strong: {
        fontSize: "18px",
        fontWeight: "500",
        color: "rgba(6, 11, 17, 0.48)",
      },
    },
  },

  // Layout
  layout: {
    containerMaxWidth: "1200px",
    gridSystem: {
      columns: 12,
      spacing: {
        xs: "8px",
        sm: "16px", 
        md: "24px",
        lg: "32px",
        xl: "48px",
      },
    },
    header: {
      height: "84px",
      position: "fixed",
      padding: "0px 2px 0px 24px",
      backgroundColor: "transparent",
    },
  },

  // Components
  components: {
    header: {
      navigation: {
        items: ["Tech Log", "Career"],
        searchButton: true,
        logo: true,
      },
      style: {
        backgroundColor: "transparent",
        height: "84px",
        position: "fixed",
        padding: "0px 2px 0px 24px",
      },
    },
    hero: {
      title: "Tech Log",
      subtitle: "카카오페이 서비스를 만드는 크루들의 기술 노하우와 경험을 공유합니다.",
      backgroundImage: true,
      style: {
        backgroundColor: "#060B11",
        color: "#FFFFFF",
        titleColor: "#FFFFFF",
        subtitleColor: "rgba(255, 255, 255, 0.48)",
      },
    },
    buttons: {
      primary: {
        backgroundColor: "transparent",
        color: "#FFFFFF",
        border: "none",
        borderRadius: "0px",
        fontSize: "13.3333px",
        fontWeight: "400",
        padding: "1px 6px",
      },
      secondary: {
        backgroundColor: "transparent", 
        color: "#060B11",
        border: "none",
        borderRadius: "0px",
      },
    },
    cards: {
      articleCard: {
        backgroundColor: "transparent",
        padding: "0px",
        margin: "0px",
        borderRadius: "0px",
        boxShadow: "none",
        border: "none",
      },
    },
    pagination: {
      style: "numeric",
      showFirstLast: true,
      showPrevNext: true,
      maxVisible: 5,
    },
    footer: {
      copyright: "© Kakao pay corp.",
      links: [
        {
          text: "카카오페이 브랜드사이트",
          url: "https://www.kakaopay.com/",
        },
        {
          text: "카카오페이 개발자센터", 
          url: "https://developers.kakaopay.com/",
        },
        {
          text: "카카오페이 블로그",
          url: "https://blog.kakaopay.com/",
        },
        {
          text: "카카오페이 유튜브",
          url: "https://www.youtube.com/channel/UCiC-E0YuAr836x0yptINkJw",
        },
      ],
    },
  },

  // Content Structure
  contentStructure: {
    sections: {
      recentPosts: {
        title: "최근 올라온 글",
        layout: "horizontal-scroll",
        cardType: "featured",
      },
      allPosts: {
        title: "전체 게시글",
        layout: "grid", 
        cardType: "standard",
      },
    },
    postCard: {
      elements: ["image", "title", "excerpt", "date", "author"],
      imageAspectRatio: "16:9",
      titleMaxLines: 2,
      excerptMaxLines: 2,
    },
  },

  // Design Principles
  designPrinciples: {
    theme: "minimalist-tech",
    colorScheme: "dark-hero-light-content",
    spacing: "consistent-24px-base", 
    imageStyle: "modern-rounded",
    animations: "subtle-hover-effects",
  },
} as const;

export type KakaoPayTheme = typeof kakaoPayTheme;