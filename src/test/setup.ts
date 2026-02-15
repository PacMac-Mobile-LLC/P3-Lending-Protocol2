import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mocking global fetch
global.fetch = vi.fn();
