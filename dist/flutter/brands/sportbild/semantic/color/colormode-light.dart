
//
// colormode-light.dart
//

// Do not edit directly, this file was auto-generated.



import 'dart:ui';

class ColormodeLight {
    ColormodeLight._();

    // ============================================
    // SEMANTIC
    // ============================================

    // Semantic - Text
    /** Applies to text elements requiring fixed brand color usage (e.g., permanent links, brand slogans on constant backgrounds).
Behavior: Constant — maintains identical red tone across Light and Dark mode. */
    static const textColorAccentConstant = Color(0xFFDD0000);
    /** Main text color used for body copy and all primary textual content. Ensures optimal readability and contrast on standard surfaces.
Behavior: Dynamic — switches between dark text on light backgrounds and light text on dark backgrounds. */
    static const textColorPrimary = Color(0xFF232629);
    /** Muted text tone for subtle information, timestamps, or inactive text elements.
Behavior: Dynamic — adjusts between mid-gray in Light mode and lighter gray in Dark mode. */
    static const textColorMuted = Color(0xFF666B70);
    /** Inverse text color used on opposing surfaces (e.g., white text on red or dark backgrounds).
Behavior: Dynamic — alternates between light and dark mode. */
    static const textColorPrimaryInverse = Color(0xFFE9ECEF);
    /** Used when primary text color must remain fixed regardless of mode (e.g., on light constant backgrounds).
Behavior: Constant — same tone across Light and Dark mode. */
    static const textColorPrimaryConstant = Color(0xFF232629);
    /** Used for positive or success-related messages (e.g., “Saved”, “Success”, or confirmation text) on success surface colors.
Behavior: Constant — green tone remains consistent across both modes. */
    static const textColorSuccessConstant = Color(0xFF006E3E);
    /** Fixed inverse tone for text that always appears on dark surfaces (e.g., hero headlines or persistent dark cards).
Behavior: Constant — unchanged across modes. */
    static const textColorPrimaryInverseConstant = Color(0xFFE9ECEF);
    /** Secondary text color used for supportive information, subtitles, and less prominent text.
Behavior: Dynamic — adapts between neutral tones to maintain proper contrast per theme. In 2025 css it is called figure meta. */
    static const textColorSecondary = Color(0xFF8C9196);
    /** Used for strong warnings, errors, or destructive action labels.
Behavior: Constant — red color remains unchanged between Light and Dark mode for visibility and recognition. */
    static const textColorAttentionHigh = Color(0xFFDD0000);
    /** Accent text color used for links, interactive text, or highlighted key words. Changes from a red in light mode to a white in dark mode. */
    static const textColorAccent = Color(0xFFDD0000);
    /** Represents medium attention states, often used in warnings or pending states.
Behavior: Constant — same orange tone across Light and Dark mode. */
    static const textColorAttentionMedium = Color(0xFFFD8227);
    /** Used for text displayed on dark surfaces to ensure maximum legibility and contrast.
Behavior: Constant — always light neutral to guarantee accessibility on dark backgrounds. */
    static const textColorOnDarkSurface = Color(0xFFFFFFFF);

