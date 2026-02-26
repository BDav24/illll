import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

// Simple global toast trigger
type Listener = (msg: string) => void;
const listeners = new Set<Listener>();

export function showToast(message: string) {
  listeners.forEach((fn) => fn(message));
}

const SLIDE_DURATION = 300;
const VISIBLE_DURATION = 1800;

export function Toast() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleShow = useCallback(
    (msg: string) => {
      setText(msg);

      if (hideTimer.current) clearTimeout(hideTimer.current);

      translateY.setValue(100);
      opacity.setValue(0);

      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: SLIDE_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }),
      ]).start();

      // Slide out after delay
      hideTimer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 100,
            duration: SLIDE_DURATION,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: SLIDE_DURATION,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setText('');
        });
      }, VISIBLE_DURATION);
    },
    [translateY, opacity],
  );

  useEffect(() => {
    listeners.add(handleShow);
    return () => {
      listeners.delete(handleShow);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [handleShow]);

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.container,
          {
            bottom: insets.bottom + 80,
            backgroundColor: colors.surface,
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  container: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 6,
  },
  text: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    textAlign: 'center',
  },
});
