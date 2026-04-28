export const fetchLatestCashFlow = async ({
  selectedPeriod,
  latestRequestRef,
  getCashFlow,
  setData,
  setLoading,
  onError,
}) => {
  const requestId = ++latestRequestRef.current;

  try {
    setLoading(true);
    const result = await getCashFlow(selectedPeriod);
    if (requestId === latestRequestRef.current) {
      setData(result);
    }
  } catch {
    if (requestId === latestRequestRef.current) {
      onError();
    }
  } finally {
    if (requestId === latestRequestRef.current) {
      setLoading(false);
    }
  }
};

export const exportCashFlowCsv = ({
  data,
  period,
  now = new Date(),
  createObjectURL = URL.createObjectURL,
  revokeObjectURL = URL.revokeObjectURL,
  createElement = (tag) => document.createElement(tag),
  appendChild = (node) => document.body.appendChild(node),
  removeChild = (node) => document.body.removeChild(node),
}) => {
  const escapeCsvValue = (value) => {
    const stringValue = String(value ?? '');
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  const summary = data?.summary || {};
  const chartData = data?.chartData || [];

  const summaryRows = [
    ['metric', 'value'],
    ['period', period],
    ['inflow', summary.inflow ?? 0],
    ['outflow', summary.outflow ?? 0],
    ['net', summary.net ?? 0],
  ];

  const trendRows = [
    ['name', 'inflow', 'outflow'],
    ...chartData.map((item) => [
      item?.name ?? '',
      item?.inflow ?? 0,
      item?.outflow ?? 0,
    ]),
  ];

  const csvContent = [
    ...summaryRows.map((row) => row.map(escapeCsvValue).join(',')),
    '',
    ...trendRows.map((row) => row.map(escapeCsvValue).join(',')),
  ].join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = createObjectURL(blob);
  const link = createElement('a');
  const date = now.toISOString().split('T')[0];
  link.href = url;
  link.setAttribute('download', `cash_flow_${period}_${date}.csv`);
  appendChild(link);
  link.click();
  removeChild(link);
  revokeObjectURL(url);
};
