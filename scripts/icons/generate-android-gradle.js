#!/usr/bin/env node

/**
 * Android build.gradle.kts Generator
 *
 * Generates build.gradle.kts from pipeline.config.js.
 * This ensures the Gradle/Maven configuration matches the central config.
 *
 * Output: packages/icons/android/build.gradle.kts
 */

const fs = require('fs');
const path = require('path');
const config = require('../../build-config/tokens/pipeline.config.js');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  output: path.resolve(__dirname, '../../packages/icons/android/build.gradle.kts'),
};

// Extract config values
const androidConfig = config.packages.icons.android;
const identity = config.identity;
const namingConfig = config.icons.naming;

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

const log = {
  info: (msg) => console.log(`\u2139\uFE0F  ${msg}`),
  success: (msg) => console.log(`\u2705 ${msg}`),
  error: (msg) => console.error(`\u274C ${msg}`),
  step: (msg) => console.log(`\n\u27A1\uFE0F  ${msg}`),
};

// ============================================================================
// GENERATOR
// ============================================================================

/**
 * Generate build.gradle.kts content
 */
function generateBuildGradle() {
  const namespace = androidConfig.namespace;
  const groupId = androidConfig.mavenGroupId;
  const artifactId = androidConfig.mavenArtifactId;
  const mavenName = androidConfig.mavenName;
  const mavenDescription = androidConfig.mavenDescription;
  const compileSdk = androidConfig.compileSdk;
  const minSdk = androidConfig.minSdk;
  const kotlinCompilerExtensionVersion = androidConfig.kotlinCompilerExtensionVersion;
  const versions = androidConfig.versions;

  const systemName = identity.name;
  const author = identity.author;
  const repoUrl = identity.repositoryUrl;
  const gitUrl = identity.gitUrl;
  const license = identity.license;
  const shortName = identity.shortName;

  // Derive object name from naming prefix
  const objectName = `${namingConfig.prefix}Icons`;

  // Extract GitHub path from repo URL (e.g., UXWizard25/bild-design-system)
  const githubPath = repoUrl.replace('https://github.com/', '');

  return `/**
 * ${systemName} Icons - Android Library
 *
 * Publishes vector drawable icons with Jetpack Compose support to GitHub Packages (Maven).
 *
 * Usage:
 *   ./gradlew build                    # Build AAR
 *   ./gradlew publish -PVERSION=1.0.0  # Publish to GitHub Packages
 *
 * Consumer:
 *   repositories {
 *       maven { url = uri("https://maven.pkg.github.com/${githubPath}") }
 *   }
 *   dependencies {
 *       implementation("${groupId}:${artifactId}:1.0.0")
 *   }
 *
 * Jetpack Compose usage:
 *   Icon(
 *       imageVector = ${objectName}.Add,
 *       contentDescription = "Add"
 *   )
 */

plugins {
    id("com.android.library") version "${versions.androidGradlePlugin}"
    id("org.jetbrains.kotlin.android") version "${versions.kotlinGradlePlugin}"
    id("maven-publish")
}

android {
    namespace = "${namespace}"
    compileSdk = ${compileSdk}

    defaultConfig {
        minSdk = ${minSdk}
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
        kotlinCompilerExtensionVersion = "${kotlinCompilerExtensionVersion}"
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
            res.srcDirs("src/main/res")
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
    // Jetpack Compose UI (required for ImageVector)
    implementation("androidx.compose.ui:ui:${versions.composeUi}")
    // Material 3 (required for Icon, IconButton, LocalContentColor)
    implementation("androidx.compose.material3:material3:${versions.composeMaterial3}")
    // Foundation (required for layout modifiers)
    implementation("androidx.compose.foundation:foundation:${versions.composeFoundation}")
}

publishing {
    publications {
        create<MavenPublication>("release") {
            groupId = "${groupId}"
            artifactId = "${artifactId}"
            version = providers.gradleProperty("VERSION").getOrElse("1.0.0")

            afterEvaluate {
                from(components["release"])
            }

            pom {
                name.set("${mavenName}")
                description.set("${mavenDescription}")
                url.set("${repoUrl}")

                licenses {
                    license {
                        name.set("${license} License")
                        url.set("https://opensource.org/licenses/${license}")
                    }
                }

                developers {
                    developer {
                        id.set("${shortName}-design-system")
                        name.set("${author}")
                    }
                }

                scm {
                    connection.set("scm:git:git://${gitUrl.replace('https://', '').replace('.git', '')}.git")
                    developerConnection.set("scm:git:ssh://${gitUrl.replace('https://', '').replace('.git', '')}.git")
                    url.set("${repoUrl}")
                }
            }
        }
    }

    repositories {
        maven {
            name = "GitHubPackages"
            url = uri("https://maven.pkg.github.com/${githubPath}")
            credentials {
                username = System.getenv("GITHUB_ACTOR") ?: providers.gradleProperty("gpr.user").getOrElse("")
                password = System.getenv("GITHUB_TOKEN") ?: providers.gradleProperty("gpr.token").getOrElse("")
            }
        }
    }
}
`;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  log.step('Generating build.gradle.kts...');

  try {
    const content = generateBuildGradle();

    // Ensure output directory exists
    const outputDir = path.dirname(PATHS.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(PATHS.output, content, 'utf8');
    log.success(`Created ${path.basename(PATHS.output)}`);

    return { success: true };
  } catch (error) {
    log.error(`Failed to generate build.gradle.kts: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(result => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch(error => {
      log.error(error.message);
      process.exit(1);
    });
}

module.exports = { main, generateBuildGradle };
