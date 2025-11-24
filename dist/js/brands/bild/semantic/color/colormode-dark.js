/**
 * colormode-dark.js
 * Generiert am: 2025-11-24T21:42:41.668Z
 * Nicht manuell bearbeiten!
 */

// ============================================
// SEMANTIC
// ============================================

// Semantic - Text
/** Applies to text elements requiring fixed brand color usage (e.g., permanent links, brand slogans on constant backgrounds).
Behavior: Constant — maintains identical red tone across Light and Dark mode. */
export const textColorAccentConstant = "#DD0000";
/** Main text color used for body copy and all primary textual content. Ensures optimal readability and contrast on standard surfaces.
Behavior: Dynamic — switches between dark text on light backgrounds and light text on dark backgrounds. */
export const textColorPrimary = "#E9ECEF";
/** Muted text tone for subtle information, timestamps, or inactive text elements.
Behavior: Dynamic — adjusts between mid-gray in Light mode and lighter gray in Dark mode. */
export const textColorMuted = "#CED4DA";
/** Inverse text color used on opposing surfaces (e.g., white text on red or dark backgrounds).
Behavior: Dynamic — alternates between light and dark mode. */
export const textColorPrimaryInverse = "#232629";
/** Used when primary text color must remain fixed regardless of mode (e.g., on light constant backgrounds).
Behavior: Constant — same tone across Light and Dark mode. */
export const textColorPrimaryConstant = "#232629";
/** Used for positive or success-related messages (e.g., “Saved”, “Success”, or confirmation text) on success surface colors.
Behavior: Constant — green tone remains consistent across both modes. */
export const textColorSuccessConstant = "#006E3E";
/** Fixed inverse tone for text that always appears on dark surfaces (e.g., hero headlines or persistent dark cards).
Behavior: Constant — unchanged across modes. */
export const textColorPrimaryInverseConstant = "#E9ECEF";
/** Secondary text color used for supportive information, subtitles, and less prominent text.
Behavior: Dynamic — adapts between neutral tones to maintain proper contrast per theme. In 2025 css it is called figure meta. */
export const textColorSecondary = "#8C9196";
/** Used for strong warnings, errors, or destructive action labels.
Behavior: Constant — red color remains unchanged between Light and Dark mode for visibility and recognition. */
export const textColorAttentionHigh = "#DD0000";
/** Accent text color used for links, interactive text, or highlighted key words. Changes from a red in light mode to a white in dark mode. */
export const textColorAccent = "#FFFFFF";
/** Represents medium attention states, often used in warnings or pending states.
Behavior: Constant — same orange tone across Light and Dark mode. */
export const textColorAttentionMedium = "#FD8227";
/** Used for text displayed on dark surfaces to ensure maximum legibility and contrast.
Behavior: Constant — always light neutral to guarantee accessibility on dark backgrounds. */
export const textColorOnDarkSurface = "#FFFFFF";

