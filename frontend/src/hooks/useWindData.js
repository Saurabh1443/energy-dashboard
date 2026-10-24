import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '');

export const useWindData = (selectedDate) => {
  const [metricsData, setMetricsData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [decisionContext, setDecisionContext] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    const dateStr = selectedDate ? selectedDate.format('YYYY-MM-DD') : '2026-01-01';

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/energy-data/?date=${dateStr}`);

      const jsonData = await response.json();

      if (!response.ok) {
        throw new Error(jsonData.error || 'Failed to fetch wind intelligence data.');
      }

      setMetricsData(jsonData?.metrics || {});
      setChartData(jsonData?.chartData || []);
      setDecisionContext(jsonData?.decisionContext || null);
    } catch (err) {
      setErrorMsg("Unable to retrieve energy intelligence data for this date. Please try another date or check your connection.");
      setMetricsData({});
      setChartData([]);
      setDecisionContext(null);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);


  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metricsData,
    chartData,
    decisionContext,
    loading,
    errorMsg,
    refetch: fetchMetrics,
  };
};
