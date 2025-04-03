import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Image, Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SIZES, SHADOWS } from '../../src/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  SlideInDown,
} from 'react-native-reanimated';

// Import our UI components
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import Card from '../../src/components/ui/Card';
import AuthBackground from '../../src/components/ui/AuthBackground';

const { width } = Dimensions.get('window');

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Animation values
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const logoScale = useSharedValue(0.8);
  const errorShake = useSharedValue(0);

  // Start animations
  React.useEffect(() => {
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.elastic(1.2) });
    formOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    formTranslateY.value = withDelay(400, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, []);

  // Animated styles
  const logoAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
    };
  });

  const formAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [{ translateY: formTranslateY.value }],
    };
  });

  const errorAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: errorShake.value }],
    };
  });

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      // Animate error shake
      errorShake.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Successfully signed in
      router.replace('/(tabs)');
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign in');
      // Animate error shake
      errorShake.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email to reset password');
      // Animate error shake
      errorShake.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'buzzap-messenger://reset-password',
      });

      if (error) throw error;
      
      // Show success message
      setError('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      setError(error.message || 'Failed to send reset password email');
      // Animate error shake
      errorShake.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <StatusBar style="dark" />
          
          {/* Logo */}
          <Animated.View 
            style={[styles.logoContainer, logoAnimStyle]}
            entering={FadeIn.duration(800).delay(200)}
          >
            <Image
              source={require('../../assets/uzzap-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
          
          {/* Form */}
          <Animated.View 
            style={[styles.formContainer, formAnimStyle]}
            entering={FadeInDown.duration(800).delay(400).springify()}
          >
            <Card style={styles.card}>
              <Animated.Text 
                style={styles.title}
                entering={SlideInDown.duration(600).delay(600)}
              >
                Welcome Back
              </Animated.Text>
              
              <Animated.Text 
                style={styles.subtitle}
                entering={SlideInDown.duration(600).delay(700)}
              >
                Sign in to continue
              </Animated.Text>
              
              {/* Error message */}
              {error && (
                <Animated.View 
                  style={[styles.errorContainer, errorAnimStyle]}
                  entering={FadeIn.duration(300)}
                >
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              )}
              
              {/* Email input */}
              <Animated.View entering={FadeInDown.duration(600).delay(800)}>
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  leftIcon={<Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />}
                  error={error && !email ? 'Email is required' : undefined}
                />
              </Animated.View>
              
              {/* Password input */}
              <Animated.View entering={FadeInDown.duration(600).delay(900)}>
                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />}
                  rightIcon={
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  }
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  error={error && !password ? 'Password is required' : undefined}
                />
              </Animated.View>
              
              {/* Forgot Password */}
              <Animated.View 
                style={styles.forgotPasswordContainer}
                entering={FadeInDown.duration(600).delay(1000)}
              >
                <TouchableWithoutFeedback onPress={handleForgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableWithoutFeedback>
              </Animated.View>
              
              {/* Sign In Button */}
              <Animated.View entering={FadeInDown.duration(600).delay(1100)}>
                <Button
                  title="Sign In"
                  onPress={handleSignIn}
                  loading={loading}
                  gradient={true}
                  fullWidth
                  style={styles.signInButton}
                />
              </Animated.View>
              
              {/* Sign Up Link */}
              <Animated.View 
                style={styles.signUpContainer}
                entering={FadeInDown.duration(600).delay(1200)}
              >
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <Link href="/sign-up" asChild>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </Link>
              </Animated.View>
            </Card>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.spacing2XL,
  },
  logoImage: {
    width: width * 0.4,
    height: width * 0.4,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    padding: SIZES.spacingL,
    borderRadius: SIZES.radiusLarge,
    ...SHADOWS.medium,
  },
  title: {
    fontFamily: 'System',
    fontSize: SIZES.h2,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.spacingXS,
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: SIZES.body2,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacingL,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '15', // 15% opacity
    padding: SIZES.spacingM,
    borderRadius: SIZES.radiusMedium,
    marginBottom: SIZES.spacingM,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    fontFamily: 'System',
    fontSize: SIZES.body3,
    fontWeight: '400',
    color: COLORS.error,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: SIZES.spacingXS,
    marginBottom: SIZES.spacingL,
  },
  forgotPasswordText: {
    fontFamily: 'System',
    fontSize: SIZES.body3,
    fontWeight: '400',
    color: COLORS.primary,
  },
  signInButton: {
    marginBottom: SIZES.spacingL,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontFamily: 'System',
    fontSize: SIZES.body3,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  signUpLink: {
    fontFamily: 'System',
    fontSize: SIZES.body3,
    fontWeight: '700',
    color: COLORS.primary,
  },
});