// Semantic - Surface
/** Primary surface color used for main backgrounds and large layout areas (e.g., page background, primary containers).
Behavior: Dynamic — adapts between light and dark surface tokens to maintain legibility and hierarchy. */
export const surfaceColorPrimary = "#232629";
/** Used for secondary surface layers such as cards, panels, or nested containers that need to differentiate themselves from the primary surface. .
Behavior: Dynamic — adapts brightness level based on mode for appropriate depth contrast. */
export const surfaceColorSecondary = "#2C3138";
/** Inverse of the primary surface, used when Light and Dark surfaces are swapped (e.g., inverse cards or elevated sections).
Behavior: Dynamic — switches between dark and light values depending on mode. */
export const surfaceColorPrimaryInverse = "#FFFFFF";
/** A fixed light surface tone used when a consistent light background is required (e.g., light panels within dark layouts).
Behavior: Constant — remains the same in both modes. */
export const surfaceColorPrimaryConstantLight = "#FFFFFF";
/** A fixed dark surface tone used for dark overlays or nested dark sections inside light layouts.
Behavior: Constant — identical across Light and Dark mode. */
export const surfaceColorPrimaryConstantDark = "#232629";
/** HIghtest elevation surface color, typically used for grouping or background accents to differentiate themselves from all previous surface color options. Uses corresponding light/dark tones for consistent layering. */
export const surfaceColorQuartenary = "#4B525A";
/** Success-related background used for positive notifications, confirmation surfaces, or success banners.
Behavior: Constant — remains the same across Light and Dark mode to ensure brand alignment. */
export const surfaceColorSuccess = "#CEF4E4";
/** Tertiary background layer for inner containers, grouped content, or subtle elevation steps  that need to differentiate themselves from the primary and secondary surfaces.
Behavior: Dynamic — switches between light and dark tertiary tones. */
export const surfaceColorTertiary = "#343C41";
/** Represents tertiary-level gradient background.
Currently used on skeletons. */
export const surfaceColorTertiaryGradientStop = "rgba(52, 60, 65, 0)";
/** Inverse tertiary background, applied when Light and Dark surfaces are reversed (e.g., dark-on-light cards).
Behavior: Dynamic — swaps values between modes for contrast preservation. */
export const surfaceColorTertiaryInverse = "#E9ECEF";
/** Defines the end stops for primary surface gradients, creating visual depth or elevation. Used next to sliders buttons and slider container edges for fading out content. Behavior: Dynamic — light gradients in Light mode, dark gradients in Dark mode. */
export const surfaceColorPrimaryGradientStop = "rgba(35, 38, 41, 0)";
/** Used for secondary surface gradients or subtle depth layers across backgrounds.
Behavior: Dynamic — adapts to mode brightness for smooth gradient transitions. */
export const surfaceColorSecondaryGradientStop = "rgba(44, 49, 56, 0)";
/** Inverse of the quartenary surface, used for background reversals in mixed-layout areas.
Behavior: Dynamic — inverts between dark and light tones depending on mode. */
export const surfaceColorQuartenaryInverse = "#CED4DA";

// Semantic - Heading
/** Used for kicker text and category labels placed directly on standard surface backgrounds.
Behavior: Dynamic — adjusts between red for Light and a neutral tone in Dark modes. */
export const kickerTextColorOnSurface = "#8C9196";
/** Primary color for headings and display typography. Ensures clear hierarchy and optimal readability on main surfaces. Adapds it´s color based on the brand mode for brand recognition.
Behavior: Dynamic — dark text in Light mode, light text in Dark mode. */
export const headlineColorPrimary = "#FFFFFF";
/** Fixed white heading color used on dark or colored backgrounds (e.g., hero sections, banners) that remain constant across modes.
Behavior: Constant — remains white in both Light and Dark mode. */
export const headlineColorWhiteConst = "#FFFFFF";
/** Specialized kicker color for use on red or brand-colored backgrounds (e.g., red kicker bg within teaser cards).
Behavior: Constant — remains consistent across light and darkmode. */
export const kickerTextColorOnRed = "#FFFFFF";
/** Applied to kicker or meta text on dark colored backgrounds to maintain high legibility.
Behavior: Constant — always uses semi-transparent white for consistent readability. */
export const kickerTextColorOnDarkBg = "rgba(255, 255, 255, 0.800000011920929)";
/** Used for kicker text placed on bright or light colored backgrounds. Ensures balanced contrast without harsh visual dominance.
Behavior: Constant — remains semi-transparent black across both modes. */
export const kickerTextColorOnBrightBg = "rgba(0, 0, 0, 0.699999988079071)";

