import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutList, Users, Volume2, VolumeX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import EndCallButton from "./EndCallButton";
import Loader from "./Loader";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get("personal");
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const router = useRouter();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  useEffect(() => {
    if (callingState !== "joined") return;

    async function initMediaDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(
          (device) => device.kind === "videoinput"
        );
        const hasMicrophone = devices.some(
          (device) => device.kind === "audioinput"
        );

        if (!hasCamera) {
          console.warn("No camera devices found.");
        }

        if (!hasMicrophone) {
          console.warn("No microphone devices found.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        console.log("Media stream initialized:", stream);
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    }

    initMediaDevices();

    const handleSFUError = async (event: Event) => {
      const error = event as CustomEvent;

      console.error("SFU reported error:", error.detail);

      if (error.detail.shouldRetry) {
        const maxRetries = 3;
        let attempts = 0;
        const retryDelay = 2000;

        while (attempts < maxRetries) {
          try {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            console.log(`Retrying... Attempt ${attempts + 1}`);
            await initMediaDevices();
            break;
          } catch (retryError) {
            console.error("Retry failed:", retryError);
            attempts++;
          }
        }

        if (attempts >= maxRetries) {
          console.error(
            "Max retries reached. Please check your network connection or contact support."
          );
          // Optionally, display an error message to the user
        }
      } else {
        console.error("Non-retryable error occurred:", error.detail.message);
        // Optionally, display a more user-friendly error message
      }
    };

    window.addEventListener("sfuerror", handleSFUError);

    return () => {
      window.removeEventListener("sfuerror", handleSFUError);
    };
  }, [callingState]);

  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const newAudioMuted = !isAudioMuted;
        audioTracks.forEach((track) => {
          track.enabled = !newAudioMuted;
        });
        setIsAudioMuted(newAudioMuted);
        console.log(`Audio ${newAudioMuted ? "muted" : "unmuted"}`);
      } else {
        console.warn("No audio tracks found in the media stream.");
      }
    } else {
      console.error("Media stream is not available.");
    }
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const newVideoEnabled = !isVideoEnabled;
        videoTracks.forEach((track) => {
          track.enabled = newVideoEnabled;
        });
        setIsVideoEnabled(newVideoEnabled);
        console.log(`Video ${newVideoEnabled ? "enabled" : "disabled"}`);
      } else {
        console.error("No video tracks found in the media stream.");
      }
    } else {
      console.error("Media stream is not available.");
    }
  };

  const CallLayout = () => {
    const layoutMap: { [key in CallLayoutType]: JSX.Element } = {
      grid: <PaginatedGridLayout />,
      "speaker-left": <SpeakerLayout participantsBarPosition="right" />,
      "speaker-right": <SpeakerLayout participantsBarPosition="left" />,
    };
    return (
      layoutMap[layout] || <SpeakerLayout participantsBarPosition="right" />
    );
  };

  if (callingState !== "joined") return <Loader />;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gray-900 text-white">
      <div className="relative flex h-full w-full">
        <div className="flex-1 flex items-center justify-center">
          <CallLayout />
        </div>
        <div
          className={cn(
            "absolute top-20 right-0 h-full w-1/4 bg-gray-800 transition-transform",
            {
              "translate-x-0": showParticipants,
              "translate-x-full": !showParticipants,
            }
          )}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      <div className="fixed bottom-20 left-20 right-10 flex items-center justify-between p-4 bg-gray-900 bg-opacity-95 z-50 border-t border-gray-700">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="rounded-full p-2 bg-gray-800 hover:bg-gray-700 transition-transform duration-300"
            aria-label="Participants list"
          >
            <Users size={20} className="text-white" />
          </button>

          <button
            onClick={toggleAudio}
            className={`rounded-full p-2 shadow-lg transition-transform duration-300 ${
              isAudioMuted
                ? "bg-red-600 hover:bg-red-500"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
            aria-label={isAudioMuted ? "Unmute audio" : "Mute audio"}
          >
            {isAudioMuted ? (
              <VolumeX size={20} className="text-white" />
            ) : (
              <Volume2 size={20} className="text-white" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`rounded-full p-2 shadow-lg transition-transform duration-300 ${
              isVideoEnabled
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-red-600 hover:bg-red-500"
            }`}
            aria-label={isVideoEnabled ? "Disable video" : "Enable video"}
          >
            {isVideoEnabled ? "Disable Video" : "Enable Video"}
          </button>

          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`rounded-full p-2 shadow-lg transition-transform duration-300 ${
              isSpeakerOn
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-red-600 hover:bg-red-500"
            }`}
            aria-label={isSpeakerOn ? "Turn off speaker" : "Turn on speaker"}
          >
            {isSpeakerOn ? "Speaker On" : "Speaker Off"}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer rounded-full bg-gray-800 p-2 hover:bg-gray-700 transition-transform duration-300">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-2 border border-gray-600 bg-gray-800 text-white rounded-lg shadow-lg">
              {["Grid", "Speaker-Left", "Speaker-Right"].map((item, index) => (
                <div key={index}>
                  <DropdownMenuItem
                    className="cursor-pointer px-4 py-2 hover:bg-gray-700 transition-transform duration-300 rounded-md"
                    onClick={() =>
                      setLayout(
                        item.toLowerCase().replace("-", "") as CallLayoutType
                      )
                    }
                  >
                    {item}
                  </DropdownMenuItem>
                  {index < 2 && (
                    <DropdownMenuSeparator className="border-gray-600" />
                  )}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <CallStatsButton />
        </div>

        <EndCallButton />
      </div>

      <video
        ref={videoRef}
        autoPlay
        muted
        className="absolute bottom-20 right-10 w-32 h-32 rounded-full border border-gray-700"
        onError={(e) => console.error("Video playback error:", e)}
      />
    </section>
  );
};

export default MeetingRoom;
