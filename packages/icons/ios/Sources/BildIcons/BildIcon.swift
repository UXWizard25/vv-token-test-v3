// GENERATED CODE - DO NOT MODIFY BY HAND
// Generated at: 2025-12-16T13:24:05.391Z
//
// BILD Design System Icons - Swift Extension
// To regenerate, run: npm run build:icons:ios

import SwiftUI

// MARK: - BildIcon Enum

/// BILD Design System Icon names
///
/// Usage:
/// ```swift
/// // Simple usage with convenience method
/// BildIcon.add.icon()
///
/// // With custom size and color
/// BildIcon.arrowLeft.icon(size: 32, color: .blue)
///
/// // Using the raw Image for more control
/// BildIcon.menu.image
///     .resizable()
///     .frame(width: 24, height: 24)
///     .foregroundColor(.primary)
/// ```
public enum BildIcon: String, CaseIterable, Sendable {
    case _2LigaLogo = "_2LigaLogo"
    case account = "account"
    case add = "add"
    case adjust = "adjust"
    case android = "android"
    case appleIos = "appleIos"
    case arrowDown = "arrowDown"
    case arrowLeft = "arrowLeft"
    case arrowRight = "arrowRight"
    case arrowUp = "arrowUp"
    case arscan = "arscan"
    case auto = "auto"
    case autobildLogo = "autobildLogo"
    case bamsLogo = "bamsLogo"
    case basketball = "basketball"
    case bildClubLogo = "bildClubLogo"
    case bildLogo = "bildLogo"
    case bildplayLogo = "bildplayLogo"
    case bildplusLogoSimple = "bildplusLogoSimple"
    case bildplusLogo = "bildplusLogo"
    case bin = "bin"
    case bookmark = "bookmark"
    case boxing = "boxing"
    case bundesligaLogo = "bundesligaLogo"
    case burgermenu = "burgermenu"
    case calendar = "calendar"
    case camera = "camera"
    case cards = "cards"
    case checklist = "checklist"
    case checkmarkCircled = "checkmarkCircled"
    case checkmark = "checkmark"
    case chevronDown = "chevronDown"
    case chevronLeft = "chevronLeft"
    case chevronRight = "chevronRight"
    case chevronUp = "chevronUp"
    case clock = "clock"
    case close = "close"
    case comment = "comment"
    case computerbildLogo = "computerbildLogo"
    case controller = "controller"
    case copy = "copy"
    case creditCard = "creditCard"
    case darkMode = "darkMode"
    case dataProtection = "dataProtection"
    case desktopCheckmark = "desktopCheckmark"
    case desktopQuestionmark = "desktopQuestionmark"
    case desktop = "desktop"
    case digital = "digital"
    case download = "download"
    case edit = "edit"
    case enterFullscreen = "enterFullscreen"
    case erotik = "erotik"
    case exclamationmarkCircle = "exclamationmarkCircle"
    case exitFullscreen = "exitFullscreen"
    case externalIntext = "externalIntext"
    case externalLink = "externalLink"
    case fastBackChevron = "fastBackChevron"
    case fastBackFilled = "fastBackFilled"
    case fastBack = "fastBack"
    case fastForwardChevron = "fastForwardChevron"
    case fastForwardFilled = "fastForwardFilled"
    case fastForward = "fastForward"
    case fastUpward = "fastUpward"
    case football = "football"
    case fussball = "fussball"
    case geld = "geld"
    case gesundheit = "gesundheit"
    case gewinnspiele = "gewinnspiele"
    case gtcs = "gtcs"
    case handball = "handball"
    case headphones = "headphones"
    case heart = "heart"
    case heyLogo = "heyLogo"
    case hide = "hide"
    case history = "history"
    case hockey = "hockey"
    case home = "home"
    case horoskop = "horoskop"
    case imageGallery = "imageGallery"
    case image = "image"
    case imprint = "imprint"
    case information = "information"
    case input = "input"
    case kino = "kino"
    case lifestyle = "lifestyle"
    case lightMode = "lightMode"
    case listChecked = "listChecked"
    case liveBadge = "liveBadge"
    case locked = "locked"
    case logOut = "logOut"
    case loggedIn = "loggedIn"
    case login = "login"
    case lotto = "lotto"
    case mail = "mail"
    case marktplatzLogo = "marktplatzLogo"
    case maximizePip = "maximizePip"
    case maximize = "maximize"
    case meinVerein = "meinVerein"
    case menu = "menu"
    case minimizePip = "minimizePip"
    case minimize = "minimize"
    case motorsport = "motorsport"
    case mute = "mute"
    case mypass = "mypass"
    case netid = "netid"
    case newsTicker = "newsTicker"
    case news = "news"
    case notificationsOff = "notificationsOff"
    case notificationsOn = "notificationsOn"
    case ostSport = "ostSport"
    case paper = "paper"
    case participate = "participate"
    case pauseFilled = "pauseFilled"
    case pause = "pause"
    case paymentMastercard = "paymentMastercard"
    case pin = "pin"
    case placeholder = "placeholder"
    case playFilled = "playFilled"
    case play = "play"
    case podcastAmazon = "podcastAmazon"
    case podcastApplepodcast = "podcastApplepodcast"
    case podcastDeezer = "podcastDeezer"
    case podcastGooglepodcasts = "podcastGooglepodcasts"
    case podcastSpotify = "podcastSpotify"
    case politik = "politik"
    case pushNotification = "pushNotification"
    case questionmarkCircle = "questionmarkCircle"
    case quote = "quote"
    case raetsel = "raetsel"
    case ratgeber = "ratgeber"
    case regio = "regio"
    case reise = "reise"
    case reload = "reload"
    case replay = "replay"
    case ressorts = "ressorts"
    case revocation = "revocation"
    case rewindTenSec = "rewindTenSec"
    case search = "search"
    case send = "send"
    case settings = "settings"
    case sexUndLiebe = "sexUndLiebe"
    case share = "share"
    case sharecast = "sharecast"
    case shoppingCart = "shoppingCart"
    case show = "show"
    case signUp = "signUp"
    case skipNextChevron = "skipNextChevron"
    case skipNextFilled = "skipNextFilled"
    case skipNext = "skipNext"
    case skipPreviousChevron = "skipPreviousChevron"
    case skipPreviousFilled = "skipPreviousFilled"
    case skipPrevious = "skipPrevious"
    case skipTenSec = "skipTenSec"
    case smartphone = "smartphone"
    case socialFacebook = "socialFacebook"
    case socialFbMessagner = "socialFbMessagner"
    case socialGoogle = "socialGoogle"
    case socialInstagram = "socialInstagram"
    case socialLinkedin = "socialLinkedin"
    case socialSnapchat = "socialSnapchat"
    case socialWhatsapp = "socialWhatsapp"
    case socialXTwitter = "socialXTwitter"
    case socialXing = "socialXing"
    case socialYoutube = "socialYoutube"
    case speed = "speed"
    case sportBildLogo = "sportBildLogo"
    case sportLive = "sportLive"
    case sportTicker = "sportTicker"
    case sport = "sport"
    case sportimtv = "sportimtv"
    case ssl = "ssl"
    case star = "star"
    case substract = "substract"
    case szTicker = "szTicker"
    case telephone = "telephone"
    case tennis = "tennis"
    case threeDotHorizontal = "threeDotHorizontal"
    case threeDotVertical = "threeDotVertical"
    case thumbsDown = "thumbsDown"
    case thumbsUp = "thumbsUp"
    case trending = "trending"
    case tv = "tv"
    case unlocked = "unlocked"
    case unquote = "unquote"
    case unterhaltung = "unterhaltung"
    case upload = "upload"
    case usSport = "usSport"
    case verimi = "verimi"
    case videoError = "videoError"
    case videoRecommendations = "videoRecommendations"
    case video = "video"
    case volumeDown = "volumeDown"
    case volumeUp = "volumeUp"
    case vote = "vote"
    case warning = "warning"
    case web = "web"
    case wetter = "wetter"
    case wrestling = "wrestling"
    case zoomIn = "zoomIn"