// Semantic - State
/** Defines the active state color for secondary actions (e.g., secondary buttons, tabs, or toggles).
Behavior: Dynamic — light gray in Light mode and bright gray in Dark mode to maintain perceptual balance. */
export const colorSecondaryActive = "#F2F4F5";
/** Used to represent the active or pressed state of primary actions such as tabs or links.
Behavior: Constant — identical value across modes for consistent interaction feedback. */
export const colorPrimaryActive = "#DD0000";
/** Used for disabled secondary elements, ensuring reduced visual prominence while maintaining legibility.
Behavior: Dynamic — adapts neutral tones based on theme brightness. */
export const colorSecondaryDisabled = "#4B525A";
/** Defines the disabled color for primary components (e.g., disabled primary buttons, inputs). Reduces emphasis and contrast to signal inactivity.
Behavior: Dynamic — slightly lighter in Light mode and darker in Dark mode to remain visually accessible. */
export const colorPrimaryDisabled = "#343C41";
/** Inverse variant of the secondary active state, applied on dark backgrounds or inverse layouts.
Behavior: Dynamic — switches between bright and dark tones depending on the background. */
export const colorSecondaryActiveInverse = "#232629";
/** Represents active or pressed states for tertiary elements (e.g., link highlights, icons, or subtle interactive surfaces).
Behavior: Constant — uses the same green success tone across Light and Dark mode. */
export const colorTertiaryActive = "#00C373";
/** Represents disabled states for tertiary levels, maintaining subtle visibility without drawing attention.
Behavior: Dynamic — adjusts between gray tones for Light and Dark mode consistency. */
export const colorTertiaryDisabled = "#666B70";

// Semantic - Border
/** Medium-emphasis border color for standard outlines, input fields, or separators that require visible yet non-dominant contrast.
Behavior: Dynamic — adjusts to maintain legibility in Light and Dark themes. */
export const borderColorMediumContrast = "#666B70";
/** Used for subtle dividers and low-emphasis borders in neutral areas (e.g., card outlines, input containers).
Dynamic — light gray in Light mode, dark gray in Dark mode. */
export const borderColorLowContrast = "#4B525A";
/** High-emphasis border color for clear delineation between surfaces (e.g., focus rings, high-contrast UI zones).
Behavior: Dynamic — light surfaces use a darker neutral, dark surfaces a light neutral tone. */
export const borderColorHighContrast = "#FFFFFF";
/** Applies to UI elements that must visually remain the same regardless of theme (e.g., brand containers, static illustrations). Identical tone across Light and Dark mode. */
export const borderColorLowContrastConstant = "#E9ECEF";
/** Used for success states and validation borders (e.g., input success outlines or confirmation frames).
Behavior: Constant — same success tone across modes for consistent feedback semantics. */
export const borderColorSuccess = "#00C373";
/** Defines border color for warning and error-related components, typically used for input validation or caution zones.
Behavior: Constant — retains the same red warning tone in both Light and Dark modes. */
export const borderColorWarning = "#DD0000";
/** Applied to disabled states of primary elements (e.g., buttons, inputs) to visually reduce emphasis and indicate inactivity. */
export const borderColorPrimaryDisabled = "#343C41";
/** Used for secondary component borders in a disabled state (e.g., secondary buttons, inactive input outlines). */
export const borderColorSecondaryDisabled = "#4B525A";

// Semantic - Core
/** Used as the main brand color for key interactive elements such as primary buttons, active states, and prominent highlights. It remains constant across Light and Dark Mode. */
export const coreColorPrimary = "#DD0000";
/** Defines the secondary brand tone. This variable changes across Light and Dark Mode. */
export const coreColorSecondary = "#232629";
/** Represents tertiary brand accents. This variable changes across Light and Dark Mode. */
export const coreColorTertiary = "#FFFFFF";
/** Use this on elements that must maintain the white color even in dark mode. */
export const coreColorSecondaryConstant = "#FFFFFF";
/** Use this on elements that need to maintain the dark color across themes and color modes. */
export const coreColorTertiaryConstant = "#232629";
/** this is a test for the token pipeline */
export const coreColorTertiaryVvPipeTest = "#B0D1F3";
/** this is a test for the token pipeline */
export const npmTest = "#B0D1F3";
/** this is a test for the token pipeline */
export const felipeTestColor = "#031A31";
/** this is a test for the token pipeline */
export const golianiTestColor = "#031A31";

