import { describe, it, expect, vi } from 'vitest';
import { exportCashFlowCsv, fetchLatestCashFlow } from './cashFlowLogic';

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('fetchLatestCashFlow', () => {
  it('ignores stale response from older period request', async () => {
    const latestRequestRef = { current: 0 };
    const setData = vi.fn();
    const setLoading = vi.fn();
    const onError = vi.fn();

    const monthly = deferred();
    const quarterly = deferred();
    const getCashFlow = vi
      .fn()
      .mockReturnValueOnce(monthly.promise)
      .mockReturnValueOnce(quarterly.promise);

    const oldRequest = fetchLatestCashFlow({
      selectedPeriod: 'monthly',
      latestRequestRef,
      getCashFlow,
      setData,
      setLoading,
      onError,
    });

    const latestRequest = fetchLatestCashFlow({
      selectedPeriod: 'quarterly',
      latestRequestRef,
      getCashFlow,
      setData,
      setLoading,
      onError,
    });

    quarterly.resolve({ summary: { net: 900 } });
    monthly.resolve({ summary: { net: 100 } });
    await Promise.all([oldRequest, latestRequest]);

    expect(setData).toHaveBeenCalledTimes(1);
    expect(setData).toHaveBeenCalledWith({ summary: { net: 900 } });
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls error handler only for latest failed request', async () => {
    const latestRequestRef = { current: 0 };
    const setData = vi.fn();
    const setLoading = vi.fn();
    const onError = vi.fn();
    const getCashFlow = vi.fn().mockRejectedValue(new Error('boom'));

    await fetchLatestCashFlow({
      selectedPeriod: 'monthly',
      latestRequestRef,
      getCashFlow,
      setData,
      setLoading,
      onError,
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(setData).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });
});

describe('exportCashFlowCsv', () => {
  it('wires download action with period-based csv filename', () => {
    const createObjectURL = vi.fn(() => 'blob:mock');
    const revokeObjectURL = vi.fn();
    const appendChild = vi.fn();
    const removeChild = vi.fn();
    const click = vi.fn();
    const setAttribute = vi.fn();
    const link = { setAttribute, click, href: '' };
    const createElement = vi.fn(() => link);

    exportCashFlowCsv({
      data: {
        summary: { inflow: 1000, outflow: 300, net: 700 },
        chartData: [{ name: 'Jan', inflow: 10, outflow: 5 }],
      },
      period: 'yearly',
      now: new Date('2026-04-28T08:00:00.000Z'),
      createObjectURL,
      revokeObjectURL,
      createElement,
      appendChild,
      removeChild,
    });

    expect(createElement).toHaveBeenCalledWith('a');
    expect(setAttribute).toHaveBeenCalledWith('download', 'cash_flow_yearly_2026-04-28.csv');
    expect(click).toHaveBeenCalledTimes(1);
    expect(appendChild).toHaveBeenCalledWith(link);
    expect(removeChild).toHaveBeenCalledWith(link);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });
});
