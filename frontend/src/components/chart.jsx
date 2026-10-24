import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";

const COLORS = {
  actual: "#60A5FA",
  forecast: "#FBBF24",
  band: "#FBBF2480",
  axis: "#94A3B8",
};

const formatMW = (value) =>
  value == null
    ? "No forecast data available"
    : `${Number(value).toLocaleString("en-GB")} MW`;

const toChartValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatStartTime = (value) =>
  value ? String(value).replace("T", " ") : "Timestamp unavailable";

const formatDateTime = (value) => {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid()
    ? parsed.format("D MMM YYYY, HH:mm")
    : null;
};

function LegendItem({ color, label, dashed = false }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        aria-hidden="true"
        sx={{
          width: 22,
          height: 0,
          borderTop: `2px ${dashed ? "dotted" : "solid"} ${color}`,
          flexShrink: 0,
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

function WindChart({
  chartData = [],
  loading = false,
  selectedDate,
  decisionContext = null,
}) {
  const rows = Array.isArray(chartData) ? chartData : [];

  const periods = rows.map((item, index) => {
    const period = Number(item.settlementPeriod);
    return Number.isFinite(period) ? period : index + 1;
  });

  const actualValues = rows.map((item) =>
    toChartValue(item.actualGeneration)
  );

  const forecastValues = rows.map((item) =>
    toChartValue(item.forecastGeneration)
  );

  const upperBandValues = rows.map((item) =>
    toChartValue(item.forecastUpperBound)
  );

  const lowerBandValues = rows.map((item) =>
    toChartValue(item.forecastLowerBound)
  );

  const publishTimeByPeriod = new Map(
    rows.map((item, index) => [
      periods[index],
      item.forecastPublishTime,
    ])
  );

  const startTimeByPeriod = new Map(
    rows.map((item, index) => [
      periods[index],
      item.startTime,
    ])
  );

  const forecastGapSeries = [];

  for (let i = 0; i < forecastValues.length - 1; i++) {
    if (
      forecastValues[i] == null ||
      forecastValues[i + 1] != null
    ) {
      continue;
    }

    let nextIndex = i + 1;

    while (
      nextIndex < forecastValues.length &&
      forecastValues[nextIndex] == null
    ) {
      nextIndex++;
    }

    if (nextIndex >= forecastValues.length) {
      continue;
    }

    const bridgeData = Array(forecastValues.length).fill(null);

    bridgeData[i] = forecastValues[i];
    bridgeData[nextIndex] = forecastValues[nextIndex];

    forecastGapSeries.push({
      id: `forecast-gap-${i}-${nextIndex}`,
      data: bridgeData,
      connectNulls: true,
      color: COLORS.forecast,
      showMark: false,
      disableHighlight: true,
      label: "",
      valueFormatter: () => null,
    });

    i = nextIndex - 1;
  }

  const hasData = rows.length > 0;
  const decisionGateLabel = formatDateTime(decisionContext?.decisionGate);
  const forecastRunLabel = formatDateTime(
    decisionContext?.forecastRunPublishTime
  );

  return (
    <Card
      component="section"
      aria-label="Wind generation comparison"
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, md: 3 },
          "&:last-child": {
            pb: { xs: 2, md: 3 },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1,
            mb: 0.5,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Actual vs. day-ahead forecast
          </Typography>

          {selectedDate && (
            <Typography variant="body2" color="text.secondary">
              Delivery · {selectedDate.format("D MMM YYYY")}
            </Typography>
          )}
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Compare actual wind generation with the forecast available at
          the day-ahead gate
          {decisionGateLabel ? ` (${decisionGateLabel} London)` : ""}.
          Shaded band is ±MAE around that forecast
          {forecastRunLabel
            ? ` · run published ${forecastRunLabel}`
            : ""}.
        </Typography>

        <Stack
          direction="row"
          flexWrap="wrap"
          gap={2.5}
          sx={{ mb: 2 }}
        >
          <LegendItem
            color={COLORS.actual}
            label="Actual generation"
          />

          <LegendItem
            color={COLORS.forecast}
            label="Day-ahead forecast"
          />

          <LegendItem
            color={COLORS.band}
            label="±MAE uncertainty band"
            dashed
          />

          <LegendItem
            color={COLORS.forecast}
            label="Missing forecast interval"
            dashed
          />
        </Stack>

        {loading && !hasData ? (
          <Box
            role="status"
            sx={{
              minHeight: 360,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <CircularProgress size={30} />
            <Typography variant="body2" color="text.secondary">
              Loading generation data...
            </Typography>
          </Box>
        ) : !hasData ? (
          <Box
            sx={{
              minHeight: 360,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                No telemetry data available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                There are no generation records for this date.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ width: "100%", minWidth: 0 }}>
            <LineChart
              height={400}
              skipAnimation
              grid={{ horizontal: true }}
              hideLegend
              margin={{
                top: 20,
                right: 24,
                bottom: 55,
                left: 76,
              }}
              xAxis={[
                {
                  data: periods,
                  scaleType: "point",
                  label: "Settlement period",

                  valueFormatter: (value, context) => {
                    if (context.location === "tooltip") {
                      const startTime = formatStartTime(
                        startTimeByPeriod.get(Number(value))
                      );
                      const publishTime = formatDateTime(
                        publishTimeByPeriod.get(Number(value))
                      );

                      return publishTime
                        ? `${startTime} · forecast published ${publishTime}`
                        : startTime;
                    }

                    return String(value);
                  },

                  tickLabelInterval: (_value, index) =>
                    index % 4 === 0 ||
                    index === periods.length - 1,

                  tickLabelStyle: {
                    fill: COLORS.axis,
                    fontSize: 11,
                  },

                  labelStyle: {
                    fill: COLORS.axis,
                    fontSize: 12,
                  },
                },
              ]}
              yAxis={[
                {
                  label: "Generation (MW)",
                  width: 76,

                  valueFormatter: (value) =>
                    Number(value).toLocaleString("en-GB"),

                  tickLabelStyle: {
                    fill: COLORS.axis,
                    fontSize: 11,
                  },

                  labelStyle: {
                    fill: COLORS.axis,
                    fontSize: 12,
                  },
                },
              ]}
              series={[
                {
                  id: "upper-band",
                  data: upperBandValues,
                  label: "Upper error band",
                  color: COLORS.band,
                  showMark: false,
                  connectNulls: false,
                  valueFormatter: (value) =>
                    value == null ? null : `Upper band ${formatMW(value)}`,
                },
                {
                  id: "lower-band",
                  data: lowerBandValues,
                  label: "Lower error band",
                  color: COLORS.band,
                  showMark: false,
                  connectNulls: false,
                  valueFormatter: (value) =>
                    value == null ? null : `Lower band ${formatMW(value)}`,
                },
                {
                  id: "actual",
                  data: actualValues,
                  label: "Actual generation",
                  color: COLORS.actual,
                  showMark: false,
                  valueFormatter: (value) =>
                    value == null ? null : formatMW(value),
                },
                {
                  id: "forecast",
                  data: forecastValues,
                  label: "Day-ahead forecast",
                  color: COLORS.forecast,
                  showMark: false,
                  connectNulls: false,
                  valueFormatter: (value) =>
                    value == null
                      ? "No forecast data available"
                      : formatMW(value),
                },
                ...forecastGapSeries,
              ]}
              slotProps={{
                tooltip: {
                  trigger: "axis",
                },
              }}
              sx={(theme) => ({
                width: "100%",

                "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": {
                  stroke: theme.palette.divider,
                },

                "& .MuiChartsGrid-line": {
                  stroke: theme.palette.divider,
                  strokeOpacity: 0.65,
                },

                "& .MuiChartsAxis-tickLabel": {
                  fill: theme.palette.text.secondary,
                },

                "& .MuiChartsAxis-label": {
                  fill: theme.palette.text.secondary,
                },

                '& .MuiLineElement-root[data-series^="forecast-gap-"]': {
                  strokeDasharray: "2 5",
                  strokeWidth: 2,
                  strokeLinecap: "round",
                },

                '& .MuiLineElement-root[data-series="upper-band"], & .MuiLineElement-root[data-series="lower-band"]': {
                  strokeDasharray: "4 4",
                  strokeWidth: 1.5,
                  strokeOpacity: 0.85,
                },
              })}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default WindChart;