// Semantic - Icon
/** Primary icon color on primary surfaces. */
export const iconColorPrimary = "#8C9196";
/** Inverse icon color for use on contrasting backgrounds (e.g., light icons on dark surfaces or dark icons on bright surfaces).
Behavior: Dynamic — switches between light and dark. */
export const iconColorInverse = "#4B525A";
/** Secondary icon tone for less prominent actions or supportive iconography (e.g., secondary buttons, tool icons). Remains unchanged across modes. */
export const iconColorSecondaryConstant = "#8C9196";
/** Used for icons displayed on dark backgrounds that don´t change colors, ensuring sufficient contrast and legibility.
Behavior: Constant — always uses a neutral bright value. */
export const iconColorConstantOnDark = "#F2F4F5";
/** Used for icons that must remain visually consistent regardless of mode (e.g.,  icons that are on surfaces that don't change color).
Identical tone in both Light and Dark mode. */
export const iconColorPrimaryConstant = "#4B525A";
/** Represents success or confirmation icons (e.g., checkmarks, completion indicators).
Behavior: Constant — same success green tone across Light and Dark mode. */
export const iconColorSuccess = "#00C373";

// Semantic - Label
/** Primary label color used for labels, badges, or tag text on light backgrounds. Ensures strong readability and visual hierarchy.
Behavior: Dynamic — dark neutral in Light mode, light neutral in Dark mode. */
export const labelColorPrimary = "#E9ECEF";
/** Secondary label tone used for less prominent text such as secondary badges or supporting labels.
Behavior: Dynamic — adapts between mid-grays for Light and Dark surfaces. */
export const labelColorSecondary = "#CED4DA";
/** Disabled label tone indicating inactive or unavailable states in UI elements.
Behavior: Dynamic — lighter gray in Light mode, darker neutral in Dark mode. */
export const labelColorDisabled = "#4B525A";
/** Used when primary label color should remain unchanged across modes in static UI areas.
Behavior: Constant — identical tone in both Light and Dark mode. */
export const labelColorPrimaryConstant = "#232629";
/** Fixed inverse label tone applied where white or bright text must always appear, regardless of theme.
Behavior: Constant — remains bright neutral in both Light and Dark mode. */
export const labelColorPrimaryInverseConstant = "#E9ECEF";
/** Tertiary label tone for subtle, low-emphasis UI text such as placeholder text or tertiary badges.
Behavior: Constant — identical tone across both modes for stable hierarchy. */
export const labelColorTertiary = "#8C9196";
/** Inverse version of the primary label color, used on dark or colored backgrounds.
Behavior: Dynamic — switches between light and dark. */
export const labelColorPrimaryInverse = "#232629";

// Semantic - Attention
/** High-level attention color used for errors, destructive actions, and critical alerts (e.g., delete actions, error states). Remains red in both Light and Dark mode for immediate recognition. */
export const attentionColorHigh = "#DD0000";
/** Primary accent color used to emphasize interactive or highlight elements such as links, selection states, or focus indicators. Adapts in Darkmode to a fully white tone. */
export const accentColorPrimary = "#FFFFFF";
/** Medium-level attention tone representing stronger caution or intermediate alert states. Commonly applied in warning messages. Constant — identical in both modes. */
export const attentionColorMedium = "#FD8227";
/** Low-level warning or attention tone, typically used for informational or cautionary messages. Same yellow tone across Light and Dark to maintain recognition. */
export const attentionColorLow = "#FFBF00";
/** Used for accent highlights that must remain visually consistent across themes (e.g., brand identifiers, logos, or fixed emphasis areas). Color value does not change between Light and Dark mode. */
export const accentColorPrimaryConstant = "#DD0000";
/** Primary success color used to indicate positive states, confirmations, or completed actions (e.g., success banners, icons, or badges). Remains the same across modes to ensure recognizability and consistency. */
export const attentionColorSuccessPrimary = "#00C373";
/** Very low-contrast background tone used for information or system-neutral surfaces, often for tooltips or quiet information highlights. Dynamic — light neutral in Light mode and dark neutral in Dark mode. */
export const attentionColorExtraLow = "#343C41";
/** Secondary success tone used for secondary states. Maintains the same color in both Light and Dark mode for clarity. */
export const attentionColorSuccessSecondary = "#006E3E";

