"use client";
import { useEffect, useState } from "react";
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import Alert from "./Alert";
import { Button } from "./ui/button";

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();

  if (!call) {
    throw new Error(
      "useStreamCall must be used within a StreamCall component."
    );
  }

  const [isMicCamToggled, setIsMicCamToggled] = useState(false);

  useEffect(() => {
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

  if (callTimeNotArrived)
    return (
      <div className="bg-yellow-200 text-gray-800 p-6 rounded-lg shadow-lg">
        <Alert
          title={`Your meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
        />
      </div>
    );

  if (callHasEnded)
    return (
      <div className="bg-red-600 text-white p-6 rounded-lg shadow-lg flex items-center gap-3">
        <img src="/icons/call-ended.svg" alt="Call Ended" className="w-8 h-8" />
        <Alert title="The call has been ended by the host" />
      </div>
    );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-gray-800 p-6 text-white">
      <h1 className="text-3xl font-semibold text-center mb-4">Meeting Setup</h1>
      <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
        <VideoPreview />
      </div>
      <div className="flex flex-col items-center gap-4 mt-4">
        <label className="flex items-center gap-3 text-lg font-medium bg-gray-700 p-3 rounded-lg">
          <input
            type="checkbox"
            checked={isMicCamToggled}
            onChange={(e) => setIsMicCamToggled(e.target.checked)}
            className="form-checkbox h-5 w-5 text-green-400"
          />
          <span>Join with mic and camera off</span>
        </label>
        <div className="bg-gray-700 rounded-lg p-2 shadow-md">
          <DeviceSettings />
        </div>
      </div>
      <Button
        className="mt-6 rounded-md bg-green-600 px-6 py-3 text-lg font-semibold shadow-lg hover:bg-green-700 transition duration-300"
        onClick={() => {
          call.join();
          setIsSetupComplete(true);
        }}
      >
        Join Meeting
      </Button>
    </div>
  );
};

export default MeetingSetup;