    // Semantic - Surface
    /** Primary surface color used for main backgrounds and large layout areas (e.g., page background, primary containers).
Behavior: Dynamic — adapts between light and dark surface tokens to maintain legibility and hierarchy. */
    static const surfaceColorPrimary = Color(0xFFFFFFFF);
    /** Used for secondary surface layers such as cards, panels, or nested containers that need to differentiate themselves from the primary surface. .
Behavior: Dynamic — adapts brightness level based on mode for appropriate depth contrast. */
    static const surfaceColorSecondary = Color(0xFFF2F4F5);
    /** Inverse of the primary surface, used when Light and Dark surfaces are swapped (e.g., inverse cards or elevated sections).
Behavior: Dynamic — switches between dark and light values depending on mode. */
    static const surfaceColorPrimaryInverse = Color(0xFF232629);
    /** A fixed light surface tone used when a consistent light background is required (e.g., light panels within dark layouts).
Behavior: Constant — remains the same in both modes. */
    static const surfaceColorPrimaryConstantLight = Color(0xFFFFFFFF);
    /** A fixed dark surface tone used for dark overlays or nested dark sections inside light layouts.
Behavior: Constant — identical across Light and Dark mode. */
    static const surfaceColorPrimaryConstantDark = Color(0xFF232629);
    /** HIghtest elevation surface color, typically used for grouping or background accents to differentiate themselves from all previous surface color options. Uses corresponding light/dark tones for consistent layering. */
    static const surfaceColorQuartenary = Color(0xFFCED4DA);
    /** Success-related background used for positive notifications, confirmation surfaces, or success banners.
Behavior: Constant — remains the same across Light and Dark mode to ensure brand alignment. */
    static const surfaceColorSuccess = Color(0xFFCEF4E4);
    /** Tertiary background layer for inner containers, grouped content, or subtle elevation steps  that need to differentiate themselves from the primary and secondary surfaces.
Behavior: Dynamic — switches between light and dark tertiary tones. */
    static const surfaceColorTertiary = Color(0xFFE9ECEF);
    /** Represents tertiary-level gradient background.
Currently used on skeletons. */
    static const surfaceColorTertiaryGradientStop = Color(0x00e9ecef);
    /** Inverse tertiary background, applied when Light and Dark surfaces are reversed (e.g., dark-on-light cards).
Behavior: Dynamic — swaps values between modes for contrast preservation. */
    static const surfaceColorTertiaryInverse = Color(0xFF343C41);
    /** Defines the end stops for primary surface gradients, creating visual depth or elevation. Used next to sliders buttons and slider container edges for fading out content. Behavior: Dynamic — light gradients in Light mode, dark gradients in Dark mode. */
    static const surfaceColorPrimaryGradientStop = Color(0x00ffffff);
    /** Used for secondary surface gradients or subtle depth layers across backgrounds.
Behavior: Dynamic — adapts to mode brightness for smooth gradient transitions. */
    static const surfaceColorSecondaryGradientStop = Color(0x00f2f4f5);
    /** Inverse of the quartenary surface, used for background reversals in mixed-layout areas.
Behavior: Dynamic — inverts between dark and light tones depending on mode. */
    static const surfaceColorQuartenaryInverse = Color(0xFF4B525A);

    // Semantic - Heading
    /** Used for kicker text and category labels placed directly on standard surface backgrounds.
Behavior: Dynamic — adjusts between red for Light and a neutral tone in Dark modes. */
    static const kickerTextColorOnSurface = Color(0xFFDD0000);
    /** Primary color for headings and display typography. Ensures clear hierarchy and optimal readability on main surfaces. Adapds it´s color based on the brand mode for brand recognition.
Behavior: Dynamic — dark text in Light mode, light text in Dark mode. */
    static const headlineColorPrimary = Color(0xFF232629);
    /** Fixed white heading color used on dark or colored backgrounds (e.g., hero sections, banners) that remain constant across modes.
Behavior: Constant — remains white in both Light and Dark mode. */
    static const headlineColorWhiteConst = Color(0xFFFFFFFF);
    /** Specialized kicker color for use on red or brand-colored backgrounds (e.g., red kicker bg within teaser cards).
Behavior: Constant — remains consistent across light and darkmode. */
    static const kickerTextColorOnRed = Color(0xFFFFFFFF);
    /** Applied to kicker or meta text on dark colored backgrounds to maintain high legibility.
Behavior: Constant — always uses semi-transparent white for consistent readability. */
    static const kickerTextColorOnDarkBg = Color(0xccffffff);
    /** Used for kicker text placed on bright or light colored backgrounds. Ensures balanced contrast without harsh visual dominance.
Behavior: Constant — remains semi-transparent black across both modes. */
    static const kickerTextColorOnBrightBg = Color(0xb2000000);

