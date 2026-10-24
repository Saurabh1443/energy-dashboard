import {
  Box,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Theme palette paths keep colors consistent with theme.js.
const METRIC_COLORS = {
  primary: "primary.main",
  error: "error.main",
  warning: "warning.main",
  success: "success.main",
  default: "text.primary",
};

function MetricCard({
  title,
  value,
  unit = "",
  subtitle,
  tooltipText,
  color = "primary",
}) {
  const accentColor =
    METRIC_COLORS[color] ?? METRIC_COLORS.primary;

  return (
    <Card
      component="article"
      sx={{
        height: "100%",
        borderLeft: 3,
        borderLeftColor: accentColor,
        transition: (theme) =>
          theme.transitions.create(
            ["transform", "border-color"],
            {
              duration: theme.transitions.duration.short,
            }
          ),
        "&:hover": {
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          "&:last-child": { pb: 2.5 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              fontWeight: 700,
              lineHeight: 1.5,
              letterSpacing: "0.06em",
            }}
          >
            {title}
          </Typography>

          {tooltipText && (
            <Tooltip
              title={tooltipText}
              arrow
              placement="top"
            >
              <IconButton
                size="small"
                aria-label={`${title} information`}
                sx={{
                  color: "text.secondary",
                  p: 0.5,
                }}
              >
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap",
            columnGap: 1,
            rowGap: 0.5,
          }}
        >
          <Typography
            variant="h4"
            component="p"
            sx={{
              color: accentColor,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              overflowWrap: "anywhere",
              m: 0,
            }}
          >
            {value ?? "—"}
          </Typography>

          {unit && (
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
              }}
            >
              {unit}
            </Typography>
          )}
        </Box>

        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1.25,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default MetricCard;