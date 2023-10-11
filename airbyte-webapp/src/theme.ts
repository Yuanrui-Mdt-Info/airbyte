import scss from "./scss/export.module.scss";

// Load all theme variables from our SCSS variables
export const theme = {
  blue50: scss.blue50,
  blue100: scss.blue100,
  blue200: scss.blue200,
  blue300: scss.blue300,
  blue400: scss.blue400,
  blue500: scss.blue500,
  blue600: scss.blue600,
  blue700: scss.blue700,
  blue800: scss.blue800,
  blue900: scss.blue900,
  blue: scss.blue,
  blueTransparent: scss.blueTransparent,

  darkBlue50: scss.darkBlue50,
  darkBlue100: scss.darkBlue100,
  darkBlue200: scss.darkBlue200,
  darkBlue300: scss.darkBlue300,
  darkBlue400: scss.darkBlue400,
  darkBlue500: scss.darkBlue500,
  darkBlue600: scss.darkBlue600,
  darkBlue700: scss.darkBlue700,
  darkBlue800: scss.darkBlue800,
  darkBlue900: scss.darkBlue900,
  darkBlue: scss.darkBlue,

  grey30: scss.grey30,
  grey40: scss.grey40,
  grey50: scss.grey50,
  grey100: scss.grey100,
  grey200: scss.grey200,
  grey300: scss.grey300,
  grey400: scss.grey400,
  grey500: scss.grey500,
  grey600: scss.grey600,
  grey700: scss.grey700,
  grey800: scss.grey800,
  grey900: scss.grey900,
  grey: scss.grey,

  orange50: scss.orange50,
  orange100: scss.orange100,
  orange200: scss.orange200,
  orange300: scss.orange300,
  orange400: scss.orange400,
  orange500: scss.orange500,
  orange600: scss.orange600,
  orange700: scss.orange700,
  orange800: scss.orange800,
  orange900: scss.orange900,
  orange: scss.orange,

  green50: scss.green50,
  green100: scss.green100,
  green200: scss.green200,
  green300: scss.green300,
  green400: scss.green400,
  green500: scss.green500,
  green600: scss.green600,
  green700: scss.green700,
  green800: scss.green800,
  green900: scss.green900,
  green: scss.green,

  red50: scss.red50,
  red100: scss.red100,
  red200: scss.red200,
  red300: scss.red300,
  red400: scss.red400,
  red500: scss.red500,
  red600: scss.red600,
  red700: scss.red700,
  red800: scss.red800,
  red900: scss.red900,
  red: scss.red,

  beige50: scss.beige50,
  beige100: scss.beige100,
  beige: scss.beige,

  black: scss.black,
  black300: scss.black300,
  white: scss.white,

  yellow50: scss.yellow50,
  yellow100: scss.yellow100,
  yellow200: scss.yellow200,
  yellow300: scss.yellow300,
  yellow400: scss.yellow400,
  yellow500: scss.yellow500,
  yellow600: scss.yellow600,
  yellow700: scss.yellow700,
  yellow800: scss.yellow800,
  yellow900: scss.yellow900,
  yellow: scss.yellow,

  // Legacy colors - Do not use for new components
  primaryColor: scss.blue,
  primaryColor25: scss.blue100,
  primaryColor12: scss.primaryColor12,
  mediumPrimaryColor: scss.darkBlue700,
  mediumPrimaryColor20: scss.blue50,
  darkPrimaryColor: scss.darkBlue,
  darkPrimaryColor60: scss.blue400,
  brightPrimaryColor: scss.blue100,
  lightPrimaryColor: scss.blue50,

  brightColor: scss.blue50,

  dangerColor: scss.red,
  dangerColor25: scss.red50,
  warningColor: scss.yellow,
  warningBackgroundColor: scss.yellow100,
  lightDangerColor: scss.red50,
  dangerTransparentColor: scss.red50,
  successColor: scss.green,
  successColor20: scss.green50,
  backgroundColor: scss.backgroundColor,
  shadowColor: scss.shadowColor,
  cardShadowColor: scss.cardShadowColor,

  textColor: scss.darkBlue,
  lightTextColor: scss.grey,
  textColor90: scss.textColor90,
  darkBlue90: scss.darkBlue90,
  greyColor70: scss.grey600,
  greyColor60: scss.grey500,
  greyColor55: scss.grey400,
  greyColor40: scss.grey300,
  greyColor30: scss.grey200,
  greyColor20: scss.grey100,
  greyColor10: scss.grey100,
  greyColor0: scss.grey50,

  whiteColor: scss.white,
  blackColor: scss.black,
  beigeColor: scss.beige,
  darkBeigeColor: scss.beige100,
  borderTableColor: scss.grey100,
  lightTableColor: scss.grey50,
  darkGreyColor: scss.grey400,
  redColor: scss.orange,
  lightRedColor: scss.lightRedColor,
  redTransparentColor: scss.orange50,
  transparentColor: scss.transparentColor,

  regularFont: scss.regularFont,
  highlightFont: scss.highlightFont,
  codeFont: scss.codeFont,
  italicFont: scss.italicFont,
};

export const barChartColors = [scss.blue400, scss.black300];

export type Theme = typeof theme;