    // Semantic - State
    /** Defines the active state color for secondary actions (e.g., secondary buttons, tabs, or toggles).
Behavior: Dynamic — light gray in Light mode and bright gray in Dark mode to maintain perceptual balance. */
    static const colorSecondaryActive = Color(0xFF232629);
    /** Used to represent the active or pressed state of primary actions such as tabs or links.
Behavior: Constant — identical value across modes for consistent interaction feedback. */
    static const colorPrimaryActive = Color(0xFFDD0000);
    /** Used for disabled secondary elements, ensuring reduced visual prominence while maintaining legibility.
Behavior: Dynamic — adapts neutral tones based on theme brightness. */
    static const colorSecondaryDisabled = Color(0xFFE9ECEF);
    /** Defines the disabled color for primary components (e.g., disabled primary buttons, inputs). Reduces emphasis and contrast to signal inactivity.
Behavior: Dynamic — slightly lighter in Light mode and darker in Dark mode to remain visually accessible. */
    static const colorPrimaryDisabled = Color(0xFFF2F4F5);
    /** Inverse variant of the secondary active state, applied on dark backgrounds or inverse layouts.
Behavior: Dynamic — switches between bright and dark tones depending on the background. */
    static const colorSecondaryActiveInverse = Color(0xFFF2F4F5);
    /** Represents active or pressed states for tertiary elements (e.g., link highlights, icons, or subtle interactive surfaces).
Behavior: Constant — uses the same green success tone across Light and Dark mode. */
    static const colorTertiaryActive = Color(0xFF00C373);
    /** Represents disabled states for tertiary levels, maintaining subtle visibility without drawing attention.
Behavior: Dynamic — adjusts between gray tones for Light and Dark mode consistency. */
    static const colorTertiaryDisabled = Color(0xFF8C9196);

    // Semantic - Border
    /** Medium-emphasis border color for standard outlines, input fields, or separators that require visible yet non-dominant contrast.
Behavior: Dynamic — adjusts to maintain legibility in Light and Dark themes. */
    static const borderColorMediumContrast = Color(0xFFCED4DA);
    /** Used for subtle dividers and low-emphasis borders in neutral areas (e.g., card outlines, input containers).
Dynamic — light gray in Light mode, dark gray in Dark mode. */
    static const borderColorLowContrast = Color(0xFFE9ECEF);
    /** High-emphasis border color for clear delineation between surfaces (e.g., focus rings, high-contrast UI zones).
Behavior: Dynamic — light surfaces use a darker neutral, dark surfaces a light neutral tone. */
    static const borderColorHighContrast = Color(0xFF232629);
    /** Applies to UI elements that must visually remain the same regardless of theme (e.g., brand containers, static illustrations). Identical tone across Light and Dark mode. */
    static const borderColorLowContrastConstant = Color(0xFFE9ECEF);
    /** Used for success states and validation borders (e.g., input success outlines or confirmation frames).
Behavior: Constant — same success tone across modes for consistent feedback semantics. */
    static const borderColorSuccess = Color(0xFF00C373);
    /** Defines border color for warning and error-related components, typically used for input validation or caution zones.
Behavior: Constant — retains the same red warning tone in both Light and Dark modes. */
    static const borderColorWarning = Color(0xFFDD0000);
    /** Applied to disabled states of primary elements (e.g., buttons, inputs) to visually reduce emphasis and indicate inactivity. */
    static const borderColorPrimaryDisabled = Color(0xFFF2F4F5);
    /** Used for secondary component borders in a disabled state (e.g., secondary buttons, inactive input outlines). */
    static const borderColorSecondaryDisabled = Color(0xFFE9ECEF);

    // Semantic - Core
    /** Used as the main brand color for key interactive elements such as primary buttons, active states, and prominent highlights. It remains constant across Light and Dark Mode. */
    static const coreColorPrimary = Color(0xFFDD0000);
    /** Defines the secondary brand tone. This variable changes across Light and Dark Mode. */
    static const coreColorSecondary = Color(0xFFFFFFFF);
    /** Represents tertiary brand accents. This variable changes across Light and Dark Mode. */
    static const coreColorTertiary = Color(0xFF232629);
    /** Use this on elements that must maintain the white color even in dark mode. */
    static const coreColorSecondaryConstant = Color(0xFFFFFFFF);
    /** Use this on elements that need to maintain the dark color across themes and color modes. */
    static const coreColorTertiaryConstant = Color(0xFF232629);
    /** this is a test for the token pipeline */
    static const coreColorTertiaryVvPipeTest = Color(0xFF476D93);
    /** this is a test for the token pipeline */
    static const npmTest = Color(0xFF476D93);
    /** this is a test for the token pipeline */
    static const felipeTestColor = Color(0xFFE9580A);