// Semantic - Overlay
/** A semi-transparent black overlay used to dim background content when modals, drawers, or dialogs are active. Identical opacity and tone in both Light and Dark mode to ensure consistent overlay depth. */
export const overlayScrimBlack = "rgba(0, 0, 0, 0.699999988079071)";
/** A semi-transparent white overlay used to brighten or fade background layers, often applied behind bottom sheets or temporary panels.
Behavior: Constant — same opacity level across modes to preserve uniform layering behavior. */
export const overlayScrimWhite = "rgba(255, 255, 255, 0.699999988079071)";

// Semantic - LayerOpacity
export const layerOpacity05 = "5px";
export const layerOpacity10 = "10px";
export const layerOpacity20 = "20px";
export const layerOpacity30 = "30px";
export const layerOpacity40 = "40px";
export const layerOpacity50 = "50px";
export const layerOpacity60 = "60px";
export const layerOpacity70 = "70px";
export const layerOpacity80 = "80px";
export const layerOpacity90 = "90px";
export const layerOpacity100 = "100px";
export const layerOpacity00 = "0px";


// ============================================
// COMPONENT
// ============================================

// Component - Subheader
export const subheadersColor = "#E9ECEF";

// Component - Breadcrumb
/** Use this token on breadcrumbs that are in their default idle state. This token changes color between light and dark modes. L:035 / D:096 */
export const breadcrumbTextColorIdle = "#F2F4F5";
/** Use this token on breadcrumbs that the user's pointer is hovering on or clicked on. This token changes color between light and dark modes. L:015 / D:100 */
export const breadcrumbTextColorHover = "#FFFFFF";

// Component - BreakingNews
export const breakingNewsTitleSurfaceColor = "#FD8227";
export const breakingNewsSurfaceColor = "#E9ECEF";
export const breakingNewsTextContentColor = "#232629";
export const breakingNewsTopTitleTextColor = "#1C1C1C";
export const breakingNewsBottomTitleTextColor = "#1C1C1C";

// Component - Menu
export const menuSurfaceColor = "#232629";
/** Used on a thin part at the top of header in navigation menu. */
export const menuScrolledSurfaceGradientColor = "rgba(35, 38, 41, 0.949999988079071)";
export const menuLinkLaneSurfaceColor = "#232629";
export const menuLinkLaneLabelColor = "#8C9196";
export const menuLinkLaneLabelColorActive = "#FFFFFF";
export const appTopBarSurfaceColor = "#343C41";
export const appTopBarIconColor = "#8C9196";
export const appTopBarTextColorPrimary = "#E9ECEF";
export const appTobBarTabNavBottomBorder = "#4B525A";
export const appTobBarTabNavBottomBorderActive = "#FFFFFF";

// Component - PartnerLinks
/** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
export const partnerLinksBorderColorIdle = "#CED4DA";
/** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
export const partnerLinksBorderColorActive = "#E9ECEF";
/** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
export const partnerLinksBgColorIdle = "#343C41";
/** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
export const partnerLinksBgColorActive = "#8C9196";
/** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
export const partnerLinksContainerBorderColor = "#4B525A";

// Component - SocialShareButton
export const socialShareButtonLabelColorDefault = "#FFFFFF";
export const socialShareButtonLabelColorActive = "#FFFFFF";
export const socialShareButtonBgColorActive = "#343C41";
export const socialShareButtonBgColorDefault = "#4B525A";

// Component - Button - Primary
export const buttonPrimaryBrandBgColorIdle = "#DD0000";
export const buttonPrimaryBrandBgColorHover = "#AF0002";
export const buttonPrimaryLabelColor = "#FFFFFF";
export const buttonPrimarySuccessColorIdle = "#18995C";
export const buttonPrimarySuccessColorHover = "#006E3E";
/** Use this variable on the neutral color primary button. Tone changes between light and dark mode. Light mode Bild & SpoBi: Tone 015 ; Dark mode Bild & SpoBi: Tone 100 */
export const buttonPrimaryNeutralBgColorIdle = "#FFFFFF";
export const buttonPrimaryNeutralBgColorHover = "#E9ECEF";

