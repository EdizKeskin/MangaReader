"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { TbEye, TbEyeClosed, TbLock, TbMail, TbUser } from "react-icons/tb";
import { Formik } from "formik";
import * as Yup from "yup";
import OtpInput from "react-otp-input";
import { useRouter } from "next13-progressbar";
import { useSignUp } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import SignInOAuthButtons from "@/components/SignInOAuthButtons";
import Link from "next/link";

export default function Login() {
  const t = useTranslations("Register");
  const { isLoaded, signUp, setActive } = useSignUp();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const { isOpen, onOpen } = useDisclosure();
  const router = useRouter();
  const toggleVisibility = () => setIsVisible(!isVisible);

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(4, t("minLength"))
      .required(t("usernameRequired")),
    email: Yup.string().email(t("emailValid")).required(t("emailRequired")),
    password: Yup.string()
      .min(4, t("minLength"))
      .required(t("passwordRequired")),
  });

  const handleSubmit = async (values) => {
    const { username, email, password } = values;
    const emailAddress = email;
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        password,
        username,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
      onOpen();
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors[0].message);
    }
  };
  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status !== "complete") {
        console.log(JSON.stringify(completeSignUp, null, 2));
      }
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/");
        setLoading(false);
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setVerifyError(err.errors[0].message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <Card className="w-11/12 md:w-[400px] lg:w-[450px]">
        <Formik
          initialValues={{
            username: "",
            email: "",
            password: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleBlur,
            handleChange,
            errors,
            values,
            handleSubmit,
            isSubmitting,
          }) => (
            <>
              <CardHeader className="flex justify-center">
                <p className="text-lg font-bold">{t("title")}</p>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col gap-6">
                  <Input
                    type="text"
                    name="username"
                    label={t("username")}
                    size="md"
                    placeholder="John doe"
                    labelPlacement="outside"
                    validationState={errors.username ? "invalid" : "valid"}
                    errorMessage={errors.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.username}
                    startContent={
                      <TbUser className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                    }
                    disabled={pendingVerification}
                  />
                  <Input
                    type="email"
                    name="email"
                    label={t("email")}
                    size="md"
                    placeholder="johndoe@example.com"
                    labelPlacement="outside"
                    validationState={errors.email ? "invalid" : "valid"}
                    errorMessage={errors.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                    startContent={
                      <TbMail className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                    }
                    disabled={pendingVerification}
                  />

                  <Input
                    label={t("password")}
                    name="password"
                    labelPlacement="outside"
                    size="md"
                    placeholder="**********"
                    validationState={errors.password ? "invalid" : "valid"}
                    errorMessage={errors.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    startContent={
                      <TbLock className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                    }
                    endContent={
                      <button
                        className="focus:outline-none"
                        type="button"
                        onClick={toggleVisibility}
                      >
                        {isVisible ? (
                          <TbEyeClosed className="text-2xl pointer-events-none text-default-400" />
                        ) : (
                          <TbEye className="text-2xl pointer-events-none text-default-400" />
                        )}
                      </button>
                    }
                    type={isVisible ? "text" : "password"}
                    disabled={pendingVerification}
                  />
                </div>

                <Button
                  type="submit"
                  as={"button"}
                  color="secondary"
                  className="mt-6"
                  onClick={handleSubmit}
                  isDisabled={true}
                >
                  Geçici olarak devre dışı 
                </Button>

                <div className="relative flex items-center py-5">
                  <div className="flex-grow border-t border-gray-400"></div>
                  <span className="flex-shrink mx-4 text-gray-400">
                    {t("or")}
                  </span>
                  <div className="flex-grow border-t border-gray-400"></div>
                </div>

                {/* <SignInOAuthButtons /> */}
              </CardBody>
            </>
          )}
        </Formik>
      </Card>
      <div className="mt-4 text-center">
        <span className="text-gray-500">Hesabınız zaten var mı? </span>
        <Link href={`/login`} className="text-secondary underline">
          Giriş yapın
        </Link>
      </div>
      {error && (
        <p className="p-4 mt-4 text-center bg-neutral-900 text-neutral-300">
          {error}
        </p>
      )}
      <Modal
        placement="center"
        backdrop={"blur"}
        isOpen={isOpen}
        hideCloseButton={true}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1">
                {t("verifyEmail")}
              </ModalHeader>
              <ModalBody className="items-center">
                <OtpInput
                  value={code}
                  onChange={setCode}
                  numInputs={6}
                  renderSeparator={<span className="mx-2">-</span>}
                  renderInput={(props) => (
                    <Input type="numInputs" size="md" {...props} />
                  )}
                  placeholder="000000"
                />
              </ModalBody>
              {verifyError && (
                <p className="p-4 mt-4 text-center bg-neutral-900 text-neutral-300">
                  {verifyError}
                </p>
              )}
              <ModalFooter>
                <Button color="primary" onPress={onPressVerify}>
                  {t("verify")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
