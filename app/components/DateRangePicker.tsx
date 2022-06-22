import { Text } from "@mantine/core";
import type { DateRangePickerProps } from "@mantine/dates";
import { DateRangePicker as MantineDateRangePicker } from "@mantine/dates";
import { format } from "~/utils/date";

export default function DateRangePicker(props: DateRangePickerProps) {
  return (
    <MantineDateRangePicker
      amountOfMonths={2}
      previousMonthLabel="Previous month"
      nextMonthLabel="Next month"
      renderDay={(day) => (
        <Text size="sm" aria-label={format(day)}>
          {day.getDate()}
        </Text>
      )}
      {...props}
    />
  );
}