// Component - Button - Tertiary
export const buttonTertiaryLabelColor = "#F2F4F5";
export const buttonTertiaryBorderColorIdle = "#4B525A";
export const buttonTertiaryBorderColorHover = "#FFFFFF";
export const buttonTertiarySuccessBgColorHover = "rgba(0, 155, 90, 0.5)";
export const buttonTertiarySuccessBorderColor = "#18995C";

// Component - Button - Secondary
export const buttonSecondaryBgColorHover = "rgba(206, 212, 218, 0.5)";
export const buttonSecondaryLabelColor = "#E9ECEF";
export const buttonSecondaryBgColorIdle = "#4B525A";

// Component - Button
export const buttonLiveTickerLoadNewSurfaceColor = "#232629";
export const buttonLiveTickerLoadNewLabelColor = "#F2F4F5";

// Component - Button - Ghost
export const buttonGhostBgColorHover = "rgba(206, 212, 218, 0.5)";

// Component - InputField
export const inputFieldBorderColorIdle = "#8C9196";
export const inputFieldBorderColorActive = "#E9ECEF";
export const inputFieldBorderColorDark = "#CED4DA";
export const inputFieldBorderColorDarkActive = "#FFFFFF";
export const inputFieldBgColorDarkLowContrast = "#343C41";
export const inputFieldBgColorDarkMediumContrast = "#4B525A";
export const inputFieldBgColorDarkHighContrast = "#E9ECEF";

// Component - Dropdown
export const dropdownBgColorHover = "#4B525A";
export const dropdownBgColorIdle = "#343C41";

// Component - TextLink
export const textLinkColorSecondary = "#CED4DA";
export const textLinkColorSecondaryActive = "#E9ECEF";
export const textLinkColorPrimary = "#8C9196";

// Component - Tab
export const tabBgColorHover = "#343C41";
export const tabLabelColorActive = "#F2F4F5";
export const tabLabelColorDefault = "#FFFFFF";
export const appBottomTabBarBgColor = "#343C41";

// Component - MenuItem
export const menuItemBorderColorActive = "#FFFFFF";
export const menuItemLabelColorPrimary = "#8C9196";
export const menuItemLabelColorPrimaryActive = "#F2F4F5";
/** The variable can be used on secondary menus that many times show up on dedicated home pages specific to a topic. The menu labels are often times using the color white across color modes. */
export const menuItemLabelColorSecondary = "#FFFFFF";

// Component - Foldout
export const foldoutLabelColorActive = "#F2F4F5";
export const foldoutLabelColorIdle = "#CED4DA";

// Component - Newsticker
export const newsTickerTimestampColor = "#8C9196";
export const newsTickerBadgeIconsColor = "#8C9196";

// Component - Alert
/** On marketing offer surfaces this variable is usually not used. The alertSurfaceConstant variables should be used. This token changes color between light and dark modes. L:100 / D:025 */
export const alertSurfaceColor = "#343C41";
/** On marketing offer surfaces this variable is  used. */
export const alertSurfaceColorConstant = "#FFFFFF";

// Component - Empties
export const emptiesBgColor = "#343C41";
export const emptiesLogoColor = "#2C3138";

// Component - Chips
export const chipsBgColorHover = "#CED4DA";
export const chipsLabelColorHover = "#232629";
export const chipsBgColorActive = "#FFFFFF";
export const chipsBgColorIdle = "#4B525A";
export const chipsLabelColorIdle = "#FFFFFF";

// Component - Card
export const cardSurfaceBgColor = "#2C3138";

// Component - Selection
/** Checkboxes and Radio buttons use this variable for their border. */
export const selectionBorderColor = "#8C9196";

// Component - _DSysDoc
/** This variable is only for use in Figma's Design System File. It is automating some of the content in documentation pages. */
export const dsysDocsLabelTextSurfaceColorPrimaryPrimitiveName = "BILD010";
/** This is currently for use in this design system's documentation texts. It is a text string made for being used in light and dark mode documentation texts. */
export const dsysDocsLabelTextColorMode = "(Dark Mode)";
export const dsDocSpacingItemBgColor = "rgba(255, 255, 255, 0.20000000298023224)";
export const dsDocSpacingItemBorderColor = "rgba(255, 255, 255, 0.800000011920929)";

