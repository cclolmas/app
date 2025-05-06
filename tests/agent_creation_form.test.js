const { test, expect } = require('@playwright/test');

test.describe('Agent Creation Form Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the agent creation page
    await page.goto('/agents/create');
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit an empty form
    await page.click('button[type="submit"]');
    
    // Check if validation messages appear
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.getByText('Agent name is required')).toBeVisible();
    await expect(page.getByText('At least one prompt is required')).toBeVisible();
  });

  test('should allow adding prompts', async ({ page }) => {
    // Fill agent name
    await page.fill('input[name="agentName"]', 'Test Agent');
    
    // Add a prompt
    await page.fill('textarea[name="prompt"]', 'You are a helpful assistant');
    await page.click('button:has-text("Add Prompt")');
    
    // Check if prompt was added
    await expect(page.locator('.prompt-list-item')).toBeVisible();
    await expect(page.getByText('You are a helpful assistant')).toBeVisible();
  });

  test('should allow selecting tools', async ({ page }) => {
    // Fill agent name
    await page.fill('input[name="agentName"]', 'Test Agent');
    
    // Select a tool
    await page.selectOption('select[name="toolSelect"]', 'web-search');
    await page.click('button:has-text("Add Tool")');
    
    // Check if tool was added
    await expect(page.locator('.tool-list-item')).toBeVisible();
    await expect(page.getByText('web-search')).toBeVisible();
  });

  test('should allow defining communication flow', async ({ page }) => {
    // Fill agent name
    await page.fill('input[name="agentName"]', 'Test Agent');
    
    // Define communication flow
    await page.fill('textarea[name="communicationFlow"]', 'user->agent->user');
    
    // Check if flow was added correctly
    await expect(page.locator('.flow-preview')).toBeVisible();
  });

  test('should successfully create an agent', async ({ page }) => {
    // Fill all required fields
    await page.fill('input[name="agentName"]', 'Complete Test Agent');
    await page.fill('textarea[name="prompt"]', 'You are a helpful assistant');
    await page.click('button:has-text("Add Prompt")');
    
    // Add tool
    await page.selectOption('select[name="toolSelect"]', 'web-search');
    await page.click('button:has-text("Add Tool")');
    
    // Define flow
    await page.fill('textarea[name="communicationFlow"]', 'user->agent->user');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Check for success message
    await expect(page.getByText('Agent created successfully')).toBeVisible();
    
    // Check if redirected to agent list or details
    await expect(page).toHaveURL(/\/agents(\/\d+)?/);
  });
});
