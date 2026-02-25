import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  // ------------------ SIGN UP ------------------

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerification((prev) => ({
        ...prev,
        state: "pending",
      }));

    } catch (err: any) {
      Alert.alert(
          "Error",
          err?.errors?.[0]?.longMessage || err?.message || "Something went wrong"
      );
    }
  };

  // ------------------ VERIFY OTP ------------------

  const onPressVerify = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (completeSignUp.status !== "complete") {
        setVerification((prev) => ({
          ...prev,
          error: "OTP verification failed.",
          state: "failed",
        }));
        return;
      }

      const clerkId = completeSignUp.createdUserId;
      const sessionId = completeSignUp.createdSessionId;

      if (!clerkId || !sessionId) {
        throw new Error("Missing Clerk ID or Session ID");
      }

      // Send ALL user data to FastAPI
      const response = await fetchAPI<{
        success: boolean;
        id?: number;
        detail?: string;
      }>("/user", {
        method: "POST",
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          clerkId,
        }),
      });

      if (!response.success) {
        throw new Error(response.detail || "Failed to store user");
      }

      await setActive({ session: sessionId });

      setVerification((prev) => ({
        ...prev,
        state: "success",
        error: "",
      }));

      router.replace("/(root)/(tabs)/home");

    } catch (error: any) {
      setVerification((prev) => ({
        ...prev,
        error:
            error?.errors?.[0]?.longMessage ||
            error?.message ||
            "Verification failed",
        state: "failed",
      }));
    }
  };

  // ------------------ UI ------------------

  return (
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 bg-white">

          <View className="relative w-full h-[250px]">
            <Image source={images.signUpCar} className="w-full h-[250px]" />
            <Text className="text-2xl font-JakartaSemiBold absolute bottom-5 left-5">
              Create Your Account
            </Text>
          </View>

          <View className="p-5">

            <InputField
                label="First Name"
                placeholder="Enter first name"
                icon={icons.person}
                value={form.firstName}
                onChangeText={(value) =>
                    setForm({ ...form, firstName: value })
                }
            />

            <InputField
                label="Last Name"
                placeholder="Enter last name"
                icon={icons.person}
                value={form.lastName}
                onChangeText={(value) =>
                    setForm({ ...form, lastName: value })
                }
            />

            <InputField
                label="Phone Number"
                placeholder="Enter phone number"
                icon={icons.phone}
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(value) =>
                    setForm({ ...form, phone: value })
                }
            />

            <InputField
                label="Email"
                placeholder="Enter email"
                icon={icons.email}
                textContentType="emailAddress"
                value={form.email}
                onChangeText={(value) =>
                    setForm({ ...form, email: value })
                }
            />

            <InputField
                label="Password"
                placeholder="Enter password"
                icon={icons.lock}
                secureTextEntry
                textContentType="password"
                value={form.password}
                onChangeText={(value) =>
                    setForm({ ...form, password: value })
                }
            />

            <CustomButton
                title="Sign Up"
                onPress={onSignUpPress}
                className="mt-6"
            />

            <OAuth />

            <Link
                href="/sign-in"
                className="text-lg text-center text-general-200 mt-10"
            >
              Already have an account?{" "}
              <Text className="text-primary-500">Log In</Text>
            </Link>
          </View>

          {/* OTP MODAL */}
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

              {verification.error && (
                  <Text className="text-red-500 text-sm mt-2">
                    {verification.error}
                  </Text>
              )}

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

export default SignUp;