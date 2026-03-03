import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
  } from "recharts";
  
  type CategoryPoint = {
    name: string;
    value: number;
  };

  type MonthKey = "total" | "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun" | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";

  type SavingsByCategoryChartProps = {
    selectedYear: number;
    selectedMonth: MonthKey;
    selectedOrgIds: string[];
  };
  
const savingsByCategory: Record<string, Record<number, Record<string, CategoryPoint[]>>> = {
    root: {
      2024: {
      total: [
        { name: "Repair vs New", value: 1_289_234 },
        { name: "Warranty repair", value: 116_036 },
        { name: "No problem found", value: 23_428 },
        { name: "Internal rework", value: 86_320 },
      ],
      Jan: [
        { name: "Repair vs New", value: 25_000 },
        { name: "Warranty repair", value: 3_000 },
        { name: "No problem found", value: 500 },
        { name: "Internal rework", value: 1_976 },
      ],
      Feb: [
        { name: "Repair vs New", value: 78_000 },
        { name: "Warranty repair", value: 9_000 },
        { name: "No problem found", value: 1_800 },
        { name: "Internal rework", value: 7_982 },
      ],
      Mar: [
        { name: "Repair vs New", value: 90_000 },
        { name: "Warranty repair", value: 11_000 },
        { name: "No problem found", value: 2_200 },
        { name: "Internal rework", value: 8_829 },
      ],
      Apr: [
        { name: "Repair vs New", value: 105_000 },
        { name: "Warranty repair", value: 12_800 },
        { name: "No problem found", value: 2_500 },
        { name: "Internal rework", value: 9_987 },
      ],
      May: [
        { name: "Repair vs New", value: 225_000 },
        { name: "Warranty repair", value: 27_000 },
        { name: "No problem found", value: 5_400 },
        { name: "Internal rework", value: 20_399 },
      ],
      Jun: [
        { name: "Repair vs New", value: 157_000 },
        { name: "Warranty repair", value: 18_800 },
        { name: "No problem found", value: 3_800 },
        { name: "Internal rework", value: 14_616 },
      ],
      Jul: [
        { name: "Repair vs New", value: 151_500 },
        { name: "Warranty repair", value: 18_200 },
        { name: "No problem found", value: 3_600 },
        { name: "Internal rework", value: 14_246 },
      ],
      Aug: [
        { name: "Repair vs New", value: 128_500 },
        { name: "Warranty repair", value: 15_400 },
        { name: "No problem found", value: 3_100 },
        { name: "Internal rework", value: 12_155 },
      ],
      Sep: [
        { name: "Repair vs New", value: 150_500 },
        { name: "Warranty repair", value: 18_000 },
        { name: "No problem found", value: 3_600 },
        { name: "Internal rework", value: 14_192 },
      ],
      Oct: [
        { name: "Repair vs New", value: 179_000 },
        { name: "Warranty repair", value: 21_500 },
        { name: "No problem found", value: 4_300 },
        { name: "Internal rework", value: 16_829 },
      ],
      Nov: [
        { name: "Repair vs New", value: 160_000 },
        { name: "Warranty repair", value: 19_200 },
        { name: "No problem found", value: 3_800 },
        { name: "Internal rework", value: 15_432 },
      ],
      Dec: [
        { name: "Repair vs New", value: 142_000 },
        { name: "Warranty repair", value: 17_000 },
        { name: "No problem found", value: 3_400 },
        { name: "Internal rework", value: 13_643 },
      ],
    },
    2023: {
      total: [
        { name: "Repair vs New", value: 1_200_000 },
        { name: "Warranty repair", value: 108_000 },
        { name: "No problem found", value: 21_500 },
        { name: "Internal rework", value: 80_500 },
      ],
      Jan: [
        { name: "Repair vs New", value: 23_000 },
        { name: "Warranty repair", value: 2_800 },
        { name: "No problem found", value: 450 },
        { name: "Internal rework", value: 1_850 },
      ],
      Feb: [
        { name: "Repair vs New", value: 74_000 },
        { name: "Warranty repair", value: 8_500 },
        { name: "No problem found", value: 1_700 },
        { name: "Internal rework", value: 7_500 },
      ],
      Mar: [
        { name: "Repair vs New", value: 87_000 },
        { name: "Warranty repair", value: 10_000 },
        { name: "No problem found", value: 2_000 },
        { name: "Internal rework", value: 8_000 },
      ],
      Apr: [
        { name: "Repair vs New", value: 101_000 },
        { name: "Warranty repair", value: 11_600 },
        { name: "No problem found", value: 2_300 },
        { name: "Internal rework", value: 9_300 },
      ],
      May: [
        { name: "Repair vs New", value: 214_000 },
        { name: "Warranty repair", value: 24_600 },
        { name: "No problem found", value: 4_900 },
        { name: "Internal rework", value: 18_500 },
      ],
      Jun: [
        { name: "Repair vs New", value: 149_000 },
        { name: "Warranty repair", value: 17_100 },
        { name: "No problem found", value: 3_400 },
        { name: "Internal rework", value: 13_300 },
      ],
      Jul: [
        { name: "Repair vs New", value: 144_000 },
        { name: "Warranty repair", value: 16_500 },
        { name: "No problem found", value: 3_300 },
        { name: "Internal rework", value: 12_800 },
      ],
      Aug: [
        { name: "Repair vs New", value: 122_000 },
        { name: "Warranty repair", value: 14_000 },
        { name: "No problem found", value: 2_800 },
        { name: "Internal rework", value: 11_000 },
      ],
      Sep: [
        { name: "Repair vs New", value: 142_000 },
        { name: "Warranty repair", value: 16_300 },
        { name: "No problem found", value: 3_200 },
        { name: "Internal rework", value: 12_900 },
      ],
      Oct: [
        { name: "Repair vs New", value: 170_000 },
        { name: "Warranty repair", value: 19_500 },
        { name: "No problem found", value: 3_900 },
        { name: "Internal rework", value: 15_300 },
      ],
      Nov: [
        { name: "Repair vs New", value: 153_000 },
        { name: "Warranty repair", value: 17_600 },
        { name: "No problem found", value: 3_500 },
        { name: "Internal rework", value: 13_800 },
      ],
      Dec: [
        { name: "Repair vs New", value: 137_000 },
        { name: "Warranty repair", value: 15_700 },
        { name: "No problem found", value: 3_100 },
        { name: "Internal rework", value: 12_500 },
      ],
    },
    2022: {
      total: [
        { name: "Repair vs New", value: 1_150_000 },
        { name: "Warranty repair", value: 103_000 },
        { name: "No problem found", value: 20_500 },
        { name: "Internal rework", value: 77_000 },
      ],
      Jan: [
        { name: "Repair vs New", value: 22_000 },
        { name: "Warranty repair", value: 2_700 },
        { name: "No problem found", value: 430 },
        { name: "Internal rework", value: 1_770 },
      ],
      Feb: [
        { name: "Repair vs New", value: 71_000 },
        { name: "Warranty repair", value: 8_200 },
        { name: "No problem found", value: 1_600 },
        { name: "Internal rework", value: 7_200 },
      ],
      Mar: [
        { name: "Repair vs New", value: 85_000 },
        { name: "Warranty repair", value: 9_800 },
        { name: "No problem found", value: 1_900 },
        { name: "Internal rework", value: 7_700 },
      ],
      Apr: [
        { name: "Repair vs New", value: 97_000 },
        { name: "Warranty repair", value: 11_200 },
        { name: "No problem found", value: 2_200 },
        { name: "Internal rework", value: 8_900 },
      ],
      May: [
        { name: "Repair vs New", value: 206_000 },
        { name: "Warranty repair", value: 23_700 },
        { name: "No problem found", value: 4_700 },
        { name: "Internal rework", value: 17_800 },
      ],
      Jun: [
        { name: "Repair vs New", value: 145_000 },
        { name: "Warranty repair", value: 16_700 },
        { name: "No problem found", value: 3_300 },
        { name: "Internal rework", value: 12_800 },
      ],
      Jul: [
        { name: "Repair vs New", value: 139_000 },
        { name: "Warranty repair", value: 16_000 },
        { name: "No problem found", value: 3_200 },
        { name: "Internal rework", value: 12_400 },
      ],
      Aug: [
        { name: "Repair vs New", value: 119_000 },
        { name: "Warranty repair", value: 13_700 },
        { name: "No problem found", value: 2_700 },
        { name: "Internal rework", value: 10_700 },
      ],
      Sep: [
        { name: "Repair vs New", value: 137_000 },
        { name: "Warranty repair", value: 15_800 },
        { name: "No problem found", value: 3_100 },
        { name: "Internal rework", value: 12_400 },
      ],
      Oct: [
        { name: "Repair vs New", value: 166_000 },
        { name: "Warranty repair", value: 19_100 },
        { name: "No problem found", value: 3_800 },
        { name: "Internal rework", value: 14_700 },
      ],
      Nov: [
        { name: "Repair vs New", value: 149_000 },
        { name: "Warranty repair", value: 17_100 },
        { name: "No problem found", value: 3_400 },
        { name: "Internal rework", value: 13_200 },
      ],
      Dec: [
        { name: "Repair vs New", value: 134_000 },
        { name: "Warranty repair", value: 15_400 },
        { name: "No problem found", value: 3_000 },
        { name: "Internal rework", value: 12_000 },
      ],
    },
  },
  sub1: {
    2024: {
      total: [
        { name: "Repair vs New", value: 508_000 },
        { name: "Warranty repair", value: 46_000 },
        { name: "No problem found", value: 9_200 },
        { name: "Internal rework", value: 34_000 },
      ],
      Jan: [
        { name: "Repair vs New", value: 10_000 },
        { name: "Warranty repair", value: 1_200 },
        { name: "No problem found", value: 200 },
        { name: "Internal rework", value: 790 },
      ],
      Feb: [
        { name: "Repair vs New", value: 31_000 },
        { name: "Warranty repair", value: 3_600 },
        { name: "No problem found", value: 720 },
        { name: "Internal rework", value: 3_190 },
      ],
      Mar: [
        { name: "Repair vs New", value: 36_000 },
        { name: "Warranty repair", value: 4_400 },
        { name: "No problem found", value: 880 },
        { name: "Internal rework", value: 3_530 },
      ],
      Apr: [
        { name: "Repair vs New", value: 41_000 },
        { name: "Warranty repair", value: 5_100 },
        { name: "No problem found", value: 1_000 },
        { name: "Internal rework", value: 3_990 },
      ],
      May: [
        { name: "Repair vs New", value: 88_000 },
        { name: "Warranty repair", value: 10_800 },
        { name: "No problem found", value: 2_160 },
        { name: "Internal rework", value: 8_160 },
      ],
      Jun: [
        { name: "Repair vs New", value: 62_000 },
        { name: "Warranty repair", value: 7_500 },
        { name: "No problem found", value: 1_520 },
        { name: "Internal rework", value: 5_850 },
      ],
      Jul: [
        { name: "Repair vs New", value: 60_000 },
        { name: "Warranty repair", value: 7_300 },
        { name: "No problem found", value: 1_440 },
        { name: "Internal rework", value: 5_700 },
      ],
      Aug: [
        { name: "Repair vs New", value: 51_000 },
        { name: "Warranty repair", value: 6_200 },
        { name: "No problem found", value: 1_240 },
        { name: "Internal rework", value: 4_860 },
      ],
      Sep: [
        { name: "Repair vs New", value: 60_000 },
        { name: "Warranty repair", value: 7_200 },
        { name: "No problem found", value: 1_440 },
        { name: "Internal rework", value: 5_680 },
      ],
      Oct: [
        { name: "Repair vs New", value: 71_000 },
        { name: "Warranty repair", value: 8_600 },
        { name: "No problem found", value: 1_720 },
        { name: "Internal rework", value: 6_730 },
      ],
      Nov: [
        { name: "Repair vs New", value: 64_000 },
        { name: "Warranty repair", value: 7_700 },
        { name: "No problem found", value: 1_520 },
        { name: "Internal rework", value: 6_170 },
      ],
      Dec: [
        { name: "Repair vs New", value: 57_000 },
        { name: "Warranty repair", value: 6_800 },
        { name: "No problem found", value: 1_360 },
        { name: "Internal rework", value: 5_460 },
      ],
    },
    2023: {
      total: [
        { name: "Repair vs New", value: 480_000 },
        { name: "Warranty repair", value: 43_200 },
        { name: "No problem found", value: 8_600 },
        { name: "Internal rework", value: 32_200 },
      ],
      Jan: [
        { name: "Repair vs New", value: 9_200 },
        { name: "Warranty repair", value: 1_120 },
        { name: "No problem found", value: 180 },
        { name: "Internal rework", value: 740 },
      ],
      Feb: [
        { name: "Repair vs New", value: 29_600 },
        { name: "Warranty repair", value: 3_400 },
        { name: "No problem found", value: 680 },
        { name: "Internal rework", value: 3_000 },
      ],
      Mar: [
        { name: "Repair vs New", value: 34_800 },
        { name: "Warranty repair", value: 4_000 },
        { name: "No problem found", value: 800 },
        { name: "Internal rework", value: 3_200 },
      ],
      Apr: [
        { name: "Repair vs New", value: 40_400 },
        { name: "Warranty repair", value: 4_640 },
        { name: "No problem found", value: 920 },
        { name: "Internal rework", value: 3_720 },
      ],
      May: [
        { name: "Repair vs New", value: 85_600 },
        { name: "Warranty repair", value: 9_840 },
        { name: "No problem found", value: 1_960 },
        { name: "Internal rework", value: 7_400 },
      ],
      Jun: [
        { name: "Repair vs New", value: 59_600 },
        { name: "Warranty repair", value: 6_840 },
        { name: "No problem found", value: 1_360 },
        { name: "Internal rework", value: 5_320 },
      ],
      Jul: [
        { name: "Repair vs New", value: 57_600 },
        { name: "Warranty repair", value: 6_600 },
        { name: "No problem found", value: 1_320 },
        { name: "Internal rework", value: 5_120 },
      ],
      Aug: [
        { name: "Repair vs New", value: 48_800 },
        { name: "Warranty repair", value: 5_600 },
        { name: "No problem found", value: 1_120 },
        { name: "Internal rework", value: 4_400 },
      ],
      Sep: [
        { name: "Repair vs New", value: 56_800 },
        { name: "Warranty repair", value: 6_520 },
        { name: "No problem found", value: 1_280 },
        { name: "Internal rework", value: 5_160 },
      ],
      Oct: [
        { name: "Repair vs New", value: 68_000 },
        { name: "Warranty repair", value: 7_800 },
        { name: "No problem found", value: 1_560 },
        { name: "Internal rework", value: 6_120 },
      ],
      Nov: [
        { name: "Repair vs New", value: 61_200 },
        { name: "Warranty repair", value: 7_040 },
        { name: "No problem found", value: 1_400 },
        { name: "Internal rework", value: 5_520 },
      ],
      Dec: [
        { name: "Repair vs New", value: 54_400 },
        { name: "Warranty repair", value: 6_280 },
        { name: "No problem found", value: 1_240 },
        { name: "Internal rework", value: 5_000 },
      ],
    },
    2022: {
      total: [
        { name: "Repair vs New", value: 460_000 },
        { name: "Warranty repair", value: 41_200 },
        { name: "No problem found", value: 8_200 },
        { name: "Internal rework", value: 30_800 },
      ],
      Jan: [
        { name: "Repair vs New", value: 8_800 },
        { name: "Warranty repair", value: 1_080 },
        { name: "No problem found", value: 172 },
        { name: "Internal rework", value: 708 },
      ],
      Feb: [
        { name: "Repair vs New", value: 28_400 },
        { name: "Warranty repair", value: 3_280 },
        { name: "No problem found", value: 640 },
        { name: "Internal rework", value: 2_880 },
      ],
      Mar: [
          { name: "Repair vs New", value: 34_000 },
          { name: "Warranty repair", value: 3_920 },
          { name: "No problem found", value: 760 },
          { name: "Internal rework", value: 3_080 },
        ],
      Apr: [
          { name: "Repair vs New", value: 38_800 },
          { name: "Warranty repair", value: 4_480 },
          { name: "No problem found", value: 880 },
          { name: "Internal rework", value: 3_560 },
        ],
      May: [
          { name: "Repair vs New", value: 82_400 },
          { name: "Warranty repair", value: 9_480 },
          { name: "No problem found", value: 1_880 },
          { name: "Internal rework", value: 7_120 },
        ],
      Jun: [
          { name: "Repair vs New", value: 58_000 },
          { name: "Warranty repair", value: 6_680 },
          { name: "No problem found", value: 1_320 },
          { name: "Internal rework", value: 5_120 },
        ],
      Jul: [
          { name: "Repair vs New", value: 55_600 },
          { name: "Warranty repair", value: 6_400 },
          { name: "No problem found", value: 1_280 },
          { name: "Internal rework", value: 4_960 },
        ],
      Aug: [
          { name: "Repair vs New", value: 47_600 },
          { name: "Warranty repair", value: 5_480 },
          { name: "No problem found", value: 1_080 },
          { name: "Internal rework", value: 4_280 },
        ],
      Sep: [
          { name: "Repair vs New", value: 54_800 },
          { name: "Warranty repair", value: 6_320 },
          { name: "No problem found", value: 1_240 },
          { name: "Internal rework", value: 4_960 },
        ],
      Oct: [
          { name: "Repair vs New", value: 66_400 },
          { name: "Warranty repair", value: 7_640 },
          { name: "No problem found", value: 1_520 },
          { name: "Internal rework", value: 5_880 },
        ],
      Nov: [
          { name: "Repair vs New", value: 59_600 },
          { name: "Warranty repair", value: 6_840 },
          { name: "No problem found", value: 1_360 },
          { name: "Internal rework", value: 5_280 },
        ],
      Dec: [
          { name: "Repair vs New", value: 53_600 },
          { name: "Warranty repair", value: 6_160 },
          { name: "No problem found", value: 1_200 },
          { name: "Internal rework", value: 4_800 },
        ],
    },
  },
  sub2: {
    2024: {
      total: [
        { name: "Repair vs New", value: 395_000 },
        { name: "Warranty repair", value: 35_600 },
        { name: "No problem found", value: 7_100 },
        { name: "Internal rework", value: 26_400 },
      ],
      Jan: [
          { name: "Repair vs New", value: 7_700 },
          { name: "Warranty repair", value: 930 },
          { name: "No problem found", value: 155 },
          { name: "Internal rework", value: 613 },
        ],
      Feb: [
          { name: "Repair vs New", value: 24_200 },
          { name: "Warranty repair", value: 2_790 },
          { name: "No problem found", value: 558 },
          { name: "Internal rework", value: 2_475 },
        ],
      Mar: [
          { name: "Repair vs New", value: 27_900 },
          { name: "Warranty repair", value: 3_410 },
          { name: "No problem found", value: 682 },
          { name: "Internal rework", value: 2_737 },
        ],
      Apr: [
          { name: "Repair vs New", value: 32_200 },
          { name: "Warranty repair", value: 3_968 },
          { name: "No problem found", value: 775 },
          { name: "Internal rework", value: 3_097 },
        ],
      May: [
          { name: "Repair vs New", value: 68_600 },
          { name: "Warranty repair", value: 8_370 },
          { name: "No problem found", value: 1_674 },
          { name: "Internal rework", value: 6_324 },
        ],
      Jun: [
          { name: "Repair vs New", value: 48_200 },
          { name: "Warranty repair", value: 5_828 },
          { name: "No problem found", value: 1_178 },
          { name: "Internal rework", value: 4_531 },
        ],
      Jul: [
          { name: "Repair vs New", value: 46_500 },
          { name: "Warranty repair", value: 5_642 },
          { name: "No problem found", value: 1_116 },
          { name: "Internal rework", value: 4_417 },
        ],
      Aug: [
          { name: "Repair vs New", value: 39_500 },
          { name: "Warranty repair", value: 4_774 },
          { name: "No problem found", value: 961 },
          { name: "Internal rework", value: 3_768 },
        ],
      Sep: [
          { name: "Repair vs New", value: 46_200 },
          { name: "Warranty repair", value: 5_580 },
          { name: "No problem found", value: 1_116 },
          { name: "Internal rework", value: 4_399 },
        ],
      Oct: [
          { name: "Repair vs New", value: 55_200 },
          { name: "Warranty repair", value: 6_665 },
          { name: "No problem found", value: 1_333 },
          { name: "Internal rework", value: 5_218 },
        ],
      Nov: [
          { name: "Repair vs New", value: 49_600 },
          { name: "Warranty repair", value: 5_952 },
          { name: "No problem found", value: 1_178 },
          { name: "Internal rework", value: 4_784 },
        ],
      Dec: [
          { name: "Repair vs New", value: 44_000 },
          { name: "Warranty repair", value: 5_270 },
          { name: "No problem found", value: 1_054 },
          { name: "Internal rework", value: 4_231 },
        ],
    },
    2023: {
      total: [
        { name: "Repair vs New", value: 372_000 },
        { name: "Warranty repair", value: 33_480 },
        { name: "No problem found", value: 6_660 },
        { name: "Internal rework", value: 24_960 },
      ],
      Jan: [
          { name: "Repair vs New", value: 7_130 },
          { name: "Warranty repair", value: 868 },
          { name: "No problem found", value: 140 },
          { name: "Internal rework", value: 574 },
        ],
      Feb: [
          { name: "Repair vs New", value: 22_940 },
          { name: "Warranty repair", value: 2_635 },
          { name: "No problem found", value: 527 },
          { name: "Internal rework", value: 2_325 },
        ],
      Mar: [
          { name: "Repair vs New", value: 26_970 },
          { name: "Warranty repair", value: 3_100 },
          { name: "No problem found", value: 620 },
          { name: "Internal rework", value: 2_480 },
        ],
      Apr: [
          { name: "Repair vs New", value: 31_310 },
          { name: "Warranty repair", value: 3_596 },
          { name: "No problem found", value: 713 },
          { name: "Internal rework", value: 2_883 },
        ],
      May: [
          { name: "Repair vs New", value: 66_360 },
          { name: "Warranty repair", value: 7_626 },
          { name: "No problem found", value: 1_519 },
          { name: "Internal rework", value: 5_740 },
        ],
      Jun: [
          { name: "Repair vs New", value: 46_190 },
          { name: "Warranty repair", value: 5_301 },
          { name: "No problem found", value: 1_054 },
          { name: "Internal rework", value: 4_123 },
        ],
      Jul: [
          { name: "Repair vs New", value: 44_640 },
          { name: "Warranty repair", value: 5_115 },
          { name: "No problem found", value: 1_023 },
          { name: "Internal rework", value: 3_968 },
        ],
      Aug: [
          { name: "Repair vs New", value: 37_820 },
          { name: "Warranty repair", value: 4_340 },
          { name: "No problem found", value: 868 },
          { name: "Internal rework", value: 3_410 },
        ],
      Sep: [
          { name: "Repair vs New", value: 44_020 },
          { name: "Warranty repair", value: 5_053 },
          { name: "No problem found", value: 992 },
          { name: "Internal rework", value: 3_999 },
        ],
      Oct: [
          { name: "Repair vs New", value: 52_700 },
          { name: "Warranty repair", value: 6_045 },
          { name: "No problem found", value: 1_209 },
          { name: "Internal rework", value: 4_743 },
        ],
      Nov: [
          { name: "Repair vs New", value: 47_430 },
          { name: "Warranty repair", value: 5_456 },
          { name: "No problem found", value: 1_085 },
          { name: "Internal rework", value: 4_278 },
        ],
      Dec: [
          { name: "Repair vs New", value: 42_160 },
          { name: "Warranty repair", value: 4_867 },
          { name: "No problem found", value: 961 },
          { name: "Internal rework", value: 3_875 },
        ],
    },
    2022: {
      total: [
        { name: "Repair vs New", value: 356_500 },
        { name: "Warranty repair", value: 31_930 },
        { name: "No problem found", value: 6_350 },
        { name: "Internal rework", value: 23_870 },
      ],
      Jan: [
          { name: "Repair vs New", value: 6_820 },
          { name: "Warranty repair", value: 837 },
          { name: "No problem found", value: 133 },
          { name: "Internal rework", value: 549 },
        ],
      Feb: [
          { name: "Repair vs New", value: 21_870 },
          { name: "Warranty repair", value: 2_542 },
          { name: "No problem found", value: 496 },
          { name: "Internal rework", value: 2_232 },
        ],
      Mar: [
          { name: "Repair vs New", value: 26_350 },
          { name: "Warranty repair", value: 3_038 },
          { name: "No problem found", value: 589 },
          { name: "Internal rework", value: 2_387 },
        ],
      Apr: [
          { name: "Repair vs New", value: 30_070 },
          { name: "Warranty repair", value: 3_472 },
          { name: "No problem found", value: 682 },
          { name: "Internal rework", value: 2_759 },
        ],
      May: [
          { name: "Repair vs New", value: 63_860 },
          { name: "Warranty repair", value: 7_347 },
          { name: "No problem found", value: 1_457 },
          { name: "Internal rework", value: 5_518 },
        ],
      Jun: [
          { name: "Repair vs New", value: 44_950 },
          { name: "Warranty repair", value: 5_177 },
          { name: "No problem found", value: 1_023 },
          { name: "Internal rework", value: 3_968 },
        ],
      Jul: [
          { name: "Repair vs New", value: 43_180 },
          { name: "Warranty repair", value: 4_960 },
          { name: "No problem found", value: 992 },
          { name: "Internal rework", value: 3_844 },
        ],
      Aug: [
          { name: "Repair vs New", value: 36_890 },
          { name: "Warranty repair", value: 4_247 },
          { name: "No problem found", value: 837 },
          { name: "Internal rework", value: 3_317 },
        ],
      Sep: [
          { name: "Repair vs New", value: 42_470 },
          { name: "Warranty repair", value: 4_898 },
          { name: "No problem found", value: 961 },
          { name: "Internal rework", value: 3_844 },
        ],
      Oct: [
          { name: "Repair vs New", value: 51_430 },
          { name: "Warranty repair", value: 5_921 },
          { name: "No problem found", value: 1_178 },
          { name: "Internal rework", value: 4_557 },
        ],
      Nov: [
          { name: "Repair vs New", value: 46_265 },
          { name: "Warranty repair", value: 5_301 },
          { name: "No problem found", value: 1_054 },
          { name: "Internal rework", value: 4_092 },
        ],
      Dec: [
          { name: "Repair vs New", value: 41_140 },
          { name: "Warranty repair", value: 4_774 },
          { name: "No problem found", value: 930 },
          { name: "Internal rework", value: 3_720 },
        ],
    },
  },
  sub3: {
    2024: {
      total: [
        { name: "Repair vs New", value: 386_234 },
        { name: "Warranty repair", value: 34_836 },
        { name: "No problem found", value: 6_928 },
        { name: "Internal rework", value: 25_920 },
      ],
      Jan: [
          { name: "Repair vs New", value: 7_576 },
          { name: "Warranty repair", value: 907 },
          { name: "No problem found", value: 145 },
          { name: "Internal rework", value: 573 },
        ],
      Feb: [
          { name: "Repair vs New", value: 23_582 },
          { name: "Warranty repair", value: 2_709 },
          { name: "No problem found", value: 522 },
          { name: "Internal rework", value: 2_318 },
        ],
      Mar: [
          { name: "Repair vs New", value: 27_129 },
          { name: "Warranty repair", value: 3_159 },
          { name: "No problem found", value: 638 },
          { name: "Internal rework", value: 2_562 },
        ],
      Apr: [
          { name: "Repair vs New", value: 31_687 },
          { name: "Warranty repair", value: 3_872 },
          { name: "No problem found", value: 725 },
          { name: "Internal rework", value: 3_199 },
        ],
      May: [
          { name: "Repair vs New", value: 67_399 },
          { name: "Warranty repair", value: 7_830 },
          { name: "No problem found", value: 1_674 },
          { name: "Internal rework", value: 6_319 },
        ],
      Jun: [
          { name: "Repair vs New", value: 47_216 },
          { name: "Warranty repair", value: 5_828 },
          { name: "No problem found", value: 1_178 },
          { name: "Internal rework", value: 4_466 },
        ],
      Jul: [
          { name: "Repair vs New", value: 45_546 },
          { name: "Warranty repair", value: 5_462 },
          { name: "No problem found", value: 1_116 },
          { name: "Internal rework", value: 4_246 },
        ],
      Aug: [
          { name: "Repair vs New", value: 38_655 },
          { name: "Warranty repair", value: 4_774 },
          { name: "No problem found", value: 961 },
          { name: "Internal rework", value: 3_655 },
        ],
      Sep: [
          { name: "Repair vs New", value: 45_292 },
          { name: "Warranty repair", value: 5_580 },
          { name: "No problem found", value: 1_116 },
          { name: "Internal rework", value: 4_192 },
        ],
      Oct: [
          { name: "Repair vs New", value: 54_129 },
          { name: "Warranty repair", value: 6_665 },
          { name: "No problem found", value: 1_333 },
          { name: "Internal rework", value: 5_029 },
        ],
      Nov: [
          { name: "Repair vs New", value: 48_632 },
          { name: "Warranty repair", value: 5_952 },
          { name: "No problem found", value: 1_178 },
          { name: "Internal rework", value: 4_432 },
        ],
      Dec: [
          { name: "Repair vs New", value: 43_143 },
          { name: "Warranty repair", value: 5_270 },
          { name: "No problem found", value: 1_054 },
          { name: "Internal rework", value: 3_943 },
        ],
    },
    2023: {
      total: [
        { name: "Repair vs New", value: 364_000 },
        { name: "Warranty repair", value: 32_760 },
        { name: "No problem found", value: 6_520 },
        { name: "Internal rework", value: 24_440 },
      ],
      Jan: [
          { name: "Repair vs New", value: 6_970 },
          { name: "Warranty repair", value: 848 },
          { name: "No problem found", value: 136 },
          { name: "Internal rework", value: 560 },
        ],
      Feb: [
          { name: "Repair vs New", value: 22_400 },
          { name: "Warranty repair", value: 2_576 },
          { name: "No problem found", value: 512 },
          { name: "Internal rework", value: 2_240 },
        ],
      Mar: [
          { name: "Repair vs New", value: 26_320 },
          { name: "Warranty repair", value: 3_024 },
          { name: "No problem found", value: 600 },
          { name: "Internal rework", value: 2_400 },
        ],
      Apr: [
          { name: "Repair vs New", value: 30_520 },
          { name: "Warranty repair", value: 3_508 },
          { name: "No problem found", value: 690 },
          { name: "Internal rework", value: 2_790 },
        ],
      May: [
          { name: "Repair vs New", value: 64_680 },
          { name: "Warranty repair", value: 7_434 },
          { name: "No problem found", value: 1_470 },
          { name: "Internal rework", value: 5_550 },
        ],
      Jun: [
          { name: "Repair vs New", value: 45_080 },
          { name: "Warranty repair", value: 5_184 },
          { name: "No problem found", value: 1_020 },
          { name: "Internal rework", value: 3_960 },
        ],
      Jul: [
          { name: "Repair vs New", value: 43_520 },
          { name: "Warranty repair", value: 5_005 },
          { name: "No problem found", value: 990 },
          { name: "Internal rework", value: 3_840 },
        ],
      Aug: [
          { name: "Repair vs New", value: 36_960 },
          { name: "Warranty repair", value: 4_256 },
          { name: "No problem found", value: 840 },
          { name: "Internal rework", value: 3_280 },
        ],
      Sep: [
          { name: "Repair vs New", value: 42_560 },
          { name: "Warranty repair", value: 4_928 },
          { name: "No problem found", value: 960 },
          { name: "Internal rework", value: 3_840 },
        ],
      Oct: [
          { name: "Repair vs New", value: 51_520 },
          { name: "Warranty repair", value: 5_928 },
          { name: "No problem found", value: 1_170 },
          { name: "Internal rework", value: 4_560 },
        ],
      Nov: [
          { name: "Repair vs New", value: 46_400 },
          { name: "Warranty repair", value: 5_344 },
          { name: "No problem found", value: 1_050 },
          { name: "Internal rework", value: 4_140 },
        ],
      Dec: [
          { name: "Repair vs New", value: 41_160 },
          { name: "Warranty repair", value: 4_746 },
          { name: "No problem found", value: 930 },
          { name: "Internal rework", value: 3_750 },
        ],
    },
    2022: {
      total: [
        { name: "Repair vs New", value: 348_500 },
        { name: "Warranty repair", value: 31_190 },
        { name: "No problem found", value: 6_200 },
        { name: "Internal rework", value: 23_270 },
      ],
      Jan: [
          { name: "Repair vs New", value: 6_660 },
          { name: "Warranty repair", value: 819 },
          { name: "No problem found", value: 129 },
          { name: "Internal rework", value: 531 },
        ],
      Feb: [
          { name: "Repair vs New", value: 21_340 },
          { name: "Warranty repair", value: 2_462 },
          { name: "No problem found", value: 480 },
          { name: "Internal rework", value: 2_160 },
        ],
      Mar: [
          { name: "Repair vs New", value: 25_650 },
          { name: "Warranty repair", value: 2_940 },
          { name: "No problem found", value: 570 },
          { name: "Internal rework", value: 2_310 },
        ],
      Apr: [
          { name: "Repair vs New", value: 29_260 },
          { name: "Warranty repair", value: 3_360 },
          { name: "No problem found", value: 660 },
          { name: "Internal rework", value: 2_670 },
        ],
      May: [
          { name: "Repair vs New", value: 62_090 },
          { name: "Warranty repair", value: 7_110 },
          { name: "No problem found", value: 1_410 },
          { name: "Internal rework", value: 5_340 },
        ],
      Jun: [
          { name: "Repair vs New", value: 43_700 },
          { name: "Warranty repair", value: 5_019 },
          { name: "No problem found", value: 990 },
          { name: "Internal rework", value: 3_840 },
        ],
      Jul: [
          { name: "Repair vs New", value: 42_020 },
          { name: "Warranty repair", value: 4_800 },
          { name: "No problem found", value: 960 },
          { name: "Internal rework", value: 3_720 },
        ],
      Aug: [
          { name: "Repair vs New", value: 35_890 },
          { name: "Warranty repair", value: 4_127 },
          { name: "No problem found", value: 810 },
          { name: "Internal rework", value: 3_217 },
        ],
      Sep: [
          { name: "Repair vs New", value: 41_330 },
          { name: "Warranty repair", value: 4_758 },
          { name: "No problem found", value: 930 },
          { name: "Internal rework", value: 3_744 },
        ],
      Oct: [
          { name: "Repair vs New", value: 50_030 },
          { name: "Warranty repair", value: 5_761 },
          { name: "No problem found", value: 1_140 },
          { name: "Internal rework", value: 4_410 },
        ],
      Nov: [
          { name: "Repair vs New", value: 45_035 },
          { name: "Warranty repair", value: 5_181 },
          { name: "No problem found", value: 1_020 },
          { name: "Internal rework", value: 3_960 },
        ],
      Dec: [
        { name: "Repair vs New", value: 40_040 },
        { name: "Warranty repair", value: 4_614 },
        { name: "No problem found", value: 900 },
        { name: "Internal rework", value: 3_600 },
      ],
    },
  },
};
  
