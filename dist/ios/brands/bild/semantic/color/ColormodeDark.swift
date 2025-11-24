
//
// ColormodeDark.swift
//

// Do not edit directly, this file was auto-generated.


import UIKit

public class ColormodeDark {
    // MARK: - ============================================
    // MARK: - SEMANTIC
    // MARK: - ============================================

    // MARK: - Semantic - Text
    /** Applies to text elements requiring fixed brand color usage (e.g., permanent links, brand slogans on constant backgrounds).
Behavior: Constant — maintains identical red tone across Light and Dark mode. */
    public static let TextColorAccentConstant = UIColor(red: 0.867, green: 0.000, blue: 0.000, alpha: 1.000)
    /** Main text color used for body copy and all primary textual content. Ensures optimal readability and contrast on standard surfaces.
Behavior: Dynamic — switches between dark text on light backgrounds and light text on dark backgrounds. */
    public static let TextColorPrimary = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)
    /** Muted text tone for subtle information, timestamps, or inactive text elements.
Behavior: Dynamic — adjusts between mid-gray in Light mode and lighter gray in Dark mode. */
    public static let TextColorMuted = UIColor(red: 0.808, green: 0.831, blue: 0.855, alpha: 1.000)
    /** Inverse text color used on opposing surfaces (e.g., white text on red or dark backgrounds).
Behavior: Dynamic — alternates between light and dark mode. */
    public static let TextColorPrimaryInverse = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1.000)
    /** Used when primary text color must remain fixed regardless of mode (e.g., on light constant backgrounds).
Behavior: Constant — same tone across Light and Dark mode. */
    public static let TextColorPrimaryConstant = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1.000)
    /** Used for positive or success-related messages (e.g., “Saved”, “Success”, or confirmation text) on success surface colors.
Behavior: Constant — green tone remains consistent across both modes. */
    public static let TextColorSuccessConstant = UIColor(red: 0.000, green: 0.431, blue: 0.243, alpha: 1.000)
    /** Fixed inverse tone for text that always appears on dark surfaces (e.g., hero headlines or persistent dark cards).
Behavior: Constant — unchanged across modes. */
    public static let TextColorPrimaryInverseConstant = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)
    /** Secondary text color used for supportive information, subtitles, and less prominent text.
Behavior: Dynamic — adapts between neutral tones to maintain proper contrast per theme. In 2025 css it is called figure meta. */
    public static let TextColorSecondary = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)
    /** Used for strong warnings, errors, or destructive action labels.
Behavior: Constant — red color remains unchanged between Light and Dark mode for visibility and recognition. */
    public static let TextColorAttentionHigh = UIColor(red: 0.867, green: 0.000, blue: 0.000, alpha: 1.000)
    /** Accent text color used for links, interactive text, or highlighted key words. Changes from a red in light mode to a white in dark mode. */
    public static let TextColorAccent = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    /** Represents medium attention states, often used in warnings or pending states.
Behavior: Constant — same orange tone across Light and Dark mode. */
    public static let TextColorAttentionMedium = UIColor(red: 0.992, green: 0.510, blue: 0.153, alpha: 1.000)
    /** Used for text displayed on dark surfaces to ensure maximum legibility and contrast.
Behavior: Constant — always light neutral to guarantee accessibility on dark backgrounds. */
    public static let TextColorOnDarkSurface = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)

    // MARK: - Semantic - Surface
    /** Primary surface color used for main backgrounds and large layout areas (e.g., page background, primary containers).
Behavior: Dynamic — adapts between light and dark surface tokens to maintain legibility and hierarchy. */
    public static let SurfaceColorPrimary = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1.000)
    /** Used for secondary surface layers such as cards, panels, or nested containers that need to differentiate themselves from the primary surface. .
Behavior: Dynamic — adapts brightness level based on mode for appropriate depth contrast. */
    public static let SurfaceColorSecondary = UIColor(red: 0.173, green: 0.192, blue: 0.220, alpha: 1.000)
    /** Inverse of the primary surface, used when Light and Dark surfaces are swapped (e.g., inverse cards or elevated sections).
Behavior: Dynamic — switches between dark and light values depending on mode. */
    public static let SurfaceColorPrimaryInverse = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    /** A fixed light surface tone used when a consistent light background is required (e.g., light panels within dark layouts).
Behavior: Constant — remains the same in both modes. */
    public static let SurfaceColorPrimaryConstantLight = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    /** A fixed dark surface tone used for dark overlays or nested dark sections inside light layouts.
Behavior: Constant — identical across Light and Dark mode. */
    public static let SurfaceColorPrimaryConstantDark = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1.000)
    /** HIghtest elevation surface color, typically used for grouping or background accents to differentiate themselves from all previous surface color options. Uses corresponding light/dark tones for consistent layering. */
    public static let SurfaceColorQuartenary = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)
    /** Success-related background used for positive notifications, confirmation surfaces, or success banners.
Behavior: Constant — remains the same across Light and Dark mode to ensure brand alignment. */
    public static let SurfaceColorSuccess = UIColor(red: 0.808, green: 0.957, blue: 0.894, alpha: 1.000)
    /** Tertiary background layer for inner containers, grouped content, or subtle elevation steps  that need to differentiate themselves from the primary and secondary surfaces.
Behavior: Dynamic — switches between light and dark tertiary tones. */
    public static let SurfaceColorTertiary = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 1.000)
    /** Represents tertiary-level gradient background.
Currently used on skeletons. */
    public static let SurfaceColorTertiaryGradientStop = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 0.000)
    /** Inverse tertiary background, applied when Light and Dark surfaces are reversed (e.g., dark-on-light cards).
Behavior: Dynamic — swaps values between modes for contrast preservation. */
    public static let SurfaceColorTertiaryInverse = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)
    /** Defines the end stops for primary surface gradients, creating visual depth or elevation. Used next to sliders buttons and slider container edges for fading out content. Behavior: Dynamic — light gradients in Light mode, dark gradients in Dark mode. */
    public static let SurfaceColorPrimaryGradientStop = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 0.000)
    /** Used for secondary surface gradients or subtle depth layers across backgrounds.
Behavior: Dynamic — adapts to mode brightness for smooth gradient transitions. */
    public static let SurfaceColorSecondaryGradientStop = UIColor(red: 0.173, green: 0.192, blue: 0.220, alpha: 0.000)
    /** Inverse of the quartenary surface, used for background reversals in mixed-layout areas.
Behavior: Dynamic — inverts between dark and light tones depending on mode. */
    public static let SurfaceColorQuartenaryInverse = UIColor(red: 0.808, green: 0.831, blue: 0.855, alpha: 1.000)

    // MARK: - Semantic - Heading
    /** Used for kicker text and category labels placed directly on standard surface backgrounds.
Behavior: Dynamic — adjusts between red for Light and a neutral tone in Dark modes. */
    public static let KickerTextColorOnSurface = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)
    /** Primary color for headings and display typography. Ensures clear hierarchy and optimal readability on main surfaces. Adapds it´s color based on the brand mode for brand recognition.
Behavior: Dynamic — dark text in Light mode, light text in Dark mode. */
    public static let HeadlineColorPrimary = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    /** Fixed white heading color used on dark or colored backgrounds (e.g., hero sections, banners) that remain constant across modes.
Behavior: Constant — remains white in both Light and Dark mode. */
    public static let HeadlineColorWhiteConst = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    /** Specialized kicker color for use on red or brand-colored backgrounds (e.g., red kicker bg within teaser cards).
Behavior: Constant — remains consistent across light and darkmode. */
    public static let KickerTextColorOnRed = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    /** Applied to kicker or meta text on dark colored backgrounds to maintain high legibility.
Behavior: Constant — always uses semi-transparent white for consistent readability. */
    public static let KickerTextColorOnDarkBg = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 0.800)
    /** Used for kicker text placed on bright or light colored backgrounds. Ensures balanced contrast without harsh visual dominance.
Behavior: Constant — remains semi-transparent black across both modes. */
    public static let KickerTextColorOnBrightBg = UIColor(red: 0.000, green: 0.000, blue: 0.000, alpha: 0.700)

    // MARK: - Semantic - State
    /** Defines the active state color for secondary actions (e.g., secondary buttons, tabs, or toggles).
Behavior: Dynamic — light gray in Light mode and bright gray in Dark mode to maintain perceptual balance. */
    public static let ColorSecondaryActive = UIColor(red: 0.949, green: 0.957, blue: 0.961, alpha: 1.000)
    /** Used to represent the active or pressed state of primary actions such as tabs or links.
Behavior: Constant — identical value across modes for consistent interaction feedback. */
    public static let ColorPrimaryActive = UIColor(red: 0.867, green: 0.000, blue: 0.000, alpha: 1.000)
    /** Used for disabled secondary elements, ensuring reduced visual prominence while maintaining legibility.
Behavior: Dynamic — adapts neutral tones based on theme brightness. */
    public static let ColorSecondaryDisabled = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)
    /** Defines the disabled color for primary components (e.g., disabled primary buttons, inputs). Reduces emphasis and contrast to signal inactivity.
Behavior: Dynamic — slightly lighter in Light mode and darker in Dark mode to remain visually accessible. */
    public static let ColorPrimaryDisabled = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 1.000)
    /** Inverse variant of the secondary active state, applied on dark backgrounds or inverse layouts.
Behavior: Dynamic — switches between bright and dark tones depending on the background. */
    public static let ColorSecondaryActiveInverse = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1.000)
    /** Represents active or pressed states for tertiary elements (e.g., link highlights, icons, or subtle interactive surfaces).
Behavior: Constant — uses the same green success tone across Light and Dark mode. */
    public static let ColorTertiaryActive = UIColor(red: 0.000, green: 0.765, blue: 0.451, alpha: 1.000)
    /** Represents disabled states for tertiary levels, maintaining subtle visibility without drawing attention.
Behavior: Dynamic — adjusts between gray tones for Light and Dark mode consistency. */
    public static let ColorTertiaryDisabled = UIColor(red: 0.400, green: 0.420, blue: 0.439, alpha: 1.000)

    // MARK: - Semantic - Border
    /** Medium-emphasis border color for standard outlines, input fields, or separators that require visible yet non-dominant contrast.
Behavior: Dynamic — adjusts to maintain legibility in Light and Dark themes. */
    public static let BorderColorMediumContrast = UIColor(red: 0.400, green: 0.420, blue: 0.439, alpha: 1.000)
    /** Used for subtle dividers and low-emphasis borders in neutral areas (e.g., card outlines, input containers).
Dynamic — light gray in Light mode, dark gray in Dark mode. */
    public static let BorderColorLowContrast = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)
    /** High-emphasis border color for clear delineation between surfaces (e.g., focus rings, high-contrast UI zones).
Behavior: Dynamic — light surfaces use a darker neutral, dark surfaces a light neutral tone. */
    public static let BorderColorHighContrast = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    /** Applies to UI elements that must visually remain the same regardless of theme (e.g., brand containers, static illustrations). Identical tone across Light and Dark mode. */
    public static let BorderColorLowContrastConstant = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)
    /** Used for success states and validation borders (e.g., input success outlines or confirmation frames).
Behavior: Constant — same success tone across modes for consistent feedback semantics. */
    public static let BorderColorSuccess = UIColor(red: 0.000, green: 0.765, blue: 0.451, alpha: 1.000)
    /** Defines border color for warning and error-related components, typically used for input validation or caution zones.
Behavior: Constant — retains the same red warning tone in both Light and Dark modes. */
    public static let BorderColorWarning = UIColor(red: 0.867, green: 0.000, blue: 0.000, alpha: 1.000)
    /** Applied to disabled states of primary elements (e.g., buttons, inputs) to visually reduce emphasis and indicate inactivity. */
    public static let BorderColorPrimaryDisabled = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 1.000)
    /** Used for secondary component borders in a disabled state (e.g., secondary buttons, inactive input outlines). */
    public static let BorderColorSecondaryDisabled = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)

    // MARK: - Semantic - Core
    /** Used as the main brand color for key interactive elements such as primary buttons, active states, and prominent highlights. It remains constant across Light and Dark Mode. */
    public static let CoreColorPrimary = UIColor(red: 0.867, green: 0.000, blue: 0.000, alpha: 1.000)
    /** Defines the secondary brand tone. This variable changes across Light and Dark Mode. */
    public static let CoreColorSecondary = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1.000)
    /** Represents tertiary brand accents. This variable changes across Light and Dark Mode. */
    public static let CoreColorTertiary = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    /** Use this on elements that must maintain the white color even in dark mode. */
    public static let CoreColorSecondaryConstant = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    /** Use this on elements that need to maintain the dark color across themes and color modes. */
    public static let CoreColorTertiaryConstant = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1.000)
    /** this is a test for the token pipeline */
    public static let CoreColorTertiaryVvPipeTest = UIColor(red: 0.690, green: 0.820, blue: 0.953, alpha: 1.000)
    /** this is a test for the token pipeline */
    public static let NpmTest = UIColor(red: 0.690, green: 0.820, blue: 0.953, alpha: 1.000)
    /** this is a test for the token pipeline */
    public static let FelipeTestColor = UIColor(red: 0.012, green: 0.102, blue: 0.192, alpha: 1.000)

    // MARK: - Semantic - Icon
    /** Primary icon color on primary surfaces. */
    public static let IconColorPrimary = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)
    /** Inverse icon color for use on contrasting backgrounds (e.g., light icons on dark surfaces or dark icons on bright surfaces).
Behavior: Dynamic — switches between light and dark. */
    public static let IconColorInverse = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)
    /** Secondary icon tone for less prominent actions or supportive iconography (e.g., secondary buttons, tool icons). Remains unchanged across modes. */
    public static let IconColorSecondaryConstant = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)
    /** Used for icons displayed on dark backgrounds that don´t change colors, ensuring sufficient contrast and legibility.
Behavior: Constant — always uses a neutral bright value. */
    public static let IconColorConstantOnDark = UIColor(red: 0.949, green: 0.957, blue: 0.961, alpha: 1.000)
    /** Used for icons that must remain visually consistent regardless of mode (e.g.,  icons that are on surfaces that don't change color).
Identical tone in both Light and Dark mode. */
    public static let IconColorPrimaryConstant = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)
    /** Represents success or confirmation icons (e.g., checkmarks, completion indicators).
Behavior: Constant — same success green tone across Light and Dark mode. */
    public static let IconColorSuccess = UIColor(red: 0.000, green: 0.765, blue: 0.451, alpha: 1.000)

    // MARK: - Semantic - Label
    /** Primary label color used for labels, badges, or tag text on light backgrounds. Ensures strong readability and visual hierarchy.
Behavior: Dynamic — dark neutral in Light mode, light neutral in Dark mode. */
    public static let LabelColorPrimary = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)
    /** Secondary label tone used for less prominent text such as secondary badges or supporting labels.
Behavior: Dynamic — adapts between mid-grays for Light and Dark surfaces. */
    public static let LabelColorSecondary = UIColor(red: 0.808, green: 0.831, blue: 0.855, alpha: 1.000)
    /** Disabled label tone indicating inactive or unavailable states in UI elements.
Behavior: Dynamic — lighter gray in Light mode, darker neutral in Dark mode. */
    public static let LabelColorDisabled = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)
    /** Used when primary label color should remain unchanged across modes in static UI areas.
Behavior: Constant — identical tone in both Light and Dark mode. */
    public static let LabelColorPrimaryConstant = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1.000)
    /** Fixed inverse label tone applied where white or bright text must always appear, regardless of theme.
Behavior: Constant — remains bright neutral in both Light and Dark mode. */
    public static let LabelColorPrimaryInverseConstant = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)
    /** Tertiary label tone for subtle, low-emphasis UI text such as placeholder text or tertiary badges.
Behavior: Constant — identical tone across both modes for stable hierarchy. */
    public static let LabelColorTertiary = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)
    /** Inverse version of the primary label color, used on dark or colored backgrounds.
Behavior: Dynamic — switches between light and dark. */
    public static let LabelColorPrimaryInverse = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1.000)

    // MARK: - Semantic - Attention
    /** High-level attention color used for errors, destructive actions, and critical alerts (e.g., delete actions, error states). Remains red in both Light and Dark mode for immediate recognition. */
    public static let AttentionColorHigh = UIColor(red: 0.867, green: 0.000, blue: 0.000, alpha: 1.000)
    /** Primary accent color used to emphasize interactive or highlight elements such as links, selection states, or focus indicators. Adapts in Darkmode to a fully white tone. */
    public static let AccentColorPrimary = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    /** Medium-level attention tone representing stronger caution or intermediate alert states. Commonly applied in warning messages. Constant — identical in both modes. */
    public static let AttentionColorMedium = UIColor(red: 0.992, green: 0.510, blue: 0.153, alpha: 1.000)
    /** Low-level warning or attention tone, typically used for informational or cautionary messages. Same yellow tone across Light and Dark to maintain recognition. */
    public static let AttentionColorLow = UIColor(red: 1.000, green: 0.749, blue: 0.000, alpha: 1.000)
    /** Used for accent highlights that must remain visually consistent across themes (e.g., brand identifiers, logos, or fixed emphasis areas). Color value does not change between Light and Dark mode. */
    public static let AccentColorPrimaryConstant = UIColor(red: 0.867, green: 0.000, blue: 0.000, alpha: 1.000)
    /** Primary success color used to indicate positive states, confirmations, or completed actions (e.g., success banners, icons, or badges). Remains the same across modes to ensure recognizability and consistency. */
    public static let AttentionColorSuccessPrimary = UIColor(red: 0.000, green: 0.765, blue: 0.451, alpha: 1.000)
    /** Very low-contrast background tone used for information or system-neutral surfaces, often for tooltips or quiet information highlights. Dynamic — light neutral in Light mode and dark neutral in Dark mode. */
    public static let AttentionColorExtraLow = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 1.000)
    /** Secondary success tone used for secondary states. Maintains the same color in both Light and Dark mode for clarity. */
    public static let AttentionColorSuccessSecondary = UIColor(red: 0.000, green: 0.431, blue: 0.243, alpha: 1.000)

    // MARK: - Semantic - Overlay
    /** A semi-transparent black overlay used to dim background content when modals, drawers, or dialogs are active. Identical opacity and tone in both Light and Dark mode to ensure consistent overlay depth. */
    public static let OverlayScrimBlack = UIColor(red: 0.000, green: 0.000, blue: 0.000, alpha: 0.700)
    /** A semi-transparent white overlay used to brighten or fade background layers, often applied behind bottom sheets or temporary panels.
Behavior: Constant — same opacity level across modes to preserve uniform layering behavior. */
    public static let OverlayScrimWhite = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 0.700)

    // MARK: - Semantic - LayerOpacity
    public static let LayerOpacity05 = "5px"
    public static let LayerOpacity10 = "10px"
    public static let LayerOpacity20 = "20px"
    public static let LayerOpacity30 = "30px"
    public static let LayerOpacity40 = "40px"
    public static let LayerOpacity50 = "50px"
    public static let LayerOpacity60 = "60px"
    public static let LayerOpacity70 = "70px"
    public static let LayerOpacity80 = "80px"
    public static let LayerOpacity90 = "90px"
    public static let LayerOpacity100 = "100px"
    public static let LayerOpacity00 = "0px"


    // MARK: - ============================================
    // MARK: - COMPONENT
    // MARK: - ============================================

    // MARK: - Component - Subheader
    public static let SubheadersColor = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)

    // MARK: - Component - Breadcrumb
    /** Use this token on breadcrumbs that are in their default idle state. This token changes color between light and dark modes. L:035 / D:096 */
    public static let BreadcrumbTextColorIdle = UIColor(red: 0.949, green: 0.957, blue: 0.961, alpha: 1.000)
    /** Use this token on breadcrumbs that the user's pointer is hovering on or clicked on. This token changes color between light and dark modes. L:015 / D:100 */
    public static let BreadcrumbTextColorHover = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)

    // MARK: - Component - BreakingNews
    public static let BreakingNewsTitleSurfaceColor = UIColor(red: 0.992, green: 0.510, blue: 0.153, alpha: 1.000)
    public static let BreakingNewsSurfaceColor = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)
    public static let BreakingNewsTextContentColor = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1.000)
    public static let BreakingNewsTopTitleTextColor = UIColor(red: 0.110, green: 0.110, blue: 0.110, alpha: 1.000)
    public static let BreakingNewsBottomTitleTextColor = UIColor(red: 0.110, green: 0.110, blue: 0.110, alpha: 1.000)

    // MARK: - Component - Menu
    public static let MenuSurfaceColor = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1.000)
    /** Used on a thin part at the top of header in navigation menu. */
    public static let MenuScrolledSurfaceGradientColor = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 0.950)
    public static let MenuLinkLaneSurfaceColor = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1.000)
    public static let MenuLinkLaneLabelColor = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)
    public static let MenuLinkLaneLabelColorActive = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    public static let AppTopBarSurfaceColor = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 1.000)
    public static let AppTopBarIconColor = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)
    public static let AppTopBarTextColorPrimary = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)
    public static let AppTobBarTabNavBottomBorder = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)
    public static let AppTobBarTabNavBottomBorderActive = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)

    // MARK: - Component - PartnerLinks
    /** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
    public static let PartnerLinksBorderColorIdle = UIColor(red: 0.808, green: 0.831, blue: 0.855, alpha: 1.000)
    /** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
    public static let PartnerLinksBorderColorActive = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)
    /** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
    public static let PartnerLinksBgColorIdle = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 1.000)
    /** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
    public static let PartnerLinksBgColorActive = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)
    /** !do not use! these variables have been deprecated and multitext link buttons are now classified as partner buttons. */
    public static let PartnerLinksContainerBorderColor = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)

    // MARK: - Component - SocialShareButton
    public static let SocialShareButtonLabelColorDefault = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    public static let SocialShareButtonLabelColorActive = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    public static let SocialShareButtonBgColorActive = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 1.000)
    public static let SocialShareButtonBgColorDefault = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)

    // MARK: - Component - Button - Primary
    public static let ButtonPrimaryBrandBgColorIdle = UIColor(red: 0.867, green: 0.000, blue: 0.000, alpha: 1.000)
    public static let ButtonPrimaryBrandBgColorHover = UIColor(red: 0.686, green: 0.000, blue: 0.008, alpha: 1.000)
    public static let ButtonPrimaryLabelColor = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    public static let ButtonPrimarySuccessColorIdle = UIColor(red: 0.094, green: 0.600, blue: 0.361, alpha: 1.000)
    public static let ButtonPrimarySuccessColorHover = UIColor(red: 0.000, green: 0.431, blue: 0.243, alpha: 1.000)
    /** Use this variable on the neutral color primary button. Tone changes between light and dark mode. Light mode Bild & SpoBi: Tone 015 ; Dark mode Bild & SpoBi: Tone 100 */
    public static let ButtonPrimaryNeutralBgColorIdle = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    public static let ButtonPrimaryNeutralBgColorHover = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)

    // MARK: - Component - Button - Tertiary
    public static let ButtonTertiaryLabelColor = UIColor(red: 0.949, green: 0.957, blue: 0.961, alpha: 1.000)
    public static let ButtonTertiaryBorderColorIdle = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)
    public static let ButtonTertiaryBorderColorHover = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    public static let ButtonTertiarySuccessBgColorHover = UIColor(red: 0.000, green: 0.608, blue: 0.353, alpha: 0.500)
    public static let ButtonTertiarySuccessBorderColor = UIColor(red: 0.094, green: 0.600, blue: 0.361, alpha: 1.000)

    // MARK: - Component - Button - Secondary
    public static let ButtonSecondaryBgColorHover = UIColor(red: 0.808, green: 0.831, blue: 0.855, alpha: 0.500)
    public static let ButtonSecondaryLabelColor = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)
    public static let ButtonSecondaryBgColorIdle = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)

    // MARK: - Component - Button
    public static let ButtonLiveTickerLoadNewSurfaceColor = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1.000)
    public static let ButtonLiveTickerLoadNewLabelColor = UIColor(red: 0.949, green: 0.957, blue: 0.961, alpha: 1.000)

    // MARK: - Component - Button - Ghost
    public static let ButtonGhostBgColorHover = UIColor(red: 0.808, green: 0.831, blue: 0.855, alpha: 0.500)

    // MARK: - Component - InputField
    public static let InputFieldBorderColorIdle = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)
    public static let InputFieldBorderColorActive = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)
    public static let InputFieldBorderColorDark = UIColor(red: 0.808, green: 0.831, blue: 0.855, alpha: 1.000)
    public static let InputFieldBorderColorDarkActive = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    public static let InputFieldBgColorDarkLowContrast = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 1.000)
    public static let InputFieldBgColorDarkMediumContrast = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)
    public static let InputFieldBgColorDarkHighContrast = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)

    // MARK: - Component - Dropdown
    public static let DropdownBgColorHover = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)
    public static let DropdownBgColorIdle = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 1.000)

    // MARK: - Component - TextLink
    public static let TextLinkColorSecondary = UIColor(red: 0.808, green: 0.831, blue: 0.855, alpha: 1.000)
    public static let TextLinkColorSecondaryActive = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)
    public static let TextLinkColorPrimary = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)

    // MARK: - Component - Tab
    public static let TabBgColorHover = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 1.000)
    public static let TabLabelColorActive = UIColor(red: 0.949, green: 0.957, blue: 0.961, alpha: 1.000)
    public static let TabLabelColorDefault = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    public static let AppBottomTabBarBgColor = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 1.000)

    // MARK: - Component - MenuItem
    public static let MenuItemBorderColorActive = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    public static let MenuItemLabelColorPrimary = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)
    public static let MenuItemLabelColorPrimaryActive = UIColor(red: 0.949, green: 0.957, blue: 0.961, alpha: 1.000)
    /** The variable can be used on secondary menus that many times show up on dedicated home pages specific to a topic. The menu labels are often times using the color white across color modes. */
    public static let MenuItemLabelColorSecondary = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)

    // MARK: - Component - Foldout
    public static let FoldoutLabelColorActive = UIColor(red: 0.949, green: 0.957, blue: 0.961, alpha: 1.000)
    public static let FoldoutLabelColorIdle = UIColor(red: 0.808, green: 0.831, blue: 0.855, alpha: 1.000)

    // MARK: - Component - Newsticker
    public static let NewsTickerTimestampColor = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)
    public static let NewsTickerBadgeIconsColor = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)

    // MARK: - Component - Alert
    /** On marketing offer surfaces this variable is usually not used. The alertSurfaceConstant variables should be used. This token changes color between light and dark modes. L:100 / D:025 */
    public static let AlertSurfaceColor = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 1.000)
    /** On marketing offer surfaces this variable is  used. */
    public static let AlertSurfaceColorConstant = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)

    // MARK: - Component - Empties
    public static let EmptiesBgColor = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 1.000)
    public static let EmptiesLogoColor = UIColor(red: 0.173, green: 0.192, blue: 0.220, alpha: 1.000)

    // MARK: - Component - Chips
    public static let ChipsBgColorHover = UIColor(red: 0.808, green: 0.831, blue: 0.855, alpha: 1.000)
    public static let ChipsLabelColorHover = UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1.000)
    public static let ChipsBgColorActive = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    public static let ChipsBgColorIdle = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)
    public static let ChipsLabelColorIdle = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)

    // MARK: - Component - Card
    public static let CardSurfaceBgColor = UIColor(red: 0.173, green: 0.192, blue: 0.220, alpha: 1.000)

    // MARK: - Component - Selection
    /** Checkboxes and Radio buttons use this variable for their border. */
    public static let SelectionBorderColor = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)

    // MARK: - Component - _DSysDoc
    /** This variable is only for use in Figma's Design System File. It is automating some of the content in documentation pages. */
    public static let DsysDocsLabelTextSurfaceColorPrimaryPrimitiveName = "BILD010"
    /** This is currently for use in this design system's documentation texts. It is a text string made for being used in light and dark mode documentation texts. */
    public static let DsysDocsLabelTextColorMode = "(Dark Mode)"
    public static let DsDocSpacingItemBgColor = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 0.200)
    public static let DsDocSpacingItemBorderColor = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 0.800)

    // MARK: - Component - Hey
    public static let HeyFavInputFieldSurfaceColor = UIColor(red: 0.294, green: 0.322, blue: 0.353, alpha: 1.000)
    public static let HeyTextColor = UIColor(red: 0.914, green: 0.925, blue: 0.937, alpha: 1.000)
    public static let HeyIconUtilColor = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    /** This is the most used color for separators across Bild products. */
    public static let HeySeparatorColor = UIColor(red: 0.400, green: 0.420, blue: 0.439, alpha: 1.000)
    public static let HeyDrawerSurfaceColor = UIColor(red: 0.204, green: 0.235, blue: 0.255, alpha: 1.000)

    // MARK: - Component - Pagination
    public static let PaginationElementColorDefault = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)
    public static let PaginationElementColorActive = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    /** Use this on gallery slider pagination elements. This can also be applied to hover states of those elements. */
    public static let GalleryPaginationElementActiveOpacity = "100px"
    /** Used as the background surface color scroll bars. Found on components that vertically or horizontally stack elements. */
    public static let ScrollBarTrackBgColor = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 0.100)
    /** Use on the scroll bar interactive element which shows where the scroll view is positioned inside the full extent of the scrolling space. */
    public static let ScrollBarThumbBgColor = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)

    // MARK: - Component - Kicker - Standard
    public static let KickerBgColorOnSurface = UIColor(red: 0.549, green: 0.569, blue: 0.588, alpha: 1.000)

    // MARK: - Component - Kicker - Partner
    public static let KickerStylebookBgColor = "UNRESOLVED_VariableID:16104:163534"
    public static let KickerFitbookBgColor = UIColor(red: 1.000, green: 0.592, blue: 0.718, alpha: 1.000)
    public static let KickerPetbookBgColor = UIColor(red: 0.725, green: 0.859, blue: 0.569, alpha: 1.000)
    public static let KickerMyhomebookBgColor = UIColor(red: 0.400, green: 0.800, blue: 0.800, alpha: 1.000)
    public static let KickerTravelbookBgColor = UIColor(red: 0.557, green: 0.941, blue: 0.929, alpha: 1.000)
    public static let KickerTechbookBgColor = UIColor(red: 0.576, green: 0.894, blue: 1.000, alpha: 1.000)
    public static let KickerKaufberaterBgColor = UIColor(red: 0.333, green: 0.278, blue: 0.431, alpha: 1.000)
    public static let KickerCobiBgColor = UIColor(red: 0.863, green: 0.137, blue: 0.110, alpha: 1.000)
    public static let KickerAubiBgColor = UIColor(red: 0.941, green: 0.000, blue: 0.000, alpha: 1.000)
    public static let KickerSpobiBgColor = UIColor(red: 0.090, green: 0.267, blue: 0.510, alpha: 1.000)
    public static let KickerBzBgColor = UIColor(red: 0.890, green: 0.000, blue: 0.106, alpha: 1.000)

    // MARK: - Component - Teaser
    /** When users hover over graphical teasers the image reduces opacity to 80%. */
    public static let TeaserHoverOpacity = "80px"
    public static let TeaserTitleBackgroundGradientStart = UIColor(red: 0.000, green: 0.000, blue: 0.000, alpha: 0.700)
    public static let TeaserTitleBackgroundGradientStop = UIColor(red: 0.000, green: 0.000, blue: 0.000, alpha: 0.000)

    // MARK: - Component - Slider
    /** When users hover on gallery slider buttons the opacity changes to 90%. */
    public static let SliderButtonOpacity = "90px"
    /** This variable is used on audio player slider bars. It references a pure white with 35% opacity. */
    public static let SliderTrackBgColor = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 0.350)

    // MARK: - Component - Mediaplayer
    public static let VidPlayerControlsAutoplayButtonBgColor = UIColor(red: 0.000, green: 0.000, blue: 0.000, alpha: 0.200)
    /** This variable is used for hover states of video player control buttons. */
    public static let VidPlayerControlButtonsBgHoverColor = UIColor(red: 0.867, green: 0.000, blue: 0.000, alpha: 0.800)
    public static let VidPlayerControlButtonsBgColorHover = UIColor(red: 0.000, green: 0.000, blue: 0.000, alpha: 0.200)
    public static let VidPlayerOverlayScrimColor = UIColor(red: 0.000, green: 0.000, blue: 0.000, alpha: 0.500)
    public static let AudioPlayerPlayButtonBgColor = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 0.300)
    public static let VidPlayerTooltipBgColor = UIColor(red: 0.000, green: 0.000, blue: 0.000, alpha: 0.700)
    public static let VidPlayerControlButtonsBgColorPressed = UIColor(red: 0.000, green: 0.000, blue: 0.000, alpha: 0.050)
    public static let VidPlayerProgressBarPreloadBgColor = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 0.300)
    public static let VidPlayerUnmuteButtonBgColor = UIColor(red: 0.000, green: 0.000, blue: 0.000, alpha: 0.200)
    public static let VidPlayerUnmuteButtonBgColorHover = UIColor(red: 0.000, green: 0.000, blue: 0.000, alpha: 0.350)

    // MARK: - Component - Avatar
    /** 09-2025 css --article-author-name-color */
    public static let AvatarLabelColor = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.000)
    /** 09-2025 css --article-author-name-color */
    public static let AvatarLabelColorHover = UIColor(red: 0.867, green: 0.000, blue: 0.000, alpha: 1.000)

    // MARK: - Component - Gallery
    public static let AppImageLightboxGalleryBgColor = UIColor(red: 0.000, green: 0.000, blue: 0.000, alpha: 1.000)

}
