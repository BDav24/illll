import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

const PARTICLE_COUNT = 10;
const DURATION = 550;

interface ParticleConfig {
  angle: number;
  distance: number;
  size: number;
}

// Pre-compute particle positions (evenly spaced with alternating distances)
const PARTICLES: ParticleConfig[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  angle: (i / PARTICLE_COUNT) * Math.PI * 2,
  distance: 22 + (i % 2) * 10,
  size: 5 + (i % 3) * 2,
}));

function Particle({ angle, distance, size, color, progress }: ParticleConfig & { color: string; progress: SharedValue<number> }) {
  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance;

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p < 0.5 ? Math.min(1, p / 0.3) : Math.max(0, 1 - (p - 0.5) / 0.5),
      transform: [
        { translateX: dx * p },
        { translateY: dy * p },
        { scale: p < 0.2 ? p / 0.2 : Math.max(0.3, 1 - (p - 0.2) * 0.6) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    />
  );
}

interface RewardBurstProps {
  trigger: boolean;
  color: string;
}

export const RewardBurst = React.memo(function RewardBurst({ trigger, color }: RewardBurstProps) {
  const progress = useSharedValue(0);
  const prevTrigger = useRef(trigger);

  useEffect(() => {
    // Only animate on false → true transition
    if (trigger && !prevTrigger.current) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: DURATION,
        easing: Easing.out(Easing.cubic),
      });
    }
    prevTrigger.current = trigger;
  }, [trigger, progress]);

  return (
    <>
      {PARTICLES.map((p, i) => (
        <Particle key={i} {...p} color={color} progress={progress} />
      ))}
    </>
  );
});

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});