    // Semantic - Icon
    /** Primary icon color on primary surfaces. */
    static const iconColorPrimary = Color(0xFF4B525A);
    /** Inverse icon color for use on contrasting backgrounds (e.g., light icons on dark surfaces or dark icons on bright surfaces).
Behavior: Dynamic — switches between light and dark. */
    static const iconColorInverse = Color(0xFFCED4DA);
    /** Secondary icon tone for less prominent actions or supportive iconography (e.g., secondary buttons, tool icons). Remains unchanged across modes. */
    static const iconColorSecondaryConstant = Color(0xFF8C9196);
    /** Used for icons displayed on dark backgrounds that don´t change colors, ensuring sufficient contrast and legibility.
Behavior: Constant — always uses a neutral bright value. */
    static const iconColorConstantOnDark = Color(0xFFF2F4F5);
    /** Used for icons that must remain visually consistent regardless of mode (e.g.,  icons that are on surfaces that don't change color).
Identical tone in both Light and Dark mode. */
    static const iconColorPrimaryConstant = Color(0xFF4B525A);
    /** Represents success or confirmation icons (e.g., checkmarks, completion indicators).
Behavior: Constant — same success green tone across Light and Dark mode. */
    static const iconColorSuccess = Color(0xFF00C373);

    // Semantic - Label
    /** Primary label color used for labels, badges, or tag text on light backgrounds. Ensures strong readability and visual hierarchy.
Behavior: Dynamic — dark neutral in Light mode, light neutral in Dark mode. */
    static const labelColorPrimary = Color(0xFF232629);
    /** Secondary label tone used for less prominent text such as secondary badges or supporting labels.
Behavior: Dynamic — adapts between mid-grays for Light and Dark surfaces. */
    static const labelColorSecondary = Color(0xFF4B525A);
    /** Disabled label tone indicating inactive or unavailable states in UI elements.
Behavior: Dynamic — lighter gray in Light mode, darker neutral in Dark mode. */
    static const labelColorDisabled = Color(0xFFCED4DA);
    /** Used when primary label color should remain unchanged across modes in static UI areas.
Behavior: Constant — identical tone in both Light and Dark mode. */
    static const labelColorPrimaryConstant = Color(0xFF232629);
    /** Fixed inverse label tone applied where white or bright text must always appear, regardless of theme.
Behavior: Constant — remains bright neutral in both Light and Dark mode. */
    static const labelColorPrimaryInverseConstant = Color(0xFFE9ECEF);
    /** Tertiary label tone for subtle, low-emphasis UI text such as placeholder text or tertiary badges.
Behavior: Constant — identical tone across both modes for stable hierarchy. */
    static const labelColorTertiary = Color(0xFF8C9196);
    /** Inverse version of the primary label color, used on dark or colored backgrounds.
Behavior: Dynamic — switches between light and dark. */
    static const labelColorPrimaryInverse = Color(0xFFE9ECEF);

    // Semantic - Attention
    /** High-level attention color used for errors, destructive actions, and critical alerts (e.g., delete actions, error states). Remains red in both Light and Dark mode for immediate recognition. */
    static const attentionColorHigh = Color(0xFFDD0000);
    /** Primary accent color used to emphasize interactive or highlight elements such as links, selection states, or focus indicators. Adapts in Darkmode to a fully white tone. */
    static const accentColorPrimary = Color(0xFFDD0000);
    /** Medium-level attention tone representing stronger caution or intermediate alert states. Commonly applied in warning messages. Constant — identical in both modes. */
    static const attentionColorMedium = Color(0xFFFD8227);
    /** Low-level warning or attention tone, typically used for informational or cautionary messages. Same yellow tone across Light and Dark to maintain recognition. */
    static const attentionColorLow = Color(0xFFFFBF00);
    /** Used for accent highlights that must remain visually consistent across themes (e.g., brand identifiers, logos, or fixed emphasis areas). Color value does not change between Light and Dark mode. */
    static const accentColorPrimaryConstant = Color(0xFFDD0000);
    /** Primary success color used to indicate positive states, confirmations, or completed actions (e.g., success banners, icons, or badges). Remains the same across modes to ensure recognizability and consistency. */
    static const attentionColorSuccessPrimary = Color(0xFF00C373);
    /** Very low-contrast background tone used for information or system-neutral surfaces, often for tooltips or quiet information highlights. Dynamic — light neutral in Light mode and dark neutral in Dark mode. */
    static const attentionColorExtraLow = Color(0xFFFFFFFF);
    /** Secondary success tone used for secondary states. Maintains the same color in both Light and Dark mode for clarity. */
    static const attentionColorSuccessSecondary = Color(0xFF006E3E);

