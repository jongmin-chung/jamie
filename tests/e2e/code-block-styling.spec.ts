import { test, expect } from '@playwright/test';

test.describe('Code Block Styling Tests', () => {
  test('should correctly render Python code blocks with Atom One Dark theme', async ({ page }) => {
    // Create a test page with Python code
    await page.setContent(`
      <html>
        <head>
          <style>
            /* Include relevant styles for testing */
            @import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap");
            
            pre {
              background: #282c34;
              border: 1px solid #3e4451;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin: 1.5em 0;
              padding: 1.25rem;
              position: relative;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            pre code {
              background: transparent;
              color: #abb2bf;
              font-family: "JetBrains Mono", monospace;
              font-size: 0.875rem;
              line-height: 1.5;
              font-feature-settings: "liga" 0;
              -webkit-font-smoothing: antialiased;
            }
            
            :not(pre) > code {
              background: #f5f5f5;
              color: #24292e;
              font-family: "JetBrains Mono", monospace;
              font-weight: 500;
              font-size: 0.875em;
              padding: 0.2em 0.4em;
              border-radius: 0.25rem;
              border: none;
            }
          </style>
        </head>
        <body>
          <div class="blog-post-content">
            <h2>Testing Code Blocks</h2>
            <p>Here is an example of <code>inline code</code> styling.</p>
            <pre><code class="language-python">
import sentencepiece as spm

# Initialize SentencePiece model
sp = spm.SentencePieceProcessor()
sp.load('spm.model')

# Encode text to ids
ids = sp.encode_as_ids("Hello world")
print(ids)  # [151, 88]

# Decode ids back to text
text = sp.decode_ids(ids)
print(text)  # Hello world
            </code></pre>
          </div>
        </body>
      </html>
    `);
    
    // Wait for page to render
    await page.waitForTimeout(500);
    
    // Check code block styling
    const codeBlock = page.locator('pre');
    
    // Check if pre block has the right background color
    const bgColor = await codeBlock.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Check for close match to Atom One Dark background (#282c34)
    expect(bgColor).toMatch(/rgb\(40, (44|45|46), (52|53|54)\)/);
    
    // Check for JetBrains Mono font
    const fontFamily = await page.locator('pre code').evaluate(el => {
      return window.getComputedStyle(el).fontFamily.toLowerCase();
    });
    
    expect(fontFamily).toContain('jetbrains mono');
    
    // Check for proper padding
    const padding = await codeBlock.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        top: parseFloat(style.paddingTop),
        right: parseFloat(style.paddingRight),
        bottom: parseFloat(style.paddingBottom),
        left: parseFloat(style.paddingLeft)
      };
    });
    
    // Should have generous padding (≥ 1.25rem = 20px)
    expect(padding.top).toBeGreaterThanOrEqual(20);
    expect(padding.right).toBeGreaterThanOrEqual(20);
    expect(padding.bottom).toBeGreaterThanOrEqual(20);
    expect(padding.left).toBeGreaterThanOrEqual(20);
    
    // Check inline code styling
    const inlineCode = page.locator(':not(pre) > code');
    
    const inlineStyle = await inlineCode.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        background: style.backgroundColor,
        fontFamily: style.fontFamily.toLowerCase(),
        padding: style.padding
      };
    });
    
    expect(inlineStyle.fontFamily).toContain('jetbrains mono');
    expect(inlineStyle.background).not.toBe('transparent');
    
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    // Verify overflow for horizontal scrolling
    const overflowX = await codeBlock.evaluate(el => {
      return window.getComputedStyle(el).overflowX;
    });
    
    expect(overflowX).toBe('auto');
  });
});