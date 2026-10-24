import {
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import BoltIcon from "@mui/icons-material/Bolt";
import HistoryIcon from "@mui/icons-material/History";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import dayjs from "dayjs";

const JANUARY_START = dayjs("2026-01-01");
const JANUARY_END = dayjs("2026-01-31");

function Header({ selectedDate, onDateChange }) {
  const handleDateChange = (newDate) => {
    if (newDate && newDate.isValid()) {
      onDateChange(newDate);
    }
  };

  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        boxSizing: "border-box",
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        px: { xs: 2, md: 3 },
        py: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        width="100%"
        gap={2}
      >
        
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              flexShrink: 0,
              borderRadius: 2,
              bgcolor: "rgba(251, 191, 36, 0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BoltIcon
              sx={{
                fontSize: 27,
                color: "warning.main",
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h1"
              variant="h6"
              sx={{
                fontSize: { xs: "1rem", sm: "1.15rem" },
                lineHeight: 1.4,
              }}
            >
              UK Wind Power Intelligence Portal
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Day-ahead market analytics
              {selectedDate &&
                ` · ${selectedDate.format("MMMM YYYY")}`}
            </Typography>
          </Box>
        </Stack>

        
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.5}
          sx={{
            ml: { md: "auto" },
            flexShrink: 0,
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Delivery date"
              value={selectedDate}
              onChange={handleDateChange}
              minDate={JANUARY_START}
              maxDate={JANUARY_END}
              format="DD MMM YYYY"
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    width: { xs: "100%", sm: 190 },
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "background.default",
                      borderRadius: 2,
                    },
                  },
                },
                openPickerButton: {
                  "aria-label": "Choose delivery date",
                },
              }}
            />
          </LocalizationProvider>

          <Chip
            icon={<HistoryIcon />}
            label="Elexon BMRS · Historical"
            variant="outlined"
            color="success"
            size="small"
            sx={{
              height: 36,
              borderRadius: 2,
              justifyContent: "center",
              alignSelf: { xs: "flex-start", sm: "center" },
              "& .MuiChip-label": {
                px: 1.25,
              },
            }}
          />
        </Stack>
      </Stack>
    </Box>
  );
}

export default Header;