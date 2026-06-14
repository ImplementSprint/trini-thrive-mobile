import type { ExpoConfig } from 'expo/config';
import { withDangerousMod, withGradleProperties } from 'expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';

type RuntimeEnvironment = 'development' | 'staging' | 'production';

const defaultAppName = 'Damayan Mobile';
const defaultEnvironment: RuntimeEnvironment = 'development';
const defaultApiBaseUrl = 'http://localhost:3001/api';
const kotlinVersion = '2.0.21';
const allowedEnvironments = new Set<RuntimeEnvironment>(['development', 'staging', 'production']);

function withCiKotlinGradleProperty(config: ExpoConfig): ExpoConfig {
  return withGradleProperties(config, (gradleConfig) => {
    const properties = gradleConfig.modResults;
    let hasKotlinVersion = false;

    for (const item of properties) {
      if (item.type === 'property' && item.key === 'kotlinVersion') {
        item.value = kotlinVersion;
        hasKotlinVersion = true;
      }
    }

    if (!hasKotlinVersion) {
      properties.push({
        type: 'property',
        key: 'kotlinVersion',
        value: kotlinVersion,
      });
    }

    return gradleConfig;
  });
}

function withXcodeBuildPhaseFix(config: ExpoConfig): ExpoConfig {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfilePath = path.join(
        cfg.modRequest.platformProjectRoot,
        'Podfile',
      );
      if (fs.existsSync(podfilePath)) {
        let podfileContent = await fs.promises.readFile(podfilePath, 'utf8');

        const fixBlock = [
          '',
          '    # Fix Xcode always_out_of_date warnings for Pods and Main project',
          '    begin',
          '      if defined?(installer) && installer',
          '        if installer.respond_to?(:pods_project) && installer.pods_project',
          '          installer.pods_project.targets.each do |target|',
          '            if target.respond_to?(:build_phases) && target.build_phases',
          '              target.build_phases.each do |phase|',
          '                if phase.respond_to?(:always_out_of_date)',
          "                  phase.always_out_of_date = '1'",
          '                end',
          '              end',
          '            end',
          '          end',
          '          installer.pods_project.save',
          '        end',
          '',
          '        if installer.respond_to?(:aggregate_targets) && installer.aggregate_targets',
          '          installer.aggregate_targets.each do |aggregate_target|',
          '            if aggregate_target.respond_to?(:user_project) && aggregate_target.user_project',
          '              project = aggregate_target.user_project',
          '              if project.respond_to?(:targets) && project.targets',
          '                project.targets.each do |target|',
          '                  if target.respond_to?(:build_phases) && target.build_phases',
          '                    target.build_phases.each do |phase|',
          '                      if phase.respond_to?(:always_out_of_date)',
          "                        phase.always_out_of_date = '1'",
          '                      end',
          '                    end',
          '                  end',
          '                end',
          '                project.save',
          '              end',
          '            end',
          '          end',
          '        end',
          '      end',
          '    rescue => e',
          '      puts "Warning: Could not apply Xcode always_out_of_date warning fix: #{e.message}"',
          '    end',
          '',
        ].join('\n');

        if (!podfileContent.includes('Fix Xcode always_out_of_date warnings')) {
          podfileContent = podfileContent.replace(
            /post_install\s+do\s+\|installer\|/,
            'post_install do |installer|' + fixBlock,
          );
          if (!podfileContent.includes('Fix Xcode always_out_of_date warnings')) {
            podfileContent = podfileContent.replace(
              'post_install do |installer|',
              'post_install do |installer|' + fixBlock,
            );
          }
          await fs.promises.writeFile(podfilePath, podfileContent, 'utf8');
        }
      }
      return cfg;
    },
  ]);
}

function resolveEnvironment(value: string | undefined): RuntimeEnvironment {
  if (value && allowedEnvironments.has(value as RuntimeEnvironment)) {
    return value as RuntimeEnvironment;
  }

  return defaultEnvironment;
}

export default function getExpoConfig(): ExpoConfig {
  const appName = process.env.EXPO_PUBLIC_APP_NAME ?? defaultAppName;
  const environment = resolveEnvironment(process.env.EXPO_PUBLIC_APP_ENV);
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl;
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  return withXcodeBuildPhaseFix(withCiKotlinGradleProperty({
    name: appName,
    slug: 'damayan-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'damayanmobile',
    userInterfaceStyle: 'light',
    jsEngine: 'hermes',
    assetBundlePatterns: ['**/*'],
    icon: './assets/images/damayan-logo.png',
    experiments: {
      tsconfigPaths: true,
    },
    android: {
      package: 'com.anonymous.damayanmobile',
    },
    ios: {
      bundleIdentifier: 'com.anonymous.damayanmobile',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            kotlinVersion,
          },
        },
      ],
      'expo-font',
    ],
    extra: {
      appName,
      environment,
      apiBaseUrl,
      supabaseUrl,
      supabaseAnonKey,
    },
  }));
}
