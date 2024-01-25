"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Header } from "@/components/auth/header";
import { Social } from "@/components/auth/social";
import { BackButton } from "@/components/auth/back-button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FaAngleDown } from "react-icons/fa";
import { useState } from "react";
import { Separator } from "../ui/separator";

interface CardWrapperProps {
  children: React.ReactNode;
  headerTitle: string;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
  useCollapsible?: boolean;
  collapsibleLabel?: string;
}

export const CardWrapper = ({
  children,
  headerTitle,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial = false,
  useCollapsible = false,
  collapsibleLabel,
}: CardWrapperProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Card className="w-[400px] bg-card shadow-md mx-2 ">
      <CardHeader>
        <Header title={headerTitle} label={headerLabel} />
      </CardHeader>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      {useCollapsible ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild className="cursor-pointer mb-5">
            <div className="relative px-5">
              <Separator />
              <span className="absolute top-[100%] left-[50%] text-center -translate-x-2/4 -translate-y-2/4 bg-white px-2 text-sm text-muted-foreground text-nowrap flex flex-row items-center h-fit">
                <FaAngleDown />{" "}
                <span className="p-1 whitespace-nowrap">
                  {collapsibleLabel}
                </span>{" "}
                <FaAngleDown />
              </span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>{children}</CardContent>
            <CardFooter>
              <BackButton label={backButtonLabel} href={backButtonHref} />
            </CardFooter>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <>
          <CardContent>{children}</CardContent>
          <CardFooter>
            <BackButton label={backButtonLabel} href={backButtonHref} />
          </CardFooter>
        </>
      )}
    </Card>
  );
};