    /// The image for this icon (use for custom configurations)
    public var image: Image {
        Image(rawValue, bundle: .module)
    }

    /// Human-readable name for preview/debugging
    public var displayName: String {
        switch self {
        case ._2LigaLogo: return "2-liga-logo"
        case .account: return "account"
        case .add: return "add"
        case .adjust: return "adjust"
        case .android: return "android"
        case .appleIos: return "apple-ios"
        case .arrowDown: return "arrow-down"
        case .arrowLeft: return "arrow-left"
        case .arrowRight: return "arrow-right"
        case .arrowUp: return "arrow-up"
        case .arscan: return "arscan"
        case .auto: return "auto"
        case .autobildLogo: return "autobild-logo"
        case .bamsLogo: return "bams-logo"
        case .basketball: return "basketball"
        case .bildClubLogo: return "bild-club-logo"
        case .bildLogo: return "bild-logo"
        case .bildplayLogo: return "bildplay-logo"
        case .bildplusLogoSimple: return "bildplus-logo-simple"
        case .bildplusLogo: return "bildplus-logo"
        case .bin: return "bin"
        case .bookmark: return "bookmark"
        case .boxing: return "boxing"
        case .bundesligaLogo: return "bundesliga-logo"
        case .burgermenu: return "burgermenu"
        case .calendar: return "calendar"
        case .camera: return "camera"
        case .cards: return "cards"
        case .checklist: return "checklist"
        case .checkmarkCircled: return "checkmark-circled"
        case .checkmark: return "checkmark"
        case .chevronDown: return "chevron-down"
        case .chevronLeft: return "chevron-left"
        case .chevronRight: return "chevron-right"
        case .chevronUp: return "chevron-up"
        case .clock: return "clock"
        case .close: return "close"
        case .comment: return "comment"
        case .computerbildLogo: return "computerbild-logo"
        case .controller: return "controller"
        case .copy: return "copy"
        case .creditCard: return "credit-card"
        case .darkMode: return "dark-mode"
        case .dataProtection: return "data-protection"
        case .desktopCheckmark: return "desktop-checkmark"
        case .desktopQuestionmark: return "desktop-questionmark"
        case .desktop: return "desktop"
        case .digital: return "digital"
        case .download: return "download"
        case .edit: return "edit"
        case .enterFullscreen: return "enter-fullscreen"
        case .erotik: return "erotik"
        case .exclamationmarkCircle: return "exclamationmark-circle"
        case .exitFullscreen: return "exit-fullscreen"
        case .externalIntext: return "external-intext"
        case .externalLink: return "external-link"
        case .fastBackChevron: return "fast-back-chevron"
        case .fastBackFilled: return "fast-back-filled"
        case .fastBack: return "fast-back"
        case .fastForwardChevron: return "fast-forward-chevron"
        case .fastForwardFilled: return "fast-forward-filled"
        case .fastForward: return "fast-forward"
        case .fastUpward: return "fast-upward"
        case .football: return "football"
        case .fussball: return "fussball"
        case .geld: return "geld"
        case .gesundheit: return "gesundheit"
        case .gewinnspiele: return "gewinnspiele"
        case .gtcs: return "gtcs"
        case .handball: return "handball"
        case .headphones: return "headphones"
        case .heart: return "heart"
        case .heyLogo: return "hey-logo"
        case .hide: return "hide"
        case .history: return "history"
        case .hockey: return "hockey"
        case .home: return "home"
        case .horoskop: return "horoskop"
        case .imageGallery: return "image-gallery"
        case .image: return "image"
        case .imprint: return "imprint"
        case .information: return "information"
        case .input: return "input"
        case .kino: return "kino"
        case .lifestyle: return "lifestyle"
        case .lightMode: return "light-mode"
        case .listChecked: return "list-checked"
        case .liveBadge: return "live-badge"
        case .locked: return "locked"
        case .logOut: return "log-out"
        case .loggedIn: return "logged-in"
        case .login: return "login"
        case .lotto: return "lotto"
        case .mail: return "mail"
        case .marktplatzLogo: return "marktplatz-logo"
        case .maximizePip: return "maximize-pip"
        case .maximize: return "maximize"
        case .meinVerein: return "mein-verein"
        case .menu: return "menu"
        case .minimizePip: return "minimize-pip"
        case .minimize: return "minimize"
        case .motorsport: return "motorsport"
        case .mute: return "mute"
        case .mypass: return "mypass"
        case .netid: return "netid"
        case .newsTicker: return "news-ticker"
        case .news: return "news"
        case .notificationsOff: return "notifications-off"
        case .notificationsOn: return "notifications-on"
        case .ostSport: return "ost-sport"
        case .paper: return "paper"
        case .participate: return "participate"
        case .pauseFilled: return "pause-filled"
        case .pause: return "pause"
        case .paymentMastercard: return "payment-mastercard"
        case .pin: return "pin"
        case .placeholder: return "placeholder"
        case .playFilled: return "play-filled"
        case .play: return "play"
        case .podcastAmazon: return "podcast-amazon"
        case .podcastApplepodcast: return "podcast-applepodcast"
        case .podcastDeezer: return "podcast-deezer"
        case .podcastGooglepodcasts: return "podcast-googlepodcasts"
        case .podcastSpotify: return "podcast-spotify"
        case .politik: return "politik"
        case .pushNotification: return "push-notification"
        case .questionmarkCircle: return "questionmark-circle"
        case .quote: return "quote"
        case .raetsel: return "raetsel"
        case .ratgeber: return "ratgeber"
        case .regio: return "regio"
        case .reise: return "reise"
        case .reload: return "reload"
        case .replay: return "replay"
        case .ressorts: return "ressorts"
        case .revocation: return "revocation"
        case .rewindTenSec: return "rewind-ten-sec"
        case .search: return "search"
        case .send: return "send"
        case .settings: return "settings"
        case .sexUndLiebe: return "sex-und-liebe"
        case .share: return "share"
        case .sharecast: return "sharecast"
        case .shoppingCart: return "shopping-cart"
        case .show: return "show"
        case .signUp: return "sign-up"
        case .skipNextChevron: return "skip-next-chevron"
        case .skipNextFilled: return "skip-next-filled"
        case .skipNext: return "skip-next"
        case .skipPreviousChevron: return "skip-previous-chevron"
        case .skipPreviousFilled: return "skip-previous-filled"
        case .skipPrevious: return "skip-previous"
        case .skipTenSec: return "skip-ten-sec"
        case .smartphone: return "smartphone"
        case .socialFacebook: return "social-facebook"
        case .socialFbMessagner: return "social-fb-messagner"
        case .socialGoogle: return "social-google"
        case .socialInstagram: return "social-instagram"
        case .socialLinkedin: return "social-linkedin"
        case .socialSnapchat: return "social-snapchat"
        case .socialWhatsapp: return "social-whatsapp"
        case .socialXTwitter: return "social-x-twitter"
        case .socialXing: return "social-xing"
        case .socialYoutube: return "social-youtube"
        case .speed: return "speed"
        case .sportBildLogo: return "sport-bild-logo"
        case .sportLive: return "sport-live"
        case .sportTicker: return "sport-ticker"
        case .sport: return "sport"
        case .sportimtv: return "sportimtv"
        case .ssl: return "ssl"
        case .star: return "star"
        case .substract: return "substract"
        case .szTicker: return "sz-ticker"
        case .telephone: return "telephone"
        case .tennis: return "tennis"
        case .threeDotHorizontal: return "three-dot-horizontal"
        case .threeDotVertical: return "three-dot-vertical"
        case .thumbsDown: return "thumbs-down"
        case .thumbsUp: return "thumbs-up"
        case .trending: return "trending"
        case .tv: return "tv"
        case .unlocked: return "unlocked"
        case .unquote: return "unquote"
        case .unterhaltung: return "unterhaltung"
        case .upload: return "upload"
        case .usSport: return "us-sport"
        case .verimi: return "verimi"
        case .videoError: return "video-error"
        case .videoRecommendations: return "video-recommendations"
        case .video: return "video"
        case .volumeDown: return "volume-down"
        case .volumeUp: return "volume-up"
        case .vote: return "vote"
        case .warning: return "warning"
        case .web: return "web"
        case .wetter: return "wetter"
        case .wrestling: return "wrestling"
        case .zoomIn: return "zoom-in"
        }
    }
}

