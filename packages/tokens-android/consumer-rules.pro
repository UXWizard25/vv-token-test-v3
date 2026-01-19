# BILD Design System Tokens - ProGuard/R8 Consumer Rules
# These rules are automatically included when consumers use this library

# Keep all token classes and interfaces
-keep class de.bild.design.tokens.** { *; }
-keep interface de.bild.design.tokens.** { *; }

# Keep Compose-related classes
-keepclassmembers class de.bild.design.tokens.** {
    @androidx.compose.runtime.Composable <methods>;
}
