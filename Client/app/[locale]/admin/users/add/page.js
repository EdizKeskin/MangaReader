"use client";
import BackButton from "@/components/BackButton";
import {
  addSubscriber,
  deleteSubscriber,
  getSubscriber,
  patchSubscriber,
} from "@/functions";
import { getDayDifference } from "@/utils";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { TbTrash } from "react-icons/tb";

export default function AddSubscriber() {
  const [update, setUpdate] = useState(false);

  const [day, setDay] = useState(30);
  const userId = useSearchParams().get("userId");
  const email = useSearchParams().get("email");
  const t = useTranslations("AddSubscriber");

  useEffect(() => {
    getSubscriber(userId).then((res) => {
      if (res !== null) {
        setDay(getDayDifference(res?.expireAt) + 1);
        setUpdate(true);
      }
    });
  }, [userId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      userId: userId,
      email: email,
      day: day,
    };
    toast.promise(addSubscriber(data), {
      loading: t("adding"),
      success: t("added"),
      error: t("addError"),
      success: () => {
        setUpdate(true);
      },
    });
  };
  const handleUpdate = (e) => {
    e.preventDefault();
    const data = {
      userId: userId,
      day: day,
    };
    toast.promise(patchSubscriber(data), {
      loading: t("updating"),
      success: t("updated"),
      error: t("updateError"),
    });
  };
  const handleDelete = (e) => {
    e.preventDefault();

    toast.promise(deleteSubscriber(userId), {
      loading: t("deleting"),
      success: t("deleted"),
      error: t("deleteError"),
      success: () => {
        setUpdate(false);
      },
    });
  };

  return (
    <div className="m-10">
      <BackButton />
      <div className="flex items-start justify-center mt-4 md:mt-0">
        <Card className="p-5">
          <CardBody className="gap-5 p-5">
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold">
                {update ? t("updateSubscriber") : t("addSubscriber")}
              </h1>
              <p className="text-sm text-gray-500">
                {t("addSubscriberDescription")}
              </p>
            </div>
            <form className="flex flex-col items-center justify-center gap-5">
              <Input
                label={t("userId")}
                className="w-full"
                labelPlacement="outside"
                type="text"
                name="userId"
                value={userId}
                placeholder="User ID"
                disabled
              />
              <Input
                label="E-mail"
                labelPlacement="outside"
                type="email"
                name="email"
                value={email}
                placeholder="E-mail"
                disabled
              />
              <Input
                label={update ? t("remainingDays") : t("day")}
                labelPlacement="outside"
                type="number"
                name="day"
                value={day}
                placeholder="Day"
                onChange={(e) => setDay(e.target.value)}
              />
              <div className="flex flex-row items-center gap-4">
                {update && (
                  <Button
                    isIconOnly
                    color="danger"
                    variant="bordered"
                    onClick={handleDelete}
                  >
                    <TbTrash size={"1.3em"} />
                  </Button>
                )}

                <Button
                  color="secondary"
                  type="submit"
                  onClick={update ? handleUpdate : handleSubmit}
                  isDisabled={!userId || !email || !day}
                >
                  {update ? t("update") : t("add")}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
