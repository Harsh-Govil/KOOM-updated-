"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { avatarImages } from "@/constants";
import { useToast } from "./ui/use-toast";

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  handleClick,
  link,
  buttonText,
}: MeetingCardProps) => {
  const { toast } = useToast();

  return (
    <section className="flex min-h-[260px] w-full flex-col justify-between rounded-lg bg-gray-800 p-6 xl:max-w-[580px] shadow-lg hover:shadow-xl transition-shadow duration-300">
      <article className="flex flex-col gap-4">
        <div className="flex items-center">
          <Image src={icon} alt="meeting icon" width={10} height={10} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-green">{title}</h1>
          <p className="text-base text-gray-300">{date}</p>
        </div>
      </article>
      <article className="relative flex flex-col items-center">
        <div className="relative flex w-full max-sm:hidden mb-4">
          {avatarImages.map((img, index) => (
            <Image
              key={index}
              src={img}
              alt="attendees"
              width={42}
              height={42}
              className={cn("rounded-full border-2 border-gray-600", {
                absolute: index > 0,
              })}
              style={{ top: 0, left: index * 30 }}
            />
          ))}
          <div className="absolute flex-center left-[140px] -top-2 h-8 w-8 rounded-full border-4 border-gray-700 bg-gray-900 text-white">
            +5
          </div>
        </div>
        {!isPreviousMeeting && (
          <div className="flex gap-3">
            <Button
              onClick={handleClick}
              className="flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2 hover:bg-blue-600 transition-colors duration-200"
            >
              {buttonIcon1 && (
                <Image
                  src={buttonIcon1}
                  alt="feature icon"
                  width={22}
                  height={22}
                />
              )}
              {buttonText}
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast({
                  title: "Link Copied",
                });
              }}
              className="flex items-center gap-2 rounded-full bg-gray-700 px-5 py-2 hover:bg-gray-800 transition-colors duration-200"
            >
              <Image
                src="/icons/copy.svg"
                alt="copy icon"
                width={22}
                height={22}
              />
              Copy Link
            </Button>
          </div>
        )}
      </article>
    </section>
  );
};

export default MeetingCard;
