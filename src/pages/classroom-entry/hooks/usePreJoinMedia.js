import { useState, useRef, useEffect, useCallback } from 'react';

export function usePreJoinMedia() {
  const [stream, setStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState(null);
  const streamRef = useRef(null);
  const isInitializing = useRef(false);

  const initializeMedia = useCallback(async () => {
    if (streamRef.current || isInitializing.current) return;
    
    isInitializing.current = true;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.warn('Pre-join media initialization failed:', err);
      setError(err);
    } finally {
      isInitializing.current = false;
    }
  }, []);

  const cleanupMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    isInitializing.current = false;
  }, []);

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    } else if (error) {
      setIsVideoEnabled(prev => !prev);
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    } else if (error) {
      setIsAudioEnabled(prev => !prev);
    }
  };

  useEffect(() => {
    initializeMedia();
    return () => {
      cleanupMedia();
    };
  }, [initializeMedia, cleanupMedia]);

  return {
    stream,
    isVideoEnabled,
    isAudioEnabled,
    error,
    toggleVideo,
    toggleAudio,
    cleanupMedia
  };
}
