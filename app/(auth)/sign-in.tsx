import { useSignIn , useClerk } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import {ReactNativeModal} from "react-native-modal";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });


  const [verification, setVerification] = useState({
    state: "default", // default | pending
    code: "",
    error: "",
  });
  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: form.email.trim(),
        password: form.password,
      });

      // ✅ If no 2FA required
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(root)/(tabs)/home");
        return;
      }

      // 🔐 If 2FA required
      if (result.status === "needs_second_factor") {
        await result.prepareSecondFactor({
          strategy: "email_code",
        });

        setVerification({
          state: "pending",
          code: "",
          error: "",
        });

        return;
      }

      Alert.alert("Error", "Login failed.");
    } catch (err: any) {
      const message =
          err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          "Login failed.";

      Alert.alert("Error", message);
    }
  }, [isLoaded, form, signIn, setActive]);



  //--------------otp verfication




  const onPressVerify = async () => {
    if (!isLoaded) return;

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: verification.code,
      });

      if (result.status === "complete") {
        setVerification({ state: "default", code: "", error: "" });

        await setActive({ session: result.createdSessionId });
        router.replace("/(root)/(tabs)/home");
        return;
      }
    } catch (err: any) {
      setVerification((prev) => ({
        ...prev,
        error:
            err?.errors?.[0]?.longMessage ||
            err?.errors?.[0]?.message ||
            "Invalid code",
      }));
    }
  };
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Welcome 👋
          </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />

          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton
            title="Sign In"
            onPress={onSignInPress}
            className="mt-6"
          />

          <OAuth />

          <Link
            href="/sign-up"
            className="text-lg text-center text-general-200 mt-10"
          >
            Don't have an account?{" "}
            <Text className="text-primary-500">Sign Up</Text>
          </Link>
        </View>
        <ReactNativeModal isVisible={verification.state === "pending"}>
          <View className="bg-white px-7 py-9 rounded-2xl">
            <Text className="font-JakartaExtraBold text-2xl mb-2">
              Verification
            </Text>

            <Text className="mb-5">
              We've sent a verification code to {form.email}.
            </Text>

            <InputField
                label="Code"
                icon={icons.lock}
                placeholder="123456"
                value={verification.code}
                keyboardType="numeric"
                onChangeText={(code) =>
                    setVerification({ ...verification, code })
                }
            />

            {verification.error ? (
                <Text className="text-red-500 text-sm mt-2">
                  {verification.error}
                </Text>
            ) : null}

            <CustomButton
                title="Verify Email"
                onPress={onPressVerify}
                className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignIn;