// Component - Hey
export const heyFavInputFieldSurfaceColor = "#4B525A";
export const heyTextColor = "#E9ECEF";
export const heyIconUtilColor = "#FFFFFF";
/** This is the most used color for separators across Bild products. */
export const heySeparatorColor = "#666B70";
export const heyDrawerSurfaceColor = "#343C41";

// Component - Pagination
export const paginationElementColorDefault = "#8C9196";
export const paginationElementColorActive = "#FFFFFF";
/** Use this on gallery slider pagination elements. This can also be applied to hover states of those elements. */
export const galleryPaginationElementActiveOpacity = "100px";
/** Used as the background surface color scroll bars. Found on components that vertically or horizontally stack elements. */
export const scrollBarTrackBgColor = "rgba(255, 255, 255, 0.10000000149011612)";
/** Use on the scroll bar interactive element which shows where the scroll view is positioned inside the full extent of the scrolling space. */
export const scrollBarThumbBgColor = "#8C9196";

// Component - Kicker - Standard
export const kickerBgColorOnSurface = "#8C9196";

// Component - Kicker - Partner
export const kickerFitbookBgColor = "#FF97B7";
export const kickerPetbookBgColor = "#B9DB91";
export const kickerMyhomebookBgColor = "#66CCCC";
export const kickerTravelbookBgColor = "#8EF0ED";
export const kickerTechbookBgColor = "#93E4FF";
export const kickerKaufberaterBgColor = "#55476E";
export const kickerCobiBgColor = "#DC231C";
export const kickerAubiBgColor = "#F00000";
export const kickerSpobiBgColor = "#174482";
export const kickerBzBgColor = "#E3001B";

// Component - Teaser
/** When users hover over graphical teasers the image reduces opacity to 80%. */
export const teaserHoverOpacity = "80px";
export const teaserTitleBackgroundGradientStart = "rgba(0, 0, 0, 0.699999988079071)";
export const teaserTitleBackgroundGradientStop = "rgba(0, 0, 0, 0)";

// Component - Slider
/** When users hover on gallery slider buttons the opacity changes to 90%. */
export const sliderButtonOpacity = "90px";
/** This variable is used on audio player slider bars. It references a pure white with 35% opacity. */
export const sliderTrackBgColor = "rgba(255, 255, 255, 0.3499999940395355)";

// Component - Mediaplayer
export const vidPlayerControlsAutoplayButtonBgColor = "rgba(0, 0, 0, 0.20000000298023224)";
/** This variable is used for hover states of video player control buttons. */
export const vidPlayerControlButtonsBgHoverColor = "rgba(221, 0, 0, 0.800000011920929)";
export const vidPlayerControlButtonsBgColorHover = "rgba(0, 0, 0, 0.20000000298023224)";
export const vidPlayerOverlayScrimColor = "rgba(0, 0, 0, 0.5)";
export const audioPlayerPlayButtonBgColor = "rgba(255, 255, 255, 0.30000001192092896)";
export const vidPlayerTooltipBgColor = "rgba(0, 0, 0, 0.699999988079071)";
export const vidPlayerControlButtonsBgColorPressed = "rgba(0, 0, 0, 0.05000000074505806)";
export const vidPlayerProgressBarPreloadBgColor = "rgba(255, 255, 255, 0.30000001192092896)";
export const vidPlayerUnmuteButtonBgColor = "rgba(0, 0, 0, 0.20000000298023224)";
export const vidPlayerUnmuteButtonBgColorHover = "rgba(0, 0, 0, 0.3499999940395355)";

// Component - Avatar
/** 09-2025 css --article-author-name-color */
export const avatarLabelColor = "#FFFFFF";
/** 09-2025 css --article-author-name-color */
export const avatarLabelColorHover = "#DD0000";

// Component - Gallery
export const appImageLightboxGalleryBgColor = "#000000";