const COLORS = ["#2563eb", "#3b82f6", "#22c55e", "#38bdf8"];
  
export function SavingsByCategoryChart({ selectedYear, selectedMonth, selectedOrgIds }: SavingsByCategoryChartProps) {
    // Aggregate data from all selected orgs
    // If no subsidiaries selected, use empty data (Interpretation A)
    const data = (() => {
      if (selectedOrgIds.length === 0) {
        return [];
      }
      
      // Get data for each selected org and aggregate by category
      const categoryMap: Record<string, number> = {};
      
      selectedOrgIds.forEach((orgId) => {
        const orgData = savingsByCategory[orgId] || savingsByCategory.root;
        const yearData = orgData[selectedYear] || orgData[2024];
        const monthData = yearData[selectedMonth] || yearData.total;
        
        monthData.forEach((point) => {
          categoryMap[point.name] = (categoryMap[point.name] || 0) + point.value;
        });
      });
      
      // Convert to array with name/value format for PieChart
      return Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
      }));
    })();
    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 12,
          padding: 24,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.02)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            margin: 0,
            marginBottom: 6,
            color: "#0f172a",
          }}
        >
          Savings by Category
        </h2>
        <p
          style={{
            margin: 0,
            marginBottom: 20,
            fontSize: 13,
            color: "#64748b",
          }}
        >
          Breakdown of cost savings by repair outcome.
        </p>
  
        <div style={{ width: "100%", height: 260, position: "relative", overflow: "visible" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  `$${value.toLocaleString("en-US")}`
                }
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  color: "#1e293b",
                  fontSize: 13,
                  fontWeight: 500,
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)",
                  padding: "8px 12px",
                }}
                wrapperStyle={{ zIndex: 9999, pointerEvents: 'none' }}
              />
              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                iconType="circle"
                formatter={(value: string) => (
                  <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }