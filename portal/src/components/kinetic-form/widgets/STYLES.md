[&#x2B9C; Back to Kinetic Form Widgets](README.md#available-widgets)

## Styles

This documentation lists all the Tailwind, DaisyUI, and custom classes that have been exposed to be used in Kinetic forms.

### Alerts

- **Alert Base**
  - `kalert`
- **Alert Variants**
  - `kalert-outline` `kalert-soft`
- **Alert Colors**
  - `kalert-info` `kalert-success` `kalert-warning` `kalert-error`
- **Alert Sizes**
  - `kalert-xs` `kalert-sm` `kalert-md` `kalert-lg` `kalert-xl` `kalert-vertical` `kalert-horizontal`

### Badges

- **Badge Base**
  - `kbadge`
- **Badge Variants**
  - `kbadge-outline` `kbadge-ghost`
- **Badge Colors**
  - `kbadge-primary` `kbadge-secondary` `kbadge-accent` `kbadge-neutral` `kbadge-info` `kbadge-success` `kbadge-warning` `kbadge-error`
- **Badge Sizes**
  - `kbadge-xs` `kbadge-sm` `kbadge-md` `kbadge-lg` `kbadge-xl`

### Borders

- **Border Size**
  - `border-#` `border-t-#` `border-r-#` `border-b-#` `border-l-#` `border-x-#` `border-y-#`
    - Where `#` is between `0` and `8` (inclusive). Numeric values increase in `1px` increments.
- **Border Radius**
  - `rounded` `rounded-none` `rounded-sm` `rounded-md` `rounded-lg` `rounded-xl` `rounded-2xl` `rounded-3xl` `rounded-full` `rounded-box`

### Buttons

- **Button Base**
  - `kbtn`
- **Button Variants**
  - `kbtn-outline` `kbtn-ghost`
- **Button Colors**
  - `kbtn-primary` `kbtn-secondary` `kbtn-accent` `kbtn-neutral` `kbtn-info` `kbtn-success` `kbtn-warning` `kbtn-error`
- **Button Sizes**
  - `kbtn-xs` `kbtn-sm` `kbtn-md` `kbtn-lg` `kbtn-xl` `kbtn-block` `kbtn-circle`

### Colors

- **Color Names**
  - `base-100` `base-200` `base-300` `primary` `secondary` `accent` `neutral` `info` `success` `warning` `error`
  - Each of the above colors also has a complementary color by adding `-content`. Ex: `primary-content`
- **Background Color**
  - `bg-COLOR` where `COLOR` is one of the above color names.
- **Text Color**
  - `text-COLOR` where `COLOR` is one of the above color names.
- **Border Color**
  - `border-COLOR` where `COLOR` is one of the above color names.

### Forms

Form elements (inputs, selects, etc) will automatically be styled to match the design system. Use the `unstyled` class to remove any styling and add your own if needed.

- Columns and Misc
  - `cols-2` `cols-3` `cols-4` _Only usable on sections, and checkbox and radio fields. Not compatible with `vertical`._
  - `full-width` _Usable on children of a section that uses one of the above column classes to make this child full width._
  - `vertical` _Usable on checkbox and radio fields to align options vertically. Usable on sections to stack children vertically._
  - `align-right` _Usable on a section to align its children to the right. Usable on a button to align it and anything after it to the right._

### Layout

- **Display**
  - `block` `inline` `inline-block` `flex` `inline-flex` `hidden` `sr-only`
- **Flex Layout**
  - `flex-wrap`
  - **Row Layouts** _(1st letter -> justify content | 2nd letter -> align items)_ `s=start` `c=center` `e=end` `b=between` `t=stretch`
    - `flex-ss` `flex-sc` `flex-se` `flex-st`
    - `flex-cs` `flex-cc` `flex-ce` `flex-ct`
    - `flex-es` `flex-ec` `flex-ee` `flex-et`
    - `flex-bs` `flex-bc` `flex-be` `flex-bt`
  - **Column Layouts** _(1st letter -> justify content | 2nd letter -> align items)_ `s=start` `c=center` `e=end` `b=between` `t=stretch`
    - `flex-c-ss` `flex-c-sc` `flex-c-se` `flex-c-st`
    - `flex-c-cs` `flex-c-cc` `flex-c-ce` `flex-c-ct`
    - `flex-c-es` `flex-c-ec` `flex-c-ee` `flex-c-et`
    - `flex-c-bs` `flex-c-bc` `flex-c-be` `flex-c-bt`
- **Flex Item**
  - `flex-auto` `flex-initial` `flex-none` `flex-full` `flex-0` `flex-1`
- **Gap**
  - `gap-#` `gap-x-#` `gap-y-#` where `#` is between `0` and `24` (inclusive). Numeric values increase in `4px` increments.

### Margin and Padding

- **Margin**
  - `m-#` `mt-#` `mr-#` `mb-#` `ml-#` `mx-#` `my-#`
    - Where `#` is between `0` and `24` (inclusive), or `auto`. Numeric values increase in `4px` increments.
  - You can prepend `-` to the class name to make the margin negative. Ex: `-m-3`.
- **Padding**
  - `p-#` `pt-#` `pr-#` `pb-#` `pl-#` `px-#` `py-#`
    - Where `#` is between `0` and `24` (inclusive), or `auto`. Numeric values increase in `4px` increments.

### Shadow

- **Box Shadow**
  - `shadow` `shadow-none` `shadow-xs` `shadow-sm` `shadow-md` `shadow-lg` `shadow-xl` `shadow-2xl`

### Sizes

- **Width and Height**
  - `w-auto` `w-px` `w-full` `w-screen`
  - `h-auto` `h-px` `h-full` `h-screen`
  - `w-#` `h-#` where `#` is between `0` and `24` inclusive. Numeric values increase in `4px` increments.
  - `w-#/5` `h-#/5` where `#` is between `1` and `4` inclusive. These divide the width into fifths.
  - `w-#/12` `h-#/12` where `#` is between `1` and `11` inclusive. These divide the width into twelfths.
- **Max Width**
  - `max-w-0` `max-w-none` `max-w-full` `max-w-screen` `max-w-xs` `max-w-sm` `max-w-md` `max-w-lg` `max-w-xl` `max-w-screen-sm` `max-w-screen-md` `max-w-screen-lg` `max-w-screen-xl` `max-w-screen-2xl`
- **Min Width**
  - `min-w-0` `min-w-auto` `min-w-full` `min-w-screen`
- **Max Height**
  - `max-h-none` `max-h-full` `max-h-screem`
  - `max-h-#` where `#` is between `0` and `96` (inclusive) in steps of `16`. Numeric values increase in `4px` increments (so `16` is `64px`).
- **Min Height**
  - `min-h-0` `min-h-auto` `min-h-full` `min-h-screen`

### Typography

- **Headings**
  - `d1` `d2` `h1` `h2` `h3` `h4` `h5` `h6`
- **Font Size**
  - `text-xs` `text-sm` `text-base` `text-lg` `text-xl` `text-2xl` `text-3xl` `text-4xl` `text-5xl`
- **Font Weight**
  - `font-light` `font-normal` `font-medium` `font-semibold` `font-bold` `font-extrabold`
- **Font Styles**
  - `underline` `italic` `uppercase` `lowercase` `capitalize`
- **Text Alignment**
  - `text-left` `text-center` `text-right`
- **Text Truncation**
  - `truncate` `line-clamp-#` where `#` is between `1` and `5` (inclusive).
