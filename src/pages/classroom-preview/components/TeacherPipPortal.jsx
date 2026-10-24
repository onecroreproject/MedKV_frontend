import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import TeacherPipContent from './TeacherPipContent';

/**
 * Copies all active styles and stylesheets from the main document to the PiP window
 * so Tailwind CSS and custom fonts render with 100% fidelity.
 */
function copyStylesToPip(targetDoc) {
  // 1. Copy direct <style> tags
  document.querySelectorAll('style').forEach((styleEl) => {
    targetDoc.head.appendChild(styleEl.cloneNode(true));
  });

  // 2. Copy stylesheet rules or external links
  [...document.styleSheets].forEach((styleSheet) => {
    try {
      if (styleSheet.cssRules) {
        const newStyleEl = targetDoc.createElement('style');
        [...styleSheet.cssRules].forEach((rule) => {
          newStyleEl.appendChild(targetDoc.createTextNode(rule.cssText));
        });
        targetDoc.head.appendChild(newStyleEl);
      }
    } catch (e) {
      if (styleSheet.href) {
        const link = targetDoc.createElement('link');
        link.rel = 'stylesheet';
        link.href = styleSheet.href;
        targetDoc.head.appendChild(link);
      }
    }
  });
}

/**
 * TeacherPipPortal
 *
 * Manages the Document Picture-in-Picture window lifecycle using Chrome's
 * Document Picture-in-Picture API (window.documentPictureInPicture).
 * Renders TeacherPipContent via React portal into the external always-on-top window.
 */
export default function TeacherPipPortal({
  isOpen,
  onClose,
  user,
  title = 'Live Class',
  isMuted,
  onToggleMic,
  isVideoOff,
  onToggleCamera,
  isScreenSharing,
  onToggleScreenShare,
  recordingState,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
  onEndClass,
  onLeave,
  participantCount = 0,
  raisedHandsCount = 0,
  screenShareTrack,
  localCameraTrack,
}) {
  const [pipWindow, setPipWindow] = useState(null);
  const isOpeningRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      if (pipWindow && !pipWindow.closed) {
        pipWindow.close();
      }
      setPipWindow(null);
      return;
    }

    if (pipWindow && !pipWindow.closed) return;
    if (isOpeningRef.current) return;

    // Check Document Picture-in-Picture API support
    if (!('documentPictureInPicture' in window)) {
      console.warn('[PiP] documentPictureInPicture is not supported in this browser.');
      alert('Document Picture-in-Picture is supported on Google Chrome, Microsoft Edge, and modern Chromium browsers.');
      onClose();
      return;
    }

    const openPipWindow = async () => {
      isOpeningRef.current = true;
      try {
        const win = await window.documentPictureInPicture.requestWindow({
          width: 380,
          height: 320,
        });

        win.document.title = `${title} — Faculty PiP`;

        // Apply styles
        copyStylesToPip(win.document);

        // Body styling
        win.document.body.style.margin = '0';
        win.document.body.style.padding = '0';
        win.document.body.style.overflow = 'hidden';
        win.document.body.style.backgroundColor = '#0b0f19';
        win.document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';

        // Handle user closing the PiP window manually
        win.addEventListener('pagehide', () => {
          setPipWindow(null);
          onClose();
        });

        setPipWindow(win);
      } catch (err) {
        console.error('[PiP] Error opening Document Picture-in-Picture window:', err);
        onClose();
      } finally {
        isOpeningRef.current = false;
      }
    };

    openPipWindow();
  }, [isOpen]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (pipWindow && !pipWindow.closed) {
        pipWindow.close();
      }
    };
  }, [pipWindow]);

  if (!pipWindow || pipWindow.closed) {
    return null;
  }

  return createPortal(
    <TeacherPipContent
      user={user}
      title={title}
      isMuted={isMuted}
      onToggleMic={onToggleMic}
      isVideoOff={isVideoOff}
      onToggleCamera={onToggleCamera}
      isScreenSharing={isScreenSharing}
      onToggleScreenShare={onToggleScreenShare}
      recordingState={recordingState}
      onPauseRecording={onPauseRecording}
      onResumeRecording={onResumeRecording}
      onStopRecording={onStopRecording}
      onEndClass={onEndClass}
      onLeave={onLeave}
      participantCount={participantCount}
      raisedHandsCount={raisedHandsCount}
      onFocusMainTab={() => {
        window.focus();
      }}
      onClosePip={() => {
        if (pipWindow && !pipWindow.closed) {
          pipWindow.close();
        }
        setPipWindow(null);
        onClose();
      }}
      screenShareTrack={screenShareTrack}
      localCameraTrack={localCameraTrack}
    />,
    pipWindow.document.body
  );
}
