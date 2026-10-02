import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');
const { default: App } = await import('@/App');
const { setAccessKey } = await import('@/services/api/client');

const fetchMock = vi.fn();
const testKey = 'fictional-test-only-access-key-1234567890';
const emptyTranscript = {
  id: 'singleton', fileName: null, uploadStatus: 'not_uploaded',
  uploadedAt: null, pageCount: null, sections: [], entries: [],
  annotations: [], processingError: null,
};
function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
function unlock() {
  fireEvent.change(screen.getByLabelText('Access key'), { target: { value: testKey } });
  fireEvent.click(screen.getByRole('button', { name: 'Unlock', exact: true }));
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  setAccessKey('');
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, '', '/transcript');
});

it('blocks transcript requests until unlock and sends the accepted key on the real transcript route', async () => {
  fetchMock.mockResolvedValueOnce(response({ authenticated: true }))
    .mockResolvedValueOnce(response(emptyTranscript));
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Unlock your workspace' })).toBeTruthy();
  expect(fetchMock).not.toHaveBeenCalled();
  unlock();
  await screen.findByRole('heading', { name: 'Interview transcript' });
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(fetchMock.mock.calls.map(call => call[0])).toEqual([
    'https://api.example.test/api/auth/check',
    'https://api.example.test/api/transcript',
  ]);
  for (const call of fetchMock.mock.calls) {
    expect(new Headers(call[1].headers).get('Authorization')).toBe(`Bearer ${testKey}`);
  }
  expect(JSON.stringify({ ...localStorage, ...sessionStorage })).not.toContain(testKey);
  fireEvent.click(screen.getByRole('button', { name: 'Lock workspace' }));
  expect(screen.getByRole('heading', { name: 'Unlock your workspace' })).toBeTruthy();
});

it('keeps rejected keys outside the workspace without fetching transcript records', async () => {
  fetchMock.mockResolvedValue(response({ detail: 'Invalid workspace access key.' }, 401));
  render(<App />);
  unlock();
  await screen.findByRole('alert');
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('heading', { name: 'Interview transcript' })).toBeNull();
});

it('returns to the unlock screen when the transcript request is unauthorized', async () => {
  fetchMock.mockResolvedValueOnce(response({ authenticated: true }))
    .mockResolvedValueOnce(response({ detail: 'Invalid workspace access key.' }, 401));
  render(<App />);
  unlock();
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Unlock your workspace' })).toBeTruthy());
  expect(screen.queryByRole('heading', { name: 'Interview transcript' })).toBeNull();
});