// MARK: - Convenience Modifiers

public extension BildIcon {
    /// Standard icon sizes following SF Symbols conventions
    enum Size: CGFloat, Sendable {
        /// Extra small icon (16pt)
        case xs = 16
        /// Small icon (20pt)
        case sm = 20
        /// Medium icon (24pt) - Default
        case md = 24
        /// Large icon (32pt)
        case lg = 32
        /// Extra large icon (48pt)
        case xl = 48
    }

    /// Creates an icon view with specified size and color
    ///
    /// - Parameters:
    ///   - size: The icon size in points (default: 24)
    ///   - color: The icon color (default: .primary)
    /// - Returns: A configured icon view
    ///
    /// Example:
    /// ```swift
    /// BildIcon.add.icon(size: 32, color: .blue)
    /// ```
    @ViewBuilder
    func icon(size: CGFloat = 24, color: Color = .primary) -> some View {
        image
            .resizable()
            .renderingMode(.template)
            .frame(width: size, height: size)
            .foregroundColor(color)
    }

    /// Creates an icon view with a preset size
    ///
    /// - Parameters:
    ///   - size: The preset size (.xs, .sm, .md, .lg, .xl)
    ///   - color: The icon color (default: .primary)
    /// - Returns: A configured icon view
    ///
    /// Example:
    /// ```swift
    /// BildIcon.menu.icon(size: .lg, color: .red)
    /// ```
    @ViewBuilder
    func icon(size: Size, color: Color = .primary) -> some View {
        icon(size: size.rawValue, color: color)
    }
}

