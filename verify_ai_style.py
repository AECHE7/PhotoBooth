
from playwright.sync_api import sync_playwright
import time

def verify_ai_style_ui():
    print("Navigating to home page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            permissions=["camera"],
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        )
        page = context.new_page()

        # 1. Navigate to Home
        page.goto("http://localhost:5173/")

        # 2. Click "Start Booth"
        print("Starting Booth...")
        page.get_by_text("Start Photo Booth").click()

        # 3. Simulate Capture
        print("Starting Capture...")
        # Since camera permission is granted (mocked), we should see the capture button
        capture_btn = page.locator("button.rounded-full.border-4")

        # Wait for camera to init
        page.wait_for_timeout(3000)

        # We need 4 captures.
        # We will loop and wait generously.
        for i in range(4):
            print(f"Capture {i+1}...")
            # Wait for button to be clickable
            try:
                capture_btn.wait_for(state="visible", timeout=10000)
                # Check if we are already redirected?
                if page.url.endswith("/review"):
                     break
                capture_btn.click()
            except Exception as e:
                print(f"Error clicking capture {i+1}: {e}")

            # Wait for countdown (3s) + processing
            page.wait_for_timeout(5000)

        # 4. Wait for Review Screen
        print("Waiting for Review Screen...")
        try:
            page.wait_for_selector("text=Layout", timeout=30000)
        except:
             print("Review screen timeout. Current URL:", page.url)
             page.screenshot(path="/home/jules/verification/review_timeout.png")
             return

        # 5. Find AI Style Buttons
        print("Checking for AI Styles...")
        # Check for "Cyberpunk" button
        cyberpunk_btn = page.get_by_role("button", name="🤖 Cyberpunk")
        if cyberpunk_btn.is_visible():
            print("Cyberpunk button found.")
        else:
            print("Cyberpunk button NOT found.")
            page.screenshot(path="/home/jules/verification/ai_verification_fail.png")
            return

        # 6. Click Cyberpunk Button
        print("Clicking Cyberpunk Style...")
        cyberpunk_btn.click()

        # 7. Check for Loading Overlay
        try:
            dreaming_text = page.get_by_text("Dreaming...")
            dreaming_text.wait_for(state="visible", timeout=3000)
            print("Loading overlay visible.")

            dreaming_text.wait_for(state="hidden", timeout=10000)
            print("Generation complete.")
        except Exception as e:
            print("Warning: Loading state might have been missed or generation failed.", e)

        # 8. Take Screenshot
        page.wait_for_timeout(1000)
        screenshot_path = "/home/jules/verification/ai_style_applied.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify_ai_style_ui()
