/**
 * BILD Design System Tokens - Android Library
 *
 * Publishes design tokens with Jetpack Compose support to GitHub Packages (Maven).
 *
 * Usage:
 *   ./gradlew build                    # Build AAR
 *   ./gradlew publish -PVERSION=1.0.0  # Publish to GitHub Packages
 *
 * Consumer:
 *   repositories {
 *       maven { url = uri("https://maven.pkg.github.com/UXWizard25/bild-design-system") }
 *   }
 *   dependencies {
 *       implementation("de.bild.design:tokens:1.0.0")
 *   }
 *
 * Jetpack Compose usage:
 *   DesignSystemTheme(
 *       colorBrand = ColorBrand.Bild,
 *       contentBrand = ContentBrand.Bild,
 *       darkTheme = isSystemInDarkTheme()
 *   ) {
 *       Text(
 *           text = "Hello",
 *           color = DesignSystemTheme.colors.textColorPrimary
 *       )
 *   }
 */

plugins {
    id("com.android.library") version "8.7.0"
    id("org.jetbrains.kotlin.android") version "1.9.24"
    id("maven-publish")
}

android {
    namespace = "de.bild.design.tokens"
    compileSdk = 34

    defaultConfig {
        minSdk = 21
        consumerProguardFiles("consumer-rules.pro")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.13"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    sourceSets {
        getByName("main") {
            kotlin.srcDirs("src/main/kotlin")
            manifest.srcFile("src/main/AndroidManifest.xml")
        }
    }

    publishing {
        singleVariant("release") {
            withSourcesJar()
        }
    }
}

dependencies {
    // Jetpack Compose UI
    implementation("androidx.compose.ui:ui:1.6.0")
    // Material 3
    implementation("androidx.compose.material3:material3:1.2.0")
    // Foundation
    implementation("androidx.compose.foundation:foundation:1.6.0")
    // Runtime for CompositionLocal
    implementation("androidx.compose.runtime:runtime:1.6.0")
}

publishing {
    publications {
        create<MavenPublication>("release") {
            groupId = "de.bild.design"
            artifactId = "tokens"
            version = providers.gradleProperty("VERSION").getOrElse("1.0.0")

            afterEvaluate {
                from(components["release"])
            }

            pom {
                name.set("BILD Design System Tokens")
                description.set("Design tokens for Android from the BILD Design System")
                url.set("https://github.com/UXWizard25/bild-design-system")

                licenses {
                    license {
                        name.set("MIT License")
                        url.set("https://opensource.org/licenses/MIT")
                    }
                }

                developers {
                    developer {
                        id.set("bild-design-system")
                        name.set("BILD Design System Team")
                    }
                }

                scm {
                    connection.set("scm:git:git://github.com/UXWizard25/bild-design-system.git")
                    developerConnection.set("scm:git:ssh://github.com/UXWizard25/bild-design-system.git")
                    url.set("https://github.com/UXWizard25/bild-design-system")
                }
            }
        }
    }

    repositories {
        maven {
            name = "GitHubPackages"
            url = uri("https://maven.pkg.github.com/UXWizard25/bild-design-system")
            credentials {
                username = System.getenv("GITHUB_ACTOR") ?: providers.gradleProperty("gpr.user").getOrElse("")
                password = System.getenv("GITHUB_TOKEN") ?: providers.gradleProperty("gpr.token").getOrElse("")
            }
        }
    }
}
