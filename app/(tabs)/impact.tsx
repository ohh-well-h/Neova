import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { impactFocusAreas } from '@/content/impact';
import { colors, radii, spacing } from '@/theme/tokens';

const focusIcons = ['heart-pulse', 'account-heart-outline', 'mother-heart'] as const;

function BotanicalLine() {
  return (
    <Svg accessibilityLabel="A growing stem" height={112} viewBox="0 0 92 112" width={92}>
      <Circle cx={54} cy={27} fill={colors.terracotta} r={18} />
      <Path
        d="M50 94 C53 73 52 54 38 35 M49 65 C34 60 27 48 26 35 C39 40 48 49 49 65 M51 78 C65 69 70 57 68 45 C57 52 51 63 51 78"
        fill="none"
        stroke={colors.cream}
        strokeLinecap="round"
        strokeWidth={2.5}
      />
    </Svg>
  );
}

export default function ImpactScreen() {
  return (
    <Screen>
      <PageHeader context="Partner transparency" threadLabel="Roster pending" title="Impact" />

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <AppText color={colors.white} variant="title">Care beyond the circle</AppText>
          <AppText color={colors.white}>
            This space will introduce Neova&apos;s confirmed partner organizations.
          </AppText>
          <AppText color={colors.cream} variant="caption">
            Launch roster pending confirmation.
          </AppText>
        </View>
        <BotanicalLine />
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Where support will focus</AppText>
        <View>
          {impactFocusAreas.map((focus, index) => (
            <View key={focus.id} style={[styles.focusRow, index === 0 && styles.firstRow]}>
              <View style={[styles.iconDisc, index % 2 === 1 && styles.sageDisc]}>
                <MaterialCommunityIcons
                  color={index % 2 === 1 ? colors.sageDark : colors.terracottaDark}
                  name={focusIcons[index] ?? 'leaf'}
                  size={27}
                />
              </View>
              <View style={styles.focusCopy}>
                <AppText variant="subheading">{focus.title}</AppText>
                <AppText color={colors.muted}>{focus.description}</AppText>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.promise}>
        <AppText variant="heading">Our promise</AppText>
        <AppText color={colors.charcoalSoft}>
          Partner names and contribution details will appear here before any impact claim does.
        </AppText>
        <View style={styles.promiseRule} />
        <AppText color={colors.sageDark} variant="bodyMedium">Clear partners. Clear contributions. No inflated totals.</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 210,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.sm,
    padding: spacing.xl,
    paddingRight: spacing.sm,
    overflow: 'hidden',
    borderRadius: radii.lg,
    backgroundColor: colors.sageDark,
  },
  heroCopy: { flex: 1, gap: spacing.md, paddingBottom: spacing.md },
  section: { marginTop: spacing.xxl },
  focusRow: {
    minHeight: 98,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  firstRow: { marginTop: spacing.sm },
  iconDisc: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: colors.terracottaSoft,
  },
  sageDisc: { backgroundColor: colors.sageSoft },
  focusCopy: { flex: 1 },
  promise: { gap: spacing.md, marginTop: spacing.xxl, paddingBottom: spacing.xl },
  promiseRule: { width: 52, height: 2, backgroundColor: colors.terracotta },
});