    // Semantic - Overlay
    /** A semi-transparent black overlay used to dim background content when modals, drawers, or dialogs are active. Identical opacity and tone in both Light and Dark mode to ensure consistent overlay depth. */
    static const overlayScrimBlack = Color(0xb2000000);
    /** A semi-transparent white overlay used to brighten or fade background layers, often applied behind bottom sheets or temporary panels.
Behavior: Constant — same opacity level across modes to preserve uniform layering behavior. */
    static const overlayScrimWhite = Color(0xb2ffffff);

    // Semantic - LayerOpacity
    static const layerOpacity05 = "5px";
    static const layerOpacity10 = "10px";
    static const layerOpacity20 = "20px";
    static const layerOpacity30 = "30px";
    static const layerOpacity40 = "40px";
    static const layerOpacity50 = "50px";
    static const layerOpacity60 = "60px";
    static const layerOpacity70 = "70px";
    static const layerOpacity80 = "80px";
    static const layerOpacity90 = "90px";
    static const layerOpacity100 = "100px";
    static const layerOpacity00 = "0px";


    // ============================================
    // COMPONENT
    // ============================================

    // Component - Subheader
    static const subheadersColor = Color(0xFF232629);

    // Component - Breadcrumb
    /** Use this token on breadcrumbs that are in their default idle state. This token changes color between light and dark modes. L:035 / D:096 */
    static const breadcrumbTextColorIdle = Color(0xFF4B525A);
    /** Use this token on breadcrumbs that the user's pointer is hovering on or clicked on. This token changes color between light and dark modes. L:015 / D:100 */
    static const breadcrumbTextColorHover = Color(0xFF232629);

    // Component - BreakingNews
    static const breakingNewsTitleSurfaceColor = Color(0xFFFD8227);
    static const breakingNewsSurfaceColor = Color(0xFF232629);
    static const breakingNewsTextContentColor = Color(0xFFFFFFFF);
    static const breakingNewsTopTitleTextColor = Color(0xFF1C1C1C);
    static const breakingNewsBottomTitleTextColor = Color(0xFF1C1C1C);

    // Component - Menu
    static const menuSurfaceColor = Color(0xFFFFFFFF);
    /** Used on a thin part at the top of header in navigation menu. */
    static const menuScrolledSurfaceGradientColor = Color(0xf2ffffff);
    static const menuLinkLaneSurfaceColor = Color(0xFFFFFFFF);
    static const menuLinkLaneLabelColor = Color(0xFF4B525A);
    static const menuLinkLaneLabelColorActive = Color(0xFF232629);
    static const appTopBarSurfaceColor = Color(0xFFFFFFFF);
    static const appTopBarIconColor = Color(0xFF4B525A);
    static const appTopBarTextColorPrimary = Color(0xFF232629);
    static const appTobBarTabNavBottomBorder = Color(0xFFE9ECEF);
    static const appTobBarTabNavBottomBorderActive = Color(0xFFDD0000);

    // Component - PartnerLinks
    /** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
    static const partnerLinksBorderColorIdle = Color(0xFFCED4DA);
    /** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
    static const partnerLinksBorderColorActive = Color(0xFF232629);
    /** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
    static const partnerLinksBgColorIdle = Color(0xFFFFFFFF);
    /** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
    static const partnerLinksBgColorActive = Color(0xFFE9ECEF);
    /** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
    static const partnerLinksContainerBorderColor = Color(0xFFCED4DA);

    // Component - SocialShareButton
    static const socialShareButtonLabelColorDefault = Color(0xFFFFFFFF);
    static const socialShareButtonLabelColorActive = Color(0xFFFFFFFF);
    static const socialShareButtonBgColorActive = Color(0xFF343C41);
    static const socialShareButtonBgColorDefault = Color(0xFF4B525A);

    // Component - Button - Primary
    static const buttonPrimaryBrandBgColorIdle = Color(0xFFDD0000);
    static const buttonPrimaryBrandBgColorHover = Color(0xFFAF0002);
    static const buttonPrimaryLabelColor = Color(0xFFFFFFFF);
    static const buttonPrimarySuccessColorIdle = Color(0xFF18995C);
    static const buttonPrimarySuccessColorHover = Color(0xFF006E3E);
    /** Use this variable on the neutral color primary button. Tone changes between light and dark mode. Light mode Bild & SpoBi: Tone 015 ; Dark mode Bild & SpoBi: Tone 100 */
    static const buttonPrimaryNeutralBgColorIdle = Color(0xFF232629);
    static const buttonPrimaryNeutralBgColorHover = Color(0xFF4B525A);

