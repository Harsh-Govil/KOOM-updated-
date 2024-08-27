"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HomeCard from "./HomeCard";
import MeetingModal from "./MeetingModal";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import Loader from "./Loader";
import { Textarea } from "./ui/textarea";
import ReactDatePicker from "react-datepicker";
import { useToast } from "./ui/use-toast";
import { Input } from "./ui/input";

const initialValues = {
  dateTime: new Date(),
  description: "",
  link: "",
};

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const client = useStreamVideoClient();
  const { user } = useUser();
  const { toast } = useToast();

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast({ title: "Please select a date and time" });
        return;
      }
      console.log("Starting meeting creation..."); // Add this line
      const id = crypto.randomUUID();
      const call = client.call("default", id);
      if (!call) throw new Error("Failed to create meeting");
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || "Instant Meeting";
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      console.log("Meeting created successfully:", call); // Add this line
      setCallDetail(call);
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast({
        title: "Meeting Created",
      });
    } catch (error) {
      console.error("Error creating meeting:", error); // Add this line
      toast({ title: "Failed to create Meeting" });
    }
  };

  if (!client || !user) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 p-8 bg-black rounded-lg shadow-md">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState("isInstantMeeting")}
        className="bg-gradient-to-r from-green-400 to-blue-500 text-black shadow-lg transition-shadow duration-300"
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via invitation link"
        className="bg-gradient-to-r from-blue-400 to-indigo-500 text-black shadow-lg hover:shadow-xl transition-shadow duration-300"
        handleClick={() => setMeetingState("isJoiningMeeting")}
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your meeting"
        className="bg-gradient-to-r from-purple-400 to-pink-500 text-black shadow-lg hover:shadow-xl transition-shadow duration-300"
        handleClick={() => setMeetingState("isScheduleMeeting")}
      />
      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Meeting Recordings"
        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg hover:shadow-xl transition-shadow duration-300"
        handleClick={() => router.push("/recordings")}
      />
      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
          buttonText="Create"
          className="bg-red border border-red-300 text-red shadow-xl rounded-lg p-8 max-w-lg mx-auto"
        >
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-lg font-semibold text-black-800 mb-2">
                Meeting Description
              </label>
              <Textarea
                className="w-full border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out duration-150"
                onChange={(e) =>
                  setValues({ ...values, description: e.target.value })
                }
                placeholder="Enter meeting description"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-black-800 mb-2">
                Date & Time
              </label>
              <ReactDatePicker
                selected={values.dateTime}
                onChange={(date) => setValues({ ...values, dateTime: date! })}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full rounded-md p-3 border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
                placeholderText="Select date and time"
              />
            </div>
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: "Link Copied" });
          }}
          image={"/icons/checked.svg"}
          buttonIcon="/icons/copy.svg"
          className="text-center bg-red border border-red-300 shadow-lg rounded-lg p-6"
          buttonText="Copy Meeting Link"
        >
          <p className="text-sm text-gray-700">
            Your meeting has been created successfully. You can copy the link to
            share it with others.
          </p>
        </MeetingModal>
      )}

      <MeetingModal
        isOpen={meetingState === "isJoiningMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Join a Meeting"
        className="text-center bg-black border border-red-300 shadow-lg rounded-lg p-6"
        buttonText="Join Meeting"
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder="Enter meeting link"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className="w-full border border-gray-300 rounded-md p-3 text-gray-800 bg-white hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out duration-150"
        />
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        className="text-center bg-red border border-orange-300 shadow-lg rounded-lg p-6"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />
    </section>
  );
};

export default MeetingTypeList;
