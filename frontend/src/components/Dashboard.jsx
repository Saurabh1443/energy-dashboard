import { useState } from "react";
import {
  Alert,
  Box,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";

import MetricCard from "./MetricCard";
import Header from "./Header";
import WindChart from "./chart";
import { useWindData } from "../hooks/useWindData";

const INITIAL_DATE = dayjs("2026-01-01");

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number.toLocaleString("en-GB", {
        maximumFractionDigits: 2,
      })
    : undefined;
};

const formatDateTime = (value) => {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid()
    ? parsed.format("D MMM YYYY, HH:mm")
    : null;
};

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(INITIAL_DATE);

  const {
    metricsData,
    chartData,
    decisionContext,
    loading,
    errorMsg,
  } = useWindData(selectedDate);

  const bias = metricsData?.bias;
  const hasBias = typeof bias === "number" && Number.isFinite(bias);

  const biasValue = hasBias
    ? `${bias > 0 ? "+" : ""}${formatNumber(bias)}`
    : undefined;

  const biasSubtitle = !hasBias
    ? "Awaiting analytics"
    : bias > 0
      ? "Systematic over-prediction"
      : bias < 0
        ? "Systematic under-prediction"
        : "No average bias";

  const biasColor = !hasBias
    ? "default"
    : bias > 0
      ? "warning"
      : bias < 0
        ? "error"
        : "success";

  const evaluatedPoints =
    metricsData?.comparedDataPoints ??
    metricsData?.totalDataPoints;

  const missingForecasts = metricsData?.missingForecastPoints ?? 0;

  const decisionGateLabel = formatDateTime(decisionContext?.decisionGate);
  const forecastRunLabel = formatDateTime(
    decisionContext?.forecastRunPublishTime
  );

  const handleDateChange = (newDate) => {
    if (newDate && newDate.isValid()) {
      setSelectedDate(newDate);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Header
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      {loading && (
        <LinearProgress
          aria-label="Loading wind analytics"
          sx={{ height: 2 }}
        />
      )}

      <Box
        sx={{
          width: "100%",
          maxWidth: 1800,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 3 },
        }}
      >
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h5" fontWeight={700}>
            Day-ahead decision overview
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Wind forecast available at the day-ahead gate for{" "}
            {selectedDate.format("D MMMM YYYY")}, with quantified
            forecast error against actual generation.
          </Typography>

          {(decisionGateLabel || forecastRunLabel) && (
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              sx={{ mt: 1.5 }}
            >
              {decisionGateLabel && (
                <Chip
                  size="small"
                  variant="outlined"
                  color="primary"
                  label={`Gate · ${decisionGateLabel} London`}
                  sx={{ borderRadius: 2 }}
                />
              )}

              {forecastRunLabel ? (
                <Chip
                  size="small"
                  variant="outlined"
                  color="warning"
                  label={`Forecast run · ${forecastRunLabel}`}
                  sx={{ borderRadius: 2 }}
                />
              ) : (
                <Chip
                  size="small"
                  variant="outlined"
                  color="default"
                  label="No day-ahead forecast run found"
                  sx={{ borderRadius: 2 }}
                />
              )}
            </Stack>
          )}
        </Box>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMsg}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2.5,
            mb: 3,
          }}
        >
          <MetricCard
            title="Mean Absolute Error"
            value={formatNumber(metricsData?.mae)}
            unit="MW"
            subtitle="Average absolute day-ahead error"
            tooltipText="Average absolute difference between the day-ahead forecast and actual generation. Lower is better."
            color="error"
          />

          <MetricCard
            title="Forecast Bias"
            value={biasValue}
            unit="MW"
            subtitle={biasSubtitle}
            tooltipText="Positive bias means the day-ahead forecast was higher than actual generation. Negative bias means under-prediction."
            color={biasColor}
          />

          <MetricCard
            title="Root Mean Square Error"
            value={formatNumber(metricsData?.rmse)}
            unit="MW"
            subtitle="Penalises larger forecast misses"
            tooltipText="Square root of the mean squared day-ahead forecast error. More sensitive to large outliers than MAE."
            color="warning"
          />

          <MetricCard
            title="Mean Absolute % Error"
            value={formatNumber(metricsData?.mape)}
            unit="%"
            subtitle="Relative day-ahead error"
            tooltipText="Average absolute error as a percentage of actual generation. Useful for comparing error scale across different wind levels."
            color="primary"
          />

          <MetricCard
            title="Error Band (±MAE)"
            value={formatNumber(metricsData?.errorBandMw)}
            unit="MW"
            subtitle="Uncertainty around the day-ahead forecast"
            tooltipText="Uses MAE as a simple uncertainty band around the day-ahead forecast curve shown on the chart."
            color="success"
          />

          <MetricCard
            title="Intervals Evaluated"
            value={formatNumber(evaluatedPoints)}
            unit="blocks"
            subtitle={
              missingForecasts > 0
                ? `${missingForecasts} intervals missing forecasts`
                : "Intervals with actual and forecast data"
            }
            tooltipText="Number of settlement periods included in the day-ahead analytics comparison."
            color="primary"
          />
        </Box>

        <WindChart
          chartData={chartData}
          loading={loading}
          selectedDate={selectedDate}
          decisionContext={decisionContext}
        />
      </Box>
    </Box>
  );
}

export default Dashboard;
