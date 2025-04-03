import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../src/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

// Import our UI components
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import Card from '@/src/components/ui/Card';
import AuthBackground from '@/src/components/ui/AuthBackground';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !username) {
      setError('All fields are required');
      triggerErrorAnimation();
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      triggerErrorAnimation();
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      triggerErrorAnimation();
      return false;
    }

    return true;
  };

  const triggerErrorAnimation = () => {
    errorShake.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(-10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      
      // Register with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (signUpError) throw signUpError;
      
      // Create profile
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username,
            email,
          });

        if (profileError) throw profileError;
      }
      
      // Success
      router.replace('/onboarding');
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up');
      triggerErrorAnimation();
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
          <Animated.View style={[styles.logoContainer, logoAnimStyle]}>
            <Image
              source={require('../../assets/uzzap-logo.png')}
              style={styles.logoImage as any}
              resizeMode="contain"
            />
          </Animated.View>
          
          {/* Form */}
          <Animated.View style={[styles.formContainer, formAnimStyle]}>
            <Card style={styles.card}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join our community</Text>
              
              {/* Error message */}
              {error && (
                <Animated.View style={[styles.errorContainer, errorAnimStyle]}>
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              )}
              
              {/* Username input */}
              <Input
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="Choose a username"
                autoCapitalize="none"
                leftIcon={<Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />}
                error={error && !username ? 'Username is required' : undefined}
              />
              
              {/* Email input */}
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
              
              {/* Password input */}
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
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
              
              {/* Confirm Password input */}
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />}
                rightIcon={
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                }
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                error={error && !confirmPassword ? 'Please confirm your password' : undefined}
              />
              
              {/* Sign up button */}
              <Button
                title="Sign Up"
                onPress={handleSignUp}
                variant="primary"
                loading={loading}
                disabled={loading}
                gradient={true}
                style={styles.button}
              />
              
              {/* Sign in link */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <Link href="/sign-in" asChild>
                  <Text style={styles.signInLink}>Sign In</Text>
                </Link>
              </View>
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
    marginBottom: SIZES.padding,
  },
  logoImage: {
    width: 200,
    height: 80,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    padding: SIZES.padding,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '20',
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },
  errorText: {
    fontFamily: FONTS.body3.fontFamily,
    fontSize: FONTS.body3.fontSize,
    fontWeight: FONTS.body3.fontWeight,
    letterSpacing: FONTS.body3.letterSpacing,
    color: COLORS.error,
    textAlign: 'center',
  },
  button: {
    marginTop: SIZES.padding,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.padding,
  },
  signInText: {
    fontFamily: FONTS.body3.fontFamily,
    fontSize: FONTS.body3.fontSize,
    fontWeight: FONTS.body3.fontWeight,
    letterSpacing: FONTS.body3.letterSpacing,
    color: COLORS.textSecondary,
  },
  signInLink: {
    fontFamily: FONTS.body3.fontFamily,
    fontSize: FONTS.body3.fontSize,
    fontWeight: '600' as const,
    letterSpacing: FONTS.body3.letterSpacing,
    color: COLORS.primary,
  },
});

export const screenOptions = {
  headerShown: false,
};