    // Component - Button - Tertiary
    static const buttonTertiaryLabelColor = Color(0xFF4B525A);
    static const buttonTertiaryBorderColorIdle = Color(0xFFCED4DA);
    static const buttonTertiaryBorderColorHover = Color(0xFF4B525A);
    static const buttonTertiarySuccessBgColorHover = Color(0xFFCEF4E4);
    static const buttonTertiarySuccessBorderColor = Color(0xFF18995C);

    // Component - Button - Secondary
    static const buttonSecondaryBgColorHover = Color(0xFFCED4DA);
    static const buttonSecondaryLabelColor = Color(0xFF4B525A);
    static const buttonSecondaryBgColorIdle = Color(0xFFE9ECEF);

    // Component - Button
    static const buttonLiveTickerLoadNewSurfaceColor = Color(0xFFFFFFFF);
    static const buttonLiveTickerLoadNewLabelColor = Color(0xFF8C9196);

    // Component - Button - Ghost
    static const buttonGhostBgColorHover = Color(0xFFCED4DA);

    // Component - InputField
    static const inputFieldBorderColorIdle = Color(0xFFCED4DA);
    static const inputFieldBorderColorActive = Color(0xFF4B525A);
    static const inputFieldBorderColorDark = Color(0xFF8C9196);
    static const inputFieldBorderColorDarkActive = Color(0xFF232629);
    static const inputFieldBgColorDarkLowContrast = Color(0xFF343C41);
    static const inputFieldBgColorDarkMediumContrast = Color(0xFF4B525A);
    static const inputFieldBgColorDarkHighContrast = Color(0xFFE9ECEF);

    // Component - Dropdown
    static const dropdownBgColorHover = Color(0xFFF2F4F5);
    static const dropdownBgColorIdle = Color(0xFFFFFFFF);

    // Component - TextLink
    static const textLinkColorSecondary = Color(0xFF8C9196);
    static const textLinkColorSecondaryActive = Color(0xFF232629);
    static const textLinkColorPrimary = Color(0xFF232629);

    // Component - Tab
    static const tabBgColorHover = Color(0xFFE9ECEF);
    static const tabLabelColorActive = Color(0xFF343C41);
    static const tabLabelColorDefault = Color(0xFF4B525A);
    static const appBottomTabBarBgColor = Color(0xFFFFFFFF);

    // Component - MenuItem
    static const menuItemBorderColorActive = Color(0xFFDD0000);
    static const menuItemLabelColorPrimary = Color(0xFF4B525A);
    static const menuItemLabelColorPrimaryActive = Color(0xFF232629);
    /** The variable can be used on secondary menus that many times show up on dedicated home pages specific to a topic. The menu labels are often times using the color white across color modes. */
    static const menuItemLabelColorSecondary = Color(0xFFFFFFFF);

    // Component - Foldout
    static const foldoutLabelColorActive = Color(0xFFDD0000);
    static const foldoutLabelColorIdle = Color(0xFF4B525A);

    // Component - Newsticker
    static const newsTickerTimestampColor = Color(0xFF8C9196);
    static const newsTickerBadgeIconsColor = Color(0xFF8C9196);

    // Component - Alert
    /** On marketing offer surfaces this variable is usually not used. The alertSurfaceConstant variables should be used. This token changes color between light and dark modes. L:100 / D:025 */
    static const alertSurfaceColor = Color(0xFFFFFFFF);
    /** On marketing offer surfaces this variable is  used. */
    static const alertSurfaceColorConstant = Color(0xFFFFFFFF);

    // Component - Empties
    static const emptiesBgColor = Color(0xFFF2F4F5);
    static const emptiesLogoColor = Color(0xFFCED4DA);

    // Component - Chips
    static const chipsBgColorHover = Color(0xFFAF0002);
    static const chipsLabelColorHover = Color(0xFFFFFFFF);
    static const chipsBgColorActive = Color(0xFFDD0000);
    static const chipsBgColorIdle = Color(0xFFE9ECEF);
    static const chipsLabelColorIdle = Color(0xFF232629);

    // Component - Card
    static const cardSurfaceBgColor = Color(0xFFFFFFFF);

    // Component - Selection
    /** Checkboxes and Radio buttons use this variable for their border. */
    static const selectionBorderColor = Color(0xFF4B525A);

