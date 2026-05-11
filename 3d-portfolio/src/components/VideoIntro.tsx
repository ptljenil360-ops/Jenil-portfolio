import { useEffect, useRef, useState } from "react";
import "./styles/VideoIntro.css";

interface VideoIntroProps {
  onTextTrigger: () => void;
  onTransition: () => void;
}

const VideoIntro = ({ onTextTrigger, onTransition }: VideoIntroProps) => {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const [currentVideo, setCurrentVideo] = useState(1);
  const [isTextTriggered, setIsTextTriggered] = useState(false);

  useEffect(() => {
    const video = video1Ref.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= 4 && !isTextTriggered) {
        setIsTextTriggered(true);
        onTextTrigger();
      }
    };

    const handleEnded = () => {
      setCurrentVideo(2);
      onTransition();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [isTextTriggered, onTextTrigger, onTransition]);

  return (
    <div className="video-intro-container">
      <video
        ref={video1Ref}
        src="/assets/Cyberpunk_city_upward_movement_202605021713.mp4"
        autoPlay
        muted
        playsInline
        className={`fullscreen-video ${currentVideo === 1 ? "visible" : "hidden"}`}
      />
      <video
        src="/assets/Clouds_hovering_over_city_202605030014.mp4"
        autoPlay={currentVideo === 2}
        muted
        loop
        playsInline
        preload="auto"
        className={`fullscreen-video ${currentVideo === 2 ? "visible" : "hidden"}`}
      />
    </div>
  );
};


export default VideoIntro;
