import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePhotoBooth } from '../usePhotoBooth';

describe('usePhotoBooth', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock HTMLMediaElement and Canvas
    // We can't easily mock useRef directly in the hook without changing implementation,
    // but we can simulate the effect if we could access it.
    // However, since we are testing the logic (timers, status), we can mock the takePhoto part partially
    // or just accept that `takePhoto` will return null if ref is not set, which is fine for state testing.

    // To properly test capture, we need to assign the ref.
    // In the test we can mutate the ref returned by the hook?
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => usePhotoBooth());
    expect(result.current.status).toBe('idle');
    expect(result.current.photos).toEqual([]);
  });

  it('should start countdown when startSession is called', async () => {
    const { result } = renderHook(() => usePhotoBooth({ countdownTime: 3 }));

    act(() => {
      result.current.startSession();
    });

    expect(result.current.status).toBe('countdown');
    expect(result.current.countdown).toBe(3);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.countdown).toBe(2);
  });

  it('should transition to capturing after countdown', async () => {
    const { result } = renderHook(() => usePhotoBooth({ countdownTime: 1 }));

    act(() => {
      result.current.startSession();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.status).toBe('capturing');
  });

  // Note: Testing the async capture loop inside `captureSequence` requires careful handling of promises and timers
  // Since `captureSequence` is async and triggered by an interval callback inside the component (hook),
  // we need to wait for the promises to resolve.
});
