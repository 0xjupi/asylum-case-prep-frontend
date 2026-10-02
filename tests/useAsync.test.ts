import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';
import { useAsync } from '@/hooks/useAsync';

it('discards late results from an older session request', async () => {
  let resolveOld!: (value: { data: string; isMock: boolean }) => void;
  const old = new Promise<{ data: string; isMock: boolean }>(resolve => { resolveOld = resolve; });
  const { result, rerender } = renderHook(({ session }) => useAsync(() => session === 'old' ? old : Promise.resolve({ data: 'new session', isMock: false }), [session]), { initialProps: { session: 'old' } });
  rerender({ session: 'new' });
  await waitFor(() => expect(result.current.data).toBe('new session'));
  await act(async () => { resolveOld({ data: 'old session', isMock: false }); });
  expect(result.current.data).toBe('new session');
});