// MARK: - Button Convenience

public extension BildIcon {
    /// Creates a button with this icon
    ///
    /// - Parameters:
    ///   - size: The icon size in points (default: 24)
    ///   - color: The icon color (default: .primary)
    ///   - action: The action to perform when tapped
    /// - Returns: A button with the icon
    ///
    /// Example:
    /// ```swift
    /// BildIcon.close.button {
    ///     dismiss()
    /// }
    /// ```
    func button(
        size: CGFloat = 24,
        color: Color = .primary,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            icon(size: size, color: color)
        }
    }
}

// MARK: - Accessibility

public extension BildIcon {
    /// Creates an accessible icon with a label for screen readers
    ///
    /// - Parameters:
    ///   - label: The accessibility label for screen readers
    ///   - size: The icon size in points (default: 24)
    ///   - color: The icon color (default: .primary)
    /// - Returns: An accessible icon view
    ///
    /// Example:
    /// ```swift
    /// BildIcon.add.accessibleIcon(label: "Add item")
    /// ```
    @ViewBuilder
    func accessibleIcon(
        label: String,
        size: CGFloat = 24,
        color: Color = .primary
    ) -> some View {
        icon(size: size, color: color)
            .accessibilityLabel(label)
    }

    /// Creates a decorative icon hidden from screen readers
    ///
    /// Use for icons that are purely decorative and don't convey meaning.
    ///
    /// - Parameters:
    ///   - size: The icon size in points (default: 24)
    ///   - color: The icon color (default: .primary)
    /// - Returns: A decorative icon view hidden from accessibility
    @ViewBuilder
    func decorativeIcon(size: CGFloat = 24, color: Color = .primary) -> some View {
        icon(size: size, color: color)
            .accessibilityHidden(true)
    }
}

#if DEBUG
// MARK: - Previews

/// Preview provider for all icons
struct BildIconPreviews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 80))], spacing: 16) {
                ForEach(BildIcon.allCases, id: \.self) { icon in
                    VStack(spacing: 8) {
                        icon.icon(size: .md)
                        Text(icon.displayName)
                            .font(.caption2)
                            .lineLimit(1)
                    }
                    .frame(width: 80)
                }
            }
            .padding()
        }
        .previewDisplayName("All Icons")
    }
}

/// Preview for icon sizes
struct BildIconSizePreviews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 24) {
            HStack(spacing: 24) {
                BildIcon.add.icon(size: .xs)
                BildIcon.add.icon(size: .sm)
                BildIcon.add.icon(size: .md)
                BildIcon.add.icon(size: .lg)
                BildIcon.add.icon(size: .xl)
            }
            HStack(spacing: 24) {
                BildIcon.add.icon(size: .md, color: .red)
                BildIcon.add.icon(size: .md, color: .blue)
                BildIcon.add.icon(size: .md, color: .green)
            }
        }
        .padding()
        .previewDisplayName("Icon Sizes & Colors")
    }
}
#endif