    // Component - _DSysDoc
    /** This variable is only for use in Figma's Design System File. It is automating some of the content in documentation pages. */
    static const dsysDocsLabelTextSurfaceColorPrimaryPrimitiveName = "BILD100";
    /** This is currently for use in this design system's documentation texts. It is a text string made for being used in light and dark mode documentation texts. */
    static const dsysDocsLabelTextColorMode = "(Light Mode)";
    static const dsDocSpacingItemBgColor = Color(0x1add0000);
    static const dsDocSpacingItemBorderColor = Color(0x80dd0000);

    // Component - Hey
    static const heyFavInputFieldSurfaceColor = Color(0xFFE9ECEF);
    static const heyTextColor = Color(0xFF4B525A);
    static const heyIconUtilColor = Color(0xFF4B525A);
    /** This is the most used color for separators across Bild products. */
    static const heySeparatorColor = Color(0xFFCED4DA);
    static const heyDrawerSurfaceColor = Color(0xFFF2F4F5);

    // Component - Pagination
    static const paginationElementColorDefault = Color(0xFFCED4DA);
    static const paginationElementColorActive = Color(0xFFDD0000);
    /** Use this on gallery slider pagination elements. This can also be applied to hover states of those elements. */
    static const galleryPaginationElementActiveOpacity = "100px";
    /** Used as the background surface color scroll bars. Found on components that vertically or horizontally stack elements. */
    static const scrollBarTrackBgColor = Color(0x1a000000);
    /** Use on the scroll bar interactive element which shows where the scroll view is positioned inside the full extent of the scrolling space. */
    static const scrollBarThumbBgColor = Color(0xFF8C9196);

    // Component - Kicker - Standard
    static const kickerBgColorOnSurface = Color(0xFFDD0000);

    // Component - Kicker - Partner
    static const kickerStylebookBgColor = "UNRESOLVED_VariableID:16104:163534";
    static const kickerFitbookBgColor = Color(0xFFFF97B7);
    static const kickerPetbookBgColor = Color(0xFFB9DB91);
    static const kickerMyhomebookBgColor = Color(0xFF66CCCC);
    static const kickerTravelbookBgColor = Color(0xFF8EF0ED);
    static const kickerTechbookBgColor = Color(0xFF93E4FF);
    static const kickerKaufberaterBgColor = Color(0xFF55476E);
    static const kickerCobiBgColor = Color(0xFFDC231C);
    static const kickerAubiBgColor = Color(0xFFF00000);
    static const kickerSpobiBgColor = Color(0xFF174482);
    static const kickerBzBgColor = Color(0xFFE3001B);

    // Component - Teaser
    /** When users hover over graphical teasers the image reduces opacity to 80%. */
    static const teaserHoverOpacity = "80px";
    static const teaserTitleBackgroundGradientStart = Color(0xb2000000);
    static const teaserTitleBackgroundGradientStop = Color(0x00000000);

    // Component - Slider
    /** When users hover on gallery slider buttons the opacity changes to 90%. */
    static const sliderButtonOpacity = "90px";
    /** This variable is used on audio player slider bars. It references a pure white with 35% opacity. */
    static const sliderTrackBgColor = Color(0x59ffffff);

    // Component - Mediaplayer
    static const vidPlayerControlsAutoplayButtonBgColor = Color(0x33000000);
    /** This variable is used for hover states of video player control buttons. */
    static const vidPlayerControlButtonsBgHoverColor = Color(0xccdd0000);
    static const vidPlayerControlButtonsBgColorHover = Color(0x33000000);
    static const vidPlayerOverlayScrimColor = Color(0x80000000);
    static const audioPlayerPlayButtonBgColor = Color(0x4dffffff);
    static const vidPlayerTooltipBgColor = Color(0xb2000000);
    static const vidPlayerControlButtonsBgColorPressed = Color(0x0d000000);
    static const vidPlayerProgressBarPreloadBgColor = Color(0x4dffffff);
    static const vidPlayerUnmuteButtonBgColor = Color(0x33000000);
    static const vidPlayerUnmuteButtonBgColorHover = Color(0x59000000);

    // Component - Avatar
    /** 09-2025 css --article-author-name-color */
    static const avatarLabelColor = Color(0xFF232629);
    /** 09-2025 css --article-author-name-color */
    static const avatarLabelColorHover = Color(0xFFDD0000);

    // Component - Gallery
    static const appImageLightboxGalleryBgColor = Color(0xFF000000);

}
