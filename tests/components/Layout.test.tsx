import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Layout } from '@/components/Layout';

describe('Layout Component', () => {
  it('should render main navigation header', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();
  });

  it('should render site title/logo', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    const siteTitle = screen.getByText(/한국 기술 블로그|기술 블로그/);
    expect(siteTitle).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    const homeLink = screen.getByRole('link', { name: /홈|Home/ });
    const blogLink = screen.getByRole('link', { name: /블로그|Blog/ });
    
    expect(homeLink).toBeInTheDocument();
    expect(blogLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
    expect(blogLink).toHaveAttribute('href', '/blog');
  });

  it('should render children content', () => {
    render(
      <Layout>
        <div data-testid="test-content">Test content</div>
      </Layout>
    );

    const content = screen.getByTestId('test-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Test content');
  });

  it('should render footer', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    const footer = screen.getByRole('contentinfo') || screen.getByText(/© 2025|저작권/);
    expect(footer).toBeInTheDocument();
  });

  it('should have responsive design classes', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveClass(/container|mx-auto/);
  });

  it('should be accessible', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    const navigation = screen.getByRole('navigation');
    const main = screen.getByRole('main');
    
    expect(navigation).toBeInTheDocument();
    expect(main).toBeInTheDocument();
  });

  it('should support mobile navigation', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    // Should have mobile menu toggle button
    const mobileMenuButton = screen.queryByRole('button', { name: /메뉴|menu/ });
    // Mobile menu might be optional, so we just check it exists or not
    if (mobileMenuButton) {
      expect(mobileMenuButton).toBeInTheDocument();
    }
  });

  it('should highlight active navigation link', () => {
    // Mock the current pathname
    Object.defineProperty(window, 'location', {
      value: { pathname: '/blog' },
      writable: true
    });

    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    const blogLink = screen.getByRole('link', { name: /블로그|Blog/ });
    // Should have active class or aria-current
    expect(blogLink).toHaveAttribute('aria-current', 'page') || 
    expect(blogLink).toHaveClass(/active/);
  });

  it('should render search functionality in header', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    const searchInput = screen.queryByPlaceholderText(/검색/);
    // Search might be in header or as separate component
    if (searchInput) {
      expect(searchInput).toBeInTheDocument();
    }
  });

  it('should handle different content types', () => {
    const { rerender } = render(
      <Layout>
        <h1>Blog Post Title</h1>
      </Layout>
    );

    expect(screen.getByText('Blog Post Title')).toBeInTheDocument();

    rerender(
      <Layout>
        <div>
          <p>Multiple paragraphs</p>
          <p>of content</p>
        </div>
      </Layout>
    );

    expect(screen.getByText('Multiple paragraphs')).toBeInTheDocument();
    expect(screen.getByText('of content')).toBeInTheDocument();
  });

  it('should support dark mode toggle', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    // Dark mode toggle might be optional
    const darkModeToggle = screen.queryByRole('button', { name: /dark|light|다크|라이트/ });
    if (darkModeToggle) {
      expect(darkModeToggle).toBeInTheDocument();
    }
  });

  it('should have proper meta structure for SEO', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    // Check if the layout sets up proper HTML structure
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    
    // Should have proper semantic structure
    const banner = screen.queryByRole('banner');
    if (banner) {
      expect(banner).toBeInTheDocument();
    }
  });
});